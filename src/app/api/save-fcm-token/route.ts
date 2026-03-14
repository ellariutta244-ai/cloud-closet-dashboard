import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();
  if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    "https://gfdurfdqrhjzxjperknw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY",
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  await supabase.from('fcm_tokens').upsert({ user_id: userId, token, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  return NextResponse.json({ ok: true });
}
