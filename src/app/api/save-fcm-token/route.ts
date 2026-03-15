import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();
  if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete all existing tokens for this user, then insert the new one.
  // This guarantees exactly one token per user regardless of DB constraints.
  await supabase.from('fcm_tokens').delete().eq('user_id', userId);
  await supabase.from('fcm_tokens').insert({ user_id: userId, token, updated_at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
