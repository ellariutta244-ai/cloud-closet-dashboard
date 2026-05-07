import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloud-closet-dashboard.vercel.app';

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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

    // ── Invite intern to Supabase Auth (or send magic link if already exists) ───
    let authStatus = 'skipped';
    let authError: string | null = null;

    if (contract.intern_email) {
      const redirectTo = `${SITE_URL}/auth/callback`;

      // Helper: upload headshot and return public URL
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
        } catch {
          return null;
        }
      }

      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        contract.intern_email,
        { data: { full_name: contract.intern_name || '' }, redirectTo }
      );

      if (!inviteErr && invited?.user?.id) {
        // ── New user: invite email sent automatically by Supabase ──────────────
        authStatus = 'invited';
        const userId = invited.user.id;
        const avatarUrl = await uploadHeadshot(userId);

        await admin.from('profiles').upsert({
          id: userId,
          full_name: contract.intern_name || '',
          email: contract.intern_email,
          role: 'intern',
          active: true,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        }, { onConflict: 'id' });

        await admin.from('contracts').update({ user_id: userId }).eq('id', contract.id);

      } else if (inviteErr?.message?.toLowerCase().includes('already')) {
        // ── Existing user: send magic link email via OTP ────────────────────────
        const { data: { users } } = await admin.auth.admin.listUsers();
        const existing = users.find(u => u.email?.toLowerCase() === contract.intern_email.toLowerCase());

        if (existing) {
          await admin.from('contracts').update({ user_id: existing.id }).eq('id', contract.id);

          const avatarUrl = await uploadHeadshot(existing.id);
          if (avatarUrl) {
            await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', existing.id);
          }

          // signInWithOtp actually sends the magic link email (unlike generateLink)
          const { error: otpErr } = await admin.auth.signInWithOtp({
            email: contract.intern_email,
            options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
          });
          if (otpErr) {
            authStatus = 'otp_failed';
            authError = otpErr.message;
            console.error('[contract sign] OTP send failed:', otpErr.message);
          } else {
            authStatus = 'magic_link_sent';
          }
        } else {
          authStatus = 'existing_user_not_found';
        }
      } else if (inviteErr) {
        authStatus = 'invite_failed';
        authError = inviteErr.message;
        console.error('[contract sign] invite error:', inviteErr.message);
      }
    }

    return NextResponse.json({ ok: true, pdf_url, auth_status: authStatus, auth_error: authError });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
