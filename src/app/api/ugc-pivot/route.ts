import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import Anthropic from '@anthropic-ai/sdk';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

export async function POST(req: NextRequest) {
  try {
    const { submissionId, creatorName, tiktokHandle, analytics } = await req.json();
    if (!submissionId || !creatorName || !analytics) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const {
      total_views, views_day1, views_day2, views_day3,
      likes, comments, shares, followers_gained,
      best_video_link, benchmark_tier, week_date,
    } = analytics;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

    const client = new Anthropic({ apiKey });

    const prompt = `You are a TikTok content strategist for Cloud Closet, a fashion brand. A UGC creator has submitted their weekly analytics. Generate a personalized pivot strategy.

Creator: ${creatorName} (@${tiktokHandle || 'unknown'})
Week: ${week_date}

Analytics:
- Total Views: ${total_views}
- Views Day 1: ${views_day1}
- Views Day 2: ${views_day2}
- Views Day 3: ${views_day3}
- Likes: ${likes}
- Comments: ${comments}
- Shares: ${shares}
- Followers Gained: ${followers_gained}
- Best Video: ${best_video_link || 'not provided'}
- Performance Tier: ${benchmark_tier}

Benchmark tiers: hook_failed (<500 views day 2), average (500-2000), good (2000-10000), strong (10000-50000), viral (50000+)

Kill rule: If consistently under 1,000 views by day 3, pivot format AND hook immediately.
Scale rule: If 10,000+ views, create 3 variations of this hook for multiple creators.

Generate a pivot strategy covering:
1. What's working (be specific)
2. What to change (be specific)
3. Three specific hook suggestions (write them out fully)
4. Format recommendations (length, style, structure)
5. If scale rule triggered: 3 hook variations

Keep it actionable, specific, and encouraging. Format with clear sections.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const aiPivot = message.content[0].type === 'text' ? message.content[0].text : '';

    const cookieStore = await cookies();
    const supabase = createServerClient(
      'https://gfdurfdqrhjzxjperknw.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY',
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    );

    const { data: queueRow, error: qErr } = await supabase.from('ugc_pivot_queue').insert({
      submission_id: submissionId,
      week_date,
      analytics_snapshot: analytics,
      ai_pivot: aiPivot,
      status: 'pending',
      created_at: new Date().toISOString(),
    }).select().single();

    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

    // Send admin push notification
    try {
      const app = getAdminApp();
      const messaging = getMessaging(app);
      const { data: adminTokens } = await supabase
        .from('fcm_tokens')
        .select('token, profiles!inner(role)')
        .eq('profiles.role', 'admin');

      const tokens = (adminTokens || []).map((r: any) => r.token).filter(Boolean);
      for (const token of tokens) {
        try {
          await messaging.send({
            token,
            webpush: {
              notification: {
                title: '📊 New UGC Pivot Ready for Review',
                body: `${creatorName} submitted analytics for week ${week_date}. AI pivot generated.`,
                icon: '/icon-192.png',
              },
              headers: { Urgency: 'normal' },
            },
          });
        } catch {
          // stale token, continue
        }
      }
    } catch {
      // FCM failure shouldn't block response
    }

    return NextResponse.json({ ok: true, queueId: queueRow.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
