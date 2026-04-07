'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Calendar, Play, BookOpen, BarChart3, Plus, Edit2, Trash2,
  ExternalLink, Copy, Check, TrendingUp, TrendingDown, Minus,
  Search, Link as LinkIcon,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────────
type Pillar = 'podcast_clips' | 'content_day' | 'campus_interview';
type PostStatus = 'idea' | 'filming' | 'editing' | 'approved' | 'scheduled' | 'posted';
type ClipStatus = 'identified' | 'clipped' | 'captioned' | 'approved' | 'posted';
type CaptionType = 'hook' | 'caption' | 'cta' | 'tag_set';

type TikTokPost = {
  id: string; title: string; pillar: Pillar; status: PostStatus;
  scheduled_date: string | null; hook: string; caption: string;
  tiktok_url: string; assigned_to: string; notes: string;
  order_num: number; created_at: string;
};
type TikTokEpisode = { id: string; title: string; url: string; created_at: string };
type TikTokClip = {
  id: string; episode_id: string; clip_title: string;
  timestamp_start: string; timestamp_end: string; duration: string;
  status: ClipStatus; hook: string; caption: string; tags: string;
  tiktok_url: string; notes: string; order_num: number; created_at: string;
};
type TikTokCaption = {
  id: string; pillar: Pillar | 'general'; type: CaptionType; content: string;
  notes: string; used_count: number; last_used_at: string | null; created_at: string;
};
type TikTokAnalytics = {
  id: string; week_start: string; posts_published: number; total_views: number;
  total_likes: number; total_comments: number; total_shares: number;
  followers_gained: number; followers_total: number; top_post_title: string;
  top_post_url: string; top_post_views: number; best_pillar: Pillar | null;
  buffer_health: number; will_notes: string; ella_notes: string; created_at: string;
};
type Profile = { id: string; full_name: string; role: string };

// ── Color/label constants ────────────────────────────────────────────────────────
const PILLAR_COLORS: Record<string, string> = {
  podcast_clips: 'bg-pink-100 text-pink-700',
  content_day: 'bg-teal-100 text-teal-700',
  campus_interview: 'bg-purple-100 text-purple-700',
  general: 'bg-stone-100 text-stone-600',
};
const PILLAR_LABELS: Record<string, string> = {
  podcast_clips: 'Podcast Clips',
  content_day: 'Content Day',
  campus_interview: 'Campus Interview',
  general: 'General',
};
const POST_STATUS_COLORS: Record<string, string> = {
  idea: 'bg-stone-100 text-stone-500',
  filming: 'bg-amber-100 text-amber-700',
  editing: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-violet-100 text-violet-700',
  posted: 'bg-stone-700 text-white',
  identified: 'bg-stone-100 text-stone-500',
  clipped: 'bg-amber-100 text-amber-700',
  captioned: 'bg-blue-100 text-blue-700',
};
const POST_STATUS_LABELS: Record<string, string> = {
  idea: 'Idea', filming: 'Filming', editing: 'Editing', approved: 'Approved',
  scheduled: 'Scheduled', posted: 'Posted',
  identified: 'Identified', clipped: 'Clipped', captioned: 'Captioned',
};
const TYPE_LABELS: Record<string, string> = {
  hook: 'Hook', caption: 'Caption', cta: 'CTA', tag_set: 'Tag Set',
};
const TYPE_COLORS: Record<string, string> = {
  hook: 'bg-rose-100 text-rose-700',
  caption: 'bg-sky-100 text-sky-700',
  cta: 'bg-amber-100 text-amber-700',
  tag_set: 'bg-stone-100 text-stone-600',
};

// ── Date utilities ───────────────────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  m.setHours(0, 0, 0, 0);
  return m;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function fmtDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}
function fmtDateLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtWeekLabel(monday: Date): string {
  const fri = addDays(monday, 4);
  return `${fmtDateLabel(monday)} – ${fmtDateLabel(fri)}`;
}
function getMostRecentSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

