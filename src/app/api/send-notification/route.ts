import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function getAccessToken(): Promise<string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
  const sa = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsigned = `${encode(header)}.${encode(payload)}`;

  // Import the private key and sign
  const keyData = sa.private_key.replace(/\\n/g, '\n');
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    Buffer.from(keyData.replace(/-----[^-]+-----/g, '').replace(/\s/g, ''), 'base64'),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(unsigned)
  );
  const jwt = `${unsigned}.${Buffer.from(sig).toString('base64url')}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { title, body, team } = await req.json();
  if (!title || !body) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  let query = supabase
    .from('fcm_tokens')
    .select('token, profiles!inner(role, team)')
    .eq('profiles.role', 'intern');

  if (team) query = (query as any).eq('profiles.team', team);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tokens: string[] = (rows || []).map((r: any) => r.token).filter(Boolean);
  if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const projectId = 'cloud-closet-dashboard';
  let sent = 0;

  for (const token of tokens) {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            webpush: { notification: { icon: '/icon-192.png' } },
          },
        }),
      }
    );
    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
