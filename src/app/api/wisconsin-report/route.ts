import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const SUPABASE_URL = 'https://gfdurfdqrhjzxjperknw.supabase.co';

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  return mon.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function buildGeminiPrompt(data: {
  projects: any[];
  stalledProjects: any[];
  requests: any[];
  overdueRequests: any[];
  outreach: any[];
  thisWeekEvents: any[];
  upcomingEvents: any[];
  submittedInterns: string[];
  missingInterns: string[];
}): string {
  const {
    projects, stalledProjects, requests, overdueRequests,
    outreach, thisWeekEvents, upcomingEvents,
    submittedInterns, missingInterns,
  } = data;

  return `You are a chief of staff for Cloud Closet summarizing the past week of activity for the Wisconsin intern team. Your audience is Caroline, the director. Write like a smart, direct colleague — not a corporate report. Confident, warm, specific. Reference real numbers and real activity. Never use filler phrases like "the team worked hard this week" or "great progress was made". If something is stalled or missing, say it directly. Keep the summary paragraph to 3-4 sentences maximum. Always end with a clear list of action items that need attention.

Here is the data from this past week:

TECH PROJECTS (${projects.length} active):
${projects.map(p => `- ${p.title} [${p.status}] — ${p.description ?? 'no description'} (progress: ${p.progress ?? 0}%)`).join('\n') || 'None'}

STALLED PROJECTS (no update in 7+ days, ${stalledProjects.length} total):
${stalledProjects.map(p => `- ${p.title} [last updated: ${p.updated_at ? new Date(p.updated_at).toDateString() : 'unknown'}]`).join('\n') || 'None'}

OPEN REQUESTS (${requests.length} total):
${requests.map(r => `- "${r.message}" requested by intern ${r.intern_id ?? 'unknown'} — status: ${r.status} (submitted ${new Date(r.created_at).toDateString()})`).join('\n') || 'None'}

OVERDUE REQUESTS (pending 7+ days, ${overdueRequests.length} total):
${overdueRequests.map(r => `- "${r.message}" — pending since ${new Date(r.created_at).toDateString()}`).join('\n') || 'None'}

OUTREACH THIS WEEK (${outreach.length} total):
${outreach.map(o => `- ${o.brand_or_creator} via ${o.platform ?? 'unknown platform'} — status: ${o.status} (logged by intern ${o.intern_id ?? 'unknown'})`).join('\n') || 'None'}

EVENTS THIS WEEK (${thisWeekEvents.length} added/updated):
${thisWeekEvents.map(e => `- ${e.title} on ${e.date ?? 'TBD'} [${e.status}]`).join('\n') || 'None'}

UPCOMING EVENTS NEXT 14 DAYS (${upcomingEvents.length} total):
${upcomingEvents.map(e => `- ${e.date}: ${e.title}${e.notes ? ` — ${e.notes}` : ''}`).join('\n') || 'None'}

WEEKLY REPORT SUBMISSIONS:
Submitted: ${submittedInterns.length > 0 ? submittedInterns.join(', ') : 'none'}
Missing: ${missingInterns.length > 0 ? missingInterns.join(', ') : 'none'}

Based on this data, respond in EXACTLY this format (no other text):

SUMMARY: [3-4 sentences in Cloud Closet brand voice — confident, warm, specific, referencing real numbers]
ACTION_ITEMS:
- [one clear direct sentence]
- [one clear direct sentence]
(list every item that needs Caroline's attention — stalled projects, overdue requests, missing reports, anything flagged)`;
}

function parseGeminiResponse(raw: string): { summary: string; actionItems: string[] } {
  const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*?)(?=ACTION_ITEMS:|$)/i);
  const actionItemsMatch = raw.match(/ACTION_ITEMS:\s*([\s\S]*?)$/i);

  const summary = summaryMatch?.[1]?.trim() ?? '';
  const actionItems = (actionItemsMatch?.[1] ?? '')
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return { summary, actionItems };
}

