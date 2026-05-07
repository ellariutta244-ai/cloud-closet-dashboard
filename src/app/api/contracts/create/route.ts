import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloud-closet-dashboard.vercel.app';

// POST /api/contracts/create
// Admin-only: create a contract record and return the signing URL.
export async function POST(req: NextRequest) {
  try {
    // Verify caller is an admin via their session cookie
    const cookieStore = await cookies();
    const sessionClient = createServerClient(SUPABASE_URL, ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });
    const { data: { session } } = await sessionClient.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: caller } = await sessionClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (!caller || !['admin', 'team_exec', 'subteam_exec'].includes(caller.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { intern_name, intern_email, content } = await req.json();
    if (!intern_email?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'intern_email and content are required.' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const admin = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 7-day expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: contract, error } = await admin
      .from('contracts')
      .insert({
        intern_name: intern_name?.trim() || null,
        intern_email: intern_email.trim().toLowerCase(),
        content: content.trim(),
        created_by: session.user.id,
        token_expires_at: expiresAt,
      })
      .select('token')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const signingUrl = `${SITE_URL}/sign/${contract.token}`;
    return NextResponse.json({ ok: true, token: contract.token, signing_url: signingUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
