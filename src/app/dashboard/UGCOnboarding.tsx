"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Lock, Star,
  ArrowUp, ArrowDown, RotateCcw, GripVertical,
  AlertTriangle, ChevronRight, ChevronLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

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
  description?: string[];
  highlights?: { icon: string; text: string }[];
  question?: QuizQ | DragQ;
  wizardMode?: boolean;
}

// ─── Module Definitions ─────────────────────────────────────────────────────────

const MODULES: ModuleData[] = [
  {
    id: 1,
    emoji: "✨",
    title: "The Setup",
    subtitle: "Account Setup & Warm-Up Protocol",
    wizardMode: true,
  },
  {
    id: 2,
    emoji: "🎬",
    title: "The First Week",
    subtitle: "Your First 3 Videos & Hook Mastery",
    description: [
      "Your first three UGC videos set the tone for your entire account: The Unboxing, The Style-Inspo, and The Honest Review.",
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

// ─── Warm-Up Day Schedule ───────────────────────────────────────────────────────

const WARM_UP_DAYS = [
  { day: "Day 1",    color: "slate",   action: "Spend 30–45 min watching fashion TikToks (GRWM, outfit ideas, hauls). Like 30+ videos. Follow 10–15 relevant accounts." },
  { day: "Day 2",    color: "slate",   action: "Comment on 10 videos (genuine, not spam). Search and follow: #outfitoftheday #grwm #fashiontiktok. Save 5 videos you love." },
  { day: "Day 3",    color: "slate",   action: "Follow 10 more fashion accounts. Your FYP should now be personalizing. Like and share 10 more videos. Do NOT post yet." },
  { day: "Day 4",    color: "blue",    action: "Post your FIRST video — low-stakes warm-up content only (see ideas below). Engage with every single comment." },
  { day: "Days 5–6", color: "slate",   action: "Post 1 soft personal video per day. Keep watching and liking. Follow 5–10 more accounts each day." },
  { day: "Day 7",    color: "emerald", action: "Warm-up complete! Review what got the most engagement, take notes. Week 2 = real UGC campaign content." },
];

const WARM_UP_IDEAS = [
  { icon: "🎬", title: "GRWM for a casual day", desc: "Phone propped up, no script, natural audio — just getting ready" },
  { icon: "👗", title: "Current outfit rotation", desc: "Lay-flat of 3–4 recent outfits with trending audio underneath" },
  { icon: "📱", title: "Day-in-my-life snippet", desc: "15–30 seconds getting ready in the morning" },
  { icon: "✨", title: "Outfit transition", desc: "Before/after look using a viral sound — simple and native-feeling" },
  { icon: "⭐", title: "Rate my outfits this week", desc: "5 outfits in 30 seconds — CapCut speed ramp effect" },
];

// ─── Shared UI ──────────────────────────────────────────────────────────────────

function NextBtn({ onClick, disabled, label = "Next →" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-sm"
    >
      {label}
    </button>
  );
}

function StepBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-4"
    >
      <ChevronLeft size={13} /> Back
    </button>
  );
}

function ConfirmCheck({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300 group-hover:border-blue-300"
        }`}
      >
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <span className="text-sm text-slate-700 leading-relaxed">{label}</span>
    </label>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
      <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-amber-800 leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Level 1 Wizard ─────────────────────────────────────────────────────────────

type WizardStep =
  | "intro" | "why" | "username" | "photo" | "bio"
  | "link" | "public" | "warmup" | "quiz";

const BANNED_BIO_WORDS = ["cheap", "buy now", "sale", "limited time", "hurry", "discount"];
const BRAND_USERNAME_WORDS = ["cloudcloset", "cloud_closet", "cloud closet", "bycloudcloset"];

function Level1Wizard({ onPass }: { onPass: () => void }) {
  const [step, setStep] = useState<WizardStep>("intro");
  const [username, setUsername] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [bio, setBio] = useState("");
  const [bioSubmitted, setBioSubmitted] = useState(false);
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [publicConfirmed, setPublicConfirmed] = useState(false);
  const [warmupRead, setWarmupRead] = useState(false);

  // Quiz state
  const [selected, setSelected] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const isQuizCorrect = quizSubmitted && selected === "b";

  function submitQuiz() {
    if (!selected) return;
    setQuizSubmitted(true);
    if (selected === "b") setTimeout(onPass, 1400);
  }

  const usernameClean = username.trim().toLowerCase().replace(/^@/, "");
  const usernameTooShort = usernameClean.length < 3;
  const usernameHasBrand = BRAND_USERNAME_WORDS.some(w => usernameClean.includes(w.replace(/\s/g, "")));
  const usernameValid = !usernameTooShort && !usernameHasBrand;

  const bioTrimmed = bio.trim();
  const bannedWord = BANNED_BIO_WORDS.find(w => bioTrimmed.toLowerCase().includes(w));
  const bioTooLong = bioTrimmed.length > 80;
  const bioEmpty = bioTrimmed.length === 0;
  const bioValid = !bannedWord && !bioTooLong && !bioEmpty;

  // ── Intro ──
  if (step === "intro") {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-3xl shadow-sm">
          ✨
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Getting Started: UGC Account Setup</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
            We'll walk through everything step by step. It takes about 10 minutes — grab your phone and let's set you up properly.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {[
            { icon: "⏱️", text: "About 10 minutes" },
            { icon: "📱", text: "Get your phone out now" },
            { icon: "🔓", text: "Open TikTok (or download it first)" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-600">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStep("why")}
          className="w-full max-w-xs py-4 rounded-xl bg-blue-500 text-white font-bold text-base hover:bg-blue-600 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          Let's Go <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  // ── Why This Matters ──
  if (step === "why") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("intro")} />
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <h3 className="text-base font-bold text-slate-800">Why This Matters — Read This First</h3>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-red-700 uppercase tracking-wide">⚠️ The #1 UGC Mistake</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            New TikTok accounts that immediately post branded content get <strong>suppressed by the algorithm.</strong> TikTok needs to understand your account and build an audience profile before it trusts it enough to push content to the FYP.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Accounts that skip the warm-up phase often get <strong>permanently sandboxed</strong> — stuck under 500 views forever. This is non-negotiable.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">What we're doing instead:</p>
          <div className="flex flex-col gap-1.5 text-sm text-slate-700">
            <p>✅ Set up your account to look 100% like a real person's</p>
            <p>✅ Spend 3 days watching + engaging before ever posting</p>
            <p>✅ Post warm-up content on Day 4 (personal, no brand mention)</p>
            <p>✅ Start real UGC content only in Week 2</p>
          </div>
        </div>
        <NextBtn onClick={() => setStep("username")} label="Got it — let's set up the account →" />
      </div>
    );
  }

  // ── Username ──
  if (step === "username") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("why")} />
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step 1 of 5</p>
          <h3 className="text-base font-bold text-slate-800">Pick Your Username</h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 text-sm text-slate-700">
          <p className="font-semibold">Rules for your username:</p>
          <p>✅ Should feel personal and natural — like a real person</p>
          <p>✅ Fashion or style-themed is great</p>
          <p>❌ Do NOT include "CloudCloset," "CC," or any brand name</p>
          <p>❌ No promotional words like "shop," "deals," or "buy"</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          <p className="font-semibold mb-1">Good examples:</p>
          <p>@emilyoutfits · @stylewithjenna · @claudiascloset · @dressingwithdev</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Enter the username you chose</label>
          <div className="flex items-center gap-2 border-2 border-slate-200 rounded-xl px-3 py-3 focus-within:border-blue-400 transition-colors bg-white">
            <span className="text-slate-400 font-medium text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameSubmitted(false); }}
              placeholder="yourusername"
              className="flex-1 text-sm text-slate-800 outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>
          {usernameSubmitted && !usernameValid && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-0.5">
              {usernameHasBrand
                ? "❌ Username can't include brand or Cloud Closet references. Keep it personal!"
                : "❌ Username needs to be at least 3 characters."}
            </div>
          )}
          {usernameSubmitted && usernameValid && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-0.5">
              ✅ Great username! That feels natural and personal.
            </div>
          )}
        </div>
        <NextBtn
          onClick={() => {
            setUsernameSubmitted(true);
            if (usernameValid) setTimeout(() => setStep("photo"), 700);
          }}
          disabled={username.trim().length < 3}
          label="Confirm username →"
        />
      </div>
    );
  }

  // ── Profile Photo ──
  if (step === "photo") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("username")} />
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step 2 of 5</p>
          <h3 className="text-base font-bold text-slate-800">Add Your Profile Photo</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your profile photo is the first thing people see. It should make them want to click on your account.
        </p>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { icon: "😊", text: "A real photo of YOUR face — not an avatar or stock photo" },
            { icon: "☀️", text: "Bright and well-lit — good lighting makes a big difference" },
            { icon: "👗", text: "Wearing an outfit you love — this is your fashion account" },
            { icon: "📐", text: "Square crop with your face centered, not too far away" },
          ].map(item => (
            <div key={item.text} className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
        <InfoBox>Accounts with a real face photo get significantly more follows and trust from new viewers. Skip the aesthetic graphic — show your face.</InfoBox>
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Confirm when done:</p>
          <ConfirmCheck
            checked={photoConfirmed}
            onChange={setPhotoConfirmed}
            label="I've added a clear, bright photo of my face as my profile picture"
          />
        </div>
        <NextBtn onClick={() => setStep("bio")} disabled={!photoConfirmed} />
      </div>
    );
  }

  // ── Bio ──
  if (step === "bio") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("photo")} />
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step 3 of 5</p>
          <h3 className="text-base font-bold text-slate-800">Write Your Bio</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your bio should sound like a real person — casual, relatable, and fashion-focused. Under 80 characters.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          <p className="font-semibold mb-1.5">Good examples:</p>
          <p className="mb-0.5">✅ <em>fashion girlie | outfit inspo daily</em></p>
          <p className="mb-0.5">✅ <em>getting dressed shouldn't be hard</em></p>
          <p className="mb-0.5">✅ <em>your closet, elevated</em></p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
          <p className="font-semibold mb-1.5">Never use these words:</p>
          <p>cheap · buy now · sale · limited time · hurry · discount</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Your bio</label>
            <span className={`text-xs font-medium ${bioTrimmed.length > 70 ? "text-amber-500" : "text-slate-400"}`}>
              {bioTrimmed.length}/80
            </span>
          </div>
          <textarea
            value={bio}
            onChange={e => { setBio(e.target.value); setBioSubmitted(false); }}
            placeholder="e.g. fashion girlie | outfit inspo daily"
            rows={2}
            maxLength={90}
            className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition-colors resize-none placeholder:text-slate-300"
          />
          {bioSubmitted && bannedWord && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ❌ Contains "{bannedWord}" — that's a brand no-go phrase. Rewrite without it.
            </div>
          )}
          {bioSubmitted && bioTooLong && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ❌ Too long — keep it under 80 characters.
            </div>
          )}
          {bioSubmitted && bioValid && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✅ Love it — that bio sounds authentic and on-brand.
            </div>
          )}
        </div>
        <NextBtn
          onClick={() => {
            setBioSubmitted(true);
            if (bioValid) setTimeout(() => setStep("link"), 700);
          }}
          disabled={bioEmpty}
          label="Confirm bio →"
        />
      </div>
    );
  }

  // ── Link + @bycloudcloset ──
  if (step === "link") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("bio")} />
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step 4 of 5</p>
          <h3 className="text-base font-bold text-slate-800">Add the Cloud Closet Link</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Two things need to go in your bio link section on TikTok — the app download link and our brand tag.
        </p>
        <div className="flex flex-col gap-2">
          <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 flex flex-col gap-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Link in Bio</p>
            <p className="text-sm text-blue-600 font-medium">Cloud Closet download link</p>
            <p className="text-xs text-slate-400">(Your manager will send this — paste it in your TikTok link section)</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 flex flex-col gap-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tag in Bio</p>
            <p className="text-sm text-slate-800 font-medium">@bycloudcloset</p>
            <p className="text-xs text-slate-400">Type this directly into your TikTok bio text</p>
          </div>
        </div>
        <InfoBox>
          Don't have the download link yet? Add @bycloudcloset to your bio now and come back to add the link when your manager sends it.
        </InfoBox>
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Confirm when done:</p>
          <ConfirmCheck
            checked={linkConfirmed}
            onChange={setLinkConfirmed}
            label="I've added @bycloudcloset to my TikTok bio"
          />
        </div>
        <NextBtn onClick={() => setStep("public")} disabled={!linkConfirmed} />
      </div>
    );
  }

  // ── Set to Public ──
  if (step === "public") {
    return (
      <div className="flex flex-col gap-4">
        <StepBack onClick={() => setStep("link")} />
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step 5 of 5</p>
          <h3 className="text-base font-bold text-slate-800">Set Your Account to Public</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          This is a quick but critical step. A private account cannot appear on the FYP — no one will see your content.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 text-sm text-slate-700">
          <p className="font-semibold">How to set to Public on TikTok:</p>
          <p>1. Open TikTok → tap your <strong>profile icon</strong> (bottom right)</p>
          <p>2. Tap the <strong>three lines</strong> (top right) → Settings</p>
          <p>3. Tap <strong>Privacy</strong></p>
          <p>4. Toggle <strong>Private account</strong> to OFF</p>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Confirm when done:</p>
          <ConfirmCheck
            checked={publicConfirmed}
            onChange={setPublicConfirmed}
            label="My TikTok account is set to Public"
          />
        </div>
        <NextBtn onClick={() => setStep("warmup")} disabled={!publicConfirmed} label="Account setup complete → Warm-Up Plan" />
      </div>
    );
  }

  // ── Warm-Up Phase ──
  if (step === "warmup") {
    return (
      <div className="flex flex-col gap-5">
        <StepBack onClick={() => setStep("public")} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-amber-500" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Non-Negotiable</p>
          </div>
          <h3 className="text-base font-bold text-slate-800">Your 7-Day Warm-Up Plan</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Do not post branded content until Day 4. Follow this plan exactly.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {WARM_UP_DAYS.map((row) => (
            <div
              key={row.day}
              className={`rounded-xl px-3.5 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border ${
                row.color === "blue"    ? "bg-blue-50 border-blue-200" :
                row.color === "emerald" ? "bg-emerald-50 border-emerald-200" :
                "bg-white border-slate-100"
              }`}
            >
              <span className={`text-xs font-bold flex-shrink-0 min-w-[62px] ${
                row.color === "blue"    ? "text-blue-600" :
                row.color === "emerald" ? "text-emerald-600" :
                "text-slate-500"
              }`}>{row.day}</span>
              <span className="text-xs text-slate-700 leading-relaxed">{row.action}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Day 4+ Warm-Up Video Ideas</p>
          <p className="text-xs text-slate-400 italic mb-2.5">No app mention, no brand mention — just a real person sharing their style.</p>
          <div className="flex flex-col gap-1.5">
            {WARM_UP_IDEAS.map(idea => (
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

        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <ConfirmCheck
            checked={warmupRead}
            onChange={setWarmupRead}
            label="I understand the warm-up plan and will NOT post branded content before Day 4"
          />
        </div>
        <NextBtn onClick={() => setStep("quiz")} disabled={!warmupRead} label="I'm ready — take the quiz →" />
      </div>
    );
  }

  // ── Quiz ──
  const quizOptions = [
    { id: "a", text: "\"Cheap fashion finds & buy-now deals!\"" },
    { id: "b", text: "\"Your closet, elevated. Helping you wear what you love.\"" },
    { id: "c", text: "\"Fashion tips for everyone! Shop my links below!\"" },
    { id: "d", text: "\"Honest fashion reviews — click the link now!\"" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StepBack onClick={() => setStep("warmup")} />
      <div className="flex items-center gap-2 mb-1">
        <Star size={15} className="text-amber-400 flex-shrink-0" fill="currentColor" />
        <p className="text-sm font-bold text-slate-700">Knowledge Check</p>
      </div>
      <p className="text-sm font-semibold text-slate-700">Which bio follows Cloud Closet brand voice?</p>
      <div className="flex flex-col gap-2">
        {quizOptions.map(opt => {
          const isSelected = selected === opt.id;
          const isRight = opt.id === "b";
          let cls = "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 ";
          if (!quizSubmitted) {
            cls += isSelected
              ? "border-blue-400 bg-blue-50 text-blue-800 font-medium shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50";
          } else {
            if (isRight) cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
            else if (isSelected) cls += "border-red-300 bg-red-50 text-red-700";
            else cls += "border-slate-100 bg-slate-50/60 text-slate-400";
          }
          return (
            <button key={opt.id} className={cls} onClick={() => !quizSubmitted && setSelected(opt.id)} disabled={quizSubmitted}>
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-bold" style={{ borderColor: "currentColor" }}>
                  {opt.id.toUpperCase()}
                </span>
                <span className="flex-1 text-left">{opt.text}</span>
                {quizSubmitted && isRight && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                {quizSubmitted && isSelected && !isRight && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>
      {!quizSubmitted ? (
        <NextBtn onClick={submitQuiz} disabled={!selected} label="Submit Answer" />
      ) : (
        <div className={`rounded-xl p-4 border ${isQuizCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isQuizCorrect
              ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
            <p className={`font-semibold text-sm ${isQuizCorrect ? "text-emerald-700" : "text-red-600"}`}>
              {isQuizCorrect ? "Correct! Moving to Level 2…" : "Not quite — try again!"}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Option B reflects our brand voice: aspirational, personal, and free of pushy sales language like "cheap" or "buy now."
          </p>
          {!isQuizCorrect && (
            <button onClick={() => { setSelected(null); setQuizSubmitted(false); }} className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <RotateCcw size={11} /> Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Standard Module Card (Levels 2–4) ─────────────────────────────────────────

function QuizSection({ question, onPass }: { question: QuizQ; onPass: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === question.correct;

  function submit() {
    if (!selected) return;
    setSubmitted(true);
    if (selected === question.correct) setTimeout(onPass, 1400);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-700">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.options.map(opt => {
          const isSelected = selected === opt.id;
          const isRight = opt.id === question.correct;
          let cls = "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 ";
          if (!submitted) {
            cls += isSelected ? "border-blue-400 bg-blue-50 text-blue-800 font-medium shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 active:scale-[0.99]";
          } else {
            if (isRight) cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
            else if (isSelected) cls += "border-red-300 bg-red-50 text-red-700";
            else cls += "border-slate-100 bg-slate-50/60 text-slate-400";
          }
          return (
            <button key={opt.id} className={cls} onClick={() => !submitted && setSelected(opt.id)} disabled={submitted}>
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-bold" style={{ borderColor: "currentColor" }}>
                  {opt.id.toUpperCase()}
                </span>
                <span className="flex-1 text-left">{opt.text}</span>
                {submitted && isRight && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                {submitted && isSelected && !isRight && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button onClick={submit} disabled={!selected} className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm">
          Submit Answer
        </button>
      ) : (
        <div className={`rounded-xl p-4 border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
            <p className={`font-semibold text-sm ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
              {isCorrect ? "Correct! Moving to the next module…" : "Not quite — try again!"}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
          {!isCorrect && (
            <button onClick={() => { setSelected(null); setSubmitted(false); }} className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium">
              <RotateCcw size={11} /> Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DragDropSection({ question, onPass }: { question: DragQ; onPass: () => void }) {
  const [items, setItems] = useState([...question.items]);
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const isCorrect = items.map(i => i.id).join(",") === question.correctOrder.join(",");

  function move(from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  }

  function handleSubmit() {
    setSubmitted(true);
    if (items.map(i => i.id).join(",") === question.correctOrder.join(",")) setTimeout(onPass, 1400);
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
            onDragOver={e => e.preventDefault()}
            onDragEnd={() => {
              if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) move(dragIdx, dragOverIdx);
              setDragIdx(null); setDragOverIdx(null);
            }}
            className={[
              "flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-sm transition-all",
              submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing",
              dragIdx === idx ? "opacity-40 scale-[0.98]" : "",
              dragOverIdx === idx && dragIdx !== null && dragIdx !== idx ? "border-blue-400 bg-blue-50 shadow-md" :
              submitted ? isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white" :
              "border-slate-200 bg-white hover:border-slate-300",
            ].filter(Boolean).join(" ")}
          >
            <GripVertical size={15} className="text-slate-300 flex-shrink-0" />
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
            <span className="flex-1 text-slate-700">{item.text}</span>
            {!submitted && (
              <div className="flex flex-col gap-0.5 ml-auto flex-shrink-0">
                <button onClick={() => idx > 0 && move(idx, idx - 1)} disabled={idx === 0} className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"><ArrowUp size={11} /></button>
                <button onClick={() => idx < items.length - 1 && move(idx, idx + 1)} disabled={idx === items.length - 1} className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"><ArrowDown size={11} /></button>
              </div>
            )}
            {submitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 ml-auto" />}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm">
          Submit Order
        </button>
      ) : (
        <div className={`rounded-xl p-4 border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={16} className="text-amber-500 flex-shrink-0" />}
            <p className={`font-semibold text-sm ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
              {isCorrect ? "Perfect order! Moving on…" : "Not quite — give it another try!"}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
          {!isCorrect && (
            <button onClick={() => { setItems([...question.items]); setSubmitted(false); }} className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium">
              <RotateCcw size={11} /> Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stepper ────────────────────────────────────────────────────────────────────

function Stepper({ modules, statuses, current, onChange }: {
  modules: ModuleData[]; statuses: ModuleStatus[]; current: number; onChange: (i: number) => void;
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
            <div className={[
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
              i === current ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110" :
              statuses[i] === "completed" ? "bg-emerald-500 text-white" :
              statuses[i] === "locked" ? "bg-slate-100 text-slate-300" :
              "bg-blue-100 text-blue-600 hover:bg-blue-200",
            ].join(" ")}>
              {statuses[i] === "completed" ? <CheckCircle2 size={18} /> : statuses[i] === "locked" ? <Lock size={14} /> : <span className="text-base">{m.emoji}</span>}
            </div>
            <span className={`text-[10px] font-medium leading-tight text-center hidden sm:block max-w-[60px] ${
              i === current ? "text-blue-600" : statuses[i] === "completed" ? "text-emerald-600" : "text-slate-400"
            }`}>{m.title}</span>
          </button>
          {i < modules.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 mb-5 sm:mb-4 rounded-full transition-all duration-500 ${statuses[i] === "completed" ? "bg-emerald-400" : "bg-slate-200"}`} />
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
        <div className="w-32 h-32 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center border border-blue-100 gap-1">
          <span className="text-5xl">🎉</span>
          <p className="text-[9px] text-slate-300 font-medium uppercase tracking-widest">GIF Placeholder</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to the Team!</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          You've completed all four training modules. You're officially ready to create content for Cloud Closet — let's make something amazing together.
        </p>
        <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm">
          Let's Go 🚀
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export function UGCOnboardingPage({ profile }: { profile: { full_name?: string } }) {
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["active", "locked", "locked", "locked"]);
  const [showModal, setShowModal] = useState(false);

  const completedCount = statuses.filter(s => s === "completed").length;
  const progress = (completedCount / MODULES.length) * 100;

  async function triggerConfetti() {
    try {
      const { default: confetti } = await import("canvas-confetti");
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 }, colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"] });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 300);
    } catch { /* silently skip */ }
  }

  function handlePass(moduleIdx: number) {
    setStatuses(prev => {
      const next = [...prev] as ModuleStatus[];
      next[moduleIdx] = "completed";
      if (moduleIdx + 1 < next.length) next[moduleIdx + 1] = "active";
      return next;
    });
    if (moduleIdx + 1 < MODULES.length) {
      setTimeout(() => setCurrentModule(moduleIdx + 1), 900);
    } else {
      setTimeout(() => { triggerConfetti(); setShowModal(true); }, 900);
    }
  }

  const mod = MODULES[currentModule];
  const isCompleted = statuses[currentModule] === "completed";

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Creator Onboarding</h1>
        <p className="text-sm text-slate-500 mt-0.5">Complete all 4 modules to unlock your creator dashboard</p>
      </div>

      {/* Progress */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Training Progress</p>
          <p className="text-xs font-bold text-blue-600">{completedCount} / {MODULES.length} complete</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <Stepper modules={MODULES} statuses={statuses} current={currentModule} onChange={setCurrentModule} />
      </div>

      {/* Module card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Header band */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">Level {mod.id} of {MODULES.length}</p>
          <h2 className="text-lg font-bold text-white leading-tight">{mod.emoji} {mod.title}</h2>
          <p className="text-sm text-blue-100 mt-0.5">{mod.subtitle}</p>
        </div>

        <div className="p-5">
          {/* Level 1 wizard */}
          {mod.wizardMode && !isCompleted && (
            <Level1Wizard key="l1wizard" onPass={() => handlePass(0)} />
          )}

          {/* Level 1 completed state */}
          {mod.wizardMode && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <p className="text-base font-bold text-slate-700">Level 1 Complete!</p>
              <p className="text-sm text-slate-500">Your account is set up and you know the warm-up plan. Select Level 2 above to continue.</p>
            </div>
          )}

          {/* Levels 2–4 */}
          {!mod.wizardMode && (
            <div className="flex flex-col gap-5">
              {mod.description && (
                <div className="flex flex-col gap-2">
                  {mod.description.map((para, i) => (
                    <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
              {mod.highlights && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Key Takeaways</p>
                  <div className="flex flex-col gap-2.5">
                    {mod.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="text-base flex-shrink-0 leading-snug">{h.icon}</span>
                        <span className="leading-relaxed">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <p className="text-xs text-slate-500 mt-1">Select the next module above to continue.</p>
                  </div>
                ) : mod.question?.type === "quiz" ? (
                  <QuizSection key={`quiz-${currentModule}`} question={mod.question as QuizQ} onPass={() => handlePass(currentModule)} />
                ) : mod.question?.type === "drag" ? (
                  <DragDropSection key={`drag-${currentModule}`} question={mod.question as DragQ} onPass={() => handlePass(currentModule)} />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
