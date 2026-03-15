import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

    const {
      total_views, likes, comments, shares, saves,
      followers_gained, followers_lost, net_follower_change,
      total_account_views, videos_posted,
      hook_text, format_type, video_length_seconds, niche,
      trending_sound, has_cta,
      avg_watch_time_seconds, watch_completion_rate, profile_visits,
      traffic_fyp_pct, traffic_following_pct, traffic_search_pct,
      comment_sentiment, best_video_link, benchmark_tier, week_date,
    } = analytics;

    const prompt = `You are a TikTok content strategist for Cloud Closet, a fashion brand. A UGC creator has submitted their weekly analytics. Generate a personalized, data-driven pivot strategy.

Creator: ${creatorName} (@${tiktokHandle || 'unknown'})
Week: ${week_date}
Performance Tier: ${benchmark_tier}

VIDEO METADATA:
- Hook: "${hook_text || 'not provided'}"
- Format: ${format_type || 'unknown'}
- Video Length: ${video_length_seconds ? `${video_length_seconds}s` : 'unknown'}
- Niche/Topic: ${niche || 'not specified'}
- Trending Sound: ${trending_sound ? 'Yes' : 'No'}
- CTA Included: ${has_cta ? 'Yes' : 'No'}

VIEW DATA:
- Total Views: ${total_views?.toLocaleString() || 0}
- Avg Watch Time: ${avg_watch_time_seconds ? `${avg_watch_time_seconds}s` : 'unknown'}
- Watch Completion Rate: ${watch_completion_rate ? `${watch_completion_rate}%` : 'unknown'}
- Profile Visits: ${profile_visits || 0}
- Traffic: FYP ${traffic_fyp_pct || 0}% / Following ${traffic_following_pct || 0}% / Search ${traffic_search_pct || 0}%

ENGAGEMENT:
- Likes: ${likes || 0} | Comments: ${comments || 0} | Shares: ${shares || 0} | Saves: ${saves || 0}
- Comment Sentiment: ${comment_sentiment || 'neutral'}

ACCOUNT HEALTH:
- Followers Gained: ${followers_gained || 0} | Lost: ${followers_lost || 0} | Net: ${net_follower_change || 0}
- Total Account Views This Week: ${total_account_views || 0}
- Videos Posted This Week: ${videos_posted || 0}
- Best Video: ${best_video_link || 'not provided'}

BENCHMARK TIERS: hook_failed (<500 completion rate or low views), average, good (2k-10k views), strong (10k-50k), viral (50k+)
KILL RULE: Under 1,000 total views → pivot format AND hook immediately.
SCALE RULE: 10,000+ views → provide 3 hook variations to replicate across creators.

Generate a pivot strategy with these sections:
1. **Performance Analysis** — what the data tells us (reference specific numbers)
2. **What's Working** — be specific about what drove results
3. **What to Change** — concrete, actionable changes
4. **3 Hook Suggestions** — write each hook out in full, tailored to this creator's niche
5. **Format Recommendations** — length, style, sound strategy, CTA placement
6. **Hook Variations** (only if scale rule triggered) — 3 variations of what worked

Be specific, data-driven, and encouraging. Reference the actual numbers.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }
    const geminiData = await geminiRes.json();
    const aiPivot = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Use service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: queueRow, error: qErr } = await supabase.from('ugc_pivot_queue').insert({
      creator_id: analytics.creator_id ?? null,
      submission_id: submissionId,
      week_date: week_date?.split('T')[0] ?? week_date,
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
