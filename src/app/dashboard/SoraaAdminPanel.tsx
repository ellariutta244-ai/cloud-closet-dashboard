'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Sparkles, MessageCircle, ChevronDown, ChevronUp, Send, Trash2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SoraaSubmission {
  id: string;
  creator_email: string;
  creator_name: string;
  deliverable: string;
  platform?: string;
  handle?: string;
  post_link?: string;
  date_posted?: string;
  time_posted?: string;
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
  creator_reflection_interest?: string;
  creator_reflection_change?: string;
  ai_analysis?: string;
  analyzed_at?: string;
  created_at: string;
}

interface SoraaQuestion {
  id: string;
  creator_email: string;
  creator_name: string;
  body: string;
  created_at: string;
  soraa_question_replies?: SoraaReply[];
}

interface SoraaReply {
  id: string;
  question_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface SoraaDeliverableStatus {
  id: string;
  creator_email: string;
  deliverable: string;
  status: string;
  payment_status: string;
  updated_at: string;
}

// ── Creator reference data ─────────────────────────────────────────────────────
const SORAA_CREATORS = [
  { email: 'ankishabhargava1989@gmail.com', name: 'Ankisha Bhargava', tiktok: '@ankisha_bhargava', ig: null as string | null, fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'melissarod31@yahoo.com', name: 'Melissa Rodriguez', tiktok: '@melissardiaz___', ig: '@melissardiaz', fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'gabrielleboyerbaker@gmail.com', name: 'Gabrielle Boyer-Baker', tiktok: '@officiallygabrielle', ig: '@officiallygabrielle', fee: 60, deliverables: ['1x TikTok', '1x IG Story', 'Connect with founder'] },
  { email: 'haileymarieinfluences@gmail.com', name: 'Hailey Malinczak', tiktok: '@haileyymalinczak', ig: '@haileyymalinczak', fee: 25, deliverables: ['1x TikTok'] },
  { email: 'nehadias.fit@gmail.com', name: 'Neha Urbaetis', tiktok: '@nehas_wrld', ig: '@nehas_wrld', fee: 60, deliverables: ['1x IG Reel/TikTok', '1x IG Story'] },
  { email: 'nataliahouse0@gmail.com', name: 'Natalia Alexis', tiktok: '@nataliaalexis__', ig: '@nataliaalexiss', fee: 30, deliverables: ['1x TikTok'] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n?: number) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
function engRate(s: SoraaSubmission) {
  const v = s.views || 1;
  return (((s.likes || 0) + (s.comments_count || 0) + (s.shares || 0)) / v * 100).toFixed(2) + '%';
}
function intentScore(s: SoraaSubmission) {
  return ((s.intent_comments_count || 0) * 3) + ((s.what_app_comments || 0) * 2) + ((s.profile_clicks || 0) * 1.5);
}
function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type PayStatus = 'unpaid' | 'approved' | 'paid';
const PAY_COLORS: Record<PayStatus, string> = { unpaid: 'bg-red-50 text-red-600', approved: 'bg-amber-50 text-amber-600', paid: 'bg-emerald-50 text-emerald-600' };
const DEL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-500',
  submitted: 'bg-blue-50 text-blue-600',
  complete: 'bg-emerald-50 text-emerald-600',
};

function isConnectDel(del: string) {
  return del.toLowerCase().includes('connect');
}

// ── Sub-tab: Creator Overview ─────────────────────────────────────────────────
function CreatorOverview({ submissions, statuses, onStatusChange, onMarkAllPaid, onViewSubs }: {
  submissions: SoraaSubmission[];
  statuses: SoraaDeliverableStatus[];
  onStatusChange: (email: string, deliverable: string, field: 'status' | 'payment_status', value: string) => Promise<void>;
  onMarkAllPaid: (email: string, paid: boolean) => Promise<void>;
  onViewSubs: (email: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {SORAA_CREATORS.map(c => {
        const creatorStatuses = statuses.filter(s => s.creator_email === c.email);
        const contentDels = c.deliverables.filter(d => !isConnectDel(d));
        const allPaid = contentDels.length > 0 && contentDels.every(del => {
          const st = creatorStatuses.find(s => s.deliverable === del);
          return st?.payment_status === 'paid';
        });
        const submittedCount = c.deliverables.filter(del => {
          if (isConnectDel(del)) return false;
          return submissions.some(s => s.creator_email === c.email && s.deliverable === del);
        }).length;

        return (
          <div key={c.email} className="bg-white border border-stone-200/60 rounded-2xl p-5">
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-stone-800">{c.name}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-stone-500">{c.tiktok}</span>
                  {c.ig && <span className="text-xs text-stone-400">{c.ig}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Paid checkbox */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allPaid}
                    onChange={e => onMarkAllPaid(c.email, e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${allPaid ? 'text-emerald-600' : 'text-stone-400'}`}>Paid</span>
                </label>
                <div className="text-right">
                  <p className="text-lg font-bold text-stone-800">${c.fee}</p>
                  <p className="text-xs text-stone-400">campaign fee</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0 mb-4">
              {c.deliverables.map(del => {
                const st = creatorStatuses.find(s => s.deliverable === del);
                const isConnect = isConnectDel(del);
                const hasSub = !isConnect && submissions.some(s => s.creator_email === c.email && s.deliverable === del);

                // Auto-derive status for content deliverables
                let delStatus = st?.status || 'pending';
                if (!isConnect && hasSub && delStatus === 'pending') delStatus = 'submitted';

                const payStatus = (st?.payment_status || 'unpaid') as PayStatus;

                return (
                  <div key={del} className="flex items-center justify-between gap-2 py-2 border-b border-stone-50 last:border-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DEL_STATUS_COLORS[delStatus] || DEL_STATUS_COLORS.pending}`}>
                        {delStatus}
                      </span>
                      <span className="text-xs text-stone-600 truncate">{del}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isConnect ? (
                        /* Connect with founder: Pending / Complete, no payment dropdown */
                        <select
                          value={delStatus}
                          onChange={e => onStatusChange(c.email, del, 'status', e.target.value)}
                          className="text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 text-stone-600 bg-stone-50 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="complete">Complete</option>
                        </select>
                      ) : (
                        /* Content deliverable: Pending / Submitted + payment dropdown */
                        <>
                          <select
                            value={delStatus}
                            onChange={e => onStatusChange(c.email, del, 'status', e.target.value)}
                            className="text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 text-stone-600 bg-stone-50 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                          </select>
                          <select
                            value={payStatus}
                            onChange={e => onStatusChange(c.email, del, 'payment_status', e.target.value)}
                            className={`text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 focus:outline-none ${PAY_COLORS[payStatus]}`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="approved">Pay Approved</option>
                            <option value="paid">Paid</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-400">{submittedCount}/{contentDels.length} analytics submitted</p>
              <button
                onClick={() => onViewSubs(c.email)}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
              >
                View Submissions →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub-tab: All Submissions ───────────────────────────────────────────────────
function AllSubmissions({ submissions, filterEmail, onAnalyze, onAnalyzeAll, analyzing, onDelete }: {
  submissions: SoraaSubmission[];
  filterEmail?: string;
  onAnalyze: (sub: SoraaSubmission) => void;
  onAnalyzeAll: () => void;
  analyzing: string | null;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const filtered = filterEmail ? submissions.filter(s => s.creator_email === filterEmail) : submissions;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</p>
        {!filterEmail && (
          <button
            onClick={onAnalyzeAll}
            disabled={analyzing === 'all' || submissions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles size={13}/>
            {analyzing === 'all' ? 'Analyzing…' : 'Analyze All with AI'}
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No submissions yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => {
            const isOpen = expanded === s.id;
            const iScore = intentScore(s);
            return (
              <div key={s.id} className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-stone-800">{s.creator_name}</p>
                      {s.platform && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{s.platform}</span>}
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{s.deliverable}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-stone-400">{fmtDate(s.date_posted)}</span>
                      {s.post_link && (
                        <a href={s.post_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-0.5">
                          <ExternalLink size={10}/>View post
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Key metrics */}
                  <div className="hidden sm:flex items-center gap-4 text-center flex-shrink-0">
                    <div><p className="text-sm font-bold text-stone-800">{fmt(s.views)}</p><p className="text-[10px] text-stone-400">Views</p></div>
                    <div><p className="text-sm font-bold text-stone-800">{engRate(s)}</p><p className="text-[10px] text-stone-400">Eng Rate</p></div>
                    <div><p className="text-sm font-bold text-stone-800">{iScore.toFixed(0)}</p><p className="text-[10px] text-stone-400">Intent</p></div>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-stone-400 flex-shrink-0"/> : <ChevronDown size={16} className="text-stone-400 flex-shrink-0"/>}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-stone-100 p-4 flex flex-col gap-4">
                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { label: 'Views', val: fmt(s.views) },
                        { label: 'Likes', val: fmt(s.likes) },
                        { label: 'Comments', val: fmt(s.comments_count) },
                        { label: 'Shares', val: fmt(s.shares) },
                        { label: 'Saves', val: fmt(s.saves) },
                        { label: 'Eng Rate', val: engRate(s) },
                      ].map(m => (
                        <div key={m.label} className="bg-stone-50 rounded-xl p-2.5 text-center">
                          <p className="text-sm font-bold text-stone-800">{m.val}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Intent */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-amber-700">{iScore.toFixed(0)}</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">Intent Score</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-stone-800">{s.intent_comments_count || 0}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">What app?</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-stone-800">{s.what_app_comments || 0}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Where get it?</p>
                      </div>
                    </div>
                    {/* Hook / reflection */}
                    {s.hook && <div><p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Hook</p><p className="text-xs text-stone-600 bg-stone-50 rounded-lg p-2.5">&ldquo;{s.hook}&rdquo;</p></div>}
                    {s.top_comments && <div><p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Top Comments</p><p className="text-xs text-stone-600 bg-stone-50 rounded-lg p-2.5 whitespace-pre-wrap">{s.top_comments}</p></div>}
                    {s.creator_reflection_interest && <div><p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Creator Reflection</p><p className="text-xs text-stone-600 bg-stone-50 rounded-lg p-2.5">{s.creator_reflection_interest}</p></div>}

                    {/* AI analysis */}
                    {s.ai_analysis && (
                      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-4">
                        <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-wide mb-2 flex items-center gap-1"><Sparkles size={10}/>AI Analysis</p>
                        <p className="text-xs text-stone-100 leading-relaxed whitespace-pre-wrap">{s.ai_analysis}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAnalyze(s)}
                        disabled={analyzing === s.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
                      >
                        <Sparkles size={12}/>
                        {analyzing === s.id ? 'Analyzing…' : s.ai_analysis ? 'Re-analyze' : 'Analyze with AI'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this submission?')) return;
                          setDeleting(s.id);
                          await onDelete(s.id);
                          setDeleting(null);
                          setExpanded(null);
                        }}
                        disabled={deleting === s.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={12}/>
                        {deleting === s.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sub-tab: AI Analysis (full report) ────────────────────────────────────────
function AIAnalysisPanel({ report, loading, onGenerate, submissions }: {
  report: string;
  loading: boolean;
  onGenerate: () => void;
  submissions: SoraaSubmission[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-stone-800">Full Campaign Analysis</h2>
          <p className="text-xs text-stone-400 mt-0.5">AI-powered weekly report across all {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || submissions.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles size={13}/>
          {loading ? 'Generating…' : report ? 'Regenerate' : 'Generate Report'}
        </button>
      </div>

      {!report && !loading && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-stone-400">
          <Sparkles size={32} className="opacity-30"/>
          <p className="text-sm">Click &ldquo;Generate Report&rdquo; to analyze all submissions</p>
          {submissions.length === 0 && <p className="text-xs">No submissions yet — creators need to submit analytics first</p>}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-stone-400">
          <RefreshCw size={24} className="animate-spin opacity-50"/>
          <p className="text-sm">Analyzing all submissions…</p>
        </div>
      )}

      {report && !loading && (
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6">
          <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Sparkles size={10}/>Campaign Analysis Report</p>
          <div className="text-sm text-stone-100 leading-relaxed whitespace-pre-wrap">{report}</div>
        </div>
      )}
    </div>
  );
}

// ── Sub-tab: Questions ────────────────────────────────────────────────────────
function QuestionsPanel({ questions, onRefresh }: {
  questions: SoraaQuestion[];
  onRefresh: () => void;
}) {
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<SoraaQuestion[]>(questions);

  useEffect(() => { setLocalQuestions(questions); }, [questions]);

  const grouped = SORAA_CREATORS.map(c => ({
    ...c,
    questions: localQuestions.filter(q => q.creator_email === c.email),
  })).filter(c => c.questions.length > 0);

  async function sendReply(questionId: string) {
    const body = replies[questionId]?.trim();
    if (!body) return;
    setSending(questionId);
    try {
      const res = await fetch(`/api/soraa/questions/${questionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: 'Cloud Closet Team', body }),
      });
      if (res.ok) {
        const { reply } = await res.json();
        setLocalQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, soraa_question_replies: [...(q.soraa_question_replies || []), reply] }
            : q
        ));
        setReplies(prev => ({ ...prev, [questionId]: '' }));
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{localQuestions.length} message{localQuestions.length !== 1 ? 's' : ''} across all creators</p>
        <button onClick={onRefresh} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"><RefreshCw size={12}/>Refresh</button>
      </div>
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No messages yet</div>
      ) : grouped.map(c => (
        <div key={c.email} className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors"
            onClick={() => setExpanded(expanded === c.email ? null : c.email)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800">{c.name}</span>
              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{c.questions.length} message{c.questions.length !== 1 ? 's' : ''}</span>
            </div>
            {expanded === c.email ? <ChevronUp size={15} className="text-stone-400"/> : <ChevronDown size={15} className="text-stone-400"/>}
          </button>
          {expanded === c.email && (
            <div className="border-t border-stone-100 p-4 flex flex-col gap-4">
              {c.questions.map(q => (
                <div key={q.id} className="flex flex-col gap-2">
                  {/* Creator message */}
                  <div className="flex justify-end">
                    <div className="bg-stone-100 rounded-xl px-3 py-2 max-w-[85%]">
                      <p className="text-[10px] font-semibold text-stone-400 mb-0.5">{c.name} · {fmtDate(q.created_at)}</p>
                      <p className="text-xs text-stone-700">{q.body}</p>
                    </div>
                  </div>
                  {/* Replies */}
                  {(q.soraa_question_replies || []).map(r => (
                    <div key={r.id} className="flex justify-start">
                      <div className="bg-stone-800 rounded-xl px-3 py-2 max-w-[85%]">
                        <p className="text-[10px] font-semibold text-stone-300 mb-0.5">{r.author_name} · {fmtDate(r.created_at)}</p>
                        <p className="text-xs text-white">{r.body}</p>
                      </div>
                    </div>
                  ))}
                  {/* Reply input */}
                  <div className="flex gap-2 mt-1">
                    <input
                      value={replies[q.id] || ''}
                      onChange={e => setReplies(prev => ({ ...prev, [q.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(q.id); } }}
                      placeholder="Reply…"
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
                    />
                    <button
                      onClick={() => sendReply(q.id)}
                      disabled={!replies[q.id]?.trim() || sending === q.id}
                      className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      <Send size={11}/>{sending === q.id ? '…' : 'Send'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Admin Panel ───────────────────────────────────────────────────────────
export default function SoraaAdminPanel({ onSubmissionsChange }: { onSubmissionsChange?: (subs: SoraaSubmission[]) => void } = {}) {
  const [tab, setTab] = useState<'overview' | 'submissions' | 'analysis' | 'questions'>('overview');
  const [submissions, setSubmissions] = useState<SoraaSubmission[]>([]);
  const [questions, setQuestions] = useState<SoraaQuestion[]>([]);
  const [statuses, setStatuses] = useState<SoraaDeliverableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState<string | undefined>(undefined);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [fullReport, setFullReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [subRes, qRes, stRes] = await Promise.all([
      fetch('/api/soraa/submissions').then(r => r.json()).catch(() => ({ submissions: [] })),
      fetch('/api/soraa/questions').then(r => r.json()).catch(() => ({ questions: [] })),
      fetch('/api/soraa/status').then(r => r.json()).catch(() => ({ statuses: [] })),
    ]);
    const subs = subRes.submissions || [];
    setSubmissions(subs);
    onSubmissionsChange?.(subs);
    setQuestions(qRes.questions || []);
    setStatuses(stRes.statuses || []);
    setLoading(false);
  }, [onSubmissionsChange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function updateStatus(email: string, deliverable: string, field: 'status' | 'payment_status', value: string) {
    await fetch('/api/soraa/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_email: email, deliverable, [field]: value }),
    });
    setStatuses(prev => prev.map(s =>
      s.creator_email === email && s.deliverable === deliverable
        ? { ...s, [field]: value }
        : s
    ));
  }

  async function analyzeSingle(sub: SoraaSubmission) {
    setAnalyzing(sub.id);
    try {
      const res = await fetch('/api/soraa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission: sub }),
      });
      const data = await res.json();
      if (data.analysis) {
        // Persist to DB
        await fetch('/api/soraa/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sub.id, ai_analysis: data.analysis, analyzed_at: new Date().toISOString() }),
        });
        setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, ai_analysis: data.analysis, analyzed_at: new Date().toISOString() } : s));
      }
    } finally {
      setAnalyzing(null);
    }
  }

  async function analyzeAll() {
    setAnalyzing('all');
    setTab('analysis');
    setReportLoading(true);
    try {
      const res = await fetch('/api/soraa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions }),
      });
      const data = await res.json();
      if (data.analysis) setFullReport(data.analysis);
    } finally {
      setAnalyzing(null);
      setReportLoading(false);
    }
  }

  async function generateFullReport() {
    setReportLoading(true);
    try {
      const res = await fetch('/api/soraa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions }),
      });
      const data = await res.json();
      if (data.analysis) setFullReport(data.analysis);
    } finally {
      setReportLoading(false);
    }
  }

  async function markAllPaid(email: string, paid: boolean) {
    const creator = SORAA_CREATORS.find(c => c.email === email);
    if (!creator) return;
    const contentDels = creator.deliverables.filter(d => !isConnectDel(d));
    await Promise.all(contentDels.map(del =>
      updateStatus(email, del, 'payment_status', paid ? 'paid' : 'unpaid')
    ));
  }

  async function deleteSubmission(id: string) {
    await fetch(`/api/soraa/submissions?id=${id}`, { method: 'DELETE' });
    const next = submissions.filter(s => s.id !== id);
    setSubmissions(next);
    onSubmissionsChange?.(next);
  }

  function viewSubmissions(email: string) {
    setFilterEmail(email);
    setTab('submissions');
  }

  const TABS = [
    { id: 'overview' as const, label: 'Creator Overview' },
    { id: 'submissions' as const, label: `Submissions${submissions.length ? ` (${submissions.length})` : ''}` },
    { id: 'analysis' as const, label: 'AI Analysis' },
    { id: 'questions' as const, label: `Questions${questions.length ? ` (${questions.length})` : ''}` },
  ];

  const totalFees = SORAA_CREATORS.reduce((s, c) => s + c.fee, 0);
  const paidCount = statuses.filter(s => s.payment_status === 'paid').length;
  const doneCount = SORAA_CREATORS.reduce((total, c) => {
    const done = c.deliverables.filter(d => {
      if (isConnectDel(d)) return statuses.some(s => s.creator_email === c.email && s.deliverable === d && s.status === 'complete');
      return submissions.some(s => s.creator_email === c.email && s.deliverable === d);
    }).length;
    return total + done;
  }, 0);
  const totalDeliverables = SORAA_CREATORS.reduce((s, c) => s + c.deliverables.length, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-stone-800">Soraa UGC Campaign</h1>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>
          </div>
          <p className="text-sm text-stone-400">6 creators · ${totalFees} total fees · {submissions.length} submissions in</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors mt-1">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Creators', value: '6' },
          { label: 'Deliverables done', value: `${doneCount}/${totalDeliverables}` },
          { label: 'Submissions', value: submissions.length.toString() },
          { label: 'Payments out', value: `${paidCount} paid` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200/60 rounded-xl p-3">
            <p className="text-lg font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'submissions') setFilterEmail(undefined); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter notice */}
      {filterEmail && tab === 'submissions' && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <span className="text-xs text-amber-700">Showing submissions for {SORAA_CREATORS.find(c => c.email === filterEmail)?.name}</span>
          <button onClick={() => setFilterEmail(undefined)} className="text-xs text-amber-600 hover:text-amber-800 underline ml-auto">Show all</button>
        </div>
      )}

      {/* Panel content */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin"/>Loading…
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <CreatorOverview submissions={submissions} statuses={statuses} onStatusChange={updateStatus} onMarkAllPaid={markAllPaid} onViewSubs={viewSubmissions}/>
          )}
          {tab === 'submissions' && (
            <AllSubmissions submissions={submissions} filterEmail={filterEmail} onAnalyze={analyzeSingle} onAnalyzeAll={analyzeAll} analyzing={analyzing} onDelete={deleteSubmission}/>
          )}
          {tab === 'analysis' && (
            <AIAnalysisPanel report={fullReport} loading={reportLoading} onGenerate={generateFullReport} submissions={submissions}/>
          )}
          {tab === 'questions' && (
            <QuestionsPanel questions={questions} onRefresh={fetchAll}/>
          )}
        </>
      )}
    </div>
  );
}
