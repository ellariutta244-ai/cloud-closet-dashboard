import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, mode } = await req.json();
    const isBestVideoMode = mode === 'best_video';
    if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const prompt = isBestVideoMode
      ? `You are analyzing a TikTok screenshot showing the analytics for a single specific video (not an account overview).

Extract every numeric and text value visible and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Field mapping rules:
- best_video_views: the view count shown for this video
- video_length_seconds: video duration in seconds (convert "0:45" → 45, "1:23" → 83)
- avg_watch_time_seconds: average watch time in seconds
- watch_completion_rate: % of viewers who watched to the end (as a number, e.g. 42 not "42%")
- hook_text: the video caption or opening text visible in the screenshot (if shown)
- best_video_link: any URL visible for this video (if shown)
- is_slideshow: true if this is a photo carousel/slideshow, false if it is a regular video

Rules:
- If a value is not visible or cannot be determined, use null
- For counts shown as "1.2K" → 1200, "3.4M" → 3400000
- For percentages, return the numeric value only
- Do not guess or invent values

Return this exact JSON structure:
{
  "best_video_views": null,
  "video_length_seconds": null,
  "avg_watch_time_seconds": null,
  "watch_completion_rate": null,
  "hook_text": null,
  "best_video_link": null,
  "is_slideshow": false
}`
      : `You are analyzing one or more TikTok analytics screenshots from the TikTok Creator Studio or TikTok app.

Extract every numeric and text value visible in the screenshot(s) and map them to the fields below.

Return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Field mapping rules:
- total_views: total video views for the week (the main "Video Views" or "Views" stat)
- best_video_views: views on the single best-performing video
- worst_video_views: views on the single worst-performing video
- profile_visits: profile views
- video_length_seconds: length of best video in seconds (convert "0:45" → 45, "1:23" → 83)
- avg_watch_time_seconds: average watch time in seconds
- watch_completion_rate: % of viewers who watched to the end (as a number, e.g. 42 not "42%")
- traffic_fyp_pct: % from For You Page / FYP (as a number)
- traffic_search_pct: % from Search (as a number)
- traffic_following_pct: % from Following tab (as a number)
- traffic_profile_pct: % from Profile (as a number)
- traffic_sound_pct: % from Sound/Audio page (as a number)
- top_search_query_1: first listed search keyword TikTok ranks the account for
- top_search_query_2: second search keyword
- top_search_query_3: third search keyword
- likes: total likes
- comments: total comments
- shares: total shares
- saves: total saves / favorites / bookmarks
- followers_gained: new followers gained
- followers_lost: followers lost / unfollowed
- videos_posted: number of videos posted that week
- hook_text: the opening text or caption visible on the best performing video (if shown)
- is_slideshow: true if the best video is a photo carousel/slideshow, false otherwise

Rules:
- If a value is not visible or cannot be determined, use null for that field
- For percentages, return the numeric value only (e.g., 68.5, not "68.5%")
- For counts shown as "1.2K" → 1200, "3.4M" → 3400000
- Do not guess or invent values
- Return all fields even if null

Return this exact JSON structure:
{
  "total_views": null,
  "best_video_views": null,
  "worst_video_views": null,
  "profile_visits": null,
  "video_length_seconds": null,
  "avg_watch_time_seconds": null,
  "watch_completion_rate": null,
  "traffic_fyp_pct": null,
  "traffic_search_pct": null,
  "traffic_following_pct": null,
  "traffic_profile_pct": null,
  "traffic_sound_pct": null,
  "top_search_query_1": null,
  "top_search_query_2": null,
  "top_search_query_3": null,
  "likes": null,
  "comments": null,
  "shares": null,
  "saves": null,
  "followers_gained": null,
  "followers_lost": null,
  "videos_posted": null,
  "hook_text": null,
  "is_slideshow": false
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inline_data: { mime_type: mimeType || 'image/png', data: imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response as JSON', raw: rawText }, { status: 500 });
    }

    return NextResponse.json({ ok: true, fields: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