export async function GET(req: NextRequest) {
  // Cron auth check
  const authHeader = req.headers.get('authorization');
  const isManual = req.nextUrl.searchParams.get('manual') === 'true';
  if (!isManual && authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });
  if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const weekDate = getMondayOfWeek();
  const sevenDaysAgo = daysAgo(7);
  const today = new Date().toISOString().split('T')[0];
  const in14Days = daysFromNow(14);

  // ── 1. Tech Projects ────────────────────────────────────────────────────────
  const { data: allProjects } = await supabase
    .from('tech_projects')
    .select('*')
    .neq('status', 'completed')
    .order('updated_at', { ascending: false });

  const projects = allProjects ?? [];
  const stalledProjects = projects.filter((p: any) =>
    !p.updated_at || new Date(p.updated_at) < new Date(sevenDaysAgo)
  );
  const activeThisWeek = projects.filter((p: any) =>
    p.updated_at && new Date(p.updated_at) >= new Date(sevenDaysAgo)
  );

  // ── 2. Requests ─────────────────────────────────────────────────────────────
  const { data: allRequests } = await supabase
    .from('requests')
    .select('*')
    .in('status', ['pending', 'in_progress', 'open'])
    .order('created_at', { ascending: false });

  const requests = allRequests ?? [];
  const overdueRequests = requests.filter((r: any) =>
    r.status === 'pending' && new Date(r.created_at) < new Date(sevenDaysAgo)
  );
  const newRequests = requests.filter((r: any) =>
    new Date(r.created_at) >= new Date(sevenDaysAgo)
  );

  // ── 3. Outreach ─────────────────────────────────────────────────────────────
  const { data: outreachData } = await supabase
    .from('outreach_logs')
    .select('*')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false });

  const outreach = outreachData ?? [];
  const positiveOutreach = outreach.filter((o: any) =>
    ['responded', 'interested', 'closed'].includes(o.status)
  );

  // ── 4. Events ───────────────────────────────────────────────────────────────
  const { data: allEvents } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  const events = allEvents ?? [];
  const thisWeekEvents = events.filter((e: any) =>
    e.created_at && new Date(e.created_at) >= new Date(sevenDaysAgo)
  );
  const upcomingEvents = events.filter((e: any) =>
    e.date && e.date >= today && e.date <= in14Days && e.status !== 'cancelled'
  );

  // ── 5. Report submissions ───────────────────────────────────────────────────
  const { data: interns } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'intern');

  const { data: reports } = await supabase
    .from('weekly_reports')
    .select('intern_id, week_of')
    .gte('created_at', sevenDaysAgo);

  const submittedInternIds = new Set((reports ?? []).map((r: any) => r.intern_id));
  const allInterns = interns ?? [];
  const submittedInterns = allInterns.filter((i: any) => submittedInternIds.has(i.id)).map((i: any) => i.full_name ?? i.id);
  const missingInterns = allInterns.filter((i: any) => !submittedInternIds.has(i.id)).map((i: any) => i.full_name ?? i.id);

  // ── Build snapshots ─────────────────────────────────────────────────────────
  const projectsSnapshot = projects.map((p: any) => ({
    id: p.id, title: p.title, status: p.status, progress: p.progress,
    description: p.description, owner_id: p.owner_id,
    updated_at: p.updated_at, stalled: stalledProjects.some((s: any) => s.id === p.id),
    worked_this_week: activeThisWeek.some((a: any) => a.id === p.id),
  }));

  const requestsSnapshot = requests.map((r: any) => ({
    id: r.id, message: r.message, intern_id: r.intern_id,
    status: r.status, created_at: r.created_at,
    overdue: overdueRequests.some((o: any) => o.id === r.id),
    is_new: newRequests.some((n: any) => n.id === r.id),
    type_name: r.type_name,
  }));

  const outreachSnapshot = {
    entries: outreach.map((o: any) => ({
      id: o.id, brand_or_creator: o.brand_or_creator, platform: o.platform,
      status: o.status, intern_id: o.intern_id, notes: o.notes,
      date_contacted: o.date_contacted, positive: positiveOutreach.some((p: any) => p.id === o.id),
    })),
    total: outreach.length,
    positive_count: positiveOutreach.length,
  };

  const eventsSnapshot = {
    this_week: thisWeekEvents.map((e: any) => ({
      id: e.id, title: e.title, date: e.date, status: e.status, description: e.description,
    })),
    upcoming: upcomingEvents.map((e: any) => ({
      id: e.id, title: e.title, date: e.date, time: e.time, location: e.location, status: e.status,
    })),
  };

  const reportSubmissionsSnapshot = {
    submitted: submittedInterns,
    missing: missingInterns,
    total_interns: allInterns.length,
  };

  // ── Call Gemini ─────────────────────────────────────────────────────────────
  const prompt = buildGeminiPrompt({
    projects, stalledProjects, requests, overdueRequests,
    outreach, thisWeekEvents, upcomingEvents,
    submittedInterns, missingInterns,
  });

  let geminiSummary = '';
  let actionItems: string[] = [];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );
    if (geminiRes.ok) {
      const geminiJson = await geminiRes.json();
      const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = parseGeminiResponse(rawText);
      geminiSummary = parsed.summary;
      actionItems = parsed.actionItems;
    }
  } catch (e) {
    console.error('Gemini error:', e);
  }

  // ── Upsert report ───────────────────────────────────────────────────────────
  const { data: report, error: upsertErr } = await supabase
    .from('wisconsin_reports')
    .upsert({
      week_date: weekDate,
      projects_snapshot: projectsSnapshot,
      requests_snapshot: requestsSnapshot,
      outreach_snapshot: outreachSnapshot,
      events_snapshot: eventsSnapshot,
      report_submissions_snapshot: reportSubmissionsSnapshot,
      gemini_summary: geminiSummary,
      action_items: actionItems,
    }, { onConflict: 'week_date' })
    .select()
    .single();

  if (upsertErr) {
    console.error('Upsert error:', upsertErr);
  }

  // ── Push notification to Caroline (director) ────────────────────────────────
  const fbBase64 = process.env.FIREBASE_SA_BASE64;
  if (fbBase64) {
    try {
      if (!getApps().length) {
        const sa = JSON.parse(Buffer.from(fbBase64, 'base64').toString('utf-8'));
        initializeApp({ credential: cert(sa) });
      }

      const { data: directorProfiles } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('role', 'director');

      const tokens = (directorProfiles ?? []).map((p: any) => p.fcm_token).filter(Boolean);

      if (tokens.length) {
        const messaging = getMessaging();
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const dateRange = `${weekDate} – ${weekEnd.toISOString().split('T')[0]}`;

        const notifBody = upsertErr
          ? 'Wisconsin Report generation failed — check the dashboard'
          : `Your Wisconsin Weekly Report for ${dateRange} is ready`;

        await Promise.allSettled(
          tokens.map((token: string) =>
            messaging.send({
              token,
              notification: { title: 'Cloud Closet', body: notifBody },
              data: { page: 'director_wisconsin_report' },
            })
          )
        );
      }
    } catch (e) {
      console.error('Push notification error:', e);
    }
  }

  return NextResponse.json({
    success: !upsertErr,
    weekDate,
    report,
    stats: {
      projects: projects.length,
      stalledProjects: stalledProjects.length,
      requests: requests.length,
      overdueRequests: overdueRequests.length,
      outreach: outreach.length,
      upcomingEvents: upcomingEvents.length,
      submitted: submittedInterns.length,
      missing: missingInterns.length,
    },
  });
}
