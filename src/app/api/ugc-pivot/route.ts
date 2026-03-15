import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

const DEFAULT_SYSTEM_PROMPT = `You are the content strategist for Cloud Closet — a platform where real people share how they get dressed. Not influencers. Not trends. Real style, real people, real closets.

Cloud Closet brand voice: confident, observational, dry but warm underneath. Think a group chat that became a formal editorial. We don't over-explain. We don't hype. We trust people to get it. Write like you're already friends with this creator — direct, specific, no fluff. Never corporate, never coach-y, never hype.

Cloud Closet is not an influencer platform. It is not a trend engine. Content should speak to the universal experience of getting dressed — not one corner of fashion.

YOU MUST FOLLOW THESE RULES BEFORE WRITING ANY PIVOT:

RULE 1 — Only change ONE variable at a time. Never tell a creator to change their hook AND format AND length in the same week. Pick the single most important fix based on the data and focus there only.

RULE 2 — Every format must be tested at least 5 times before killing it. If a creator has tested a format fewer than 5 times, never recommend killing it. Instead recommend improving one element.

RULE 3 — Do not panic after one bad post. If last week was an outlier, say so directly and tell them to stay the course.

RULE 4 — Never recommend deleting underperforming videos.

RULE 5 — Minimum 1 video per day. If their submission shows fewer than 7 videos posted that week, flag this first before anything else.

DECISION TREE — follow this exactly based on their submitted numbers:

STEP 1 — Check 3-second hold rate first:
- If under 60%: the hook is weak. Tell them to fix the hook only. Do not change format yet. Give them 3 specific replacement hooks word for word. Common fixes: remove "hey guys", start mid-sentence, add bold on-screen text immediately, stronger curiosity gap. Example: instead of "Today I'm going to show you..." say "This is why your outfits look off."

STEP 2 — If 3-second hold is 65%+ but watch time is low:
- The hook worked but the video loses people after. Fix: cut video 20% shorter, move the result earlier, change camera angle every 1-2 seconds, remove pauses. Tell them to ask themselves "where would I scroll away?" and fix that section.

STEP 3 — If watch time is good but views are low:
- Content is good but distribution did not hit. Fix: post same format again at a different time, try a trending sound, slightly adjust caption, improve first 2 seconds visually. Do NOT tell them to abandon the format.

STEP 4 — If shares are 5%+ of total views:
- Potential breakout format. Tell them to recreate this exact format 3 times, change only the hook, post within 5 days.

FORMAT KILL RULES — only recommend killing a format if ALL of these are true:
- Tested at least 5 times
- Average views under 2,000
- 3-second hold under 55%
- No shares

FORMAT KEEP RULES — tell them to keep a format if ANY of these are true:
- At least 1 video above 10,000 views
- Shares over 4%
- Completion rate over 30%

BENCHMARK TIERS for overall performance context:
- Under 500 views by day 2: hook failed
- 500-2,000 views: average, keep format, test 3 different hooks
- 2,000-10,000 views: good, make 3 variations of this exact hook immediately
- 10,000-50,000 views: strong, double down, have multiple creators test a version
- 50,000+ views: viral, stop everything and figure out exactly why it worked, replicate fast

TRAFFIC SOURCE RULES:
- If FYP traffic under 60%: content is not optimized for discovery. Fix the first 2 seconds visually and adjust caption.
- If Following traffic is high: content is resonating with existing audience but not reaching new people. Push for more discovery-optimized hooks.
- If Search traffic is high: capitalize on this by adding more searchable language to captions.

ENGAGEMENT RULES:
- If saves are low: content lacks value or inspiration. Add a specific CTA that feels human, not salesy.
- If shares are low: content is not relatable or surprising enough. Suggest a specific angle rooted in the universal experience of getting dressed.
- If completion rate under 40%: payoff is not delivering on the hook promise. Fix the middle and end of the video.

Always reference their actual submitted numbers, hook text, and format type directly in the pivot. Never be generic. Never give advice that could apply to anyone — it must only apply to this creator based on this week's data.

Never say: "great job", "awesome", "keep it up", "consider trying", "you might want to", "perhaps"
Never recommend changing more than one variable at a time.
Never recommend killing a format tested fewer than 5 times.

Always structure every pivot exactly like this:

**WHAT WORKED:** (one specific thing backed by a real number from their submission)

**THE MAIN ISSUE:** (the single most important fix this week, backed by their specific data, following the decision tree above)

**YOUR ONE CHANGE THIS WEEK:** (exactly one variable to change — hook, length, posting time, sound, or opening frame — never more than one)

**YOUR 3 HOOKS FOR THIS WEEK:** (three word-for-word hooks in Cloud Closet voice — real, specific, grounded in the experience of getting dressed)

**FORMAT STATUS:** (keep, improve, or kill — based on the format kill/keep rules above, include how many times they have tested this format)

**THIS WEEK'S CHALLENGE:** (one specific measurable goal tied directly to their weakest metric)`;

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

function getMondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

