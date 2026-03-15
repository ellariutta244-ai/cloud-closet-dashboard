import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  return mon.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  // Vercel cron security check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch all active UGC creators
  const { data: creators, error: creatorsErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'ugc_creator');

  if (creatorsErr || !creators?.length) {
    return NextResponse.json({ error: 'No active creators found' }, { status: 200 });
  }

  const weekDate = getMondayOfWeek();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cloud-closet-ops.vercel.app';

  const results: { creatorId: string; name: string; status: string; error?: string }[] = [];

  for (const creator of creators) {
    try {
      const res = await fetch(`${baseUrl}/api/ugc-weekly-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: creator.id, weekDate, forceRegenerate: false }),
      });

      const json = await res.json();
      if (json.exists) {
        results.push({ creatorId: creator.id, name: creator.full_name ?? '', status: 'skipped_exists' });
      } else if (json.success) {
        results.push({ creatorId: creator.id, name: creator.full_name ?? '', status: 'generated' });
      } else {
        results.push({ creatorId: creator.id, name: creator.full_name ?? '', status: 'error', error: json.error });
      }
    } catch (e: any) {
      results.push({ creatorId: creator.id, name: creator.full_name ?? '', status: 'error', error: e.message });
    }
  }

  const generated = results.filter(r => r.status === 'generated').length;
  const errors = results.filter(r => r.status === 'error').length;

  // Send admin push notification
  const fbBase64 = process.env.FIREBASE_SA_BASE64;
  if (fbBase64 && generated > 0) {
    try {
      if (!getApps().length) {
        const sa = JSON.parse(Buffer.from(fbBase64, 'base64').toString('utf-8'));
        initializeApp({ credential: cert(sa) });
      }

      // Fetch admin FCM tokens
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('role', 'admin');

      const tokens = (adminProfiles ?? []).map((p: any) => p.fcm_token).filter(Boolean);

      if (tokens.length) {
        const messaging = getMessaging();
        await Promise.allSettled(
          tokens.map((token: string) =>
            messaging.send({
              token,
              webpush: {
                notification: {
                  title: 'Cloud Closet Dashboard',
                  body: `Weekly Plans Ready — ${generated} new content plan${generated > 1 ? 's' : ''} generated. Tap to review.`,
                  icon: '/icon-192.png',
                },
              },
              data: { page: 'ugc_weekly_plans' },
            })
          )
        );
      }
    } catch (e) {
      console.error('Push notification error:', e);
    }
  }

  return NextResponse.json({
    success: true,
    weekDate,
    total: creators.length,
    generated,
    errors,
    results,
  });
}
