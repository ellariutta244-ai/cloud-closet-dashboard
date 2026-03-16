import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getPhase(submissionCount: number): string {
  if (submissionCount <= 4) return 'setup';
  if (submissionCount <= 12) return 'volume';
  if (submissionCount <= 20) return 'optimize';
  return 'scale';
}

function buildPrompt(creatorName: string, phase: string, submissions: any[]): string {
  const recent = submissions.slice(0, 4);

  const analyticsSection = recent.length === 0
    ? '(no submissions yet — new creator, plan based on phase guidance only)'
    : recent.map((s: any, i: number) => {
        const lines: string[] = [`Week of ${s.week_date}${i === 0 ? ' (most recent)' : ''}:`];
        lines.push(`  WEEKLY TOTALS (all videos combined this week):`);
        lines.push(`    Total views across all videos: ${(s.total_views ?? 0).toLocaleString()}`);
        lines.push(`    Videos posted: ${s.videos_posted ?? 0}`);
        lines.push(`    Likes: ${s.likes ?? 0}  Comments: ${s.comments ?? 0}  Shares: ${s.shares ?? 0}  Saves: ${s.saves ?? 0}`);
        lines.push(`    Profile visits: ${s.profile_visits ?? 0}  Followers gained: ${s.followers_gained ?? 0}  Lost: ${s.followers_lost ?? 0}`);

        const hasBestVideo = s.best_video_views || s.avg_watch_time_seconds || s.watch_completion_rate || s.hook_text || s.format_type;
        if (hasBestVideo) {
          lines.push(`  BEST PERFORMING VIDEO (single video data, not weekly average):`);
          if (s.best_video_views)        lines.push(`    Best video views: ${(s.best_video_views).toLocaleString()}`);
          if (s.worst_video_views)       lines.push(`    Worst video views: ${(s.worst_video_views).toLocaleString()}`);
          if (s.video_length_seconds)    lines.push(`    Video length: ${s.video_length_seconds}s`);
          if (s.avg_watch_time_seconds)  lines.push(`    Avg watch time: ${s.avg_watch_time_seconds}s`);
          if (s.watch_completion_rate)   lines.push(`    Completion rate: ${s.watch_completion_rate}%`);
          if (s.hook_text)               lines.push(`    Hook used: "${s.hook_text}"`);
          if (s.format_type)             lines.push(`    Format: ${s.format_type}`);
          if (s.niche)                   lines.push(`    Niche/topic: ${s.niche}`);
        }

        const hasTraffic = s.traffic_fyp_pct || s.traffic_search_pct || s.traffic_profile_pct || s.traffic_following_pct || s.traffic_sound_pct;
        if (hasTraffic) {
          lines.push(`  TRAFFIC SOURCES:`);
          if (s.traffic_fyp_pct)        lines.push(`    For You Page: ${s.traffic_fyp_pct}%`);
          if (s.traffic_search_pct)     lines.push(`    Search: ${s.traffic_search_pct}%`);
          if (s.traffic_profile_pct)    lines.push(`    Profile: ${s.traffic_profile_pct}%`);
          if (s.traffic_following_pct)  lines.push(`    Following: ${s.traffic_following_pct}%`);
          if (s.traffic_sound_pct)      lines.push(`    Sound: ${s.traffic_sound_pct}%`);
        }

        if (s.most_active_time) lines.push(`  Most active viewer time: ${s.most_active_time}`);

        const queries = [s.top_search_query_1, s.top_search_query_2, s.top_search_query_3].filter(Boolean);
        if (queries.length) lines.push(`  Top search queries: ${queries.join(', ')}`);

        return lines.join('\n');
      }).join('\n\n');

  return `You are a UGC content strategist for Cloud Closet — a platform where real people share how they get dressed.

Generate a 7-day content plan for ${creatorName} (phase: ${phase}).

CRITICAL — read these data definitions before making any recommendation:
- "Total views across all videos" = combined views from every video posted that week, NOT one video's views
- "Best video views" = views on their single best-performing video that week only
- "Worst video views" = views on their single worst-performing video that week only
- "Avg watch time" and "Completion rate" = from the best video only, not a weekly average
- Every recommendation must reference specific numbers from the data below — no generic advice

Phase guidance:
- setup: 1 video/day minimum, build consistency, establish content identity
- volume: 1-2 videos/day, test 3 different hooks or formats, find what resonates
- optimize: double down on top 2 formats, cut what has not worked after 5+ tests
- scale: max volume on proven formats, push for one breakout video this week

ANALYTICS DATA:
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

  // Check if plan already exists
  if (!forceRegenerate) {
    const { data: existing } = await supabase
      .from('weekly_plans')
      .select('id, status')
      .eq('creator_id', creatorId)
      .eq('week_date', targetWeek)
      .maybeSingle();

    if (existing) {
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