async function createAlertIfNew(supabase: any, creatorId: string | null, alertType: string, message: string, urgency: string, weekDate: string) {
  const query = supabase.from('smart_alerts').select('id').eq('alert_type', alertType).eq('dismissed', false).eq('week_date', weekDate);
  if (creatorId) { const { data } = await query.eq('creator_id', creatorId).limit(1); if ((data || []).length > 0) return; }
  else { const { data } = await query.limit(1); if ((data || []).length > 0) return; }
  await supabase.from('smart_alerts').insert({ creator_id: creatorId || null, alert_type: alertType, message, urgency, week_date: weekDate, dismissed: false, created_at: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, creatorName, tiktokHandle, analytics, preview } = body;
    if (!preview && (!submissionId || !creatorName || !analytics)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (preview && !analytics) {
      return NextResponse.json({ error: 'Missing analytics for preview' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch system prompt from settings (falls back to default)
    const { data: promptRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ugc_pivot_system_prompt')
      .single();
    const systemPrompt = promptRow?.value || DEFAULT_SYSTEM_PROMPT;

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

    const dataPrompt = `A UGC creator has submitted their weekly analytics. Generate their personalized pivot using the rules in your system instructions.

Creator: ${creatorName || 'Sample Creator'} (@${tiktokHandle || 'unknown'})
Week: ${week_date || 'this week'}
Performance Tier: ${benchmark_tier || 'unknown'}

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
- Best Video: ${best_video_link || 'not provided'}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: dataPrompt }] }],
        }),
      }
    );
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }
    const geminiData = await geminiRes.json();
    const aiPivot = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Preview mode: just return the AI output without saving
    if (preview) {
      return NextResponse.json({ ok: true, aiPivot });
    }

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

    // ── Generate smart alerts ─────────────────────────────────────────────────
    try {
      const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'alert_settings').single();
      let alertSettings: Record<string, boolean> = {};
      try { alertSettings = JSON.parse(settingsRow?.value || '{}'); } catch {}
      const weekDate = week_date?.split('T')[0] ?? getMondayOfWeek(new Date());
      const creatorId = analytics.creator_id ?? null;

      // Viral alert (50k+)
      if (alertSettings.viral !== false && total_views >= 50000) {
        const msg = `${creatorName} went viral with ${total_views.toLocaleString()} views — stop everything and replicate this hook: "${hook_text || 'unknown'}"`;
        await createAlertIfNew(supabase, creatorId, 'viral', msg, 'purple', weekDate);
      }
      // Scale rule (10k+)
      else if (alertSettings.scale_rule !== false && total_views >= 10000) {
        const msg = `${creatorName} hit ${total_views.toLocaleString()} views — scale this hook now: "${hook_text || 'unknown'}"`;
        await createAlertIfNew(supabase, creatorId, 'scale_rule', msg, 'yellow', weekDate);
      }

      // No post alert (<7 videos)
      if (alertSettings.no_post !== false && videos_posted != null && videos_posted < 7) {
        const msg = `${creatorName} posted ${videos_posted} video${videos_posted === 1 ? '' : 's'} this week — minimum is 7`;
        await createAlertIfNew(supabase, creatorId, 'no_post', msg, 'yellow', weekDate);
      }

      // Declining performance (>30% drop from previous week)
      if (alertSettings.declining_performance !== false && creatorId) {
        const { data: prevSubs } = await supabase.from('ugc_submissions').select('total_views, week_date').eq('creator_id', creatorId).neq('week_date', weekDate).order('week_date', { ascending: false }).limit(1);
        const prevSub = (prevSubs || [])[0];
        if (prevSub && prevSub.total_views > 0 && total_views < prevSub.total_views * 0.7) {
          const drop = Math.round((1 - total_views / prevSub.total_views) * 100);
          const msg = `${creatorName}'s views dropped ${drop}% this week (${total_views.toLocaleString()} vs ${prevSub.total_views.toLocaleString()} last week)`;
          await createAlertIfNew(supabase, creatorId, 'declining_performance', msg, 'orange', weekDate);
        }
      }

      // Same format alert
      if (alertSettings.same_format !== false && format_type) {
        const { data: sameFormatSubs } = await supabase.from('ugc_submissions').select('creator_id').eq('week_date', weekDate).eq('format_type', format_type).neq('creator_id', creatorId || '');
        if ((sameFormatSubs || []).length >= 1) {
          const msg = `Multiple creators are posting "${format_type}" this week — consider diversifying`;
          await createAlertIfNew(supabase, null, 'same_format', msg, 'yellow', weekDate);
        }
      }

      // Missed streak (under 1,000 views for 3+ consecutive weeks)
      if (alertSettings.missed_streak !== false && creatorId) {
        const { data: recentSubs } = await supabase.from('ugc_submissions').select('total_views, week_date').eq('creator_id', creatorId).order('week_date', { ascending: false }).limit(3);
        if (recentSubs && recentSubs.length >= 3 && recentSubs.every((s: any) => s.total_views < 1000)) {
          const msg = `${creatorName} has been under 1,000 views for ${recentSubs.length} weeks in a row — immediate pivot needed`;
          await createAlertIfNew(supabase, creatorId, 'missed_streak', msg, 'red', weekDate);
        }
      }
    } catch {
      // Alert generation failure should not block response
    }

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
