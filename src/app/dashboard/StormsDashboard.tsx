"use client";

import { useState } from "react";
import { Loader2, CloudRain, CalendarClock, ExternalLink, Clock } from "lucide-react";

export type Storm = {
  id: string;
  user_id: string;
  problem: string;
  addressed?: string;
  wants_call: boolean;
  created_at: string;
};

type Profile = { id: string; full_name: string; email: string };

// ── Shared helpers ─────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Intern side ────────────────────────────────────────────────────────────────
export function InternStormsView({
  profile,
  storms,
  setStorms,
  calendlyElla,
  sb,
}: {
  profile: Profile;
  storms: Storm[];
  setStorms: (s: Storm[]) => void;
  calendlyElla?: string;
  sb: any;
}) {
  const [problem, setProblem] = useState("");
  const [addressed, setAddressed] = useState("");
  const [wantsCall, setWantsCall] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const myStorms = storms.filter((s) => s.user_id === profile.id);

  async function submit() {
    if (!problem.trim()) { setErr("Please describe what's going on."); return; }
    setSaving(true); setErr("");
    const { data, error } = await sb.from("storms").insert({
      user_id: profile.id,
      problem: problem.trim(),
      addressed: addressed.trim() || null,
      wants_call: wantsCall,
    }).select().single();

    if (error || !data) { setErr("Failed to submit. Try again."); setSaving(false); return; }
    setStorms([data as Storm, ...storms]);
    setProblem(""); setAddressed(""); setWantsCall(false);
    setSaving(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const ta = "w-full px-4 py-3 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 resize-none leading-relaxed";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CloudRain size={18} className="text-stone-500"/>
          <h1 className="text-xl font-bold text-stone-800">Storms</h1>
        </div>
        <p className="text-sm text-stone-400">
          A private space to vent, flag problems, and ask for help. Only Ella sees this.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            What&apos;s going on?
          </label>
          <textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            rows={4}
            placeholder="Describe any problems, frustrations, blockers, or things going wrong…"
            className={ta}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            What have you done to address it?
          </label>
          <textarea
            value={addressed}
            onChange={e => setAddressed(e.target.value)}
            rows={3}
            placeholder="Any steps you&apos;ve already tried, who you&apos;ve talked to, etc. (optional)"
            className={ta}
          />
        </div>

        {/* Calendly checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${wantsCall ? "bg-stone-800 border-stone-800" : "border-stone-300 group-hover:border-stone-400"}`}
            onClick={() => setWantsCall(v => !v)}>
            {wantsCall && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-stone-700 font-medium">
              Do you want to schedule a 15-minute follow up call with Ella?
            </p>
            {wantsCall && calendlyElla && (
              <a
                href={calendlyElla}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-lg hover:bg-violet-100 transition-colors"
              >
                <CalendarClock size={12}/>
                Book a 15-min call with Ella
                <ExternalLink size={11}/>
              </a>
            )}
            {wantsCall && !calendlyElla && (
              <p className="text-xs text-stone-400 mt-1 italic">Ella&apos;s booking link isn&apos;t set up yet — she&apos;ll reach out directly.</p>
            )}
          </div>
        </label>

        {err && <p className="text-xs text-red-500">{err}</p>}

        {submitted && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Submitted — Ella will review this.
          </div>
        )}

        <button
          onClick={submit}
          disabled={saving || !problem.trim()}
          className="flex items-center justify-center gap-2 w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-40 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin"/> : null}
          {saving ? "Submitting…" : "Submit"}
        </button>
      </div>

      {/* Past submissions */}
      {myStorms.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Your past submissions</p>
          {myStorms.map(s => (
            <div key={s.id} className="bg-white border border-stone-200/60 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock size={11} className="text-stone-300"/>
                <span className="text-xs text-stone-400">{timeAgo(s.created_at)}</span>
                {s.wants_call && (
                  <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full font-medium">Requested call</span>
                )}
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{s.problem}</p>
              {s.addressed && (
                <p className="text-xs text-stone-400 italic border-t border-stone-100 pt-2">{s.addressed}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin side ─────────────────────────────────────────────────────────────────
export function AdminStormsView({
  storms,
  profiles,
}: {
  storms: Storm[];
  profiles: Profile[];
}) {
  const [filter, setFilter] = useState<"all" | "wants_call">("all");

  function getName(userId: string) {
    return profiles.find(p => p.id === userId)?.full_name || "Unknown";
  }

  const sorted = [...storms].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filtered = filter === "wants_call" ? sorted.filter(s => s.wants_call) : sorted;

  const wantsCallCount = storms.filter(s => s.wants_call).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudRain size={18} className="text-stone-500"/>
            <h1 className="text-xl font-bold text-stone-800">Storms</h1>
          </div>
          <p className="text-sm text-stone-400">
            {storms.length} submission{storms.length !== 1 ? "s" : ""}{wantsCallCount > 0 ? ` · ${wantsCallCount} requesting a call` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === "all" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("wants_call")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === "wants_call" ? "bg-violet-700 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
          >
            Wants call {wantsCallCount > 0 && `(${wantsCallCount})`}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total", storms.length, "bg-stone-100", "text-stone-600"],
          ["Requesting call", wantsCallCount, "bg-violet-50", "text-violet-600"],
          ["This week", storms.filter(s => (Date.now() - new Date(s.created_at).getTime()) < 7 * 86400000).length, "bg-amber-50", "text-amber-600"],
        ].map(([label, val, bg, text]) => (
          <div key={label as string} className={`${bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${text}`}>{val}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm">
          {storms.length === 0 ? "No storms yet — interns will submit here when they're having a tough time." : "No submissions match this filter."}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                  {getName(s.user_id).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-stone-800">{getName(s.user_id)}</span>
              </div>
              <div className="flex items-center gap-2">
                {s.wants_call && (
                  <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full font-medium flex items-center gap-1">
                    <CalendarClock size={10}/> Wants call
                  </span>
                )}
                <span className="text-xs text-stone-400">{timeAgo(s.created_at)}</span>
              </div>
            </div>

            {/* Problem */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">What&apos;s going on</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{s.problem}</p>
            </div>

            {/* What they've done */}
            {s.addressed && (
              <div className="px-4 pb-3 border-t border-stone-50">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 mt-2">What they&apos;ve done to address it</p>
                <p className="text-sm text-stone-500 italic whitespace-pre-wrap leading-relaxed">{s.addressed}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
