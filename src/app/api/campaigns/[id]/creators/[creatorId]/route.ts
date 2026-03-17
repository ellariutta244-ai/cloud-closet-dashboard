import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient('https://gfdurfdqrhjzxjperknw.supabase.co', serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
) {
  try {
    const sb = getSupabase();
    const { id: campaign_id, creatorId } = await params;
    const body = await req.json() as {
      creator_name?: string;
      email?: string;
      tiktok?: string;
      ig?: string;
      fee?: number;
      deliverables?: string[];
    };

    const { data, error } = await sb
      .from('external_campaign_creators')
      .update(body)
      .eq('id', creatorId)
      .eq('campaign_id', campaign_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Re-sync status rows when deliverables change
    if (body.deliverables !== undefined) {
      await sb.from('external_deliverable_status').delete().eq('creator_id', creatorId);
      if (body.deliverables.length > 0) {
        const statusRows = body.deliverables.map(del => ({
          campaign_id,
          creator_id: creatorId,
          deliverable: del,
          status: 'pending',
          payment_status: 'unpaid',
        }));
        await sb.from('external_deliverable_status').insert(statusRows);
      }
    }

    return NextResponse.json({ creator: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
) {
  try {
    const sb = getSupabase();
    const { id: campaign_id, creatorId } = await params;
    const { error } = await sb
      .from('external_campaign_creators')
      .delete()
      .eq('id', creatorId)
      .eq('campaign_id', campaign_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
