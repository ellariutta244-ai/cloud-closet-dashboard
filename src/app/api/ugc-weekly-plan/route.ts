import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getPhase(submissionCount: number): string {
  if (submissionCount <= 4) return 'setup';
  if (submissionCount <= 12) return 'volume';
  if (submissionCount <= 20) return 'optimize';
  return 'scale';
}

function fmt(n: any) { return n != null ? Number(n).toLocaleString() : 'not submitted'; }
function pct(n: any) { return n != null && n !== 0 ? `${n}%` : 'not submitted'; }
function sec(n: any) { return n != null ? `${n}s` : 'not submitted'; }
function flag(b: any) { return b ? 'yes' : 'no'; }

function buildPrompt(creatorName: string, phase: string, submissions: any[]): string {
  const recent = submissions.slice(0, 4);

  const analyticsSection = recent.length === 0
    ? '(no submissions yet — new creator, plan based on phase guidance only)'
    : recent.map((s: any, i: number) => {
        const lines: string[] = [];
        lines.push(`── WEEK OF ${s.week_date}${i === 0 ? ' [MOST RECENT]' : ''} ──`);

        lines.push(`WEEKLY TOTALS — these numbers cover ALL videos posted this week combined:`);
        lines.push(`  total_views = ${fmt(s.total_views)}  ← THE ONLY VIEWS METRIC — sum of every video's views this week. This is not one video's views.`);
        lines.push(`  videos_posted = ${s.videos_posted ?? 'not submitted'}  ← how many videos they uploaded`);
        lines.push(`  likes = ${fmt(s.likes)}  comments = ${fmt(s.comments)}  shares = ${fmt(s.shares)}  saves = ${fmt(s.saves)}`);
        lines.push(`  profile_visits = ${fmt(s.profile_visits)}`);
        lines.push(`  followers_gained = ${fmt(s.followers_gained)}  followers_lost = ${fmt(s.followers_lost)}  net = ${fmt((s.followers_gained ?? 0) - (s.followers_lost ?? 0))}`);
        lines.push(`  comment_sentiment = ${s.comment_sentiment ?? 'not submitted'}  ← overall tone of comments (positive/neutral/negative)`);

        lines.push(`BEST PERFORMING VIDEO — all fields below are for their single top video only, NOT weekly averages:`);
        lines.push(`  best_video_views = ${fmt(s.best_video_views)}  ← views on their #1 video this week`);
        lines.push(`  worst_video_views = ${fmt(s.worst_video_views)}  ← views on their lowest-performing video`);
        lines.push(`  is_slideshow = ${flag(s.is_slideshow)}  ← if true, best video is a photo slideshow (TikTok carousel), NOT a traditional video`);
        if (s.is_slideshow) {
          lines.push(`  video_length_seconds = N/A (slideshow — no meaningful video length)`);
          lines.push(`  avg_watch_time_seconds = N/A (slideshow — watch time metric does not apply; TikTok loops slideshows automatically)`);
          lines.push(`  watch_completion_rate = ${s.watch_completion_rate != null ? pct(s.watch_completion_rate) : 'N/A (slideshow)'}  ← for slideshows this reflects swipe-through rate, not video completion`);
        } else {
          lines.push(`  video_length_seconds = ${sec(s.video_length_seconds)}  ← length of best video`);
          lines.push(`  avg_watch_time_seconds = ${sec(s.avg_watch_time_seconds)}  ← avg time viewers spent watching best video`);
          lines.push(`  watch_completion_rate = ${pct(s.watch_completion_rate)}  ← % of viewers who watched best video to the end`);
        }
        lines.push(`  hook_text = ${s.hook_text ? `"${s.hook_text}"` : 'not submitted'}  ← opening line/hook of best video`);
        lines.push(`  format_type = ${s.format_type ?? 'not submitted'}  ← video style (e.g. talking_head, voiceover, outfit_montage, pov, trending_audio, tutorial)`);
        lines.push(`  niche = ${s.niche ?? 'not submitted'}  ← topic or content category of best video`);
        lines.push(`  trending_sound = ${flag(s.trending_sound)}  ← did best video use a trending audio`);
        lines.push(`  has_cta = ${flag(s.has_cta)}  ← did best video include a call to action`);

        const hasTraffic = s.traffic_fyp_pct || s.traffic_search_pct || s.traffic_profile_pct || s.traffic_following_pct || s.traffic_sound_pct;
        if (hasTraffic) {
          lines.push(`TRAFFIC SOURCES — where viewers found their videos (should sum to ~100%):`);
          lines.push(`  For You Page (FYP) = ${pct(s.traffic_fyp_pct)}  ← pushed by TikTok algorithm`);
          lines.push(`  Search = ${pct(s.traffic_search_pct)}  ← found by searching keywords`);
          lines.push(`  Following tab = ${pct(s.traffic_following_pct)}  ← existing followers`);
          lines.push(`  Profile = ${pct(s.traffic_profile_pct)}  ← visited their profile directly`);
          lines.push(`  Sound/Audio = ${pct(s.traffic_sound_pct)}  ← discovered via audio page`);
        }

        if (s.most_active_time) lines.push(`most_active_time = ${s.most_active_time}  ← time of day their audience is most active`);

        const queries = [s.top_search_query_1, s.top_search_query_2, s.top_search_query_3].filter(Boolean);
        if (queries.length) lines.push(`top_search_queries = ${queries.map((q: string) => `"${q}"`).join(', ')}  ← search terms TikTok shows their content for`);

        return lines.join('\n');
      }).join('\n\n');

  return `You are a UGC content strategist for Cloud Closet — a platform where real people share how they get dressed.

Generate a 7-day content plan for ${creatorName} (phase: ${phase}).

FIELD GLOSSARY — memorise these before reading the data:
- total_views: the SUM of views across every video they posted that week. Do NOT treat this as one video's views.
- best_video_views: views on their single highest-performing video only. This is one video, not an average.
- worst_video_views: views on their single lowest-performing video only.
- avg_watch_time_seconds + watch_completion_rate: retention metrics for the best video only, not a weekly average.
- videos_posted: number of videos uploaded that week — use this to understand their volume output.
- traffic_fyp_pct: percentage of views that came from TikTok's For You Page algorithm.
- traffic_search_pct: percentage from TikTok Search — high % means content is keyword-discoverable.
- comment_sentiment: the creator's read on overall comment tone (positive / neutral / negative).
- trending_sound: whether the best video used a trending audio clip.
- has_cta: whether the best video had a call to action.
- is_slideshow: if true, the best video is a TikTok photo carousel/slideshow — there is no meaningful video_length or avg_watch_time. Do NOT apply watch-time or video-length based advice to slideshow content. Instead focus on hook text, slide count strategy, saves, and shares.
- top_search_queries: keywords TikTok already ranks their content for — build on these.

RULES:
- Every recommendation must cite specific numbers from the data. No generic advice.
- Do not invent numbers or assume values for fields marked "not submitted".
- If search traffic is high, recommend keyword-forward hooks and note the specific queries.
- If FYP traffic dominates, focus on hook strength and watch time optimisation.
- Use most_active_time to set post times. If not submitted, default to 7pm CST.

Phase guidance:
- setup: 1 video/day minimum, build consistency, establish content identity
- volume: 1–2 videos/day, test 3 different hooks or formats, find what resonates
- optimize: double down on top 2 formats, cut what has not worked after 5+ tests
- scale: max volume on proven formats, push for one breakout video this week

ANALYTICS DATA FOR ${creatorName.toUpperCase()}:
${analyticsSection}

Cloud Closet voice: confident, observational, dry but warm. Group chat that became editorial. Never coach-y, never hype, never corporate. Hooks must be specific and feel real — never generic.

Output EXACTLY the 10 lines below. No markdown, no asterisks, no bullet points, no numbering, no extra lines. Each entry is a single line:

WEEK GOAL: [one specific goal tied to their actual numbers]
MONDAY: [hook] | [format] | [post time CST] | [tactical note]
TUESDAY: [hook] | [format] | [post time CST] | [tactical note]
WEDNESDAY: [hook] | [format] | [post time CST] | [tactical note]
THURSDAY: [hook] | [format] | [post time CST] | [tactical note]
FRIDAY: [hook] | [format] | [post time CST] | [tactical note]
SATURDAY: [hook] | [format] | [post time CST] | [tactical note]
SUNDAY: [hook] | [format] | [post time CST] | [tactical note]
A/B TEST: [specific variable to test, two concrete versions based on their data]
WEEKLY REMINDER: [one reminder tied to their numbers, max 2 sentences]`;
}

