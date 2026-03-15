import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

const SYSTEM_PROMPT = `You are a content strategist generating TikTok content ideas for Caroline, the founder of Cloud Closet — a fashion platform where real people share how they get dressed. Not influencers. Not trends. Real style, real people, real closets.

Caroline is a college-aged founder building Cloud Closet. Her content lives at the intersection of two voices:
Voice 1 — Cloud Closet brand voice: confident, observational, dry but warm. Think a group chat that became a formal editorial. We do not over-explain. We do not hype. Real style, real people, real expression. Never say aesthetic as a noun. Never say curated. Never sound like an ad.
Voice 2 — Caroline's founder voice: honest, specific, building in public. She is a real person figuring it out. Not a polished CEO — a founder who is in it. Content should feel like a real person showing their work, not performing success. Relatable to other founders and to the Cloud Closet girl equally.

Content categories she creates:
- Founder story and personal journey: honest, specific, the real version of building something
- Fashion and style: grounded in the Cloud Closet world — real closets, real getting dressed, real expression
- Startup and entrepreneurship: practical, specific, never preachy — things she actually learned, not advice for advice's sake
- Behind the scenes: building in public, showing the real process of making Cloud Closet

Hook rules:
- Under 12 words
- Start mid-thought or mid-action
- Never start with "hey guys", "today I am going to", "so I wanted to share"
- Sound like a real person, not a marketer
- Create curiosity without clickbait
- Speak to something true — about getting dressed, about building something, about being a college-aged woman figuring it out

Good founder hook examples for Cloud Closet:
- "I built an app because I was tired of standing in front of a full closet crying"
- "Nobody tells you what building something actually looks like at 20"
- "My closet has 200 pieces. I was only wearing 11 of them."
- "The moment I knew Cloud Closet was actually going to work"
- "I stopped buying clothes for 3 months. Here is what happened."
- "What I learned from 6 months of building a fashion app nobody asked me to build"

Video concept rules:
- Match the filming time constraint given
- Favor low effort high impact formats: screen recording, talking head, GRWM, day in the life clips
- The outline should be specific enough that she could pick up her phone and film it immediately
- Every concept should have a clear reason why it will perform

Content series rules:
- The series should be sustainable — something she can actually commit to for 4-6 weeks
- Each episode should work as a standalone video and as part of the series
- Series name should be simple, memorable, and feel like Cloud Closet

Always generate content that could resonate with both the fashion girl and the founder girl — because on Cloud Closet, they are the same person.`;

function buildFullPrompt(body: {
  mind: string;
  mood: string;
  audience: string[];
  time: string;
  inspiration?: string;
}): string {
  return `${SYSTEM_PROMPT}

---
Here is what Caroline is working with this week:
- What's on her mind: ${body.mind}
- Content mood: ${body.mood}
- Audience: ${body.audience.join(', ')}
- Time to film: ${body.time}
${body.inspiration ? `- Inspiration/hook to riff on: ${body.inspiration}` : ''}

Generate a full content drop. Return ONLY valid JSON in this exact structure, no other text:

{
  "concepts": [
    {
      "hook": "hook text under 12 words",
      "format": "video format",
      "outline": {
        "opening": "what to say/show in opening",
        "middle": "what to say/show in middle",
        "end": "what to say/show at the end"
      },
      "caption": "1-2 line caption with CTA",
      "why": "one sentence strategic reason this will perform"
    }
  ],
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "series": {
    "name": "series name",
    "premise": "series premise",
    "episodes": [
      { "title": "episode title", "description": "one line description" }
    ]
  },
  "sounds": ["sound suggestion 1", "sound suggestion 2", "sound suggestion 3"],
  "sound_note": "check TikTok Creative Center note"
}

Generate exactly 3 concepts, exactly 5 hooks, exactly 4-6 series episodes, exactly 3 sound suggestions.`;
}

function buildQuickPrompt(): string {
  return `${SYSTEM_PROMPT}

Generate 10 TikTok hooks for Caroline's Cloud Closet founder content. Mix of founder journey, fashion/closet insights, and building in public. All under 12 words, all ready to use.

Return ONLY a JSON array of 10 strings, no other text:
["hook1", "hook2", "hook3", "hook4", "hook5", "hook6", "hook7", "hook8", "hook9", "hook10"]`;
}

