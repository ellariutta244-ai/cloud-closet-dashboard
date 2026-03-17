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

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('soraa_deliverable_status')
      .select('*')
      .order('creator_email', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ statuses: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json() as {
      creator_email: string;
      deliverable: string;
      status?: string;
      payment_status?: string;
    };

    if (!body.creator_email || !body.deliverable) {
      return NextResponse.json({ error: 'Missing required fields: creator_email, deliverable' }, { status: 400 });
    }

    const updates: { status?: string; payment_status?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (body.status !== undefined) updates.status = body.status;
    if (body.payment_status !== undefined) updates.payment_status = body.payment_status;

    const { data, error } = await supabase
      .from('soraa_deliverable_status')
      .update(updates)
      .eq('creator_email', body.creator_email)
      .eq('deliverable', body.deliverable)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ statuses: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
