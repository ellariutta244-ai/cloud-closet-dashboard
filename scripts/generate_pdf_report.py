#!/usr/bin/env python3
"""
Marketing Audit PDF Report Generator
Generates a professional PDF report from a JSON data file.
Usage: python3 generate_pdf_report.py [input.json] [output.pdf]
"""

import sys
import json
import math
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, HRFlowable
    )
    from reportlab.graphics.shapes import Drawing
    from reportlab.platypus.flowables import Flowable
except ImportError:
    print("ERROR: reportlab is not installed. Run: pip3 install reportlab")
    sys.exit(1)

# ── Color Palette ─────────────────────────────────────────────────────────────
NAVY       = colors.HexColor('#1B2A4A')
BLUE       = colors.HexColor('#2D5BFF')
ORANGE     = colors.HexColor('#FF6B35')
GREEN      = colors.HexColor('#00C853')
AMBER      = colors.HexColor('#FFB300')
RED        = colors.HexColor('#FF1744')
LIGHT_GRAY = colors.HexColor('#F5F7FA')
DARK_GRAY  = colors.HexColor('#2C3E50')
MED_GRAY   = colors.HexColor('#7F8C9B')
BORDER     = colors.HexColor('#E0E6ED')
WHITE      = colors.white

def score_color(score):
    if score >= 80: return GREEN
    if score >= 60: return BLUE
    if score >= 40: return AMBER
    return RED

def score_grade(score):
    if score >= 97: return 'A+'
    if score >= 93: return 'A'
    if score >= 90: return 'A-'
    if score >= 87: return 'B+'
    if score >= 83: return 'B'
    if score >= 80: return 'B-'
    if score >= 77: return 'C+'
    if score >= 73: return 'C'
    if score >= 70: return 'C-'
    if score >= 67: return 'D+'
    if score >= 63: return 'D'
    if score >= 60: return 'D-'
    return 'F'

def score_label(score):
    if score >= 80: return 'Strong'
    if score >= 60: return 'Solid'
    if score >= 40: return 'Needs Work'
    return 'Critical'

def severity_color(severity):
    s = severity.lower()
    if s == 'critical': return RED
    if s == 'high':     return ORANGE
    if s == 'medium':   return AMBER
    return BLUE

# ── Custom Flowables ──────────────────────────────────────────────────────────

class ScoreGauge(Flowable):
    """Circular score gauge with grade letter."""
    def __init__(self, score, size=160):
        Flowable.__init__(self)
        self.score = score
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        cx = self.size / 2
        cy = self.size / 2
        r  = self.size / 2 - 12
        stroke_w = 14

        # Background arc (full circle, light gray)
        self.canv.setStrokeColor(LIGHT_GRAY)
        self.canv.setLineWidth(stroke_w)
        self.canv.circle(cx, cy, r, stroke=1, fill=0)

        # Score arc
        pct = self.score / 100.0
        start_angle = 90          # top
        sweep = -360 * pct        # clockwise
        c = score_color(self.score)
        self.canv.setStrokeColor(c)
        self.canv.setLineWidth(stroke_w)
        # Draw arc using bezier approximation via path
        from reportlab.graphics.shapes import ArcPath
        # Use canvas arc
        end_angle = start_angle + sweep
        self.canv.arc(cx - r, cy - r, cx + r, cy + r,
                      startAng=end_angle, extent=abs(sweep))

        # Score number
        self.canv.setFillColor(NAVY)
        self.canv.setFont('Helvetica-Bold', self.size * 0.22)
        score_text = str(self.score)
        self.canv.drawCentredString(cx, cy + self.size * 0.04, score_text)

        # "/100" label
        self.canv.setFillColor(MED_GRAY)
        self.canv.setFont('Helvetica', self.size * 0.10)
        self.canv.drawCentredString(cx, cy - self.size * 0.10, '/100')

        # Grade
        grade = score_grade(self.score)
        self.canv.setFillColor(score_color(self.score))
        self.canv.setFont('Helvetica-Bold', self.size * 0.13)
        self.canv.drawCentredString(cx, cy - self.size * 0.28, f'Grade: {grade}')


