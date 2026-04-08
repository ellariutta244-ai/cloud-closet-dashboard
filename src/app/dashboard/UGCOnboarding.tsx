"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Lock, Star, Play,
  ArrowUp, ArrowDown, RotateCcw, GripVertical,
  ChevronDown, AlertTriangle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModuleStatus = "locked" | "active" | "completed";

interface QuizQ {
  type: "quiz";
  question: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
}

interface DragQ {
  type: "drag";
  prompt: string;
  items: { id: string; text: string }[];
  correctOrder: string[];
  explanation: string;
}

interface ModuleData {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  videoLabel: string;
  description: string[];
  highlights: { icon: string; text: string }[];
  question: QuizQ | DragQ;
}

// ─── Module Content ─────────────────────────────────────────────────────────────

const MODULES: ModuleData[] = [
  {
    id: 1,
    emoji: "✨",
    title: "The Setup",
    subtitle: "Profile Optimization & Account Linking",
    videoLabel: "Profile Setup Walkthrough",
    description: [
      "Your TikTok profile is your storefront. Before you film a single video, it needs to be polished and on-brand.",
      "This module covers optimizing your bio, linking your accounts, and setting up your payout info so you get paid on time.",
    ],
    highlights: [
      { icon: "📸", text: "Profile photo: Clean, bright, and shows your face clearly" },
      { icon: "✍️", text: "Bio: Under 80 characters — no \"cheap,\" \"sale,\" or \"buy now\" language" },
      { icon: "🔗", text: "Link your dashboard account to your TikTok handle in Settings" },
      { icon: "💳", text: "Submit your payout info within 48 hours of onboarding" },
    ],
    question: {
      type: "quiz",
      question: "Which bio follows Cloud Closet brand voice?",
      options: [
        { id: "a", text: "\"Cheap fashion finds & buy-now deals!\"" },
        { id: "b", text: "\"Your closet, elevated. Helping you wear what you love.\"" },
        { id: "c", text: "\"Fashion tips for everyone! Shop my links below!\"" },
        { id: "d", text: "\"Honest fashion reviews — click the link now!\"" },
      ],
      correct: "b",
      explanation:
        "Option B reflects our brand voice: aspirational, personal, and free of pushy sales language like \"cheap\" or \"buy now.\"",
    },
  },
  {
    id: 2,
    emoji: "🎬",
    title: "The First Week",
    subtitle: "Your First 3 Videos & Hook Mastery",
    videoLabel: "Good Hook vs. Bad Hook — Side by Side",
    description: [
      "Your first three videos set the tone for your entire account: The Unboxing, The Style-Inspo, and The Honest Review.",
      "The most important skill you'll build in week one? Hooks that stop the scroll in the first 2 seconds.",
    ],
    highlights: [
      { icon: "📦", text: "Video 1 — The Unboxing: Authentic reaction, item arriving on camera" },
      { icon: "💫", text: "Video 2 — The Style-Inspo: 3+ ways to wear the same piece" },
      { icon: "⭐", text: "Video 3 — The Honest Review: Real talk, real opinion — keep it genuine" },
      { icon: "⏱️", text: "Your hook must land in the first 2 seconds or viewers scroll away" },
    ],
    question: {
      type: "quiz",
      question: "Which of these is a strong opening hook?",
      options: [
        { id: "a", text: "\"Hey guys, welcome back to my channel!\"" },
        { id: "b", text: "\"Hi, today I'm going to show you some cute outfits.\"" },
        { id: "c", text: "\"I wore the same 3 pieces 7 different ways — here's how.\"" },
        { id: "d", text: "\"So I just got a package and wanted to share it with you all.\"" },
      ],
      correct: "c",
      explanation:
        "Option C is specific, creates curiosity, and promises value immediately. The others start with generic greetings or vague setups that lose viewers before the video begins.",
    },
  },
  {
    id: 3,
    emoji: "📋",
    title: "Daily Upkeep",
    subtitle: "Dashboard Check-Ins, Comments & Uploads",
    videoLabel: "Navigating Your Creator Dashboard",
    description: [
      "Consistency isn't just about posting — it's the routine behind it. Top creators spend 15–20 minutes per day on upkeep.",
      "Put these daily tasks in the right order, from most to least important.",
    ],
    highlights: [
      { icon: "📊", text: "Check your dashboard for new briefs every morning" },
      { icon: "🎥", text: "Film and post your scheduled content for the day" },
      { icon: "📤", text: "Upload your raw footage to the platform after filming" },
      { icon: "💬", text: "Engage with comments — reply within the first hour of posting" },
      { icon: "📈", text: "Review analytics from your last post before sleeping" },
    ],
    question: {
      type: "drag",
      prompt: "Order these daily tasks from most → least important:",
      items: [
        { id: "engage",    text: "💬 Engage with comments" },
        { id: "upload",    text: "📤 Upload raw footage" },
        { id: "brief",     text: "📊 Check dashboard for new briefs" },
        { id: "film",      text: "🎥 Film your scheduled content" },
        { id: "analytics", text: "📈 Review last post's analytics" },
      ],
      correctOrder: ["brief", "film", "upload", "engage", "analytics"],
      explanation:
        "Start your day by checking for briefs (so you know what to film), then create and upload content, engage with your community, and wind down by reviewing analytics to improve tomorrow.",
    },
  },
  {
    id: 4,
    emoji: "📐",
    title: "Guidelines",
    subtitle: "Lighting, Language & Music Rules",
    videoLabel: "Brand Guidelines Deep Dive",
    description: [
      "Cloud Closet has non-negotiable content standards that protect the brand and keep your content performing.",
      "Lighting requirements, banned phrases, and music usage rights are all covered here — read these carefully.",
    ],
    highlights: [
      { icon: "💡", text: "Lighting: Natural or ring light only — no dark or grainy footage" },
      { icon: "🚫", text: "No-Go phrases: \"cheap,\" \"buy now,\" \"sale,\" \"limited time,\" \"hurry\"" },
      { icon: "🎵", text: "Music: TikTok commercial sounds only — no unlicensed audio" },
      { icon: "🎨", text: "Background: Clean and uncluttered, no competitor brand items visible" },
    ],
    question: {
      type: "quiz",
      question: "Which caption is NOT allowed in Cloud Closet content?",
      options: [
        { id: "a", text: "\"I've been styling this three different ways all week.\"" },
        { id: "b", text: "\"This is the most versatile piece in my closet right now.\"" },
        { id: "c", text: "\"So cheap — you need to buy this before it sells out!\"" },
        { id: "d", text: "\"I tested this outfit for a full week, here's my honest take.\"" },
      ],
      correct: "c",
      explanation:
        "Option C contains two banned phrases: \"cheap\" (undermines brand positioning) and \"buy\" (pushy sales language). All other options reflect authentic Cloud Closet voice.",
    },
  },
];

