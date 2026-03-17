'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SoraaSession {
  email: string;
  name: string;
  tiktok: string;
  ig: string | null;
  fee: number;
  deliverables: string[];
}

export interface SoraaSubmission {
  id: string;
  creator_email: string;
  creator_name: string;
  deliverable: string;
  platform: string | null;
  handle: string | null;
  post_link: string | null;
  date_posted: string | null;
  time_posted: string | null;
  hook: string | null;
  video_type: string | null;
  caption: string | null;
  cta_text: string | null;
  cta_placement: string | null;
  cloud_closet_visible: boolean;
  views: number;
  likes: number;
  comments_count: number;
  shares: number;
  saves: number;
  intent_comments_count: number;
  what_app_comments: number;
  profile_clicks: number;
  top_comments: string | null;
  common_confusion: string | null;
  common_excitement: string | null;
  repeated_phrases: string | null;
  creator_reflection_interest: string | null;
  creator_reflection_change: string | null;
  ai_analysis: string | null;
  analyzed_at: string | null;
  created_at: string;
}

export interface SoraaReply {
  id: string;
  question_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface SoraaQuestion {
  id: string;
  creator_email: string;
  creator_name: string;
  body: string;
  created_at: string;
  soraa_question_replies: SoraaReply[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferPlatform(deliverable: string): string {
  const lower = deliverable.toLowerCase();
  if (lower.includes('tiktok')) return 'TikTok';
  if (lower.includes('ig') || lower.includes('instagram') || lower.includes('reel') || lower.includes('story')) return 'Instagram';
  return '';
}

function num(val: string): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

// ─── Submission Form State ─────────────────────────────────────────────────

interface FormState {
  platform: string;
  handle: string;
  post_link: string;
  date_posted: string;
  time_posted: string;
  hook: string;
  video_type: string;
  caption: string;
  cta_text: string;
  cta_placement: string;
  cloud_closet_visible: boolean;
  views: string;
  likes: string;
  comments_count: string;
  shares: string;
  saves: string;
  intent_comments_count: string;
  what_app_comments: string;
  profile_clicks: string;
  top_comments: string;
  common_confusion: string;
  common_excitement: string;
  repeated_phrases: string;
  creator_reflection_interest: string;
  creator_reflection_change: string;
}

function defaultForm(session: SoraaSession, deliverable: string): FormState {
  const platform = inferPlatform(deliverable);
  const handle = platform === 'TikTok' ? session.tiktok : (session.ig ?? session.tiktok);
  return {
    platform,
    handle,
    post_link: '',
    date_posted: '',
    time_posted: '',
    hook: '',
    video_type: '',
    caption: '',
    cta_text: '',
    cta_placement: '',
    cloud_closet_visible: false,
    views: '',
    likes: '',
    comments_count: '',
    shares: '',
    saves: '',
    intent_comments_count: '',
    what_app_comments: '',
    profile_clicks: '',
    top_comments: '',
    common_confusion: '',
    common_excitement: '',
    repeated_phrases: '',
    creator_reflection_interest: '',
    creator_reflection_change: '',
  };
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-t border-stone-100 pt-6 mb-4">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{title}</span>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-stone-500 mb-1">
      {children}
    </label>
  );
}

const inputCls = 'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400';
const textareaCls = 'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none';
const selectCls = 'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none';

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function SoraaDashboardPage() {
  const router = useRouter();

  // Session state
  const [session, setSession] = useState<SoraaSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions'>('analytics');

  // Analytics tab state
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SoraaSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Questions tab state
  const [questions, setQuestions] = useState<SoraaQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  // ── Session guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('soraa_session');
    if (!raw) {
      router.push('/soraa');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SoraaSession;
      setSession(parsed);
    } catch {
      router.push('/soraa');
    }
    setSessionLoading(false);
  }, [router]);

