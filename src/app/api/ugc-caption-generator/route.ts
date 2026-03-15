import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an SEO and TikTok growth strategist for Cloud Closet — a fashion platform where real people share how they get dressed.
Your job is to generate captions and hashtags that maximize discoverability, FYP reach, and audience growth for Cloud Closet UGC creators.

Caption rules:
- 1-2 lines maximum — TikTok captions are not essays
- Written in Cloud Closet brand voice: confident, dry, warm, specific. Never salesy, never corporate
- Always end with a CTA: a question that invites comments, a challenge, or a soft prompt. CTAs drive comment engagement which signals TikTok to push the video further
- If the goal is views or saves: do NOT mention the app name — create FOMO. Let viewers comment asking what app it is. This drives comment engagement which boosts distribution
- If the goal is follows or downloads: include a soft natural mention of Cloud Closet or "link in bio"
- Never use the word "aesthetic" as a noun. Never use the word "curated". Never sound like an ad

Hashtag rules:
- Always use exactly 5 hashtags — research shows 3-5 performs better than 20+
- Mix niche and broad: niche tags reach the right audience, broad tags reach more people
- Always include #cloudcloset as the branded tag
- Rotate hashtag sets so creators are not flagged for repetitive content
- Niche hashtags to draw from: #capsulewardrobe #outfitinspo #wardrobeorganization #styleapp #virtualcloset #morningroutine #gettingdressed #outfitcheck #fashionapp #closetorganization #sustainablefashion #slowfashion #getreadywithme #grwm #fashiontiktok
- Broad hashtags to draw from: #fashion #ootd #outfitideas #style #outfitoftheday #fashiongirl #styletips #outfitinspiration #fashioninspo #wiwt

SEO keyword strategy for Cloud Closet:
- The highest searched terms in this niche: nothing to wear, outfit ideas, closet organization, get ready with me, capsule wardrobe, fashion app, virtual closet, style tips, wardrobe organization
- When relevant, work the most searchable keyword naturally into the caption or suggest it for on-screen text
- TikTok search is growing fast — captions and on-screen text that include searchable phrases get surfaced in search results in addition to FYP

Always generate two caption options and two hashtag sets so the creator has choices.

Return ONLY valid JSON in this exact format:
{
  "caption": "primary caption text here",
  "alternate_caption": "alternate caption text here",
  "seo_note": "one sentence SEO tip here",
  "hashtag_set_1": "#tag1 #tag2 #tag3 #tag4 #cloudcloset",
  "hashtag_set_2": "#tag1 #tag2 #tag3 #tag4 #cloudcloset",
  "posting_time": "7-9am"
}`;

export async function POST(req: NextRequest) {
  try {
    const { topic, hook, format, goal, audience } = await req.json();
    if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const userPrompt = `Generate a TikTok caption and hashtag set for this Cloud Closet video:

Video topic: ${topic}
Hook being used: ${hook || 'not specified'}
Format: ${format || 'talking head'}
Goal: ${goal || 'get views'}
Target audience: ${audience || 'everyone'}

Return the JSON object as specified.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let result: any;
    try {
      result = JSON.parse(raw);
    } catch {
      // Try to extract JSON from the text
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: 'Failed to parse Gemini response', raw }, { status: 500 });
      result = JSON.parse(match[0]);
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
