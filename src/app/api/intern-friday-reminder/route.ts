import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  return mon.toISOString().split('T')[0];
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const weekDate = getMondayOfWeek();

  // Get all active interns
  const { data: interns } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'intern');

  // Get reports already submitted this week
  const { data: reports } = await supabase
    .from('weekly_reports')
    .select('intern_id')
    .gte('week_of', weekDate);

  const submittedIds = new Set((reports ?? []).map((r: any) => r.intern_id));
  const missingIds = (interns ?? []).map((i: any) => i.id).filter((id: string) => !submittedIds.has(id));

  if (missingIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'All interns have submitted' });
  }

  // Get FCM tokens for interns who haven't submitted
  const { data: tokenRows } = await supabase
    .from('fcm_tokens')
    .select('user_id, token')
    .in('user_id', missingIds);

  const userTokenMap = new Map<string, string>();
  for (const r of (tokenRows ?? []) as any[]) {
    if (r.token && !userTokenMap.has(r.user_id)) userTokenMap.set(r.user_id, r.token);
  }

  const tokens = Array.from(userTokenMap.values());
  if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const app = getAdminApp();
  const messaging = getMessaging(app);
  const notifId = `friday-reminder-${weekDate}`;

  let sent = 0;
  for (const token of tokens) {
    try {
      await messaging.send({
        token,
        webpush: {
          notification: {
            title: 'Cloud Closet Dashboard',
            body: "Weekly report reminder — don't forget to submit your update before the weekend!",
            icon: '/icon-192.png',
            tag: notifId,
          },
          headers: { Urgency: 'high' },
        },
      });
      sent++;
    } catch {
      // stale token, skip
    }
  }

  return NextResponse.json({ ok: true, sent, missing: missingIds.length });
}