  // ── Fetch submissions ─────────────────────────────────────────────────────
  const fetchSubmissions = useCallback(async (email: string) => {
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`/api/soraa/submissions?email=${encodeURIComponent(email)}`);
      const json = await res.json() as { submissions?: SoraaSubmission[]; error?: string };
      if (json.submissions) setSubmissions(json.submissions);
    } catch {
      // silent
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchSubmissions(session.email);
    }
  }, [session, fetchSubmissions]);

  // ── Fetch questions ───────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async (email: string) => {
    setQuestionsLoading(true);
    try {
      const res = await fetch(`/api/soraa/questions?email=${encodeURIComponent(email)}`);
      const json = await res.json() as { questions?: SoraaQuestion[]; error?: string };
      if (json.questions) setQuestions(json.questions);
    } catch {
      // silent
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session && activeTab === 'questions') {
      fetchQuestions(session.email);
    }
  }, [session, activeTab, fetchQuestions]);

  // ── Deliverable selection ─────────────────────────────────────────────────
  function handleSelectDeliverable(deliverable: string) {
    setSelectedDeliverable(deliverable);
    setFormSuccess(false);
    setFormError('');
    if (session) {
      setForm(defaultForm(session, deliverable));
    }
  }

  function getExistingSubmission(deliverable: string): SoraaSubmission | undefined {
    return submissions.find((s) => s.deliverable === deliverable);
  }

  // ── Form field helpers ─────────────────────────────────────────────────────
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  // ── Submit form ────────────────────────────────────────────────────────────
  async function handleSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session || !form || !selectedDeliverable) return;
    setFormSubmitting(true);
    setFormError('');

    const payload = {
      creator_email: session.email,
      creator_name: session.name,
      deliverable: selectedDeliverable,
      platform: form.platform || null,
      handle: form.handle || null,
      post_link: form.post_link || null,
      date_posted: form.date_posted || null,
      time_posted: form.time_posted || null,
      hook: form.hook || null,
      video_type: form.video_type || null,
      caption: form.caption || null,
      cta_text: form.cta_text || null,
      cta_placement: form.cta_placement || null,
      cloud_closet_visible: form.cloud_closet_visible,
      views: num(form.views),
      likes: num(form.likes),
      comments_count: num(form.comments_count),
      shares: num(form.shares),
      saves: num(form.saves),
      intent_comments_count: num(form.intent_comments_count),
      what_app_comments: num(form.what_app_comments),
      profile_clicks: num(form.profile_clicks),
      top_comments: form.top_comments || null,
      common_confusion: form.common_confusion || null,
      common_excitement: form.common_excitement || null,
      repeated_phrases: form.repeated_phrases || null,
      creator_reflection_interest: form.creator_reflection_interest || null,
      creator_reflection_change: form.creator_reflection_change || null,
    };

    try {
      const res = await fetch('/api/soraa/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as { data?: SoraaSubmission; error?: string };
      if (!res.ok || json.error) {
        setFormError(json.error ?? 'Failed to submit. Please try again.');
      } else {
        setFormSuccess(true);
        await fetchSubmissions(session.email);
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  }

  // ── Submit question ────────────────────────────────────────────────────────
  async function handleSendQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session || !newQuestion.trim()) return;
    setQuestionSubmitting(true);

    try {
      const res = await fetch('/api/soraa/questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          creator_email: session.email,
          creator_name: session.name,
          body: newQuestion.trim(),
        }),
      });
      if (res.ok) {
        setNewQuestion('');
        await fetchQuestions(session.email);
      }
    } catch {
      // silent
    } finally {
      setQuestionSubmitting(false);
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function handleLogout() {
    localStorage.removeItem('soraa_session');
    router.push('/soraa');
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', color: '#1C1917' }}>
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Soraa</h1>
          <p className="text-xs text-stone-400 tracking-widest uppercase mt-0.5">Cloud Closet Campaign Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-stone-700">{session.name}</p>
            <p className="text-xs text-stone-400">{session.tiktok}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-2 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-6">
        <div className="flex gap-1 pt-3 pb-0">
          {(['analytics', 'questions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab === 'analytics' ? 'Submit Analytics' : 'Questions'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Tab 1: Submit Analytics ── */}
        {activeTab === 'analytics' && (
          <div>
            {!selectedDeliverable ? (
              /* Deliverable selection */
              <div>
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
                  Select a Deliverable
                </h2>
                <div className="space-y-3">
                  {session.deliverables.map((deliverable) => {
                    const existing = getExistingSubmission(deliverable);
                    const platform = inferPlatform(deliverable);
                    return (
                      <div
                        key={deliverable}
                        className="bg-white border border-stone-200/60 rounded-2xl p-5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-800">{deliverable}</p>
                          {platform && (
                            <p className="text-xs text-stone-400 mt-0.5">{platform}</p>
                          )}
                          {existing && (
                            <span className="inline-block mt-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                              Submitted
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelectDeliverable(deliverable)}
                          className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                            existing
                              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              : 'bg-stone-800 text-white hover:bg-stone-700'
                          }`}
                        >
                          {existing ? 'View' : 'Submit'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {submissionsLoading && (
                  <p className="text-xs text-stone-400 text-center mt-6">Loading submissions...</p>
                )}
              </div>
            ) : (
              /* Form or existing submission view */
              <div>
                <button
                  onClick={() => { setSelectedDeliverable(null); setFormSuccess(false); setFormError(''); }}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 mb-6 transition-colors"
                >
                  ← Back to deliverables
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-stone-800">{selectedDeliverable}</h2>
                    <p className="text-xs text-stone-400 mt-0.5">{inferPlatform(selectedDeliverable) || 'Content'}</p>
                  </div>
                </div>

                {/* Success state */}
                {formSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <p className="text-base font-semibold text-green-800 mb-1">Thank you!</p>
                    <p className="text-sm text-green-700">
                      Your submission has been received. Payment will be processed after review.
                    </p>
                  </div>
                )}

                {/* Existing submission notice */}
                {!formSuccess && getExistingSubmission(selectedDeliverable) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-amber-800">
                      You have already submitted analytics for this deliverable.
                    </p>
                  </div>
                )}

                {/* Submission form */}
                {!formSuccess && form && (
                  <form onSubmit={handleSubmitForm} className="space-y-1">

                    {/* POST INFO */}
                    <SectionHeader title="Post Info" />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform">Platform</Label>
                        <select
                          id="platform"
                          value={form.platform}
                          onChange={(e) => setField('platform', e.target.value)}
                          className={selectCls}
                        >
                          <option value="">Select platform</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Instagram">Instagram</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="handle">Handle</Label>
                        <input
                          id="handle"
                          type="text"
                          value={form.handle}
                          onChange={(e) => setField('handle', e.target.value)}
                          placeholder="@yourhandle"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <Label htmlFor="post_link">Post Link</Label>
                        <input
                          id="post_link"
                          type="url"
                          value={form.post_link}
                          onChange={(e) => setField('post_link', e.target.value)}
                          placeholder="https://..."
                          className={inputCls}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="date_posted">Date Posted</Label>
                          <input
                            id="date_posted"
                            type="date"
                            value={form.date_posted}
                            onChange={(e) => setField('date_posted', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time_posted">Time Posted</Label>
                          <input
                            id="time_posted"
                            type="time"
                            value={form.time_posted}
                            onChange={(e) => setField('time_posted', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <SectionHeader title="Content" />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hook">Hook</Label>
                        <textarea
                          id="hook"
                          value={form.hook}
                          onChange={(e) => setField('hook', e.target.value)}
                          placeholder="First 3 seconds of your video..."
                          rows={2}
                          className={textareaCls}
                        />
                      </div>

                      <div>
                        <Label htmlFor="video_type">Video Type</Label>
                        <select
                          id="video_type"
                          value={form.video_type}
                          onChange={(e) => setField('video_type', e.target.value)}
                          className={selectCls}
                        >
                          <option value="">Select video type</option>
                          <option value="Outfit Diary">Outfit Diary</option>
                          <option value="GRWM">GRWM</option>
                          <option value="Problem-Solution">Problem-Solution</option>
                          <option value="Aesthetic">Aesthetic</option>
                          <option value="Direct App Demo">Direct App Demo</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="caption">Caption</Label>
                        <textarea
                          id="caption"
                          value={form.caption}
                          onChange={(e) => setField('caption', e.target.value)}
                          placeholder="Your post caption..."
                          rows={3}
                          className={textareaCls}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cta_text">CTA Used</Label>
                        <input
                          id="cta_text"
                          type="text"
                          value={form.cta_text}
                          onChange={(e) => setField('cta_text', e.target.value)}
                          placeholder="Exact wording of your call-to-action..."
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cta_placement">CTA Placement</Label>
                        <select
                          id="cta_placement"
                          value={form.cta_placement}
                          onChange={(e) => setField('cta_placement', e.target.value)}
                          className={selectCls}
                        >
                          <option value="">Select placement</option>
                          <option value="Start">Start</option>
                          <option value="Middle">Middle</option>
                          <option value="End">End</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="cloud_closet_visible">Cloud Closet visually shown?</Label>
                        <div className="flex gap-4 mt-1">
                          {(['Yes', 'No'] as const).map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                              <input
                                type="radio"
                                name="cloud_closet_visible"
                                value={opt}
                                checked={form.cloud_closet_visible === (opt === 'Yes')}
                                onChange={() => setField('cloud_closet_visible', opt === 'Yes')}
                                className="accent-stone-800"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PERFORMANCE METRICS */}
                    <SectionHeader title="Performance Metrics" />

                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: 'views', label: 'Views', key: 'views' },
                        { id: 'likes', label: 'Likes', key: 'likes' },
                        { id: 'comments_count', label: 'Comments', key: 'comments_count' },
                        { id: 'shares', label: 'Shares', key: 'shares' },
                      ] as const).map(({ id, label, key }) => (
                        <div key={id}>
                          <Label htmlFor={id}>{label}</Label>
                          <input
                            id={id}
                            type="number"
                            min="0"
                            value={form[key]}
                            onChange={(e) => setField(key, e.target.value)}
                            placeholder="0"
                            className={inputCls}
                          />
                        </div>
                      ))}
                      <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="saves">Saves <span className="text-stone-400 font-normal">(Instagram only)</span></Label>
                        <input
                          id="saves"
                          type="number"
                          min="0"
                          value={form.saves}
                          onChange={(e) => setField('saves', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* INTENT SIGNALS */}
                    <SectionHeader title="Intent Signals" />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="what_app_comments"># of &quot;what app is this?&quot; comments</Label>
                        <input
                          id="what_app_comments"
                          type="number"
                          min="0"
                          value={form.what_app_comments}
                          onChange={(e) => setField('what_app_comments', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="intent_comments_count"># of &quot;where do I get it?&quot; comments</Label>
                        <input
                          id="intent_comments_count"
                          type="number"
                          min="0"
                          value={form.intent_comments_count}
                          onChange={(e) => setField('intent_comments_count', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile_clicks">Profile clicks <span className="text-stone-400 font-normal">(optional)</span></Label>
                        <input
                          id="profile_clicks"
                          type="number"
                          min="0"
                          value={form.profile_clicks}
                          onChange={(e) => setField('profile_clicks', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* QUALITATIVE */}
                    <SectionHeader title="Qualitative" />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="top_comments">Top Comments</Label>
                        <textarea
                          id="top_comments"
                          value={form.top_comments}
                          onChange={(e) => setField('top_comments', e.target.value)}
                          placeholder="Copy/paste your best comments..."
                          rows={3}
                          className={textareaCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="common_confusion">Common confusion noticed</Label>
                        <textarea
                          id="common_confusion"
                          value={form.common_confusion}
                          onChange={(e) => setField('common_confusion', e.target.value)}
                          placeholder="Any recurring questions or confusion in comments?"
                          rows={2}
                          className={textareaCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="common_excitement">Common excitement noticed</Label>
                        <textarea
                          id="common_excitement"
                          value={form.common_excitement}
                          onChange={(e) => setField('common_excitement', e.target.value)}
                          placeholder="What got people excited in comments?"
                          rows={2}
                          className={textareaCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="repeated_phrases">Repeated phrases</Label>
                        <textarea
                          id="repeated_phrases"
                          value={form.repeated_phrases}
                          onChange={(e) => setField('repeated_phrases', e.target.value)}
                          placeholder="Phrases you saw multiple times in comments..."
                          rows={2}
                          className={textareaCls}
                        />
                      </div>
                    </div>

                    {/* CREATOR REFLECTION */}
                    <SectionHeader title="Creator Reflection" />

                    <div className="space-y-4 pb-6">
                      <div>
                        <Label htmlFor="creator_reflection_interest">What do you think made people interested?</Label>
                        <textarea
                          id="creator_reflection_interest"
                          value={form.creator_reflection_interest}
                          onChange={(e) => setField('creator_reflection_interest', e.target.value)}
                          placeholder="Your perspective on what resonated..."
                          rows={3}
                          className={textareaCls}
                        />
                      </div>
                      <div>
                        <Label htmlFor="creator_reflection_change">What would you change?</Label>
                        <textarea
                          id="creator_reflection_change"
                          value={form.creator_reflection_change}
                          onChange={(e) => setField('creator_reflection_change', e.target.value)}
                          placeholder="If you could redo this post, what would you do differently?"
                          rows={3}
                          className={textareaCls}
                        />
                      </div>
                    </div>

                    {formError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-sm text-red-700">{formError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full bg-stone-800 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formSubmitting ? 'Submitting...' : 'Submit Analytics'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Questions ── */}
        {activeTab === 'questions' && (
          <div className="flex flex-col gap-6">
            {/* Privacy notice */}
            <div className="bg-stone-100 border border-stone-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-stone-600 text-center">
                Only you and the Cloud Closet team can see your messages.
              </p>
            </div>

            {/* Conversation thread */}
            <div className="space-y-3 min-h-[200px]">
              {questionsLoading ? (
                <p className="text-xs text-stone-400 text-center py-8">Loading messages...</p>
              ) : questions.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-8">
                  No messages yet. Send your first message below.
                </p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    {/* Creator message — right aligned */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        <div className="bg-stone-800 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-sm">{q.body}</p>
                        </div>
                        <p className="text-xs text-stone-400 text-right mt-1">
                          {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Replies — left aligned */}
                    {q.soraa_question_replies.map((reply) => (
                      <div key={reply.id} className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-xs font-semibold text-stone-500 mb-1">{reply.author_name}</p>
                            <p className="text-sm text-stone-800">{reply.body}</p>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Send message form */}
            <form onSubmit={handleSendQuestion} className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question or send a message..."
                  rows={2}
                  className={textareaCls}
                />
              </div>
              <button
                type="submit"
                disabled={questionSubmitting || !newQuestion.trim()}
                className="bg-stone-800 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {questionSubmitting ? '...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