function parseAIOutput(raw: string): {
  weekGoal: string;
  days: Record<string, { hook: string; format: string; postTime: string; note: string }>;
  abTest: string;
  weeklyReminder: string;
} {
  // Strip markdown bold/italic that Gemini sometimes adds despite instructions
  const lines = raw.split('\n')
    .map(l => l.trim().replace(/\*\*/g, '').replace(/\*/g, ''))
    .filter(Boolean);
  const result: any = { weekGoal: '', days: {}, abTest: '', weeklyReminder: '' };

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  for (const line of lines) {
    // Normalise: uppercase and strip leading punctuation so "- MONDAY:" and "MONDAY:" both match
    const upper = line.toUpperCase().replace(/^[-•\s]+/, '');
    if (upper.startsWith('WEEK GOAL:')) {
      result.weekGoal = line.replace(/^.*?WEEK GOAL:\s*/i, '').trim();
    } else if (upper.startsWith('A/B TEST:')) {
      result.abTest = line.replace(/^.*?A\/B TEST:\s*/i, '').trim();
    } else if (upper.startsWith('WEEKLY REMINDER:')) {
      result.weeklyReminder = line.replace(/^.*?WEEKLY REMINDER:\s*/i, '').trim();
    } else {
      for (const day of dayNames) {
        if (upper.startsWith(`${day}:`)) {
          const content = line.replace(new RegExp(`^.*?${day}:\\s*`, 'i'), '').trim();
          const parts = content.split('|').map((p: string) => p.trim());
          result.days[day.toLowerCase()] = {
            hook: parts[0] ?? '',
            format: parts[1] ?? '',
            postTime: parts[2] ?? '',
            note: parts[3] ?? '',
          };
          break;
        }
      }
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });
  if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

  let body: { creatorId?: string; weekDate?: string; forceRegenerate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { creatorId, weekDate, forceRegenerate = false } = body;
  if (!creatorId) return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });

  // Determine week (Monday of current or provided week)
  const targetWeek = weekDate ?? (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    return mon.toISOString().split('T')[0];
  })();

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if plan already exists — always protect approved plans from being overwritten
  const { data: existing } = await supabase
    .from('weekly_plans')
    .select('id, status')
    .eq('creator_id', creatorId)
    .eq('week_date', targetWeek)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'approved') {
      // Never overwrite an approved plan, even with forceRegenerate
      return NextResponse.json({ exists: true, protected: true, plan: existing }, { status: 200 });
    }
    if (!forceRegenerate) {
      return NextResponse.json({ exists: true, plan: existing }, { status: 200 });
    }
  }

  // Fetch creator profile
  const { data: creator, error: creatorErr } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', creatorId)
    .single();

  if (creatorErr || !creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  // Fetch recent submissions (last 8 weeks)
  const { data: submissions } = await supabase
    .from('ugc_submissions')
    .select('*')
    .eq('creator_id', creatorId)
    .order('week_date', { ascending: false })
    .limit(8);

  const phase = getPhase(submissions?.length ?? 0);
  const prompt = buildPrompt(creator.full_name ?? 'Creator', phase, submissions ?? []);

  // Call Gemini
  let rawAIOutput = '';
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `Gemini error: ${errText}` }, { status: 500 });
    }

    const geminiJson = await geminiRes.json();
    rawAIOutput = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch (e: any) {
    return NextResponse.json({ error: `Gemini fetch failed: ${e.message}` }, { status: 500 });
  }

  if (!rawAIOutput) {
    return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });
  }

  const parsed = parseAIOutput(rawAIOutput);

  // Upsert into weekly_plans
  const { data: plan, error: upsertErr } = await supabase
    .from('weekly_plans')
    .upsert(
      {
        creator_id: creatorId,
        week_date: targetWeek,
        week_goal: parsed.weekGoal,
        phase,
        monday: parsed.days['monday'] ?? null,
        tuesday: parsed.days['tuesday'] ?? null,
        wednesday: parsed.days['wednesday'] ?? null,
        thursday: parsed.days['thursday'] ?? null,
        friday: parsed.days['friday'] ?? null,
        saturday: parsed.days['saturday'] ?? null,
        sunday: parsed.days['sunday'] ?? null,
        ab_test: parsed.abTest,
        weekly_reminder: parsed.weeklyReminder,
        status: 'draft',
        raw_ai_output: rawAIOutput,
        completed_days: [],
      },
      { onConflict: 'creator_id,week_date' }
    )
    .select()
    .single();

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, plan }, { status: 200 });
}
