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
      .from('external_campaign_creators')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ creators: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sb = getSupabase();
    const { id: campaign_id } = await params;
    const body = await req.json() as {
      creator_name: string;
      email: string;
      tiktok?: string;
      ig?: string;
      fee?: number;
      deliverables?: string[];
    };

    if (!body.creator_name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: 'creator_name and email required' }, { status: 400 });
    }

    const { data: creator, error } = await sb
      .from('external_campaign_creators')
      .insert([{ campaign_id, ...body }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Auto-create deliverable status rows
    if (body.deliverables && body.deliverables.length > 0) {
      const statusRows = body.deliverables.map(del => ({
        campaign_id,
        creator_id: creator.id,
        deliverable: del,
        status: 'pending',
        payment_status: 'unpaid',
      }));
      await sb.from('external_deliverable_status').insert(statusRows);
    }

    return NextResponse.json({ creator }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
