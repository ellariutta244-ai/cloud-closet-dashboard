import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

export async function GET(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find all unsent reminders due now or in the past
  const { data: due, error } = await supabase
    .from('caroline_reminders')
    .select('*')
    .eq('sent', false)
    .lte('remind_at', new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!due || due.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let sent = 0;

  for (const reminder of due) {
    try {
      await fetch(`${siteUrl}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Time to film',
          body: `Don't forget: film "${reminder.idea_title}"`,
          role: 'director',
        }),
      });
      await supabase.from('caroline_reminders').update({ sent: true }).eq('id', reminder.id);
      sent++;
    } catch {
      // continue on failure
    }
  }

  return NextResponse.json({ ok: true, sent });
}
