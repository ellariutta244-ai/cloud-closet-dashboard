import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, body, team } = await req.json();
  if (!title || !body) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });

  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) return NextResponse.json({ error: 'FCM server key not configured' }, { status: 500 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  // Fetch FCM tokens — optionally filtered by team
  let query = supabase
    .from('fcm_tokens')
    .select('token, profiles!inner(role, team)')
    .eq('profiles.role', 'intern');

  if (team) query = (query as any).eq('profiles.team', team);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tokens: string[] = (rows || []).map((r: any) => r.token).filter(Boolean);
  if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // FCM legacy API supports up to 1000 tokens per batch
  const batches = [];
  for (let i = 0; i < tokens.length; i += 1000) batches.push(tokens.slice(i, i + 1000));

  let sent = 0;
  for (const batch of batches) {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: batch,
        notification: { title, body },
        webpush: { notification: { icon: '/icon-192.png' } },
      }),
    });
    if (res.ok) sent += batch.length;
  }

  return NextResponse.json({ ok: true, sent });
}
