import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getPhase(submissionCount: number): string {
  if (submissionCount <= 4) return 'setup';
  if (submissionCount <= 12) return 'volume';
  if (submissionCount <= 20) return 'optimize';
  return 'scale';
}

function buildPrompt(
  creatorName: string,
  phase: string,
  submissions: any[],
): string {
  const recent = submissions.slice(0, 4);
  const perfLines = recent.map((s: any) =>
    `Week of ${s.week_date}: ${s.total_views?.toLocaleString() ?? 0} views, ` +
    `${s.videos_posted ?? 0} videos posted, ` +
    `${s.watch_completion_rate ? Math.round(s.watch_completion_rate * 100) + '% completion' : 'no completion data'}, ` +
    `format: ${s.format_type ?? 'unknown'}, niche: ${s.niche ?? 'unknown'}`
  ).join('\n');

  const bestFormat = recent.find((s: any) => s.format_type)?.format_type ?? 'talking head';
  const niche = recent.find((s: any) => s.niche)?.niche ?? 'lifestyle';

  return `You are a UGC content strategist for Cloud Closet — a platform where real people share how they get dressed.

Generate a personalized weekly content plan for a TikTok UGC creator.

Creator Profile:
- Name: ${creatorName}
- Phase: ${phase} (setup/volume/optimize/scale)
- Recent Performance:
${perfLines || '(no submissions yet — this is a new creator)'}
- Best performing format: ${bestFormat}
- Niche: ${niche}

Phase guidance:
- setup: Focus on consistency and establishing content identity. 1 video/day minimum.
- volume: Post 1-2 videos/day, test 3 different hooks/formats, find what resonates.
- optimize: Double down on your top 2 performing formats, cut what isn't working.
- scale: Maximize volume on proven formats, challenge yourself to go viral once this week.

Based on their data, create a 7-day content plan. For each day provide:
- A specific hook (not generic — must feel real, direct, and fit Cloud Closet's dry-but-warm voice)
- A video format
- An optimal posting time (CST)
- One tactical note

Cloud Closet voice: confident, observational, dry but warm. Think group chat that became editorial. Never coach-y, never hype, never corporate.

Format your response EXACTLY like this (no extra text before or after):

WEEK GOAL: [one clear goal for the week]
MONDAY: [hook text] | [format] | [post time CST] | [tactical note]
TUESDAY: [hook text] | [format] | [post time CST] | [tactical note]
WEDNESDAY: [hook text] | [format] | [post time CST] | [tactical note]
THURSDAY: [hook text] | [format] | [post time CST] | [tactical note]
FRIDAY: [hook text] | [format] | [post time CST] | [tactical note]
SATURDAY: [hook text] | [format] | [post time CST] | [tactical note]
SUNDAY: [hook text] | [format] | [post time CST] | [tactical note]
A/B TEST: [one specific test to run this week — what variable, two versions]
WEEKLY REMINDER: [one mindset or tactical reminder, max 2 sentences]`;
}

function parseAIOutput(raw: string): {
  weekGoal: string;
  days: Record<string, { hook: string; format: string; postTime: string; note: string }>;
  abTest: string;
  weeklyReminder: string;
} {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const result: any = { weekGoal: '', days: {}, abTest: '', weeklyReminder: '' };

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  for (const line of lines) {
    if (line.startsWith('WEEK GOAL:')) {
      result.weekGoal = line.replace('WEEK GOAL:', '').trim();
    } else if (line.startsWith('A/B TEST:')) {
      result.abTest = line.replace('A/B TEST:', '').trim();
    } else if (line.startsWith('WEEKLY REMINDER:')) {
      result.weeklyReminder = line.replace('WEEKLY REMINDER:', '').trim();
    } else {
      for (const day of dayNames) {
        if (line.startsWith(`${day}:`)) {
          const content = line.replace(`${day}:`, '').trim();
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
          generationConfig: { temperature: 0.85, maxOutputTokens: 1200 },
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
