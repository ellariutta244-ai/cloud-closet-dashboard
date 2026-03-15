import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      'https://gfdurfdqrhjzxjperknw.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY',
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    );

    const { data: rows, error } = await supabase
      .from('fcm_tokens')
      .select('token, profiles!inner(role)')
      .eq('profiles.role', 'ugc_creator');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const tokens: string[] = Array.from(new Set<string>((rows || []).map((r: any) => r.token as string).filter((t: string) => !!t)));
    if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 });

    const app = getAdminApp();
    const messaging = getMessaging(app);

    let sent = 0;
    for (const token of tokens) {
      try {
        await messaging.send({
          token,
          webpush: {
            notification: {
              title: '📊 Time to Submit!',
              body: "Don't forget to submit your weekly analytics for this week.",
              icon: '/icon-192.png',
            },
            headers: { Urgency: 'high' },
          },
        });
        sent++;
      } catch {
        // stale token, continue
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
