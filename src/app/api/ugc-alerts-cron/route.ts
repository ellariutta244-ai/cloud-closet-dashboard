import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getMondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

async function sendAdminPush(title: string, body: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cloud-closet-ops.vercel.app';
  try {
    await fetch(`${baseUrl}/api/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', title, body }),
    });
  } catch {}
}

async function sendCreatorPush(_supabase: any, userId: string, title: string, body: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cloud-closet-ops.vercel.app';
  try {
    await fetch(`${baseUrl}/api/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body }),
    });
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
        await sendAdminPush('⚠️ Missed Submission', msg);
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
        await sendAdminPush('👻 Creator Inactive', msg);
        results.push(`creator_inactive: ${creator.full_name}`);
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}
