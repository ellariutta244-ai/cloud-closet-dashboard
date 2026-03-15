import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';
import { createClient } from '@/lib/supabase/client';

async function getGoogleToken(privateKey: string, clientEmail: string): Promise<string> {
  const scope = 'https://www.googleapis.com/auth/spreadsheets';
  const now = Math.floor(Date.now() / 1000);

  // Reconstruct PEM if needed
  let pem = privateKey;
  if (!pem.includes('-----BEGIN')) {
    const b64 = pem.replace(/\s/g, '');
    const chunks = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
    pem = `-----BEGIN RSA PRIVATE KEY-----\n${chunks}\n-----END RSA PRIVATE KEY-----`;
  }

  const key = await importPKCS8(pem, 'RS256');

  const jwt = await new SignJWT({
    iss: clientEmail,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(key);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Google OAuth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function sheetsRequest(token: string, method: string, url: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function ensureTab(token: string, sheetId: string, tabName: string, spreadsheet: any): Promise<boolean> {
  const sheets: any[] = spreadsheet.sheets || [];
  const exists = sheets.some((s: any) => s.properties?.title === tabName);
  if (exists) return true;

  await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    requests: [{ addSheet: { properties: { title: tabName } } }],
  });
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const {
      creatorName, tiktokHandle, weekDate,
      totalViews, viewsDay1, viewsDay2, viewsDay3,
      likes, comments, shares, followersGained,
      bestVideoLink, benchmarkTier,
    } = await req.json();

    const b64 = process.env.FIREBASE_SA_BASE64;
    if (!b64) return NextResponse.json({ error: 'FIREBASE_SA_BASE64 not configured' }, { status: 500 });
    const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    const token = await getGoogleToken(sa.private_key, sa.client_email);

    const sb = createClient();
    const { data: configRows } = await sb.from('google_sheet_config').select('*').limit(1);

    let sheetId: string;

    if (!configRows || configRows.length === 0) {
      // Create new spreadsheet
      const created = await sheetsRequest(token, 'POST', 'https://sheets.googleapis.com/v4/spreadsheets', {
        properties: { title: 'Cloud Closet UGC Analytics' },
        sheets: [
          { properties: { title: 'Master' } },
          { properties: { title: creatorName } },
        ],
      });
      sheetId = created.spreadsheetId;
      await sb.from('google_sheet_config').insert({ sheet_id: sheetId });

      // Add headers
      const headers = [['Creator', 'TikTok Handle', 'Week Date', 'Total Views', 'Day 1', 'Day 2', 'Day 3', 'Likes', 'Comments', 'Shares', 'Followers Gained', 'Best Video', 'Tier']];
      await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Master!A1:M1:append?valueInputOption=RAW`, { values: headers });
      await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(creatorName)}!A1:M1:append?valueInputOption=RAW`, { values: headers });
    } else {
      sheetId = configRows[0].sheet_id;

      // Get spreadsheet to check tabs
      const spreadsheet = await sheetsRequest(token, 'GET', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`);
      const isNew = await ensureTab(token, sheetId, creatorName, spreadsheet);

      if (isNew === false) {
        // Tab was just created, add headers
        const headers = [['Creator', 'TikTok Handle', 'Week Date', 'Total Views', 'Day 1', 'Day 2', 'Day 3', 'Likes', 'Comments', 'Shares', 'Followers Gained', 'Best Video', 'Tier']];
        await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(creatorName)}!A1:M1:append?valueInputOption=RAW`, { values: headers });
      }
    }

    const row = [[
      creatorName, tiktokHandle || '', weekDate,
      totalViews, viewsDay1, viewsDay2, viewsDay3,
      likes, comments, shares, followersGained,
      bestVideoLink || '', benchmarkTier || '',
    ]];

    // Append to Master
    await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Master!A:M:append?valueInputOption=RAW`, { values: row });

    // Append to creator tab
    await sheetsRequest(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(creatorName)}!A:M:append?valueInputOption=RAW`, { values: row });

    return NextResponse.json({ ok: true, sheetId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
