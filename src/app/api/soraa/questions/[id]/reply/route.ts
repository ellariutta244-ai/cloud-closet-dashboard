import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient(
    'https://gfdurfdqrhjzxjperknw.supabase.co',
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id: question_id } = await params;
    const body = await req.json() as { author_name: string; body: string };

    if (!body.author_name || !body.body) {
      return NextResponse.json({ error: 'Missing required fields: author_name, body' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('soraa_question_replies')
      .insert([{
        question_id,
        author_name: body.author_name,
        body: body.body,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ reply: data }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
