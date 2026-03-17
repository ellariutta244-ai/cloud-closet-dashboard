'use client';

import { useState, useEffect } from 'react';
import { Send, RefreshCw, CheckCircle2, Instagram, Trash2 } from 'lucide-react';

interface SoraaCreator {
  email: string;
  name: string;
  tiktok: string;
  ig: string | null;
  fee: number;
  deliverables: string[];
}

const SORAA_CREATORS: SoraaCreator[] = [
  { email: 'ankishabhargava1989@gmail.com', name: 'Ankisha Bhargava', tiktok: '@ankisha_bhargava', ig: null, fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'melissarod31@yahoo.com', name: 'Melissa Rodriguez', tiktok: '@melissardiaz___', ig: '@melissardiaz', fee: 25, deliverables: ['1x TikTok', 'Connect with founder'] },
  { email: 'gabrielleboyerbaker@gmail.com', name: 'Gabrielle Boyer-Baker', tiktok: '@officiallygabrielle', ig: '@officiallygabrielle', fee: 60, deliverables: ['1x TikTok', '1x IG Story', 'Connect with founder'] },
  { email: 'haileymarieinfluences@gmail.com', name: 'Hailey Malinczak', tiktok: '@haileyymalinczak', ig: '@haileyymalinczak', fee: 25, deliverables: ['1x TikTok'] },
  { email: 'nehadias.fit@gmail.com', name: 'Neha Urbaetis', tiktok: '@nehas_wrld', ig: '@nehas_wrld', fee: 60, deliverables: ['1x IG Reel/TikTok', '1x IG Story'] },
  { email: 'nataliahouse0@gmail.com', name: 'Natalia Alexis', tiktok: '@nataliaalexis__', ig: '@nataliaalexiss', fee: 30, deliverables: ['1x TikTok'] },
];

interface Profile {
  email: string;
  full_name: string;
}

const emptyForm = {
  post_link: '',
  date_posted: '',
  time_posted: '',
  hook: '',
  video_type: 'talking_head',
  caption: '',
  cta_text: '',
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
  creator_reflection_interest: '',
  creator_reflection_change: '',
};

function isConnectDel(del: string) {
  return del.toLowerCase().includes('connect');
}

