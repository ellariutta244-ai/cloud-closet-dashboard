import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, tiktok_handle } = await req.json();
    if (!full_name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

    const admin = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to invite; if already registered, look up existing user
    let userId: string;
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
    });
    if (inviteErr) {
      if (!inviteErr.message.toLowerCase().includes('already')) {
        return NextResponse.json({ error: inviteErr.message }, { status: 500 });
      }
      // User exists — find their ID
      const { data: { users }, error: listErr } = await admin.auth.admin.listUsers();
      if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });
      const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!existing) return NextResponse.json({ error: 'Could not find existing user' }, { status: 500 });
      userId = existing.id;
    } else {
      userId = invited.user.id;
    }

    // Upsert profile with ugc_creator role
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .upsert({
        id: userId,
        full_name,
        email,
        tiktok_handle: tiktok_handle || null,
        role: 'ugc_creator',
        active: true,
        ugc_status: 'active',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