async function callGemini(prompt: string, geminiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function buildRecreatePrompt(body: { url: string; drawnTo: string[]; time: string }): string {
  return `You are analyzing a TikTok video and generating a recreation guide for Caroline, the founder of Cloud Closet.
Your job is to help her recreate the spirit and structure of the video — not copy it. Always adapt it to feel genuinely like Caroline and Cloud Closet. Never suggest anything that would feel inauthentic, overly produced, or hard to film.

Recreation rules you must always follow:
- Keep it simple — if the original is complex, find the simplest possible way to achieve the same effect
- One take is always better than multiple takes — design the guide around what she can film in one continuous shot
- CapCut is the only editing tool — never suggest anything that requires another app
- The script must sound like Caroline talking, not like copy — short sentences, natural language, real thoughts
- Always adapt the hook to be in Cloud Closet founder voice — never copy the original hook word for word
- The Cloud Closet app should feel like a natural part of the content, not forced in
- If the original video would take more than 10 minutes to recreate, simplify it until it does not
- Always end with a CTA that feels human — never salesy

Cloud Closet founder voice reminder: honest, specific, building in public, warm but dry. She is a real college-aged founder figuring it out. Not polished. Not performing. Real.

---
Caroline found this TikTok: ${body.url}
What drew her to it: ${body.drawnTo.join(', ')}
Time she has to film: ${body.time}

Based on what drew her to this video, generate a complete recreation guide. Return ONLY valid JSON, no other text:

{
  "breakdown": {
    "what_worked": "what made this type of video work",
    "why_performed": "one clear strategic reason",
    "what_to_keep": "elements worth preserving",
    "what_to_change": "how to make it feel authentic to Caroline and Cloud Closet"
  },
  "step_by_step": {
    "setup": "exactly what Caroline needs before hitting record",
    "hook": "her exact word-for-word hook in founder voice",
    "middle": "exactly what to say or show, in 5-10 second segments",
    "end": "exact closing line and CTA",
    "filming_time": "estimated filming time",
    "video_length": "estimated video length"
  },
  "script": "full word-for-word script OR narration notes if visual format",
  "script_type": "full_script or narration_notes",
  "technical": "CapCut instructions, or 'No special setup needed — film straight to camera in good light'",
  "caption": "1-2 line caption in Cloud Closet brand voice with CTA",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "app_mention_note": "whether to mention app name directly or create FOMO",
  "sound": "specific guidance on audio type",
  "sound_note": "check TikTok Creative Center note"
}`;
}

function extractJSON(raw: string): any {
  // Strip markdown code fences
  let cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  // Find the outermost { } or [ ] block
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    const objEnd = cleaned.lastIndexOf('}');
    cleaned = cleaned.slice(objStart, objEnd + 1);
  } else if (arrStart !== -1) {
    const arrEnd = cleaned.lastIndexOf(']');
    cleaned = cleaned.slice(arrStart, arrEnd + 1);
  }
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { type } = body;

  if (type === 'quick') {
    const raw = await callGemini(buildQuickPrompt(), geminiKey);
    let hooks: string[] = [];
    try { hooks = extractJSON(raw); } catch { hooks = raw.split('\n').filter((l: string) => l.trim()).slice(0, 10); }

    // Save all to hook bank
    if (hooks.length) {
      await supabase.from('caroline_hook_bank').insert(hooks.map((h: string) => ({
        hook_text: h, mood: 'Building in public', saved: false,
      })));
    }
    return NextResponse.json({ hooks });
  }

  if (type === 'full') {
    const { mind, mood, audience, time, inspiration } = body;
    if (!mind || !mood || !audience || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const raw = await callGemini(buildFullPrompt({ mind, mood, audience, time, inspiration }), geminiKey);
    let data: any;
    try { data = extractJSON(raw); } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Gemini response', raw }, { status: 500 });
    }

    // Auto-save all generated hooks to hook bank
    const allHooks = [
      ...((data.concepts ?? []).map((c: any) => c.hook)),
      ...(data.hooks ?? []),
    ].filter(Boolean);

    if (allHooks.length) {
      await supabase.from('caroline_hook_bank').insert(allHooks.map((h: string) => ({
        hook_text: h, mood, saved: false,
      })));
    }

    return NextResponse.json({ ...data, mood });
  }

  if (type === 'recreate') {
    const { url, drawnTo, time } = body;
    if (!url) return NextResponse.json({ error: 'TikTok URL is required' }, { status: 400 });
    const raw = await callGemini(buildRecreatePrompt({ url, drawnTo: drawnTo ?? [], time: time ?? 'Under 2 minutes' }), geminiKey);
    let data: any;
    try { data = extractJSON(raw); } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Gemini response', raw }, { status: 500 });
    }
    return NextResponse.json({ ...data, url });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
