import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, team, role } = await req.json();
    if (!title || !body) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

    const supabase = createClient(
      'https://gfdurfdqrhjzxjperknw.supabase.co',
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let query = supabase.from('fcm_tokens').select('token, profiles!inner(role, team)');
    if (role) query = (query as any).eq('profiles.role', role);
    else if (team) query = (query as any).eq('profiles.team', team);

    const { data: rows, error } = await query;
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
            notification: { title, body, icon: '/icon-192.png' },
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
