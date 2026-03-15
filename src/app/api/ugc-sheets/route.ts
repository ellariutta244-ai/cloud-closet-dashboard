import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';
import { createClient } from '@/lib/supabase/client';

const HEADERS = [
  'Creator', 'TikTok Handle', 'Week Date', 'Benchmark Tier',
  // Video metadata
  'Hook Text', 'Format Type', 'Video Length (sec)', 'Niche', 'Trending Sound', 'Has CTA',
  // View data
  'Total Views', 'Avg Watch Time (sec)', 'Watch Completion %', 'Profile Visits',
  'FYP Traffic %', 'Following Traffic %', 'Search Traffic %',
  // Engagement
  'Likes', 'Comments', 'Shares', 'Saves', 'Comment Sentiment',
  // Account health
  'Followers Gained', 'Followers Lost', 'Net Follower Change',
  'Total Account Views', 'Videos Posted', 'Best Video Link',
];

function buildRow(d: any): any[] {
  return [
    d.creatorName || d.creator_name || '', d.tiktokHandle || d.tiktok_handle || '',
    d.week_date || d.weekDate || '', d.benchmark_tier || d.benchmarkTier || '',
    d.hook_text || '', d.format_type || '', d.video_length_seconds ?? '',
    d.niche || '', d.trending_sound ? 'Yes' : 'No', d.has_cta ? 'Yes' : 'No',
    d.total_views ?? 0, d.avg_watch_time_seconds ?? '', d.watch_completion_rate ?? '',
    d.profile_visits ?? 0, d.traffic_fyp_pct ?? 0, d.traffic_following_pct ?? 0, d.traffic_search_pct ?? 0,
    d.likes ?? 0, d.comments ?? 0, d.shares ?? 0, d.saves ?? 0, d.comment_sentiment || '',
    d.followers_gained ?? 0, d.followers_lost ?? 0, d.net_follower_change ?? 0,
    d.total_account_views ?? 0, d.videos_posted ?? 0, d.best_video_link || '',
  ];
}

async function getGoogleToken(privateKey: string, clientEmail: string): Promise<string> {
  const scope = 'https://www.googleapis.com/auth/spreadsheets';
  const now = Math.floor(Date.now() / 1000);
  const base64Only = privateKey.replace(/\\n/g, '').replace(/\s/g, '')
    .replace(/-+BEGINPRIVATEKEY-+/g, '').replace(/-+ENDPRIVATEKEY-+/g, '');
  const lines = base64Only.match(/.{1,64}/g) || [];
  const pem = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
  const key = await importPKCS8(pem, 'RS256');
  const jwt = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(clientEmail)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Google OAuth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function sheetsReq(token: string, method: string, url: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function addHeaders(token: string, sheetId: string, tab: string) {
  const colCount = HEADERS.length;
  const endCol = String.fromCharCode(64 + colCount);
  await sheetsReq(token, 'POST',
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A1:${endCol}1:append?valueInputOption=RAW`,
    { values: [HEADERS] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const creatorName = body.creatorName || body.creator_name || 'Unknown';

    const b64 = process.env.FIREBASE_SA_BASE64;
    if (!b64) return NextResponse.json({ error: 'FIREBASE_SA_BASE64 not configured' }, { status: 500 });
    const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    const token = await getGoogleToken(sa.private_key, sa.client_email);

    const sb = createClient();
    const { data: configRows } = await sb.from('google_sheet_config').select('*').limit(1);

    let sheetId: string;

    if (!configRows || configRows.length === 0) {
      const created = await sheetsReq(token, 'POST', 'https://sheets.googleapis.com/v4/spreadsheets', {
        properties: { title: 'Cloud Closet UGC Analytics' },
        sheets: [{ properties: { title: 'Master' } }, { properties: { title: creatorName } }],
      });
      sheetId = created.spreadsheetId;
      await sb.from('google_sheet_config').insert({ sheet_id: sheetId });
      await addHeaders(token, sheetId, 'Master');
      await addHeaders(token, sheetId, creatorName);
    } else {
      sheetId = configRows[0].sheet_id;
      const spreadsheet = await sheetsReq(token, 'GET', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`);
      const tabs: string[] = (spreadsheet.sheets || []).map((s: any) => s.properties?.title);
      if (!tabs.includes(creatorName)) {
        await sheetsReq(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
          { requests: [{ addSheet: { properties: { title: creatorName } } }] });
        await addHeaders(token, sheetId, creatorName);
      }
    }

    const row = [buildRow(body)];
    const colCount = HEADERS.length;
    const endCol = String.fromCharCode(64 + colCount);
    await sheetsReq(token, 'POST',
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Master!A:${endCol}:append?valueInputOption=RAW`,
      { values: row });
    await sheetsReq(token, 'POST',
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(creatorName)}!A:${endCol}:append?valueInputOption=RAW`,
      { values: row });

    return NextResponse.json({ ok: true, sheetId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
