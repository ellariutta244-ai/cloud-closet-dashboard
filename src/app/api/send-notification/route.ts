import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail || !rawKey) throw new Error('FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY not configured');

  // rawKey is pure base64 (no PEM headers, no newlines) — rebuild proper PEM
  const base64Only = rawKey.replace(/\s/g, '');
  const lines = base64Only.match(/.{1,64}/g) || [];
  const privateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;

  return initializeApp({
    credential: cert({
      projectId: 'cloud-closet-dashboard',
      clientEmail,
      privateKey,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, team } = await req.json();
    if (!title || !body) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      "https://gfdurfdqrhjzxjperknw.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY",
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    );

    let query = supabase
      .from('fcm_tokens')
      .select('token, profiles!inner(role, team)');

    if (team) query = (query as any).eq('profiles.team', team);

    const { data: rows, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const tokens: string[] = (rows || []).map((r: any) => r.token).filter(Boolean);
    if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 });

    const app = getAdminApp();
    const messaging = getMessaging(app);

    let sent = 0;
    for (const token of tokens) {
      try {
        await messaging.send({
          token,
          notification: { title, body },
          webpush: { notification: { icon: '/icon-192.png' } },
        });
        sent++;
      } catch {
        // individual token may be stale, continue
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
