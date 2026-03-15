import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const body = await req.json();
  const { id, archived, updateFields, full_name, tiktok_handle, tiktok_url } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let updates: Record<string, unknown>;
  if (updateFields) {
    updates = { full_name, tiktok_handle, tiktok_url };
  } else {
    updates = { ugc_status: archived ? 'archived' : 'active' };
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