class ColorBar(Flowable):
    """Horizontal color bar for a score."""
    def __init__(self, score, label, width=380, height=22):
        Flowable.__init__(self)
        self.score = score
        self.label = label
        self.bar_width = width
        self.height = height
        self.width = width

    def draw(self):
        bar_h = self.height * 0.55
        y = (self.height - bar_h) / 2

        # Background
        self.canv.setFillColor(LIGHT_GRAY)
        self.canv.roundRect(0, y, self.bar_width, bar_h, 3, fill=1, stroke=0)

        # Fill
        fill_w = (self.score / 100.0) * self.bar_width
        self.canv.setFillColor(score_color(self.score))
        self.canv.roundRect(0, y, fill_w, bar_h, 3, fill=1, stroke=0)

        # Score label on bar
        self.canv.setFillColor(WHITE)
        self.canv.setFont('Helvetica-Bold', 8)
        self.canv.drawCentredString(fill_w / 2, y + bar_h * 0.18, f'{self.score}')


# ── Styles ────────────────────────────────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles['cover_title'] = ParagraphStyle('cover_title',
        fontName='Helvetica-Bold', fontSize=28, textColor=WHITE,
        leading=34, spaceAfter=6)

    styles['cover_subtitle'] = ParagraphStyle('cover_subtitle',
        fontName='Helvetica', fontSize=13, textColor=colors.HexColor('#B0BEC5'),
        leading=18, spaceAfter=4)

    styles['section_header'] = ParagraphStyle('section_header',
        fontName='Helvetica-Bold', fontSize=16, textColor=NAVY,
        spaceBefore=18, spaceAfter=8, leading=20)

    styles['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=10, textColor=DARK_GRAY,
        leading=15, spaceAfter=6)

    styles['body_small'] = ParagraphStyle('body_small',
        fontName='Helvetica', fontSize=9, textColor=DARK_GRAY,
        leading=13, spaceAfter=4)

    styles['label'] = ParagraphStyle('label',
        fontName='Helvetica-Bold', fontSize=9, textColor=MED_GRAY,
        leading=12, spaceAfter=2)

    styles['action_item'] = ParagraphStyle('action_item',
        fontName='Helvetica', fontSize=9, textColor=DARK_GRAY,
        leading=13, spaceAfter=3, leftIndent=14, firstLineIndent=-14)

    styles['footer'] = ParagraphStyle('footer',
        fontName='Helvetica', fontSize=8, textColor=MED_GRAY,
        alignment=1)  # center

    styles['table_header'] = ParagraphStyle('table_header',
        fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, leading=12)

    styles['table_cell'] = ParagraphStyle('table_cell',
        fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=12)

    return styles


# ── Page Template ─────────────────────────────────────────────────────────────

def on_page(canvas, doc, brand_name, report_date):
    canvas.saveState()
    w, h = letter

    if doc.page == 1:
        # Full navy cover background
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)

        # Orange accent bar at top
        canvas.setFillColor(ORANGE)
        canvas.rect(0, h - 8, w, 8, fill=1, stroke=0)

        # Bottom band
        canvas.setFillColor(colors.HexColor('#111D33'))
        canvas.rect(0, 0, w, 60, fill=1, stroke=0)

        # Footer text on cover
        canvas.setFillColor(MED_GRAY)
        canvas.setFont('Helvetica', 8)
        canvas.drawCentredString(w / 2, 22, 'Generated by AI Marketing Suite for Claude Code')
    else:
        # Header bar
        canvas.setFillColor(NAVY)
        canvas.rect(0, h - 44, w, 44, fill=1, stroke=0)
        canvas.setFillColor(ORANGE)
        canvas.rect(0, h - 46, w, 2, fill=1, stroke=0)

        # Header text
        canvas.setFillColor(WHITE)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(0.65 * inch, h - 28, 'Marketing Audit Report')
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.HexColor('#B0BEC5'))
        canvas.drawRightString(w - 0.65 * inch, h - 28, brand_name)

        # Footer
        canvas.setFillColor(BORDER)
        canvas.rect(0, 28, w, 1, fill=1, stroke=0)
        canvas.setFillColor(MED_GRAY)
        canvas.setFont('Helvetica', 8)
        canvas.drawString(0.65 * inch, 14, f'Generated by AI Marketing Suite  ·  {report_date}')
        canvas.drawRightString(w - 0.65 * inch, 14, f'Page {doc.page}')

    canvas.restoreState()


