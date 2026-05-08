import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Resend } from 'resend';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloud-closet-dashboard.vercel.app';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cloud Closet <onboarding@resend.dev>';

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
}

function dashboardInviteEmail(name: string, actionLink: string) {
  const firstName = name.split(' ')[0] || name;
  return {
    subject: 'Welcome to Cloud Closet — Access Your Dashboard',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;border:1px solid #e7e5e4;overflow:hidden">
        <!-- Header -->
        <tr><td style="background:#1c1917;padding:28px 36px;text-align:center">
          <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px">Cloud Closet</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1c1917">You&rsquo;re in, ${firstName}! 🎉</p>
          <p style="margin:0 0 24px;font-size:15px;color:#78716c;line-height:1.6">
            Your internship agreement is signed. Click below to set up your password and access the Cloud Closet intern dashboard.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
            <tr><td style="background:#1c1917;border-radius:12px;padding:14px 28px;text-align:center">
              <a href="${actionLink}" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none">Access My Dashboard →</a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;font-size:13px;color:#a8a29e">This link expires in 24 hours. If you didn&rsquo;t expect this email, you can safely ignore it.</p>
          <p style="margin:0;font-size:13px;color:#a8a29e">Or copy this URL into your browser:<br>
            <span style="color:#57534e;word-break:break-all">${actionLink}</span>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fafaf9;border-top:1px solid #f5f5f4;padding:20px 36px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a8a29e">Cloud Closet Internship Program · Questions? Reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

function dashboardMagicLinkEmail(name: string, actionLink: string) {
  const firstName = name.split(' ')[0] || name;
  return {
    subject: 'Your Cloud Closet Sign-In Link',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;border:1px solid #e7e5e4;overflow:hidden">
        <tr><td style="background:#1c1917;padding:28px 36px;text-align:center">
          <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px">Cloud Closet</span>
        </td></tr>
        <tr><td style="padding:36px">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1c1917">Hi ${firstName},</p>
          <p style="margin:0 0 24px;font-size:15px;color:#78716c;line-height:1.6">
            Your contract is signed. Use the link below to log into your Cloud Closet dashboard.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
            <tr><td style="background:#1c1917;border-radius:12px;padding:14px 28px;text-align:center">
              <a href="${actionLink}" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none">Log In to Dashboard →</a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;font-size:13px;color:#a8a29e">This link expires in 1 hour and can only be used once.</p>
          <p style="margin:0;font-size:13px;color:#a8a29e">Or copy this URL:<br>
            <span style="color:#57534e;word-break:break-all">${actionLink}</span>
          </p>
        </td></tr>
        <tr><td style="background:#fafaf9;border-top:1px solid #f5f5f4;padding:20px 36px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a8a29e">Cloud Closet Internship Program</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

// ── GET /api/contracts/[token] ─────────────────────────────────────────────────
// Public: fetch contract content for the signing page. Validates token + expiry.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const admin = adminClient();
    const { data, error } = await admin
      .from('contracts')
      .select('id, intern_name, intern_email, content, signed_at, token_expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Contract not found.' }, { status: 404 });
    }
    if (data.signed_at) {
      return NextResponse.json({ error: 'This contract has already been signed.' }, { status: 409 });
    }
    if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'This signing link has expired. Please contact your team exec.' }, { status: 410 });
    }

    return NextResponse.json({
      id: data.id,
      intern_name: data.intern_name,
      content: data.content,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── POST /api/contracts/[token] ────────────────────────────────────────────────
// Public: submit signature. Generates PDF, uploads to storage, invites intern.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const { signature_data, headshot_data } = await req.json();
    if (!signature_data) {
      return NextResponse.json({ error: 'Signature is required.' }, { status: 400 });
    }

    const admin = adminClient();

    // Re-validate token
    const { data: contract, error: fetchErr } = await admin
      .from('contracts')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchErr || !contract) {
      return NextResponse.json({ error: 'Contract not found.' }, { status: 404 });
    }
    if (contract.signed_at) {
      return NextResponse.json({ error: 'Already signed.' }, { status: 409 });
    }
    if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired.' }, { status: 410 });
    }

    const signedAt = new Date().toISOString();

    // ── Generate PDF ────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;

    // Helper: wrap text into lines
    function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
      const lines: string[] = [];
      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        if (para.trim() === '') { lines.push(''); continue; }
        const words = para.split(' ');
        let line = '';
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
      }
      return lines;
    }

    // Build pages
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    function ensureSpace(needed: number) {
      if (y - needed < margin + 80) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    }

    // Header
    page.drawText('Cloud Closet', { x: margin, y, font: helveticaBold, size: 20, color: rgb(0.18, 0.15, 0.13) });
    y -= 24;
    page.drawText('Internship Agreement', { x: margin, y, font: helvetica, size: 13, color: rgb(0.45, 0.42, 0.4) });
    y -= 8;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.83, 0.81) });
    y -= 20;

    // Intern name + date
    const dateLine = `Prepared for: ${contract.intern_name || contract.intern_email || '—'}   ·   Date: ${new Date(signedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    page.drawText(dateLine, { x: margin, y, font: helvetica, size: 9, color: rgb(0.55, 0.52, 0.5) });
    y -= 28;

    // Contract body
    const bodyLines = wrapText(contract.content || '', helvetica, 10.5, contentWidth);
    for (const line of bodyLines) {
      ensureSpace(16);
      if (line !== '') {
        page.drawText(line, { x: margin, y, font: helvetica, size: 10.5, color: rgb(0.15, 0.13, 0.12) });
      }
      y -= 15;
    }

    // Signature section
    ensureSpace(160);
    y -= 24;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.83, 0.81) });
    y -= 20;
    page.drawText('Digital Signature', { x: margin, y, font: helveticaBold, size: 11, color: rgb(0.18, 0.15, 0.13) });
    y -= 18;

    // Embed signature image
    try {
      const base64Data = signature_data.replace(/^data:image\/png;base64,/, '');
      const sigBytes = Buffer.from(base64Data, 'base64');
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const sigDims = sigImage.scaleToFit(220, 80);
      ensureSpace(sigDims.height + 30);
      page.drawImage(sigImage, { x: margin, y: y - sigDims.height, width: sigDims.width, height: sigDims.height });
      y -= sigDims.height + 12;
    } catch {
      page.drawText('[Signature captured digitally]', { x: margin, y, font: helvetica, size: 10, color: rgb(0.4, 0.4, 0.4) });
      y -= 20;
    }

    const signedLine = `Signed: ${contract.intern_name || contract.intern_email || ''}   ·   ${new Date(signedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`;
    page.drawText(signedLine, { x: margin, y, font: helvetica, size: 9, color: rgb(0.45, 0.42, 0.4) });
    y -= 14;
    page.drawText('This document was signed electronically and constitutes a legally binding agreement.', {
      x: margin, y, font: helvetica, size: 8, color: rgb(0.6, 0.58, 0.56),
    });

    const pdfBytes = await pdfDoc.save();

    // ── Upload PDF to Supabase Storage ──────────────────────────────────────────
    const fileName = `${contract.id}/signed_contract.pdf`;
    const { error: uploadErr } = await admin.storage
      .from('contracts')
      .upload(fileName, Buffer.from(pdfBytes), {
        contentType: 'application/pdf',
        upsert: true,
      });

    let pdf_url: string | null = null;
    if (!uploadErr) {
      const { data: urlData } = admin.storage.from('contracts').getPublicUrl(fileName);
      pdf_url = urlData?.publicUrl ?? null;
      // Since bucket is private, use signed URL instead
      const { data: signed } = await admin.storage
        .from('contracts')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year
      pdf_url = signed?.signedUrl ?? pdf_url;
    }

    // ── Update contract record ──────────────────────────────────────────────────
    const { error: updateErr } = await admin
      .from('contracts')
      .update({ signature_data, signed_at: signedAt, pdf_url })
      .eq('id', contract.id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // ── Mark intern_roster row as complete ──────────────────────────────────────
    await admin
      .from('intern_roster')
      .update({ contract_status: 'complete' })
      .eq('contract_token', token);

    // ── Create/find Supabase Auth user and send dashboard email via Resend ───────
    let authStatus = 'skipped';
    let authError: string | null = null;

    if (contract.intern_email) {
      const redirectTo = `${SITE_URL}/auth/callback`;
      const internName = contract.intern_name || contract.intern_email;

      // Helper: upload headshot
      async function uploadHeadshot(userId: string): Promise<string | null> {
        if (!headshot_data) return null;
        try {
          const mimeMatch = headshot_data.match(/^data:([^;]+);base64,/);
          const mime = mimeMatch?.[1] || 'image/jpeg';
          const ext = mime.includes('png') ? 'png' : 'jpg';
          const base64 = headshot_data.replace(/^data:[^;]+;base64,/, '');
          const imageBytes = Buffer.from(base64, 'base64');
          const { error: uploadErr } = await admin.storage
            .from('headshots')
            .upload(`${userId}/photo.${ext}`, imageBytes, { contentType: mime, upsert: true });
          if (uploadErr) return null;
          const { data: urlData } = admin.storage.from('headshots').getPublicUrl(`${userId}/photo.${ext}`);
          return urlData?.publicUrl ?? null;
        } catch { return null; }
      }

      // Helper: send email via Resend
      async function sendEmail(to: string, subject: string, html: string) {
        try {
          const resend = resendClient();
          const { error: emailErr } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
          if (emailErr) console.error('[contract sign] Resend error:', emailErr);
          return !emailErr;
        } catch (e: any) {
          console.error('[contract sign] Resend exception:', e.message);
          return false;
        }
      }

      // Try to create a new user
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        contract.intern_email,
        { data: { full_name: internName }, redirectTo }
      );

      if (!inviteErr && invited?.user?.id) {
        // ── New user created ────────────────────────────────────────────────────
        const userId = invited.user.id;
        const avatarUrl = await uploadHeadshot(userId);

        await admin.from('profiles').upsert({
          id: userId,
          full_name: internName,
          email: contract.intern_email,
          role: 'intern',
          active: true,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        }, { onConflict: 'id' });

        await admin.from('contracts').update({ user_id: userId }).eq('id', contract.id);

        // Generate invite link and send via Resend (bypasses Supabase email entirely)
        const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'invite',
          email: contract.intern_email,
          options: { redirectTo, data: { full_name: internName } },
        });

        if (!linkErr && linkData?.properties?.action_link) {
          const sent = await sendEmail(
            contract.intern_email,
            ...Object.values(dashboardInviteEmail(internName, linkData.properties.action_link)) as [string, string]
          );
          authStatus = sent ? 'invite_sent' : 'invite_email_failed';
        } else {
          authStatus = 'link_gen_failed';
          authError = linkErr?.message || null;
          console.error('[contract sign] generateLink failed:', linkErr?.message);
        }

      } else if (inviteErr?.message?.toLowerCase().includes('already')) {
        // ── Existing user — generate magic link and send via Resend ────────────
        const { data: { users } } = await admin.auth.admin.listUsers();
        const existing = users.find(u => u.email?.toLowerCase() === contract.intern_email.toLowerCase());

        if (existing) {
          await admin.from('contracts').update({ user_id: existing.id }).eq('id', contract.id);

          const avatarUrl = await uploadHeadshot(existing.id);
          if (avatarUrl) await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', existing.id);

          const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
            type: 'magiclink',
            email: contract.intern_email,
            options: { redirectTo },
          });

          if (!linkErr && linkData?.properties?.action_link) {
            const sent = await sendEmail(
              contract.intern_email,
              ...Object.values(dashboardMagicLinkEmail(internName, linkData.properties.action_link)) as [string, string]
            );
            authStatus = sent ? 'magic_link_sent' : 'magic_link_email_failed';
          } else {
            authStatus = 'link_gen_failed';
            authError = linkErr?.message || null;
            console.error('[contract sign] generateLink (magic) failed:', linkErr?.message);
          }
        } else {
          authStatus = 'existing_user_not_found';
        }
      } else if (inviteErr) {
        authStatus = 'invite_failed';
        authError = inviteErr.message;
        console.error('[contract sign] inviteUserByEmail failed:', inviteErr.message);
      }
    }

    return NextResponse.json({ ok: true, pdf_url, auth_status: authStatus, auth_error: authError });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
