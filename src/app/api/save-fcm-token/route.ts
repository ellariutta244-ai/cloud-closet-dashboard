import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();
  if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  await supabase.from('fcm_tokens').upsert({ user_id: userId, token, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  return NextResponse.json({ ok: true });
}