// ── UI Primitives ────────────────────────────────────────────────────────────────
function SlideOver({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Pill({ label, className = '' }: { label: string; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{label}</span>;
}

function StatCard({ label, value, sub, color = 'stone' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    stone: 'text-stone-800', rose: 'text-rose-700', amber: 'text-amber-700',
    emerald: 'text-emerald-700', violet: 'text-violet-700',
  };
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || colorMap.stone}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TI({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 bg-white" />
    </div>
  );
}
function TA({ label, value, onChange, placeholder = '', rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none bg-white" />
    </div>
  );
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 bg-white">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function Btn({ children, onClick, variant = 'secondary', size = 'md', disabled, type = 'button', className = '' }: any) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50';
  const sizes: any = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-4 py-2' };
  const variants: any = {
    primary: 'bg-stone-800 text-white hover:bg-stone-900',
    secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
    ghost: 'text-stone-500 hover:text-stone-700 hover:bg-stone-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ── Seed data ────────────────────────────────────────────────────────────────────
function seedCaptions(): Omit<TikTokCaption, 'id'>[] {
  const now = new Date().toISOString();
  return [
    { pillar: 'podcast_clips', type: 'hook', content: "i got screamed at by an investor and here's what i did next", notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'podcast_clips', type: 'hook', content: 'unpopular opinion: AI is a toaster', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'podcast_clips', type: 'hook', content: "our competitors raised $50M. we didn't. here's why that's fine.", notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'podcast_clips', type: 'hook', content: 'two outfits. cloud closet can make them six.', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'podcast_clips', type: 'hook', content: "what if i just posted 'we raised $5,000'", notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'content_day', type: 'hook', content: 'outfit of the day built entirely from my existing wardrobe', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'content_day', type: 'hook', content: 'the app that tells you what to wear (before you even open your closet)', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'content_day', type: 'hook', content: 'stopping girls on campus to rate their outfits', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'general', type: 'cta', content: 'link in bio to try Cloud Closet free', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'general', type: 'cta', content: 'download the app and plan your first outfit', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'general', type: 'cta', content: "comment your school and we'll feature it next", notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'campus_interview', type: 'tag_set', content: '#cloudcloset #campusstyle #collegeootd #outfitcheck #uwmadison', notes: '', used_count: 0, last_used_at: null, created_at: now },
    { pillar: 'podcast_clips', type: 'tag_set', content: '#foundertok #startuplife #womenintech #fashiontech #cloudcloset', notes: '', used_count: 0, last_used_at: null, created_at: now },
  ];
}

// ── PILLAR / STATUS select options ───────────────────────────────────────────────
const PILLAR_OPTIONS = [
  { value: 'podcast_clips', label: 'Podcast Clips' },
  { value: 'content_day', label: 'Content Day' },
  { value: 'campus_interview', label: 'Campus Interview' },
];
const POST_STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'filming', label: 'Filming' },
  { value: 'editing', label: 'Editing' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'posted', label: 'Posted' },
];
const CLIP_STATUS_OPTIONS = [
  { value: 'identified', label: 'Identified' },
  { value: 'clipped', label: 'Clipped' },
  { value: 'captioned', label: 'Captioned' },
  { value: 'approved', label: 'Approved' },
  { value: 'posted', label: 'Posted' },
];
const PILLAR_WITH_GENERAL_OPTIONS = [
  { value: 'podcast_clips', label: 'Podcast Clips' },
  { value: 'content_day', label: 'Content Day' },
  { value: 'campus_interview', label: 'Campus Interview' },
  { value: 'general', label: 'General' },
];
const CAPTION_TYPE_OPTIONS = [
  { value: 'hook', label: 'Hook' },
  { value: 'caption', label: 'Caption' },
  { value: 'cta', label: 'CTA' },
  { value: 'tag_set', label: 'Tag Set' },
];

// ── Blank form factories ─────────────────────────────────────────────────────────
function blankPost(): Omit<TikTokPost, 'id' | 'created_at'> {
  return { title: '', pillar: 'podcast_clips', status: 'idea', scheduled_date: null, hook: '', caption: '', tiktok_url: '', assigned_to: 'Will', notes: '', order_num: 0 };
}
function blankClip(episodeId: string = ''): Omit<TikTokClip, 'id' | 'created_at'> {
  return { episode_id: episodeId, clip_title: '', timestamp_start: '', timestamp_end: '', duration: '', status: 'identified', hook: '', caption: '', tags: '', tiktok_url: '', notes: '', order_num: 0 };
}
function blankCaption(): Omit<TikTokCaption, 'id' | 'created_at'> {
  return { pillar: 'general', type: 'hook', content: '', notes: '', used_count: 0, last_used_at: null };
}
function blankAnalytics(): Omit<TikTokAnalytics, 'id' | 'created_at'> {
  return {
    week_start: getMostRecentSunday(),
    posts_published: 0, total_views: 0, total_likes: 0, total_comments: 0,
    total_shares: 0, followers_gained: 0, followers_total: 0,
    top_post_title: '', top_post_url: '', top_post_views: 0,
    best_pillar: 'podcast_clips', buffer_health: 0, will_notes: '', ella_notes: '',
  };
}

// ── SUB-COMPONENT 1: ContentCalendar ────────────────────────────────────────────
function ContentCalendar({ posts, canEdit, sb, onChange, profile }: {
  posts: TikTokPost[]; canEdit: boolean; sb: any; onChange: () => void; profile: Profile;
}) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [monthDate, setMonthDate] = useState<Date>(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [slidePost, setSlidePost] = useState<TikTokPost | null>(null);
  const [showSlide, setShowSlide] = useState(false);
  const [form, setForm] = useState<Omit<TikTokPost, 'id' | 'created_at'>>(blankPost());
  const [saving, setSaving] = useState(false);

  const weekDays = [0, 1, 2, 3, 4].map(i => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);

  const postsThisWeek = posts.filter(p => {
    if (!p.scheduled_date) return false;
    const d = p.scheduled_date;
    return d >= fmtDateKey(weekStart) && d <= fmtDateKey(weekEnd);
  }).length;
  const bufferCount = posts.filter(p => p.status === 'approved' || p.status === 'scheduled').length;
  const inBuffer = bufferCount;
  const needsApproval = posts.filter(p => p.status === 'editing').length;
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const postedThisMonth = posts.filter(p => p.status === 'posted' && p.scheduled_date && p.scheduled_date.startsWith(monthStr)).length;

  const bufferColor = bufferCount >= 3 ? 'bg-emerald-500' : bufferCount === 2 ? 'bg-amber-400' : 'bg-red-500';
  const bufferPct = Math.min(100, (bufferCount / 5) * 100);

  const queuePosts = posts.filter(p => !p.scheduled_date);

  function openNew(date?: string) {
    setSlidePost(null);
    setForm({ ...blankPost(), scheduled_date: date || null });
    setShowSlide(true);
  }
  function openEdit(post: TikTokPost) {
    setSlidePost(post);
    setForm({
      title: post.title, pillar: post.pillar, status: post.status,
      scheduled_date: post.scheduled_date, hook: post.hook, caption: post.caption,
      tiktok_url: post.tiktok_url, assigned_to: post.assigned_to, notes: post.notes,
      order_num: post.order_num,
    });
    setShowSlide(true);
  }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (slidePost) {
      await sb.from('tiktok_posts').update({ ...form, updated_at: new Date().toISOString() }).eq('id', slidePost.id);
    } else {
      await sb.from('tiktok_posts').insert({ ...form, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  async function deletePost() {
    if (!slidePost) return;
    setSaving(true);
    await sb.from('tiktok_posts').delete().eq('id', slidePost.id);
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  async function handleDrop(dayKey: string) {
    if (!draggingId) return;
    await sb.from('tiktok_posts').update({ scheduled_date: dayKey }).eq('id', draggingId);
    setDraggingId(null);
    setDragOverDay(null);
    onChange();
  }

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const ALL_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Month grid helpers
  function getMonthWeeks(monthStart: Date): Date[][] {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Find the Monday on or before the 1st
    const startMonday = getMonday(firstDay);
    const weeks: Date[][] = [];
    let cur = new Date(startMonday);
    while (cur <= lastDay || weeks.length < 1) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cur));
        cur = addDays(cur, 1);
      }
      weeks.push(week);
      if (cur > lastDay && weeks.length >= 4) break;
    }
    return weeks;
  }

  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthWeeks = getMonthWeeks(monthDate);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="This Week" value={postsThisWeek} sub="scheduled" />
        <StatCard label="In Buffer" value={inBuffer} sub="approved/scheduled" color={bufferCount >= 3 ? 'emerald' : bufferCount === 2 ? 'amber' : 'rose'} />
        <StatCard label="Needs Approval" value={needsApproval} color={needsApproval > 0 ? 'amber' : 'stone'} />
        <StatCard label="Posted This Month" value={postedThisMonth} color="violet" />
      </div>

      {/* Buffer health bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-600">Buffer Health</span>
          <span className="text-xs text-stone-400">{bufferCount} posts ready</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${bufferColor}`} style={{ width: `${bufferPct}%` }} />
        </div>
        <p className="text-xs text-stone-400 mt-1.5">
          {bufferCount >= 3 ? 'Healthy — keep it up!' : bufferCount === 2 ? 'Getting low — approve more content' : 'Critical — buffer needs attention'}
        </p>
      </div>

      {/* Nav bar: view toggle + prev/next + add */}
      <div className="flex items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center bg-stone-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'week' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >Week</button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'month' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >Month</button>
        </div>

        {/* Period nav */}
        <div className="flex items-center gap-1.5 flex-1">
          {viewMode === 'week' ? (
            <>
              <button onClick={() => setWeekStart(d => addDays(d, -7))} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium text-stone-700">{fmtWeekLabel(weekStart)}</span>
              <button onClick={() => setWeekStart(d => addDays(d, 7))} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronRight size={16} /></button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMonthDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
              ><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium text-stone-700">{monthLabel}</span>
              <button
                onClick={() => setMonthDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
              ><ChevronRight size={16} /></button>
            </>
          )}
        </div>

        {canEdit && <Btn variant="primary" onClick={() => openNew()}><Plus size={14} />Add Post</Btn>}
      </div>

      {/* Week view grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-5 gap-2">
          {weekDays.map((day, i) => {
            const dayKey = fmtDateKey(day);
            const dayPosts = posts.filter(p => p.scheduled_date === dayKey);
            const isOver = dragOverDay === dayKey;
            const isToday = dayKey === fmtDateKey(new Date());
            return (
              <div
                key={dayKey}
                onDragOver={e => { e.preventDefault(); setDragOverDay(dayKey); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={() => handleDrop(dayKey)}
                className={`min-h-[160px] rounded-xl border p-2 transition-colors ${isOver ? 'border-stone-400 bg-stone-50' : 'border-stone-200 bg-white'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">{DAY_LABELS[i]}</p>
                    <p className={`text-sm font-bold ${isToday ? 'text-pink-600' : 'text-stone-700'}`}>{fmtDateLabel(day)}</p>
                  </div>
                  {canEdit && (
                    <button onClick={() => openNew(dayKey)} className="p-0.5 rounded text-stone-300 hover:text-stone-600 hover:bg-stone-100">
                      <Plus size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {dayPosts.map(post => (
                    <div
                      key={post.id}
                      draggable={canEdit}
                      onDragStart={() => setDraggingId(post.id)}
                      onDragEnd={() => { setDraggingId(null); setDragOverDay(null); }}
                      onClick={() => openEdit(post)}
                      className={`cursor-pointer rounded-lg p-2 border-l-4 bg-stone-50 hover:bg-stone-100 transition-colors ${
                        post.pillar === 'podcast_clips' ? 'border-pink-400' :
                        post.pillar === 'content_day' ? 'border-teal-400' : 'border-purple-400'
                      }`}
                    >
                      <div className="flex flex-wrap gap-1 mb-1">
                        <Pill label={PILLAR_LABELS[post.pillar]} className={PILLAR_COLORS[post.pillar]} />
                        <Pill label={POST_STATUS_LABELS[post.status] || post.status} className={POST_STATUS_COLORS[post.status] || 'bg-stone-100 text-stone-500'} />
                      </div>
                      <p className="text-xs font-medium text-stone-800 line-clamp-2">{post.title}</p>
                      {post.assigned_to && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-600">
                            {post.assigned_to.slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month view grid */}
      {viewMode === 'month' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {ALL_DAY_LABELS.map(d => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold text-stone-400 uppercase">{d}</div>
            ))}
          </div>
          {/* Weeks */}
          {monthWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-stone-100 last:border-b-0">
              {week.map((day) => {
                const dayKey = fmtDateKey(day);
                const inMonth = day.getMonth() === monthDate.getMonth();
                const isToday = dayKey === fmtDateKey(new Date());
                const dayPosts = posts.filter(p => p.scheduled_date === dayKey);
                const isOver = dragOverDay === dayKey;
                return (
                  <div
                    key={dayKey}
                    onDragOver={e => { e.preventDefault(); setDragOverDay(dayKey); }}
                    onDragLeave={() => setDragOverDay(null)}
                    onDrop={() => handleDrop(dayKey)}
                    className={`min-h-[100px] p-1.5 border-r border-stone-100 last:border-r-0 transition-colors ${
                      isOver ? 'bg-stone-50' : inMonth ? 'bg-white' : 'bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-pink-500 text-white' : inMonth ? 'text-stone-700' : 'text-stone-300'
                      }`}>
                        {day.getDate()}
                      </span>
                      {canEdit && inMonth && (
                        <button onClick={() => openNew(dayKey)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-300 hover:text-stone-500">
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.map(post => (
                        <div
                          key={post.id}
                          draggable={canEdit}
                          onDragStart={() => setDraggingId(post.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverDay(null); }}
                          onClick={() => openEdit(post)}
                          className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium truncate border-l-2 ${
                            post.pillar === 'podcast_clips' ? 'border-pink-400 bg-pink-50 text-pink-800' :
                            post.pillar === 'content_day' ? 'border-teal-400 bg-teal-50 text-teal-800' :
                            'border-purple-400 bg-purple-50 text-purple-800'
                          } ${post.status === 'posted' ? 'opacity-60' : ''}`}
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length === 0 && canEdit && inMonth && (
                        <button
                          onClick={() => openNew(dayKey)}
                          className="w-full text-[10px] text-stone-300 hover:text-stone-500 py-1 text-center"
                        >+</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Queue */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-800">Unscheduled Queue ({queuePosts.length})</h3>
        </div>
        {queuePosts.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">No unscheduled posts</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Title</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Pillar</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Assigned</th>
                  {canEdit && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {queuePosts.map(post => (
                  <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-stone-800">{post.title}</td>
                    <td className="px-4 py-2.5"><Pill label={PILLAR_LABELS[post.pillar]} className={PILLAR_COLORS[post.pillar]} /></td>
                    <td className="px-4 py-2.5"><Pill label={POST_STATUS_LABELS[post.status] || post.status} className={POST_STATUS_COLORS[post.status] || ''} /></td>
                    <td className="px-4 py-2.5 text-stone-500">{post.assigned_to}</td>
                    {canEdit && (
                      <td className="px-4 py-2.5">
                        <Btn size="sm" variant="ghost" onClick={() => openEdit(post)}><Edit2 size={12} /></Btn>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over */}
      <SlideOver open={showSlide} onClose={() => setShowSlide(false)} title={slidePost ? 'Edit Post' : 'Add Post'}>
        <div className="space-y-4">
          <TI label="Title *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Post title…" />
          <Sel label="Pillar" value={form.pillar} onChange={v => setForm(f => ({ ...f, pillar: v as Pillar }))} options={PILLAR_OPTIONS} />
          <Sel label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v as PostStatus }))} options={POST_STATUS_OPTIONS} />
          <TI label="Scheduled Date" value={form.scheduled_date || ''} onChange={v => setForm(f => ({ ...f, scheduled_date: v || null }))} type="date" />
          <TA label="Hook" value={form.hook} onChange={v => setForm(f => ({ ...f, hook: v }))} placeholder="Opening hook…" rows={2} />
          <TA label="Caption" value={form.caption} onChange={v => setForm(f => ({ ...f, caption: v }))} placeholder="Caption…" rows={3} />
          <TI label="TikTok URL" value={form.tiktok_url} onChange={v => setForm(f => ({ ...f, tiktok_url: v }))} placeholder="https://tiktok.com/…" />
          <TI label="Assigned To" value={form.assigned_to} onChange={v => setForm(f => ({ ...f, assigned_to: v }))} placeholder="Will" />
          <TA label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} rows={2} />
          <div className="flex items-center gap-2 pt-2">
            <Btn variant="primary" onClick={save} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : slidePost ? 'Save Changes' : 'Add Post'}
            </Btn>
            {slidePost && canEdit && (
              <Btn variant="danger" onClick={deletePost} disabled={saving}><Trash2 size={14} />Delete</Btn>
            )}
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ── SUB-COMPONENT 2: ClipTracker ─────────────────────────────────────────────────
function ClipTracker({ episodes, clips, canEdit, sb, onEpisodesChange, onClipsChange }: {
  episodes: TikTokEpisode[]; clips: TikTokClip[]; canEdit: boolean;
  sb: any; onEpisodesChange: () => void; onClipsChange: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [slideClip, setSlideClip] = useState<TikTokClip | null>(null);
  const [showClipSlide, setShowClipSlide] = useState(false);
  const [showEpSlide, setShowEpSlide] = useState(false);
  const [epForm, setEpForm] = useState({ title: '', url: '' });
  const [editingEpisode, setEditingEpisode] = useState<TikTokEpisode | null>(null);
  const [clipForm, setClipForm] = useState<Omit<TikTokClip, 'id' | 'created_at'>>(blankClip());
  const [saving, setSaving] = useState(false);

  const filteredEpisodes = episodes.filter(ep =>
    ep.title.toLowerCase().includes(search.toLowerCase())
  );

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function openAddClip(episodeId: string) {
    setSlideClip(null);
    setClipForm(blankClip(episodeId));
    setShowClipSlide(true);
  }
  function openEditClip(clip: TikTokClip) {
    setSlideClip(clip);
    setClipForm({
      episode_id: clip.episode_id, clip_title: clip.clip_title,
      timestamp_start: clip.timestamp_start, timestamp_end: clip.timestamp_end,
      duration: clip.duration, status: clip.status, hook: clip.hook,
      caption: clip.caption, tags: clip.tags, tiktok_url: clip.tiktok_url,
      notes: clip.notes, order_num: clip.order_num,
    });
    setShowClipSlide(true);
  }

  async function saveClip() {
    setSaving(true);
    if (slideClip) {
      await sb.from('tiktok_clips').update(clipForm).eq('id', slideClip.id);
    } else {
      await sb.from('tiktok_clips').insert({ ...clipForm, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowClipSlide(false);
    onClipsChange();
  }
  async function deleteClip() {
    if (!slideClip) return;
    setSaving(true);
    await sb.from('tiktok_clips').delete().eq('id', slideClip.id);
    setSaving(false);
    setShowClipSlide(false);
    onClipsChange();
  }

  function openAddEpisode() {
    setEditingEpisode(null);
    setEpForm({ title: '', url: '' });
    setShowEpSlide(true);
  }
  function openEditEpisode(ep: TikTokEpisode) {
    setEditingEpisode(ep);
    setEpForm({ title: ep.title, url: ep.url });
    setShowEpSlide(true);
  }
  async function saveEpisode() {
    if (!epForm.title.trim()) return;
    setSaving(true);
    if (editingEpisode) {
      await sb.from('tiktok_episodes').update(epForm).eq('id', editingEpisode.id);
    } else {
      await sb.from('tiktok_episodes').insert({ ...epForm, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowEpSlide(false);
    onEpisodesChange();
  }
  async function deleteEpisode() {
    if (!editingEpisode) return;
    setSaving(true);
    await sb.from('tiktok_episodes').delete().eq('id', editingEpisode.id);
    setSaving(false);
    setShowEpSlide(false);
    onEpisodesChange();
    onClipsChange();
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        {canEdit && <Btn variant="primary" onClick={openAddEpisode}><Plus size={14} />Add Episode</Btn>}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search episodes…"
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400 bg-white"
          />
        </div>
      </div>

      {/* Episodes list */}
      {filteredEpisodes.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Play size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">{search ? 'No episodes match your search' : 'No episodes yet — add your first podcast episode'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEpisodes.map(ep => {
            const epClips = clips.filter(c => c.episode_id === ep.id);
            const postedCount = epClips.filter(c => c.status === 'posted').length;
            const totalCount = epClips.length;
            const pct = totalCount > 0 ? Math.round((postedCount / totalCount) * 100) : 0;
            const isOpen = expanded.has(ep.id);
            return (
              <div key={ep.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                {/* Episode header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleExpand(ep.id)} className="flex-1 flex items-center gap-3 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-stone-800 text-sm">{ep.title}</p>
                        {ep.url && (
                          <a href={ep.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-stone-400 hover:text-stone-600">
                            <LinkIcon size={12} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {totalCount} clip{totalCount !== 1 ? 's' : ''} · {postedCount} posted
                        {totalCount > 0 && ` · ${totalCount - postedCount} remaining`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 text-right">{pct}%</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">{totalCount}</span>
                      {isOpen ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                    </div>
                  </button>
                  {canEdit && (
                    <div className="flex items-center gap-1 ml-2">
                      <Btn size="sm" variant="ghost" onClick={() => openEditEpisode(ep)}><Edit2 size={12} /></Btn>
                      <Btn size="sm" variant="primary" onClick={() => openAddClip(ep.id)}><Plus size={12} /></Btn>
                    </div>
                  )}
                </div>

                {/* Clips table */}
                {isOpen && (
                  <div className="border-t border-stone-100">
                    {epClips.length === 0 ? (
                      <p className="text-sm text-stone-400 text-center py-6">No clips yet for this episode</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-stone-50 border-b border-stone-100">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Clip Title</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Timestamps</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Duration</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Status</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Hook</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-stone-500">Link</th>
                              {canEdit && <th className="px-4 py-2" />}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                            {epClips.map(clip => (
                              <tr key={clip.id} className="hover:bg-stone-50 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-stone-800 max-w-[140px] truncate">{clip.clip_title}</td>
                                <td className="px-4 py-2.5 text-stone-500 text-xs whitespace-nowrap">
                                  {clip.timestamp_start && clip.timestamp_end ? `${clip.timestamp_start}–${clip.timestamp_end}` : clip.timestamp_start || '—'}
                                </td>
                                <td className="px-4 py-2.5 text-stone-500">{clip.duration || '—'}</td>
                                <td className="px-4 py-2.5"><Pill label={POST_STATUS_LABELS[clip.status] || clip.status} className={POST_STATUS_COLORS[clip.status] || 'bg-stone-100 text-stone-500'} /></td>
                                <td className="px-4 py-2.5 text-stone-500 text-xs max-w-[160px] truncate">
                                  {clip.hook ? (clip.hook.length > 60 ? clip.hook.slice(0, 60) + '…' : clip.hook) : '—'}
                                </td>
                                <td className="px-4 py-2.5">
                                  {clip.tiktok_url ? (
                                    <a href={clip.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700">
                                      <ExternalLink size={13} />
                                    </a>
                                  ) : <span className="text-stone-300">—</span>}
                                </td>
                                {canEdit && (
                                  <td className="px-4 py-2.5">
                                    <Btn size="sm" variant="ghost" onClick={() => openEditClip(clip)}><Edit2 size={12} /></Btn>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Episode slide-over */}
      <SlideOver open={showEpSlide} onClose={() => setShowEpSlide(false)} title={editingEpisode ? 'Edit Episode' : 'Add Episode'}>
        <div className="space-y-4">
          <TI label="Episode Title *" value={epForm.title} onChange={v => setEpForm(f => ({ ...f, title: v }))} placeholder="Episode title…" />
          <TI label="URL" value={epForm.url} onChange={v => setEpForm(f => ({ ...f, url: v }))} placeholder="https://…" />
          <div className="flex items-center gap-2 pt-2">
            <Btn variant="primary" onClick={saveEpisode} disabled={saving || !epForm.title.trim()}>
              {saving ? 'Saving…' : editingEpisode ? 'Save Changes' : 'Add Episode'}
            </Btn>
            {editingEpisode && canEdit && (
              <Btn variant="danger" onClick={deleteEpisode} disabled={saving}><Trash2 size={14} />Delete</Btn>
            )}
          </div>
        </div>
      </SlideOver>

      {/* Clip slide-over */}
      <SlideOver open={showClipSlide} onClose={() => setShowClipSlide(false)} title={slideClip ? 'Edit Clip' : 'Add Clip'}>
        <div className="space-y-4">
          <TI label="Clip Title *" value={clipForm.clip_title} onChange={v => setClipForm(f => ({ ...f, clip_title: v }))} placeholder="Clip title…" />
          <div className="grid grid-cols-2 gap-3">
            <TI label="Start" value={clipForm.timestamp_start} onChange={v => setClipForm(f => ({ ...f, timestamp_start: v }))} placeholder="0:00" />
            <TI label="End" value={clipForm.timestamp_end} onChange={v => setClipForm(f => ({ ...f, timestamp_end: v }))} placeholder="1:30" />
          </div>
          <TI label="Duration" value={clipForm.duration} onChange={v => setClipForm(f => ({ ...f, duration: v }))} placeholder="0:30" />
          <Sel label="Status" value={clipForm.status} onChange={v => setClipForm(f => ({ ...f, status: v as ClipStatus }))} options={CLIP_STATUS_OPTIONS} />
          <TA label="Hook" value={clipForm.hook} onChange={v => setClipForm(f => ({ ...f, hook: v }))} placeholder="Opening hook…" rows={2} />
          <TA label="Caption" value={clipForm.caption} onChange={v => setClipForm(f => ({ ...f, caption: v }))} rows={3} />
          <TI label="Tags" value={clipForm.tags} onChange={v => setClipForm(f => ({ ...f, tags: v }))} placeholder="#tag1 #tag2" />
          <TI label="TikTok URL" value={clipForm.tiktok_url} onChange={v => setClipForm(f => ({ ...f, tiktok_url: v }))} placeholder="https://tiktok.com/…" />
          <TA label="Notes" value={clipForm.notes} onChange={v => setClipForm(f => ({ ...f, notes: v }))} rows={2} />
          <div className="flex items-center gap-2 pt-2">
            <Btn variant="primary" onClick={saveClip} disabled={saving || !clipForm.clip_title.trim()}>
              {saving ? 'Saving…' : slideClip ? 'Save Changes' : 'Add Clip'}
            </Btn>
            {slideClip && canEdit && (
              <Btn variant="danger" onClick={deleteClip} disabled={saving}><Trash2 size={14} />Delete</Btn>
            )}
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ── SUB-COMPONENT 3: CaptionBank ─────────────────────────────────────────────────
function CaptionBank({ captions, canEdit, sb, onChange }: {
  captions: TikTokCaption[]; canEdit: boolean; sb: any; onChange: () => void;
}) {
  const [pillarFilter, setPillarFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [slideCaption, setSlideCaption] = useState<TikTokCaption | null>(null);
  const [showSlide, setShowSlide] = useState(false);
  const [form, setForm] = useState<Omit<TikTokCaption, 'id' | 'created_at'>>(blankCaption());
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = captions.filter(c => {
    if (pillarFilter !== 'all' && c.pillar !== pillarFilter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  function openAdd() {
    setSlideCaption(null);
    setForm(blankCaption());
    setShowSlide(true);
  }
  function openEdit(cap: TikTokCaption) {
    setSlideCaption(cap);
    setForm({ pillar: cap.pillar, type: cap.type, content: cap.content, notes: cap.notes, used_count: cap.used_count, last_used_at: cap.last_used_at });
    setShowSlide(true);
  }

  async function save() {
    if (!form.content.trim()) return;
    setSaving(true);
    if (slideCaption) {
      await sb.from('tiktok_captions').update(form).eq('id', slideCaption.id);
    } else {
      await sb.from('tiktok_captions').insert({ ...form, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  async function deleteCaption() {
    if (!slideCaption) return;
    setSaving(true);
    await sb.from('tiktok_captions').delete().eq('id', slideCaption.id);
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  async function copyContent(cap: TikTokCaption) {
    await navigator.clipboard.writeText(cap.content);
    setCopied(cap.id);
    setTimeout(() => setCopied(null), 1500);
    await sb.from('tiktok_captions').update({
      used_count: cap.used_count + 1,
      last_used_at: new Date().toISOString(),
    }).eq('id', cap.id);
    onChange();
  }

  const PILLAR_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'podcast_clips', label: 'Podcast Clips' },
    { id: 'content_day', label: 'Content Day' },
    { id: 'campus_interview', label: 'Campus Interview' },
    { id: 'general', label: 'General' },
  ];
  const TYPE_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'hook', label: 'Hooks' },
    { id: 'caption', label: 'Captions' },
    { id: 'cta', label: 'CTAs' },
    { id: 'tag_set', label: 'Tag Sets' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter + Add row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {PILLAR_FILTERS.map(f => (
              <button key={f.id} onClick={() => setPillarFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${pillarFilter === f.id ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${typeFilter === f.id ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {canEdit && <Btn variant="primary" onClick={openAdd}><Plus size={14} />Add Entry</Btn>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No captions match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(cap => (
            <div key={cap.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill label={PILLAR_LABELS[cap.pillar] || cap.pillar} className={PILLAR_COLORS[cap.pillar] || PILLAR_COLORS.general} />
                <Pill label={TYPE_LABELS[cap.type] || cap.type} className={TYPE_COLORS[cap.type] || 'bg-stone-100 text-stone-600'} />
              </div>
              <p className="text-sm text-stone-800 leading-relaxed flex-1">{cap.content}</p>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  Used {cap.used_count} time{cap.used_count !== 1 ? 's' : ''}
                  {cap.last_used_at && ` · last ${new Date(cap.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Btn size="sm" variant="secondary" onClick={() => copyContent(cap)} className="flex-1 justify-center">
                  {copied === cap.id ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                </Btn>
                {canEdit && (
                  <>
                    <Btn size="sm" variant="ghost" onClick={() => openEdit(cap)}><Edit2 size={12} /></Btn>
                    <Btn size="sm" variant="ghost" onClick={async () => {
                      setSaving(true);
                      await sb.from('tiktok_captions').delete().eq('id', cap.id);
                      setSaving(false);
                      onChange();
                    }}><Trash2 size={12} className="text-red-400" /></Btn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over */}
      <SlideOver open={showSlide} onClose={() => setShowSlide(false)} title={slideCaption ? 'Edit Entry' : 'Add Entry'}>
        <div className="space-y-4">
          <Sel label="Pillar" value={form.pillar} onChange={v => setForm(f => ({ ...f, pillar: v as Pillar | 'general' }))} options={PILLAR_WITH_GENERAL_OPTIONS} />
          <Sel label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v as CaptionType }))} options={CAPTION_TYPE_OPTIONS} />
          <TA label="Content *" value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} placeholder="Caption content…" rows={6} />
          <TA label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} rows={2} />
          <div className="flex items-center gap-2 pt-2">
            <Btn variant="primary" onClick={save} disabled={saving || !form.content.trim()}>
              {saving ? 'Saving…' : slideCaption ? 'Save Changes' : 'Add Entry'}
            </Btn>
            {slideCaption && canEdit && (
              <Btn variant="danger" onClick={deleteCaption} disabled={saving}><Trash2 size={14} />Delete</Btn>
            )}
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ── SUB-COMPONENT 4: AnalyticsLog ────────────────────────────────────────────────
function AnalyticsLog({ entries, canEdit, isAdmin, sb, onChange }: {
  entries: TikTokAnalytics[]; canEdit: boolean; isAdmin: boolean; sb: any; onChange: () => void;
}) {
  const [showSlide, setShowSlide] = useState(false);
  const [editEntry, setEditEntry] = useState<TikTokAnalytics | null>(null);
  const [form, setForm] = useState<Omit<TikTokAnalytics, 'id' | 'created_at'>>(blankAnalytics());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Sort entries newest-first
  const sorted = [...entries].sort((a, b) => b.week_start.localeCompare(a.week_start));
  const latest = sorted[0] || null;
  const prior = sorted[1] || null;

  function trend(latestVal: number, priorVal: number | undefined) {
    if (priorVal === undefined || priorVal === null) return null;
    if (latestVal > priorVal) return 'up';
    if (latestVal < priorVal) return 'down';
    return 'same';
  }
  function TrendIcon({ dir, val }: { dir: string | null; val: number }) {
    if (dir === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (dir === 'down') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-stone-300" />;
  }

  function openAdd() {
    setEditEntry(null);
    setForm(blankAnalytics());
    setShowSlide(true);
  }
  function openEdit(entry: TikTokAnalytics) {
    setEditEntry(entry);
    setForm({
      week_start: entry.week_start, posts_published: entry.posts_published,
      total_views: entry.total_views, total_likes: entry.total_likes,
      total_comments: entry.total_comments, total_shares: entry.total_shares,
      followers_gained: entry.followers_gained, followers_total: entry.followers_total,
      top_post_title: entry.top_post_title, top_post_url: entry.top_post_url,
      top_post_views: entry.top_post_views, best_pillar: entry.best_pillar,
      buffer_health: entry.buffer_health, will_notes: entry.will_notes,
      ella_notes: entry.ella_notes,
    });
    setShowSlide(true);
  }

  async function save() {
    setSaving(true);
    if (editEntry) {
      await sb.from('tiktok_analytics').update(form).eq('id', editEntry.id);
    } else {
      await sb.from('tiktok_analytics').insert({ ...form, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  async function deleteEntry() {
    if (!editEntry) return;
    setSaving(true);
    await sb.from('tiktok_analytics').delete().eq('id', editEntry.id);
    setSaving(false);
    setShowSlide(false);
    onChange();
  }

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function numField(key: keyof typeof form, label: string) {
    return (
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
        <input
          type="number" value={(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary stat cards */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-1">Total Views</p>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-stone-800">{latest.total_views.toLocaleString()}</p>
              <TrendIcon dir={trend(latest.total_views, prior?.total_views)} val={latest.total_views} />
            </div>
            {prior && <p className="text-xs text-stone-400 mt-0.5">prev: {prior.total_views.toLocaleString()}</p>}
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-1">Followers Gained</p>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-emerald-700">+{latest.followers_gained}</p>
              <TrendIcon dir={trend(latest.followers_gained, prior?.followers_gained)} val={latest.followers_gained} />
            </div>
            {prior && <p className="text-xs text-stone-400 mt-0.5">prev: +{prior.followers_gained}</p>}
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-1">Posts Published</p>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-violet-700">{latest.posts_published}</p>
              <TrendIcon dir={trend(latest.posts_published, prior?.posts_published)} val={latest.posts_published} />
            </div>
            {prior && <p className="text-xs text-stone-400 mt-0.5">prev: {prior.posts_published}</p>}
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-1">Buffer Health</p>
            <div className="flex items-center gap-1.5">
              <p className={`text-2xl font-bold ${latest.buffer_health >= 3 ? 'text-emerald-700' : latest.buffer_health === 2 ? 'text-amber-700' : 'text-red-600'}`}>
                {latest.buffer_health}
              </p>
              <TrendIcon dir={trend(latest.buffer_health, prior?.buffer_health)} val={latest.buffer_health} />
            </div>
            {prior && <p className="text-xs text-stone-400 mt-0.5">prev: {prior.buffer_health}</p>}
          </div>
        </div>
      )}

      {/* Add button */}
      {canEdit && (
        <div className="flex justify-end">
          <Btn variant="primary" onClick={openAdd}><Plus size={14} />Log Week</Btn>
        </div>
      )}

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <BarChart3 size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No analytics entries yet</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Week</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Posts</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Views</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Followers</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Top Post</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Best Pillar</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Buffer</th>
                  {canEdit && <th className="px-4 py-3" />}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(entry => {
                  const isOpen = expandedRows.has(entry.id);
                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-800 whitespace-nowrap">
                          {new Date(entry.week_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-stone-700">{entry.posts_published}</td>
                        <td className="px-4 py-3 text-stone-700">{entry.total_views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">+{entry.followers_gained}</td>
                        <td className="px-4 py-3 max-w-[140px]">
                          {entry.top_post_title ? (
                            entry.top_post_url
                              ? <a href={entry.top_post_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 text-xs truncate block">{entry.top_post_title}</a>
                              : <span className="text-xs text-stone-600 truncate block">{entry.top_post_title}</span>
                          ) : <span className="text-stone-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {entry.best_pillar
                            ? <Pill label={PILLAR_LABELS[entry.best_pillar] || entry.best_pillar} className={PILLAR_COLORS[entry.best_pillar] || ''} />
                            : <span className="text-stone-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${entry.buffer_health >= 3 ? 'text-emerald-600' : entry.buffer_health === 2 ? 'text-amber-600' : 'text-red-600'}`}>
                            {entry.buffer_health}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <Btn size="sm" variant="ghost" onClick={() => openEdit(entry)}><Edit2 size={12} /></Btn>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <button onClick={() => toggleRow(entry.id)} className="p-1 rounded text-stone-400 hover:text-stone-600">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-stone-50 bg-stone-50">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="space-y-3">
                              {entry.will_notes && (
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 mb-1">Will's Notes</p>
                                  <p className="text-sm text-stone-700 whitespace-pre-wrap">{entry.will_notes}</p>
                                </div>
                              )}
                              {isAdmin ? (
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 mb-1">Ella's Notes</p>
                                  <textarea
                                    value={entry.ella_notes || ''}
                                    rows={3}
                                    onChange={async e => {
                                      const val = e.target.value;
                                      await sb.from('tiktok_analytics').update({ ella_notes: val }).eq('id', entry.id);
                                      onChange();
                                    }}
                                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none bg-white"
                                    placeholder="Ella's notes…"
                                  />
                                </div>
                              ) : (
                                entry.ella_notes && (
                                  <div>
                                    <p className="text-xs font-semibold text-stone-500 mb-1">Ella's Notes</p>
                                    <p className="text-sm text-stone-700 whitespace-pre-wrap">{entry.ella_notes}</p>
                                  </div>
                                )
                              )}
                              {!entry.will_notes && !entry.ella_notes && !isAdmin && (
                                <p className="text-xs text-stone-400">No notes for this week</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over */}
      <SlideOver open={showSlide} onClose={() => setShowSlide(false)} title={editEntry ? 'Edit Week Entry' : 'Log Week'}>
        <div className="space-y-4">
          <TI label="Week Start (Sunday)" value={form.week_start} onChange={v => setForm(f => ({ ...f, week_start: v }))} type="date" />
          <div className="grid grid-cols-2 gap-3">
            {numField('posts_published', 'Posts Published')}
            {numField('total_views', 'Total Views')}
            {numField('total_likes', 'Total Likes')}
            {numField('total_comments', 'Total Comments')}
            {numField('total_shares', 'Total Shares')}
            {numField('followers_gained', 'Followers Gained')}
            {numField('followers_total', 'Followers Total')}
            {numField('top_post_views', 'Top Post Views')}
            {numField('buffer_health', 'Buffer Health')}
          </div>
          <TI label="Top Post Title" value={form.top_post_title} onChange={v => setForm(f => ({ ...f, top_post_title: v }))} placeholder="Top performing post…" />
          <TI label="Top Post URL" value={form.top_post_url} onChange={v => setForm(f => ({ ...f, top_post_url: v }))} placeholder="https://tiktok.com/…" />
          <Sel
            label="Best Pillar"
            value={form.best_pillar || 'podcast_clips'}
            onChange={v => setForm(f => ({ ...f, best_pillar: v as Pillar }))}
            options={PILLAR_OPTIONS}
          />
          <TA label="Will's Notes *" value={form.will_notes} onChange={v => setForm(f => ({ ...f, will_notes: v }))} placeholder="Week recap, what worked, what didn't…" rows={4} />
          {isAdmin && (
            <TA label="Ella's Notes" value={form.ella_notes} onChange={v => setForm(f => ({ ...f, ella_notes: v }))} placeholder="Ella's feedback and notes…" rows={3} />
          )}
          <div className="flex items-center gap-2 pt-2">
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editEntry ? 'Save Changes' : 'Log Week'}
            </Btn>
            {editEntry && canEdit && (
              <Btn variant="danger" onClick={deleteEntry} disabled={saving}><Trash2 size={14} />Delete</Btn>
            )}
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

// ── Main TikTokContent component ─────────────────────────────────────────────────
export default function TikTokContent({ profile, sb }: { profile: Profile; sb: any }) {
  type SubTab = 'calendar' | 'clips' | 'captions' | 'analytics';
  const [subTab, setSubTab] = useState<SubTab>('calendar');
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [episodes, setEpisodes] = useState<TikTokEpisode[]>([]);
  const [clips, setClips] = useState<TikTokClip[]>([]);
  const [captions, setCaptions] = useState<TikTokCaption[]>([]);
  const [analytics, setAnalytics] = useState<TikTokAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = profile.role === 'admin' || profile.role === 'cc_exec';
  const isAdmin = profile.role === 'admin';

  const reloadPosts = useCallback(async () => {
    const { data } = await sb.from('tiktok_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data as TikTokPost[]);
  }, [sb]);

  const reloadEpisodes = useCallback(async () => {
    const { data } = await sb.from('tiktok_episodes').select('*').order('created_at', { ascending: false });
    if (data) setEpisodes(data as TikTokEpisode[]);
  }, [sb]);

  const reloadClips = useCallback(async () => {
    const { data } = await sb.from('tiktok_clips').select('*').order('created_at', { ascending: false });
    if (data) setClips(data as TikTokClip[]);
  }, [sb]);

  const reloadCaptions = useCallback(async () => {
    const { data } = await sb.from('tiktok_captions').select('*').order('created_at', { ascending: false });
    if (data) setCaptions(data as TikTokCaption[]);
    return data;
  }, [sb]);

  const reloadAnalytics = useCallback(async () => {
    const { data } = await sb.from('tiktok_analytics').select('*').order('created_at', { ascending: false });
    if (data) setAnalytics(data as TikTokAnalytics[]);
  }, [sb]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([reloadPosts(), reloadEpisodes(), reloadClips(), reloadAnalytics()]);
      // Captions: seed if empty
      const data = await reloadCaptions();
      if (!data || data.length === 0) {
        const seeds = seedCaptions();
        await sb.from('tiktok_captions').insert(seeds);
        await reloadCaptions();
      }
      setLoading(false);
    }
    loadData();
  }, [reloadPosts, reloadEpisodes, reloadClips, reloadCaptions, reloadAnalytics, sb]);

  const SUBTABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'clips', label: 'Clip Tracker', icon: Play },
    { id: 'captions', label: 'Caption Bank', icon: BookOpen },
    { id: 'analytics', label: 'Analytics Log', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-800">TikTok Content</h1>
        <p className="text-sm text-stone-400 mt-0.5">Manage posts, clips, captions, and analytics</p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === 'calendar' && (
        <ContentCalendar
          posts={posts}
          canEdit={canEdit}
          sb={sb}
          onChange={reloadPosts}
          profile={profile}
        />
      )}
      {subTab === 'clips' && (
        <ClipTracker
          episodes={episodes}
          clips={clips}
          canEdit={canEdit}
          sb={sb}
          onEpisodesChange={reloadEpisodes}
          onClipsChange={reloadClips}
        />
      )}
      {subTab === 'captions' && (
        <CaptionBank
          captions={captions}
          canEdit={canEdit}
          sb={sb}
          onChange={reloadCaptions}
        />
      )}
      {subTab === 'analytics' && (
        <AnalyticsLog
          entries={analytics}
          canEdit={canEdit}
          isAdmin={isAdmin}
          sb={sb}
          onChange={reloadAnalytics}
        />
      )}
    </div>
  );
}
