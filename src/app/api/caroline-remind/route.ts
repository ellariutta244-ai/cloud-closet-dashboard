import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const { ideaId, ideaTitle } = await req.json();
  if (!ideaTitle) return NextResponse.json({ error: 'ideaTitle is required' }, { status: 400 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
  const in3Days = new Date(now); in3Days.setDate(in3Days.getDate() + 3); in3Days.setHours(10, 0, 0, 0);

  // Store follow-up reminders
  await supabase.from('caroline_reminders').insert([
    { idea_id: ideaId ?? null, idea_title: ideaTitle, remind_at: tomorrow.toISOString(), sent: false },
    { idea_id: ideaId ?? null, idea_title: ideaTitle, remind_at: in3Days.toISOString(), sent: false },
  ]);

  // Send the immediate notification now
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${siteUrl}/api/send-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Time to film',
      body: `Reminder: film "${ideaTitle}"`,
      role: 'director',
    }),
  });

  const json = await res.json();
  return NextResponse.json({ ok: true, sent: json.sent ?? 0 });
}