# ── Report Builder ────────────────────────────────────────────────────────────

def build_report(data, output_path):
    styles = build_styles()
    w, h = letter
    margin = 0.65 * inch
    content_w = w - 2 * margin

    brand_name = data.get('brand_name', 'Unknown')
    report_date = data.get('date', datetime.today().strftime('%B %d, %Y'))
    url = data.get('url', '')
    overall = int(data.get('overall_score', 0))
    summary = data.get('executive_summary', '')
    categories = data.get('categories', {})
    findings = data.get('findings', [])
    quick_wins = data.get('quick_wins', [])
    medium_term = data.get('medium_term', [])
    strategic = data.get('strategic', [])
    competitors = data.get('competitors', [])

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=1.0 * inch,
        bottomMargin=0.65 * inch,
    )

    story = []

    # ── PAGE 1: COVER ─────────────────────────────────────────────────────────
    # Top spacer (behind navy bg set in on_page)
    story.append(Spacer(1, 1.1 * inch))

    story.append(Paragraph('Marketing Audit Report', styles['cover_title']))
    story.append(Paragraph(url, styles['cover_subtitle']))
    story.append(Paragraph(report_date, styles['cover_subtitle']))
    story.append(Spacer(1, 0.3 * inch))

    # Score gauge centered
    gauge_size = 180
    gauge_table = Table([[ScoreGauge(overall, size=gauge_size)]],
                        colWidths=[content_w])
    gauge_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(gauge_table)
    story.append(Spacer(1, 0.25 * inch))

    # Executive summary on white card
    summary_style = ParagraphStyle('summary_card',
        fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#B0BEC5'),
        leading=16, spaceAfter=0, alignment=1)
    summary_table = Table(
        [[Paragraph(summary, summary_style)]],
        colWidths=[content_w - 0.4 * inch]
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0F1E36')),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 18),
        ('RIGHTPADDING', (0, 0), (-1, -1), 18),
        ('ROUNDEDCORNERS', (0, 0), (-1, -1), [6, 6, 6, 6]),
    ]))
    story.append(summary_table)

    story.append(PageBreak())

    # ── PAGE 2: SCORE BREAKDOWN ───────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('Score Breakdown', styles['section_header']))
    story.append(HRFlowable(width=content_w, thickness=2, color=ORANGE, spaceAfter=16))

    cat_rows = [
        [
            Paragraph('<b>Category</b>', styles['label']),
            Paragraph('<b>Score</b>', styles['label']),
            Paragraph('<b>Weight</b>', styles['label']),
            Paragraph('<b>Bar</b>', styles['label']),
            Paragraph('<b>Status</b>', styles['label']),
        ]
    ]

    bar_w = content_w * 0.38

    for cat_name, cat_data in categories.items():
        sc = int(cat_data.get('score', 0))
        wt = cat_data.get('weight', '')
        c = score_color(sc)
        lbl = score_label(sc)
        cat_rows.append([
            Paragraph(cat_name, styles['body_small']),
            Paragraph(f'<b>{sc}/100</b>', ParagraphStyle('sc',
                fontName='Helvetica-Bold', fontSize=10,
                textColor=c, leading=14)),
            Paragraph(wt, styles['body_small']),
            ColorBar(sc, cat_name, width=bar_w, height=20),
            Paragraph(lbl, ParagraphStyle('lbl',
                fontName='Helvetica-Bold', fontSize=8,
                textColor=c, leading=12)),
        ])

    col_widths = [
        content_w * 0.26,
        content_w * 0.10,
        content_w * 0.09,
        content_w * 0.40,
        content_w * 0.15,
    ]

    cat_table = Table(cat_rows, colWidths=col_widths, rowHeights=None)
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(cat_table)

    # Overall score row
    story.append(Spacer(1, 12))
    overall_color = score_color(overall)
    overall_row_data = [[
        Paragraph(f'<b>Overall Marketing Score</b>', ParagraphStyle('ov',
            fontName='Helvetica-Bold', fontSize=11, textColor=NAVY, leading=14)),
        Paragraph(f'<b>{overall}/100</b>', ParagraphStyle('ovsc',
            fontName='Helvetica-Bold', fontSize=14,
            textColor=overall_color, leading=18)),
        Paragraph(f'Grade: {score_grade(overall)}', ParagraphStyle('ovg',
            fontName='Helvetica-Bold', fontSize=11,
            textColor=overall_color, leading=14)),
    ]]
    overall_table = Table(overall_row_data,
                          colWidths=[content_w * 0.55, content_w * 0.25, content_w * 0.20])
    overall_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EEF1F8')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 1.5, overall_color),
    ]))
    story.append(overall_table)

    story.append(PageBreak())

    # ── PAGE 3: KEY FINDINGS ──────────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('Key Findings', styles['section_header']))
    story.append(HRFlowable(width=content_w, thickness=2, color=ORANGE, spaceAfter=16))

    findings_rows = [
        [
            Paragraph('<b>Severity</b>', styles['label']),
            Paragraph('<b>Finding</b>', styles['label']),
        ]
    ]
    for f in findings:
        sev = f.get('severity', 'Low')
        finding_text = f.get('finding', '')
        sc = severity_color(sev)
        findings_rows.append([
            Paragraph(f'<b>{sev}</b>', ParagraphStyle('sev',
                fontName='Helvetica-Bold', fontSize=9,
                textColor=sc, leading=13)),
            Paragraph(finding_text, styles['body_small']),
        ])

    findings_table = Table(findings_rows,
                           colWidths=[content_w * 0.14, content_w * 0.86])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(findings_table)

    story.append(PageBreak())

    # ── PAGE 4: ACTION PLAN ───────────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('Prioritized Action Plan', styles['section_header']))
    story.append(HRFlowable(width=content_w, thickness=2, color=ORANGE, spaceAfter=14))

    def action_section(title, items, accent):
        section_rows = [[
            Paragraph(f'<b>{title}</b>', ParagraphStyle('ah',
                fontName='Helvetica-Bold', fontSize=11,
                textColor=WHITE, leading=14)),
        ]]
        header_table = Table(section_rows, colWidths=[content_w])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), accent),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        els = [header_table]

        item_rows = []
        for i, item in enumerate(items, 1):
            item_rows.append([
                Paragraph(f'<b>{i}.</b>', ParagraphStyle('num',
                    fontName='Helvetica-Bold', fontSize=9,
                    textColor=accent, leading=14)),
                Paragraph(item, styles['body_small']),
            ])

        items_table = Table(item_rows,
                            colWidths=[content_w * 0.05, content_w * 0.95])
        items_table.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [WHITE, LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        els.append(items_table)
        els.append(Spacer(1, 14))
        return els

    story.extend(action_section('Quick Wins — This Week', quick_wins, GREEN))
    story.extend(action_section('Medium-Term — 1 to 3 Months', medium_term, BLUE))
    story.extend(action_section('Strategic — 3 to 6 Months', strategic, NAVY))

    # ── PAGE 5: COMPETITOR LANDSCAPE ─────────────────────────────────────────
    if competitors:
        story.append(PageBreak())
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph('Competitive Landscape', styles['section_header']))
        story.append(HRFlowable(width=content_w, thickness=2, color=ORANGE, spaceAfter=16))

        comp_names = [c.get('name', '') for c in competitors[:3]]
        header_row = [Paragraph('<b>Factor</b>', styles['label'])]
        header_row.append(Paragraph(f'<b>{brand_name}</b>', ParagraphStyle('bnh',
            fontName='Helvetica-Bold', fontSize=9, textColor=ORANGE, leading=12)))
        for name in comp_names:
            header_row.append(Paragraph(f'<b>{name}</b>', styles['label']))

        fields = [
            ('positioning', 'Positioning'),
            ('pricing', 'Pricing'),
            ('social_proof', 'Social Proof'),
            ('content', 'Content'),
        ]

        # We need "our" values — pull from competitors list if brand is first,
        # otherwise mark as TBD. The JSON structure has competitor objects only.
        # We'll show N/A for brand columns in competitor table rows.
        comp_rows = [header_row]
        for field_key, field_label in fields:
            row = [Paragraph(f'<b>{field_label}</b>', styles['body_small'])]
            row.append(Paragraph('—', styles['body_small']))
            for comp in competitors[:3]:
                row.append(Paragraph(comp.get(field_key, '—'), styles['body_small']))
            comp_rows.append(row)

        num_cols = 2 + len(competitors[:3])
        col_w = content_w / num_cols
        comp_table = Table(comp_rows, colWidths=[col_w] * num_cols)
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('BACKGROUND', (1, 0), (1, 0), ORANGE),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ]))
        story.append(comp_table)

    # ── FINAL PAGE: METHODOLOGY ───────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('Methodology', styles['section_header']))
    story.append(HRFlowable(width=content_w, thickness=2, color=ORANGE, spaceAfter=16))

    story.append(Paragraph(
        'This report was generated using the AI Marketing Suite, a multi-agent marketing analysis '
        'framework built on Claude. Each of the six scored categories was evaluated by a specialized '
        'analysis agent that examined publicly available signals — site structure, messaging, content, '
        'competitive positioning, technical SEO, and growth indicators.',
        styles['body']))

    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Scoring Formula</b>', styles['label']))
    story.append(Paragraph(
        'Overall Score = (Content × 25%) + (Conversion × 20%) + (SEO × 20%) + '
        '(Competitive × 15%) + (Brand × 10%) + (Growth × 10%)',
        styles['body']))

    story.append(Spacer(1, 10))

    meth_rows = [
        [Paragraph('<b>Category</b>', styles['label']),
         Paragraph('<b>Weight</b>', styles['label']),
         Paragraph('<b>What It Measures</b>', styles['label'])],
        ['Content & Messaging', '25%', 'Copy quality, value proposition, headline clarity, CTA text, brand voice'],
        ['Conversion Optimization', '20%', 'Social proof, form design, CTA placement, objection handling, urgency'],
        ['SEO & Discoverability', '20%', 'Title tags, meta descriptions, schema, internal linking, page speed, ASO'],
        ['Competitive Positioning', '15%', 'Differentiation, pricing clarity, comparison content, market awareness'],
        ['Brand & Trust', '10%', 'Design quality, trust signals, security indicators, professional appearance'],
        ['Growth & Strategy', '10%', 'Lead capture, email, content strategy, acquisition channels, retention'],
    ]

    for i in range(1, len(meth_rows)):
        meth_rows[i] = [Paragraph(str(cell), styles['body_small']) for cell in meth_rows[i]]

    meth_table = Table(meth_rows,
                       colWidths=[content_w * 0.30, content_w * 0.10, content_w * 0.60])
    meth_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meth_table)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width=content_w, thickness=1, color=BORDER))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Generated by AI Marketing Suite for Claude Code  ·  Not for redistribution without permission.',
        styles['footer']))

    # Build PDF
    doc.build(
        story,
        onFirstPage=lambda c, d: on_page(c, d, brand_name, report_date),
        onLaterPages=lambda c, d: on_page(c, d, brand_name, report_date),
    )
    print(f'PDF generated: {output_path}')