function AnalyticsForm({
  creator,
  deliverable,
  onSubmitted,
}: {
  creator: SoraaCreator;
  deliverable: string;
  onSubmitted: (newId: string) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function f(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!form.post_link || !form.views) {
      setError('Post link and views are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/soraa/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_email: creator.email,
          creator_name: creator.name,
          deliverable,
          platform: deliverable.toLowerCase().includes('ig') ? 'instagram' : 'tiktok',
          handle: deliverable.toLowerCase().includes('ig') ? creator.ig : creator.tiktok,
          post_link: form.post_link || null,
          date_posted: form.date_posted || null,
          time_posted: form.time_posted || null,
          hook: form.hook || null,
          video_type: form.video_type || null,
          caption: form.caption || null,
          cta_text: form.cta_text || null,
          cloud_closet_visible: form.cloud_closet_visible,
          views: parseInt(form.views) || 0,
          likes: parseInt(form.likes) || 0,
          comments_count: parseInt(form.comments_count) || 0,
          shares: parseInt(form.shares) || 0,
          saves: parseInt(form.saves) || 0,
          intent_comments_count: parseInt(form.intent_comments_count) || 0,
          what_app_comments: parseInt(form.what_app_comments) || 0,
          profile_clicks: parseInt(form.profile_clicks) || 0,
          top_comments: form.top_comments || null,
          creator_reflection_interest: form.creator_reflection_interest || null,
          creator_reflection_change: form.creator_reflection_change || null,
          created_at: new Date().toISOString(),
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resData.error || 'Submission failed.');
        return;
      }
      setDone(true);
      onSubmitted(resData.submission?.id || '');
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-emerald-600">
        <CheckCircle2 size={32}/>
        <p className="text-sm font-semibold">Analytics submitted!</p>
        <p className="text-xs text-stone-400">Thank you for submitting your {deliverable} analytics.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Post details */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Post Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Post Link *</label>
            <input
              value={form.post_link}
              onChange={e => f('post_link', e.target.value)}
              placeholder="https://..."
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Date Posted</label>
            <input
              type="date"
              value={form.date_posted}
              onChange={e => f('date_posted', e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Time Posted</label>
            <input
              type="time"
              value={form.time_posted}
              onChange={e => f('time_posted', e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Video Type</label>
            <select
              value={form.video_type}
              onChange={e => f('video_type', e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
            >
              <option value="talking_head">Talking Head</option>
              <option value="voiceover">Voiceover</option>
              <option value="text_overlay">Text Overlay</option>
              <option value="slideshow">Slideshow</option>
              <option value="duet">Duet / Stitch</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">Hook (opening line)</label>
          <input
            value={form.hook}
            onChange={e => f('hook', e.target.value)}
            placeholder="What was your opening line?"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">Caption</label>
          <textarea
            value={form.caption}
            onChange={e => f('caption', e.target.value)}
            placeholder="Your post caption..."
            rows={2}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">CTA Text</label>
          <input
            value={form.cta_text}
            onChange={e => f('cta_text', e.target.value)}
            placeholder="e.g. Link in bio"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.cloud_closet_visible}
            onChange={e => f('cloud_closet_visible', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-stone-600">Cloud Closet is visible / tagged in the post</span>
        </label>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Performance Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'views', label: 'Views *' },
            { key: 'likes', label: 'Likes' },
            { key: 'comments_count', label: 'Comments' },
            { key: 'shares', label: 'Shares' },
            { key: 'saves', label: 'Saves' },
            { key: 'profile_clicks', label: 'Profile Clicks' },
            { key: 'intent_comments_count', label: '"What app?" Comments' },
            { key: 'what_app_comments', label: 'Intent DMs' },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-stone-500">{label}</label>
              <input
                type="number"
                value={form[key as keyof typeof form] as string}
                onChange={e => f(key, e.target.value)}
                placeholder="0"
                min="0"
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reflections */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Reflections</p>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">Top Comments</label>
          <textarea
            value={form.top_comments}
            onChange={e => f('top_comments', e.target.value)}
            placeholder="Paste your top comments here..."
            rows={2}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">What generated the most interest?</label>
          <textarea
            value={form.creator_reflection_interest}
            onChange={e => f('creator_reflection_interest', e.target.value)}
            placeholder="e.g. The hook, the product reveal..."
            rows={2}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">What would you change?</label>
          <textarea
            value={form.creator_reflection_change}
            onChange={e => f('creator_reflection_change', e.target.value)}
            placeholder="e.g. Film earlier in the day, shorter hook..."
            rows={2}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || !form.post_link || !form.views}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? <RefreshCw size={14} className="animate-spin"/> : <Send size={14}/>}
        {submitting ? 'Submitting…' : 'Submit Analytics'}
      </button>
    </div>
  );
}

interface SubmittedSub { id: string; deliverable: string; }

export default function SoraaCreatorView({ profile }: { profile: Profile }) {
  const email = profile.email?.toLowerCase();
  const creator = SORAA_CREATORS.find(c => c.email.toLowerCase() === email);
  const [submissions, setSubmissions] = useState<SubmittedSub[]>([]);
  const [selectedDel, setSelectedDel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const contentDels = creator ? creator.deliverables.filter(d => !isConnectDel(d)) : [];

  useEffect(() => {
    if (!creator) { setLoading(false); return; }
    fetch(`/api/soraa/submissions?email=${encodeURIComponent(creator.email)}`)
      .then(r => r.json())
      .catch(() => ({ submissions: [] }))
      .then(data => {
        setSubmissions((data.submissions || []).map((s: { id: string; deliverable: string }) => ({ id: s.id, deliverable: s.deliverable })));
        setLoading(false);
      });
  }, [creator]);

  async function handleDelete(subId: string) {
    if (!confirm('Delete this submission?')) return;
    setDeleting(subId);
    await fetch(`/api/soraa/submissions?id=${subId}`, { method: 'DELETE' });
    setSubmissions(prev => prev.filter(s => s.id !== subId));
    setDeleting(null);
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-2">
        <p className="text-sm">Creator profile not found.</p>
        <p className="text-xs">Contact Cloud Closet team for help.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Soraa UGC Campaign</p>
        <p className="text-xl font-bold text-white">{creator.name}</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <span className="text-sm text-stone-300">{creator.tiktok}</span>
          {creator.ig && (
            <span className="flex items-center gap-1 text-sm text-stone-300">
              <Instagram size={13}/>{creator.ig}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {creator.deliverables.map(del => {
            const hasSub = submissions.some(s => s.deliverable === del);
            return (
              <span
                key={del}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                  isConnectDel(del)
                    ? 'bg-stone-700 text-stone-300'
                    : hasSub
                    ? 'bg-emerald-900/50 text-emerald-400'
                    : 'bg-amber-900/40 text-amber-400'
                }`}
              >
                {del}{!isConnectDel(del) && hasSub ? ' ✓' : ''}
              </span>
            );
          })}
        </div>
      </div>

      {/* Submission forms */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-stone-400 text-sm">
          <RefreshCw size={16} className="animate-spin"/>Loading…
        </div>
      ) : contentDels.length === 0 ? (
        <div className="text-center py-8 text-stone-400 text-sm">No content deliverables to submit.</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-800 mb-1">Submit Content Analytics</h2>
            <p className="text-xs text-stone-400">Submit analytics for each of your content deliverables below.</p>
          </div>

          {contentDels.map(del => {
            const delSubs = submissions.filter(s => s.deliverable === del);
            const submitted = delSubs.length > 0;
            const isOpen = selectedDel === del;
            return (
              <div key={del} className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
                  onClick={() => setSelectedDel(isOpen ? null : del)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-stone-800">{del}</span>
                    {submitted && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle2 size={10}/>Submitted
                      </span>
                    )}
                    {!submitted && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">{isOpen ? 'Close' : submitted ? 'Submit again' : 'Submit'}</span>
                </button>
                {/* Existing submissions with delete */}
                {submitted && (
                  <div className="border-t border-stone-50 px-5 py-3 flex flex-col gap-2">
                    {delSubs.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between gap-2 bg-stone-50 rounded-xl px-3 py-2">
                        <span className="text-xs text-stone-500">Submission on file</span>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deleting === sub.id}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={11}/>
                          {deleting === sub.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && (
                  <div className="border-t border-stone-100 p-5">
                    <AnalyticsForm
                      creator={creator}
                      deliverable={del}
                      onSubmitted={(newId: string) => {
                        setSubmissions(prev => [...prev, { id: newId, deliverable: del }]);
                        setSelectedDel(null);
                      }}
                    />
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
