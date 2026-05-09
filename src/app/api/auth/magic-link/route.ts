import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloud-closet-dashboard.vercel.app';

// POST /api/auth/magic-link
// Admin-only: generate a magic link for an intern and send it via Gmail.
export async function POST(req: NextRequest) {
  try {
    // Verify caller is admin
    const cookieStore = await cookies();
    const sessionClient = createServerClient(SUPABASE_URL, ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });
    const { data: { session } } = await sessionClient.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: caller } = await sessionClient.from('profiles').select('role').eq('id', session.user.id).single();
    if (!caller || caller.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPass) return NextResponse.json({ error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' }, { status: 500 });

    const admin = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const redirectTo = `${SITE_URL}/auth/callback`;
    const firstName = (name || email).split(' ')[0];

    // Generate magic link (doesn't send email — we send via Gmail)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: linkErr?.message || 'Failed to generate link' }, { status: 500 });
    }

    const actionLink = linkData.properties.action_link;

    // Send via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `Cloud Closet <${gmailUser}>`,
      to: email,
      subject: 'Your Cloud Closet Dashboard Access',
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
            Here&rsquo;s your link to access the Cloud Closet intern dashboard. Click below to log in &mdash; no password needed.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
            <tr><td style="background:#1c1917;border-radius:12px;padding:14px 28px;text-align:center">
              <a href="${actionLink}" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none">Log In to Dashboard &rarr;</a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;font-size:13px;color:#a8a29e">This link expires in 1 hour and can only be used once.</p>
          <p style="margin:0;font-size:13px;color:#a8a29e">Or copy this URL into your browser:<br>
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
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[magic-link] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
