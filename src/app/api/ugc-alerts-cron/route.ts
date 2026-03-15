import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

function getMondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

async function sendAdminPush(supabase: any, title: string, body: string) {
  try {
    const { data: adminTokens } = await supabase
      .from('fcm_tokens')
      .select('token, profiles!inner(role)')
      .eq('profiles.role', 'admin');
    const tokens = Array.from(new Set<string>((adminTokens || []).map((r: any) => r.token as string).filter((t: string) => !!t)));
    const app = getAdminApp();
    const messaging = getMessaging(app);
    for (const token of tokens) {
      try {
        await messaging.send({ token, webpush: { notification: { title, body, icon: '/icon-192.png' }, headers: { Urgency: 'normal' } } });
      } catch {}
    }
  } catch {}
}

async function sendCreatorPush(supabase: any, creatorId: string, title: string, body: string) {
  try {
    const { data: rows } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', creatorId);
    const tokens = Array.from(new Set<string>((rows || []).map((r: any) => r.token as string).filter((t: string) => !!t)));
    const app = getAdminApp();
    const messaging = getMessaging(app);
    for (const token of tokens) {
      try {
        await messaging.send({ token, webpush: { notification: { title, body, icon: '/icon-192.png' }, headers: { Urgency: 'high' } } });
      } catch {}
    }
  } catch {}
}

async function alertExists(supabase: any, creatorId: string | null, alertType: string, weekDate: string): Promise<boolean> {
  const query = supabase.from('smart_alerts').select('id').eq('alert_type', alertType).eq('dismissed', false).eq('week_date', weekDate);
  if (creatorId) query.eq('creator_id', creatorId);
  const { data } = await query.limit(1);
  return (data || []).length > 0;
}

async function createAlert(supabase: any, creatorId: string | null, alertType: string, message: string, urgency: string, weekDate: string) {
  const exists = await alertExists(supabase, creatorId, alertType, weekDate);
  if (exists) return;
  await supabase.from('smart_alerts').insert({
    creator_id: creatorId || null,
    alert_type: alertType,
    message,
    urgency,
    week_date: weekDate,
    dismissed: false,
    created_at: new Date().toISOString(),
  });
}

export async function GET(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const type = req.nextUrl.searchParams.get('type') || 'all';
  const currentWeek = getMondayOfWeek(new Date());
  const results: string[] = [];

  // Load alert settings
  const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'alert_settings').single();
  let alertSettings: Record<string, boolean> = {};
  try { alertSettings = JSON.parse(settingsRow?.value || '{}'); } catch {}

  // ── Missed Submission check (run on Fridays) ─────────────────────────────────
  if ((type === 'all' || type === 'missed_submission') && alertSettings.missed_submission !== false) {
    const { data: creators } = await supabase.from('profiles').select('id, full_name').eq('role', 'ugc_creator').eq('active', true);
    const { data: submissions } = await supabase.from('ugc_submissions').select('creator_id').eq('week_date', currentWeek);
    const submittedIds = new Set((submissions || []).map((s: any) => s.creator_id));

    for (const creator of creators || []) {
      if (!submittedIds.has(creator.id)) {
        // Send reminder push to creator
        await sendCreatorPush(supabase, creator.id, '⏰ Analytics Due Today', `${creator.full_name}, don't forget to submit your weekly analytics before midnight!`);
        // Alert admin
        const msg = `${creator.full_name} has not submitted their Friday analytics yet.`;
        await createAlert(supabase, creator.id, 'missed_submission', msg, 'red', currentWeek);
        await sendAdminPush(supabase, '⚠️ Missed Submission', msg);
        results.push(`missed_submission: ${creator.full_name}`);
      }
    }
  }

  // ── Creator Inactive check (run daily) ───────────────────────────────────────
  if ((type === 'all' || type === 'creator_inactive') && alertSettings.creator_inactive !== false) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: creators } = await supabase.from('profiles').select('id, full_name, last_seen_at').eq('role', 'ugc_creator').eq('active', true);
    for (const creator of creators || []) {
      const isInactive = !creator.last_seen_at || creator.last_seen_at < sevenDaysAgo;
      if (isInactive) {
        const msg = `${creator.full_name} hasn't logged into the dashboard in 7+ days — check in with them.`;
        await createAlert(supabase, creator.id, 'creator_inactive', msg, 'yellow', currentWeek);
        await sendAdminPush(supabase, '👻 Creator Inactive', msg);
        results.push(`creator_inactive: ${creator.full_name}`);
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}
