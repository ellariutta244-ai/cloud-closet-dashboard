import { NextRequest, NextResponse } from 'next/server';

interface SoraaSubmissionInput {
  creator_name?: string;
  creator_email?: string;
  deliverable?: string;
  platform?: string;
  handle?: string;
  post_link?: string;
  hook?: string;
  video_type?: string;
  caption?: string;
  cta_text?: string;
  cta_placement?: string;
  cloud_closet_visible?: boolean;
  views?: number;
  likes?: number;
  comments_count?: number;
  shares?: number;
  saves?: number;
  intent_comments_count?: number;
  what_app_comments?: number;
  profile_clicks?: number;
  top_comments?: string;
  common_confusion?: string;
  common_excitement?: string;
  repeated_phrases?: string;
  creator_reflection_interest?: string;
  creator_reflection_change?: string;
}

function buildSingleAnalysisPrompt(submission: SoraaSubmissionInput): string {
  const views = submission.views ?? 0;
  const likes = submission.likes ?? 0;
  const comments = submission.comments_count ?? 0;
  const shares = submission.shares ?? 0;
  const intentComments = submission.intent_comments_count ?? 0;
  const whatAppComments = submission.what_app_comments ?? 0;
  const profileClicks = submission.profile_clicks ?? 0;

  const engagementRate = views > 0 ? ((likes + comments + shares) / views).toFixed(4) : '0';
  const intentScore = (intentComments * 3) + (whatAppComments * 2) + (profileClicks * 1.5);
  const shareRate = views > 0 ? shares / views : 0;
  const conversionScore = (intentScore * 2) + (shareRate * 1000);

  return `Analyze this UGC submission for Cloud Closet:

Creator: ${submission.creator_name ?? 'Unknown'}
Platform: ${submission.platform ?? 'Unknown'}
Handle: ${submission.handle ?? 'Unknown'}
Deliverable: ${submission.deliverable ?? 'Unknown'}

CONTENT:
Hook (first 3s): ${submission.hook ?? 'Not provided'}
Video Type: ${submission.video_type ?? 'Unknown'}
Caption: ${submission.caption ?? 'Not provided'}
CTA Used: ${submission.cta_text ?? 'None'}
CTA Placement: ${submission.cta_placement ?? 'Unknown'}
Cloud Closet Visually Shown: ${submission.cloud_closet_visible ? 'Yes' : 'No'}

PERFORMANCE METRICS:
Views: ${views}
Likes: ${likes}
Comments: ${comments}
Shares: ${shares}
Saves: ${submission.saves ?? 0}

COMPUTED SCORES:
Engagement Rate: ${engagementRate}
Intent Score: ${intentScore.toFixed(2)} (intent_comments×3 + what_app_comments×2 + profile_clicks×1.5)
Conversion Score: ${conversionScore.toFixed(2)} (intent_score×2 + share_rate×1000)

INTENT SIGNALS:
"What app is this?" comments: ${whatAppComments}
"Where do I get it?" comments: ${intentComments}
Profile clicks: ${profileClicks}

QUALITATIVE:
Top Comments: ${submission.top_comments ?? 'Not provided'}
Common Confusion: ${submission.common_confusion ?? 'None noted'}
Common Excitement: ${submission.common_excitement ?? 'None noted'}
Repeated Phrases: ${submission.repeated_phrases ?? 'None noted'}

CREATOR REFLECTION:
What made people interested: ${submission.creator_reflection_interest ?? 'Not provided'}
What they'd change: ${submission.creator_reflection_change ?? 'Not provided'}

Please provide a structured analysis with:
1. CLASSIFICATION: High Conversion / High Awareness Low Conversion / Low Performance / Needs Iteration
2. HOOK STRENGTH: Rate and explain (1-10)
3. CTA EFFECTIVENESS: Was the CTA clear and well-placed?
4. PRODUCT CLARITY: How clear was the Cloud Closet app value proposition?
5. WHAT WORKED: Top 2-3 things driving performance
6. WHAT DIDN'T: Top 1-2 weaknesses
7. ONE SPECIFIC CHANGE: The single highest-leverage improvement for next post

Remember: rank by Conversion Score > Views. All recommendations must be through the lens of app downloads, not vanity metrics.`;
}

function buildBatchAnalysisPrompt(submissions: SoraaSubmissionInput[]): string {
  const summaries = submissions.map((s, i) => {
    const views = s.views ?? 0;
    const likes = s.likes ?? 0;
    const comments = s.comments_count ?? 0;
    const shares = s.shares ?? 0;
    const intentComments = s.intent_comments_count ?? 0;
    const whatAppComments = s.what_app_comments ?? 0;
    const profileClicks = s.profile_clicks ?? 0;
    const intentScore = (intentComments * 3) + (whatAppComments * 2) + (profileClicks * 1.5);
    const shareRate = views > 0 ? shares / views : 0;
    const conversionScore = (intentScore * 2) + (shareRate * 1000);

    return `POST ${i + 1}:
Creator: ${s.creator_name ?? 'Unknown'} | Platform: ${s.platform ?? 'Unknown'} | Type: ${s.video_type ?? 'Unknown'}
Views: ${views} | Likes: ${likes} | Shares: ${shares} | Intent Comments: ${intentComments} | "What app?" comments: ${whatAppComments}
Conversion Score: ${conversionScore.toFixed(2)} | Hook: ${s.hook ?? 'Not provided'}`;
  }).join('\n\n');

  return `Produce a full weekly UGC campaign report for Cloud Closet based on these ${submissions.length} submissions:

${summaries}

Please provide:
1. TOP PERFORMING POST: Which post had the highest Conversion Score and why it worked
2. BIGGEST MISS: Which post underperformed relative to potential and what went wrong
3. OVERALL INSIGHT: The single most important strategic takeaway from this week
4. CONTENT PLAYBOOK:
   - DOUBLE DOWN ON: Content formats/approaches to repeat
   - AVOID: What's not working
   - TEST NEXT: New angles to try
5. PER-CREATOR FEEDBACK: Brief note for each creator (name + 1 strength + 1 improvement)
6. POST CLUSTERS: Group posts by content type (e.g. GRWM, Problem-Solution, Aesthetic) and note which cluster drove most intent

Remember: rank by Conversion Score > Views. All analysis must be through the lens of driving app downloads, not vanity metrics.`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json() as {
      submission?: SoraaSubmissionInput;
      submissions?: SoraaSubmissionInput[];
    };

    const isBatch = Array.isArray(body.submissions) && body.submissions.length > 0;
    const isSingle = !!body.submission;

    if (!isSingle && !isBatch) {
      return NextResponse.json({ error: 'Must provide either submission or submissions array' }, { status: 400 });
    }

    const userContent = isBatch
      ? buildBatchAnalysisPrompt(body.submissions!)
      : buildSingleAnalysisPrompt(body.submission!);

    const systemPrompt = isBatch
      ? 'You are a UGC campaign analyst for Cloud Closet. Always rank by Conversion Score > Views. All recommendations must be through the lens of app downloads, not vanity metrics. Produce clear, actionable weekly campaign reports.'
      : 'You are a UGC campaign analyst for Cloud Closet. Always rank by Conversion Score > Views. All recommendations must be through the lens of app downloads, not vanity metrics.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${errText}` }, { status: 502 });
    }

    const result = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const analysis = result.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return NextResponse.json({ analysis });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