# ── Sample Data ───────────────────────────────────────────────────────────────

SAMPLE_DATA = {
    "url": "https://example.com",
    "date": "March 13, 2026",
    "brand_name": "Example Co",
    "overall_score": 62,
    "executive_summary": (
        "Example Co earned a 62/100 marketing score, reflecting solid fundamentals with clear "
        "opportunities for conversion and SEO improvement. The strongest area is brand positioning "
        "(70/100), while SEO & Discoverability (52/100) and Conversion Optimization (48/100) "
        "represent the largest revenue gaps. Implementing all recommendations could drive an "
        "estimated $15,000–$40,000 in additional monthly revenue within 6 months."
    ),
    "categories": {
        "Content & Messaging": {"score": 68, "weight": "25%"},
        "Conversion Optimization": {"score": 48, "weight": "20%"},
        "SEO & Discoverability": {"score": 52, "weight": "20%"},
        "Competitive Positioning": {"score": 61, "weight": "15%"},
        "Brand & Trust": {"score": 70, "weight": "10%"},
        "Growth & Strategy": {"score": 65, "weight": "10%"},
    },
    "findings": [
        {"severity": "Critical", "finding": "Homepage loads in 5.8s on mobile (benchmark: <2.5s), causing ~40% of mobile visitors to bounce before engaging."},
        {"severity": "High", "finding": "No meta descriptions on 7 of 10 landing pages, suppressing organic click-through rates by an estimated 20–35%."},
        {"severity": "High", "finding": "Primary CTA reads 'Submit' with no benefit framing; no social proof elements within scroll distance of the conversion point."},
        {"severity": "Medium", "finding": "No comparison or 'vs competitor' pages, leaving high-intent bottom-of-funnel searchers without a reason to choose this brand."},
        {"severity": "Medium", "finding": "Blog posts lack internal linking to product pages; PageRank does not flow to conversion-focused pages."},
        {"severity": "Low", "finding": "About page does not feature founder credentials or team photos, missing a key trust-building opportunity."},
    ],
    "quick_wins": [
        "Rewrite primary CTA from 'Submit' to 'Get My Free Report — Takes 60 Seconds' and add '2,400+ teams already use us' beneath it.",
        "Add unique meta descriptions to the top 7 landing pages, leading with the primary keyword and a benefit statement.",
        "Compress hero image from 2.4MB to under 200KB using WebP format to immediately improve mobile load time.",
    ],
    "medium_term": [
        "Build a 'vs Competitor A' comparison page targeting the keyword 'best [category] tool' to capture 1,200+ monthly searches.",
        "Redesign the pricing page with a 3-tier structure, highlighting the middle tier as 'Most Popular' with an annual discount anchor.",
        "Implement a referral program offering a $20 credit per successful referral, targeting the existing 2,400-user base as the growth engine.",
    ],
    "strategic": [
        "Launch a content marketing program with 4 cornerstone articles per month targeting primary and long-tail keywords; project 3,000+ organic visitors by month 6.",
        "Implement full schema markup (Organization, Product, FAQ, Breadcrumb) across all pages to unlock rich snippets and improve CTR by an estimated 15–30%.",
        "Build a partner ecosystem with 10 complementary tools to create inbound referral channels and co-marketing opportunities.",
    ],
    "competitors": [
        {"name": "Competitor A", "positioning": "All-in-one platform", "pricing": "$49–$199/mo", "social_proof": "4.8★ G2, 1,200 reviews", "content": "Active blog, weekly newsletter"},
        {"name": "Competitor B", "positioning": "Enterprise focus", "pricing": "$299+/mo", "social_proof": "Case studies, Fortune 500 logos", "content": "Whitepapers, webinars"},
        {"name": "Competitor C", "positioning": "SMB / self-serve", "pricing": "Free + $19/mo", "social_proof": "Product Hunt #1, 800 reviews", "content": "Tutorials, YouTube channel"},
    ],
}


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        with open(input_path, 'r') as f:
            data = json.load(f)
    elif len(sys.argv) == 2:
        input_path = sys.argv[1]
        output_path = 'MARKETING-REPORT-output.pdf'
        with open(input_path, 'r') as f:
            data = json.load(f)
    else:
        print('No arguments provided — generating sample report.')
        data = SAMPLE_DATA
        output_path = 'MARKETING-REPORT-sample.pdf'

    build_report(data, output_path)
