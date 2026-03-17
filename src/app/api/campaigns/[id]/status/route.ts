import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient('https://gfdurfdqrhjzxjperknw.supabase.co', serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sb = getSupabase();
    const { id } = await params;
    const { data, error } = await sb
      .from('external_deliverable_status')
      .select('*')
      .eq('campaign_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ statuses: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sb = getSupabase();
    const { id: campaign_id } = await params;
    const body = await req.json() as {
      creator_id: string;
      deliverable: string;
      status?: string;
      payment_status?: string;
    };

    if (!body.creator_id || !body.deliverable) {
      return NextResponse.json({ error: 'creator_id and deliverable required' }, { status: 400 });
    }

    const updates: { status?: string; payment_status?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (body.status !== undefined) updates.status = body.status;
    if (body.payment_status !== undefined) updates.payment_status = body.payment_status;

    const { data, error } = await sb
      .from('external_deliverable_status')
      .update(updates)
      .eq('campaign_id', campaign_id)
      .eq('creator_id', body.creator_id)
      .eq('deliverable', body.deliverable)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
