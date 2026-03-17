import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const b64 = process.env.FIREBASE_SA_BASE64;
  if (!b64) throw new Error('FIREBASE_SA_BASE64 not configured');
  const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(sa) });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, assigned_to, co_assignees')
    .eq('due_date', tomorrowStr)
    .neq('status', 'completed');

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Map each user → list of task titles due tomorrow
  const userTaskMap = new Map<string, string[]>();
  for (const task of tasks as any[]) {
    const assignees = [task.assigned_to, ...(task.co_assignees ?? [])].filter(Boolean) as string[];
    for (const userId of assignees) {
      if (!userTaskMap.has(userId)) userTaskMap.set(userId, []);
      userTaskMap.get(userId)!.push(task.title);
    }
  }

  if (userTaskMap.size === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: tokenRows } = await supabase
    .from('fcm_tokens')
    .select('user_id, token')
    .in('user_id', Array.from(userTaskMap.keys()));

  const userTokenMap = new Map<string, string>();
  for (const r of (tokenRows ?? []) as any[]) {
    if (r.token && !userTokenMap.has(r.user_id)) userTokenMap.set(r.user_id, r.token);
  }

  const app = getAdminApp();
  const messaging = getMessaging(app);

  let sent = 0;
  for (const [userId, taskTitles] of userTaskMap) {
    const token = userTokenMap.get(userId);
    if (!token) continue;
    const body =
      taskTitles.length === 1
        ? `"${taskTitles[0]}" is due tomorrow`
        : `${taskTitles.length} tasks are due tomorrow`;
    try {
      await messaging.send({
        token,
        webpush: {
          notification: {
            title: 'Cloud Closet Dashboard',
            body,
            icon: '/icon-192.png',
            tag: `task-due-${tomorrowStr}-${userId}`,
          },
          headers: { Urgency: 'high' },
        },
      });
      sent++;
    } catch {
      // stale token, skip
    }
  }

  return NextResponse.json({ ok: true, sent, tasks: tasks.length, users: userTaskMap.size });
}
