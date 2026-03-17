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

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    let query = supabase
      .from('soraa_questions')
      .select('*, soraa_question_replies(*)')
      .order('created_at', { ascending: true });

    if (email) {
      query = query.eq('creator_email', email);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ questions: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json() as { creator_email: string; creator_name: string; body: string };

    if (!body.creator_email || !body.creator_name || !body.body) {
      return NextResponse.json({ error: 'Missing required fields: creator_email, creator_name, body' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('soraa_questions')
      .insert([{
        creator_email: body.creator_email,
        creator_name: body.creator_name,
        body: body.body,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