// ─── Video Placeholder ──────────────────────────────────────────────────────────

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-blue-100/80">
      <div className="text-center z-10 px-4">
        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Play size={22} className="text-blue-500 ml-0.5" fill="currentColor" />
        </div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-xs text-slate-400 mt-1">Video coming soon</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-slate-100/10" />
      <div className="absolute top-3 right-3 text-xs text-slate-400 bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
        Preview
      </div>
    </div>
  );
}

// ─── Quiz Section ───────────────────────────────────────────────────────────────

function QuizSection({ question, onPass }: { question: QuizQ; onPass: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === question.correct;

  function submit() {
    if (!selected) return;
    setSubmitted(true);
    if (selected === question.correct) setTimeout(onPass, 1400);
  }

  function retry() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-700">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isRight = opt.id === question.correct;
          let cls =
            "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 ";
          if (!submitted) {
            cls += isSelected
              ? "border-blue-400 bg-blue-50 text-blue-800 font-medium shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 active:scale-[0.99]";
          } else {
            if (isRight) cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
            else if (isSelected) cls += "border-red-300 bg-red-50 text-red-700";
            else cls += "border-slate-100 bg-slate-50/60 text-slate-400";
          }
          return (
            <button
              key={opt.id}
              className={cls}
              onClick={() => !submitted && setSelected(opt.id)}
              disabled={submitted}
            >
              <span className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ borderColor: "currentColor" }}
                >
                  {opt.id.toUpperCase()}
                </span>
                <span className="flex-1 text-left">{opt.text}</span>
                {submitted && isRight && (
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                )}
                {submitted && isSelected && !isRight && (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!selected}
          className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm"
        >
          Submit Answer
        </button>
      ) : (
        <div
          className={`rounded-xl p-4 border ${
            isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect ? (
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle size={16} className="text-red-400 flex-shrink-0" />
            )}
            <p
              className={`font-semibold text-sm ${
                isCorrect ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {isCorrect ? "Correct! Moving to the next module…" : "Not quite — try again!"}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
          {!isCorrect && (
            <button
              onClick={retry}
              className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <RotateCcw size={11} /> Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Drag & Drop Section ────────────────────────────────────────────────────────

function DragDropSection({ question, onPass }: { question: DragQ; onPass: () => void }) {
  const [items, setItems] = useState([...question.items]);
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const isCorrect = items.map((i) => i.id).join(",") === question.correctOrder.join(",");

  function move(from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  }

  function handleSubmit() {
    setSubmitted(true);
    if (items.map((i) => i.id).join(",") === question.correctOrder.join(",")) {
      setTimeout(onPass, 1400);
    }
  }

  function retry() {
    setItems([...question.items]);
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">{question.prompt}</p>
        <p className="text-xs text-slate-400 mt-0.5">Drag to reorder, or use the ↑↓ buttons</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            draggable={!submitted}
            onDragStart={() => setDragIdx(idx)}
            onDragEnter={() => setDragOverIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => {
              if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
                move(dragIdx, dragOverIdx);
              }
              setDragIdx(null);
              setDragOverIdx(null);
            }}
            className={[
              "flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-sm transition-all",
              submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing",
              dragIdx === idx ? "opacity-40 scale-[0.98]" : "",
              dragOverIdx === idx && dragIdx !== null && dragIdx !== idx
                ? "border-blue-400 bg-blue-50 shadow-md"
                : submitted
                ? isCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <GripVertical size={15} className="text-slate-300 flex-shrink-0" />
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <span className="flex-1 text-slate-700">{item.text}</span>
            {!submitted && (
              <div className="flex flex-col gap-0.5 ml-auto flex-shrink-0">
                <button
                  onClick={() => idx > 0 && move(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                >
                  <ArrowUp size={11} />
                </button>
                <button
                  onClick={() => idx < items.length - 1 && move(idx, idx + 1)}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                >
                  <ArrowDown size={11} />
                </button>
              </div>
            )}
            {submitted && isCorrect && (
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 ml-auto" />
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm"
        >
          Submit Order
        </button>
      ) : (
        <div
          className={`rounded-xl p-4 border ${
            isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect ? (
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle size={16} className="text-amber-500 flex-shrink-0" />
            )}
            <p
              className={`font-semibold text-sm ${
                isCorrect ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isCorrect ? "Perfect order! Moving on…" : "Not quite — give it another try!"}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
          {!isCorrect && (
            <button
              onClick={retry}
              className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              <RotateCcw size={11} /> Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module Stepper ─────────────────────────────────────────────────────────────

function Stepper({
  modules,
  statuses,
  current,
  onChange,
}: {
  modules: ModuleData[];
  statuses: ModuleStatus[];
  current: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-start w-full">
      {modules.map((m, i) => (
        <div key={m.id} className="flex items-center flex-1 last:flex-none">
          <button
            onClick={() => statuses[i] !== "locked" && onChange(i)}
            disabled={statuses[i] === "locked"}
            className="flex flex-col items-center gap-1.5 group w-full"
          >
            <div
              className={[
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                i === current
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110"
                  : statuses[i] === "completed"
                  ? "bg-emerald-500 text-white"
                  : statuses[i] === "locked"
                  ? "bg-slate-100 text-slate-300"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {statuses[i] === "completed" ? (
                <CheckCircle2 size={18} />
              ) : statuses[i] === "locked" ? (
                <Lock size={14} />
              ) : (
                <span className="text-base">{m.emoji}</span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-tight text-center hidden sm:block max-w-[60px] ${
                i === current
                  ? "text-blue-600"
                  : statuses[i] === "completed"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              {m.title}
            </span>
          </button>
          {i < modules.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1.5 mb-5 sm:mb-4 rounded-full transition-all duration-500 ${
                statuses[i] === "completed" ? "bg-emerald-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Welcome Modal ──────────────────────────────────────────────────────────────

function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full p-8 text-center">
        {/* Celebratory GIF placeholder */}
        <div className="w-32 h-32 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center border border-blue-100 gap-1">
          <span className="text-5xl">🎉</span>
          <p className="text-[9px] text-slate-300 font-medium uppercase tracking-widest">GIF Placeholder</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to the Team!</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          You've completed all four training modules. You're officially ready to create content for Cloud Closet — let's make something amazing together.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm"
        >
          Let's Go 🚀
        </button>
      </div>
    </div>
  );
}

// ─── Warm-Up Protocol ──────────────────────────────────────────────────────────

const WARM_UP_DAYS = [
  { day: "Day 1",    action: "Spend 30–45 min watching fashion TikToks (GRWM, outfit ideas, hauls, styling tips). Like 30+ videos. Follow 10–15 relevant accounts." },
  { day: "Day 2",    action: "Comment on 10 videos (genuine, not spam). Search and follow: #outfitoftheday #grwm #fashiontiktok #whatiwore. Save 5 videos you love." },
  { day: "Day 3",    action: "Follow 10 more fashion accounts. Your FYP should now be personalizing. Like and share 10 more videos. Do NOT post yet." },
  { day: "Day 4",    action: "Post your FIRST video — low-stakes warm-up content only (see ideas below). Engage with every comment." },
  { day: "Days 5–6", action: "Post 1 soft personal video per day. Keep watching and liking in your niche. Follow 5–10 more accounts each day." },
  { day: "Day 7",    action: "Warm-up complete. Review what got the most engagement. Take notes. Week 2 starts the real UGC campaign content." },
];

const WARM_UP_IDEAS = [
  { icon: "🎬", title: "GRWM for a casual day", desc: "Phone propped up, no script, natural audio — just getting ready" },
  { icon: "👗", title: "Current outfit rotation", desc: "Lay-flat of 3–4 recent outfits with trending audio underneath" },
  { icon: "📱", title: "Day-in-my-life vlog snippet", desc: "15–30 seconds getting ready in the morning" },
  { icon: "✨", title: "Outfit transition", desc: "Before/after look using a viral sound — simple and native-feeling" },
  { icon: "⭐", title: "Rate my outfits this week", desc: "5 outfits in 30 seconds — CapCut speed ramp effect" },
];

function WarmUpProtocol() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="mt-0.5 flex-shrink-0">
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">Account Warm-Up Protocol</p>
          <p className="text-xs text-amber-600 mt-0.5">Non-negotiable before posting any UGC content — read before starting modules</p>
        </div>
        <ChevronDown size={16} className={`text-amber-400 flex-shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-5 flex flex-col gap-5 border-t border-amber-200">
          {/* Why it matters */}
          <div className="pt-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Why This Matters — Do Not Skip</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              New TikTok accounts that immediately post branded content get suppressed. TikTok needs to
              understand the account and build an audience profile before it trusts it enough to push
              content to the FYP. Accounts that skip the warm-up phase often get permanently sandboxed
              and stuck under 500 views forever.
            </p>
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">⚠️ Single Most Common UGC Mistake</p>
              <p className="text-xs text-red-700 leading-relaxed">Skipping the warm-up phase. Do not post branded content until Day 4 at the earliest.</p>
            </div>
          </div>

          {/* Step 1 */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Step 1 — Account Setup</p>
            <div className="flex flex-col gap-2">
              {[
                { icon: "👤", label: "Username", text: "Personal and natural — NOT brand-related. e.g. @emilyoutfits, @stylewithjenna, @claudiascloset" },
                { icon: "📸", label: "Profile photo", text: "Real photo of yourself — bright and approachable" },
                { icon: "✍️", label: "Bio", text: "'fashion girlie | outfit inspo daily' or 'getting dressed shouldn't be hard'" },
                { icon: "🌐", label: "Vibe", text: "Profile should look 100% like a real person's account — NOT a brand page" },
                { icon: "🔗", label: "Link in bio", text: "Add Cloud Closet download link and @bycloudcloset" },
                { icon: "🔓", label: "Visibility", text: "Set account to PUBLIC immediately" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 text-sm">
                  <span className="text-base flex-shrink-0 leading-snug">{item.icon}</span>
                  <span>
                    <span className="font-semibold text-slate-700">{item.label}: </span>
                    <span className="text-slate-600">{item.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 — Day table */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Step 2 — The Watch-First Phase</p>
            <p className="text-xs text-slate-500 mb-3 italic">For the first 3 days, only watch and engage — no posting yet. This trains the algorithm on your niche.</p>
            <div className="flex flex-col gap-1.5">
              {WARM_UP_DAYS.map((row, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3.5 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 ${
                    row.day === "Day 4" ? "bg-blue-50 border border-blue-200" :
                    row.day === "Day 7" ? "bg-emerald-50 border border-emerald-200" :
                    "bg-white border border-slate-100"
                  }`}
                >
                  <span className={`text-xs font-bold flex-shrink-0 min-w-[58px] ${
                    row.day === "Day 4" ? "text-blue-600" :
                    row.day === "Day 7" ? "text-emerald-600" :
                    "text-slate-500"
                  }`}>{row.day}</span>
                  <span className="text-xs text-slate-700 leading-relaxed">{row.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warm-up video ideas */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Warm-Up Video Ideas</p>
            <p className="text-xs text-slate-400 italic mb-3">First posts should feel 100% organic — no app mention, no brand mention.</p>
            <div className="flex flex-col gap-2">
              {WARM_UP_IDEAS.map((idea) => (
                <div key={idea.title} className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-3.5 py-3">
                  <span className="text-base flex-shrink-0 leading-snug">{idea.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{idea.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{idea.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export function UGCOnboardingPage({ profile }: { profile: { full_name?: string } }) {
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["active", "locked", "locked", "locked"]);
  const [showModal, setShowModal] = useState(false);

  const completedCount = statuses.filter((s) => s === "completed").length;
  const progress = (completedCount / MODULES.length) * 100;

  async function triggerConfetti() {
    try {
      const { default: confetti } = await import("canvas-confetti");
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"],
      });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0,   y: 0.6 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1,   y: 0.6 } });
      }, 300);
    } catch {
      // canvas-confetti unavailable in this env — silently skip
    }
  }

  function handlePass(moduleIdx: number) {
    setStatuses((prev) => {
      const next = [...prev] as ModuleStatus[];
      next[moduleIdx] = "completed";
      if (moduleIdx + 1 < next.length) next[moduleIdx + 1] = "active";
      return next;
    });
    if (moduleIdx + 1 < MODULES.length) {
      setTimeout(() => setCurrentModule(moduleIdx + 1), 900);
    } else {
      setTimeout(() => {
        triggerConfetti();
        setShowModal(true);
      }, 900);
    }
  }

  const mod = MODULES[currentModule];
  const isCompleted = statuses[currentModule] === "completed";

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Creator Onboarding</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complete all 4 modules to unlock your creator dashboard
        </p>
      </div>

      {/* Warm-up protocol */}
      <WarmUpProtocol />

      {/* Progress card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Training Progress
          </p>
          <p className="text-xs font-bold text-blue-600">
            {completedCount} / {MODULES.length} complete
          </p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Stepper
          modules={MODULES}
          statuses={statuses}
          current={currentModule}
          onChange={setCurrentModule}
        />
      </div>

      {/* Module content card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Color header band */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">
            Level {mod.id} of {MODULES.length}
          </p>
          <h2 className="text-lg font-bold text-white leading-tight">
            {mod.emoji} {mod.title}
          </h2>
          <p className="text-sm text-blue-100 mt-0.5">{mod.subtitle}</p>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Video placeholder */}
          <VideoPlaceholder label={mod.videoLabel} />

          {/* Description */}
          <div className="flex flex-col gap-2">
            {mod.description.map((para, i) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Key takeaways */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Key Takeaways
            </p>
            <div className="flex flex-col gap-2.5">
              {mod.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="text-base flex-shrink-0 leading-snug">{h.icon}</span>
                  <span className="leading-relaxed">{h.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge check */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Star size={15} className="text-amber-400 flex-shrink-0" fill="currentColor" />
              <p className="text-sm font-bold text-slate-700">Knowledge Check</p>
              {isCompleted && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Passed
                </span>
              )}
            </div>

            {isCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Module Complete!</p>
                <p className="text-xs text-slate-500 mt-1">
                  You've already passed this module. Select the next one above to continue.
                </p>
              </div>
            ) : mod.question.type === "quiz" ? (
              <QuizSection
                key={`quiz-${currentModule}`}
                question={mod.question as QuizQ}
                onPass={() => handlePass(currentModule)}
              />
            ) : (
              <DragDropSection
                key={`drag-${currentModule}`}
                question={mod.question as DragQ}
                onPass={() => handlePass(currentModule)}
              />
            )}
          </div>
        </div>
      </div>

      {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
