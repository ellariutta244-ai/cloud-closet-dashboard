import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a TikTok hook writer for Cloud Closet — a platform where real people share how they get dressed. Not influencers. Not trends. Real style, real people, real closets.

Cloud Closet hook voice: confident, dry, warm, specific. Sounds like a real person — not a marketer. Never say "hey guys". Never start with "today I am going to". Never use the word aesthetic as a noun. Never use the word curated. Never hype. Trust the viewer to get it.

Good Cloud Closet hooks:
- Start mid-thought or mid-action
- Create a curiosity gap without being clickbait
- Feel like something a real person would actually say
- Speak to the universal experience of getting dressed
- Are specific enough to be interesting, simple enough to feel effortless

Hook formulas that work for Cloud Closet:
- The honest observation: "This is why your outfits look off"
- The relatable moment: "I have worn this 47 times and I will wear it 47 more"
- The specific detail: "The piece that changed how I get dressed in the morning"
- The contrast: "Everyone told me not to keep this. I kept it."
- The quiet flex: "Found this for $4. It goes with everything I own."
- The question that makes you think: "When did getting dressed become this complicated"

Given the video topic, format, goal, and audience provided, generate exactly 10 hooks.

Each hook must:
- Be under 12 words
- Sound like it was said by a real person, not written by a marketing team
- Be immediately usable word for word
- Match the goal (views = curiosity, saves = value, shares = relatability, follows = identity)
- Feel like Cloud Closet — real, specific, effortless

Return only the 10 hooks as a numbered list. No explanations, no preamble, no labels.`;

export async function POST(req: NextRequest) {
  try {
    const { topic, format, goal, audience, inspiration } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Missing video topic' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const userPrompt = `Video topic: ${topic}
Format: ${format || 'talking head'}
Goal: ${goal || 'get views'}
Audience: ${audience || 'everyone'}${inspiration ? `\nInspiration hook (what has worked before): "${inspiration}"` : ''}

Generate 10 hooks for this video.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse numbered list into array of hook strings
    const hooks = raw
      .split('\n')
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 10);

    return NextResponse.json({ ok: true, hooks });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
