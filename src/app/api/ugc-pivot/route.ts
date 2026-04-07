import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

const DEFAULT_SYSTEM_PROMPT = `You are a high-performance UGC growth analyst for a fast-scaling consumer app targeting college students.

Your job is NOT to give generic feedback.
Your job is to DIAGNOSE performance, IDENTIFY root causes, and prescribe SPECIFIC actions that will increase views, saves, and shares immediately.

You must be decisive, analytical, and action-oriented.

-----------------------------------
STEP 1: CALCULATE KEY METRICS
-----------------------------------
If not explicitly provided, calculate:

- Retention Rate = avg_watch_time / video_length
- Like Rate = likes / views
- Save Rate = saves / views
- Share Rate = shares / views

-----------------------------------
STEP 2: CLASSIFY PERFORMANCE (CHOOSE ONE)
-----------------------------------
You MUST assign the video to ONE category:

1. HOOK FAILURE
   (Low views relative to posting consistency)

2. RETENTION ISSUE
   (People click but don't stay)

3. LOW VALUE CONTENT
   (Views are decent but saves/shares are low)

4. HIGH POTENTIAL (NEEDS OPTIMIZATION)
   (One strong signal but not fully optimized)

5. BREAKOUT PERFORMER
   (High views + high saves or shares)

-----------------------------------
STEP 3: APPLY BENCHMARK LOGIC
-----------------------------------

Use these rules strictly:

- Views < 1,000 → Hook Failure
- Views 1K–10K → Average (look at other signals)
- Views > 10K → Strong

- Retention < 30% → Poor
- Retention 30–50% → Average
- Retention > 50% → Strong
- Retention > 70% → Viral potential

- Save Rate:
  < 2% → Weak
  3–5% → Solid
  > 5% → Strong
  > 8% → Elite

- Share Rate:
  < 1% → Weak
  1–3% → Good
  > 3% → Strong

-----------------------------------
STEP 4: ROOT CAUSE ANALYSIS
-----------------------------------
Explain WHY the video performed the way it did.

Be specific and tie directly to metrics.

Examples:
- "High views but low saves indicates the content is entertaining but lacks actionable or reusable value."
- "Low views indicates the hook is not strong enough to stop scrolling."
- "Low retention suggests pacing issues or weak structure."

DO NOT give vague statements.

-----------------------------------
STEP 5: EXACT PIVOT (MOST IMPORTANT)
-----------------------------------
Give a SPECIFIC, EXECUTABLE improvement.

You must include:

1. A rewritten hook (word-for-word)
2. A clearer or improved format
3. A specific content angle

Bad example:
❌ "Improve your hook"

Good example:
✅ "Start with: '3 outfits I would've worn last week if I had this app' and immediately show the best outfit in the first 2 seconds"

-----------------------------------
STEP 6: REPLICATION STRATEGY
-----------------------------------
If the video shows ANY signs of success:

Explain how to scale it:
- New variations
- Different scenarios
- Different audiences (roommates, sororities, etc.)

-----------------------------------
STEP 7: DECISION (MANDATORY)
-----------------------------------
You must choose ONE:

- SCALE → double down and replicate immediately
- ITERATE → keep concept but improve execution
- DROP → stop this direction and try a new format

-----------------------------------
STEP 8: NEXT VIDEO PLAN (FORCE ACTION)
-----------------------------------
Provide a structured plan the creator MUST follow:

- Hook:
- Format:
- Concept:
- CTA:

This should be ready to film immediately.

-----------------------------------
IMPORTANT RULES
-----------------------------------

- Be blunt and clear (no fluff)
- Do NOT repeat the input
- Do NOT give generic advice
- Every recommendation must be specific and actionable
- Optimize for SAVES and SHARES, not just views
- Assume the audience is college-aged women
- Prioritize relatable, roommate, and outfit-based content
- Do NOT reference the creator's school, university, location, or any personal detail not in the data
- Do NOT use language like "fashion tips", "style advice", "fashion influencer", "content creator tips", or similar buzzwords — they are off-brand
- Do NOT assume any field is 0 if it was not submitted — treat missing data as unknown and skip calculations that depend on it

-----------------------------------
OUTPUT FORMAT
-----------------------------------

Return your answer in this exact structure:

1. **Performance Classification:**
[category]

2. **Key Metrics:**
- Views:
- Retention:
- Save Rate:
- Share Rate:

3. **Diagnosis:**
[clear explanation]

4. **Pivot:**
- Hook:
- Format:
- Change:

5. **Replication Strategy:**
[if applicable]

6. **Decision:**
[SCALE / ITERATE / DROP]

7. **Next Video Plan:**
- Hook:
- Format:
- Concept:
- CTA:`;

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
      trending_sound, has_cta, is_slideshow,
      best_video_views, worst_video_views,
      avg_watch_time_seconds, watch_completion_rate, profile_visits,
      traffic_fyp_pct, traffic_following_pct, traffic_search_pct,
      traffic_profile_pct, traffic_sound_pct,
      most_active_time,
      top_search_query_1, top_search_query_2, top_search_query_3,
      comment_sentiment, best_video_link, benchmark_tier, week_date,
    } = analytics;

    const fmt = (n: any) => n != null ? Number(n).toLocaleString() : 'not submitted';
    const pct = (n: any) => n != null && n !== '' ? `${n}%` : 'not submitted';
    const sec = (n: any) => n != null && n !== '' ? `${n}s` : 'not submitted';

    const dataPrompt = `A UGC creator has submitted their weekly analytics. Generate their personalized pivot using the rules in your system instructions.

CRITICAL RULES FOR MISSING DATA:
- Any field marked "not submitted" means the creator did not provide that data — it is UNKNOWN, not zero.
- Do NOT assume a "not submitted" field is 0. Do not calculate rates using fields that are "not submitted".
- Only reference metrics that were actually submitted. If a metric is missing, say it's unavailable and base your analysis on what was provided.
- Do NOT reference the creator's school, location, city, university, or any other personal detail not present in this data. Do not invent context.
- Do NOT use generic buzzword language like "fashion tips", "style advice", "content tips", "fashion influencer", or similar clichés. Cloud Closet is not that brand. Keep the voice direct, specific, and grounded.

FIELD DEFINITIONS — read before analysing the data:
- total_views: THE ONLY VIEWS METRIC — SUM of views across ALL videos posted this week. Not one video's views.
- best_video_views: views on their single highest-performing video only (one video).
- worst_video_views: views on their single lowest-performing video only (one video).
- avg_watch_time_seconds + watch_completion_rate: retention metrics for the best video only, not a weekly average.
- videos_posted: how many videos they uploaded this week total.
- is_slideshow: CRITICAL — if true, the best video is a TikTok photo carousel/slideshow, NOT a traditional video. video_length_seconds and avg_watch_time_seconds do not apply and are marked N/A. Do NOT give watch-time or video-length advice for slideshows. Focus on hook text (opening image/text), saves, shares, and whether each slide delivers a clear payoff.

Creator: ${creatorName || 'Sample Creator'} (@${tiktokHandle || 'unknown'})
Week: ${week_date || 'this week'}
Performance Tier: ${benchmark_tier || 'not submitted'}

WEEKLY TOTALS — all videos combined this week:
- total_views = ${fmt(total_views)}  ← THE ONLY VIEWS METRIC — sum of every video's views this week
- videos_posted = ${videos_posted ?? 'not submitted'}  ← number of videos uploaded
- likes = ${fmt(likes)}  comments = ${fmt(comments)}  shares = ${fmt(shares)}  saves = ${fmt(saves)}
- profile_visits = ${fmt(profile_visits)}
- followers_gained = ${followers_gained != null ? fmt(followers_gained) : 'not submitted'}  followers_lost = ${followers_lost != null ? fmt(followers_lost) : 'not submitted'}  net = ${followers_gained != null && followers_lost != null ? fmt(followers_gained - followers_lost) : 'not submitted'}
- comment_sentiment = ${comment_sentiment ?? 'not submitted'}

BEST PERFORMING VIDEO — single video data only, not weekly averages:
- is_slideshow = ${is_slideshow ? 'YES — this is a photo carousel/slideshow, NOT a video' : 'no — standard video'}
- best_video_views = ${fmt(best_video_views)}  ← views on their #1 video
- worst_video_views = ${fmt(worst_video_views)}  ← views on their lowest video
- hook_text = ${hook_text ? `"${hook_text}"` : 'not submitted'}  ← opening line/image of best video
- format_type = ${format_type ?? 'not submitted'}  ← video style (talking_head, voiceover, outfit_montage, pov, trending_audio, tutorial)
- video_length_seconds = ${is_slideshow ? 'N/A (slideshow)' : sec(video_length_seconds)}
- avg_watch_time_seconds = ${is_slideshow ? 'N/A (slideshow)' : sec(avg_watch_time_seconds)}
- watch_completion_rate = ${is_slideshow ? (watch_completion_rate != null ? pct(watch_completion_rate) + ' (swipe-through rate)' : 'N/A (slideshow)') : pct(watch_completion_rate)}
- niche = ${niche ?? 'not submitted'}  ← topic/category of best video
- trending_sound = ${trending_sound ? 'yes' : 'no'}  ← used trending audio
- has_cta = ${has_cta ? 'yes' : 'no'}  ← included a call to action
- best_video_link = ${best_video_link ?? 'not submitted'}

TRAFFIC SOURCES — where viewers found their videos:
- For You Page (FYP) = ${pct(traffic_fyp_pct)}
- Search = ${pct(traffic_search_pct)}
- Following tab = ${pct(traffic_following_pct)}
- Profile = ${pct(traffic_profile_pct)}
- Sound/Audio = ${pct(traffic_sound_pct)}
${most_active_time ? `- Most active viewer time = ${most_active_time}` : ''}`;

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

      // Helper: send push to all admins
      async function pushAdmins(title: string, body: string) {
        try {
          const { data: adminTokens } = await supabase.from('fcm_tokens').select('token, profiles!inner(role)').eq('profiles.role', 'admin');
          const tokens = Array.from(new Set<string>((adminTokens || []).map((r: any) => r.token as string).filter((t: string) => !!t)));
          const app = getAdminApp();
          const messaging = getMessaging(app);
          for (const token of tokens) {
            try { await messaging.send({ token, webpush: { notification: { title: 'Cloud Closet Dashboard', body: `${title} — ${body}`, icon: '/icon-192.png' }, headers: { Urgency: 'high' } } }); } catch {}
          }
        } catch {}
      }

      // Viral alert (50k+)
      if (alertSettings.viral !== false && total_views >= 50000) {
        const msg = `${creatorName} went viral with ${total_views.toLocaleString()} views — stop everything and replicate this hook: "${hook_text || 'unknown'}"`;
        await pushAdmins('🚀 VIRAL ALERT', msg);
        await createAlertIfNew(supabase, creatorId, 'viral', msg, 'purple', weekDate);
      }
      // Scale rule (10k+)
      else if (alertSettings.scale_rule !== false && total_views >= 10000) {
        const msg = `${creatorName} hit ${total_views.toLocaleString()} views — scale this hook now: "${hook_text || 'unknown'}"`;
        await pushAdmins('📈 Scale Rule Triggered', msg);
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
          await pushAdmins('📉 Declining Performance', msg);
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
          await pushAdmins('🚨 Missed Streak Alert', msg);
          await createAlertIfNew(supabase, creatorId, 'missed_streak', msg, 'red', weekDate);
        }
      }
    } catch (alertErr) {
      console.error('[smart_alerts] generation failed:', alertErr);
    }

    // Send admin push notification
    try {
      const app = getAdminApp();
      const messaging = getMessaging(app);
      const { data: adminTokens } = await supabase
        .from('fcm_tokens')
        .select('token, profiles!inner(role)')
        .eq('profiles.role', 'admin');

      const tokens = Array.from(new Set<string>((adminTokens || []).map((r: any) => r.token as string).filter((t: string) => !!t)));
      for (const token of tokens) {
        try {
          await messaging.send({
            token,
            webpush: {
              notification: {
                title: 'Cloud Closet Dashboard',
                body: `📊 New UGC Pivot Ready for Review — ${creatorName} submitted analytics for week ${week_date}.`,
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
