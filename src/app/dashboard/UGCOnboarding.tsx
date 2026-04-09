"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Color tokens ────────────────────────────────────────────────────────────────
// Navy dark:  #1a2f4a   Navy mid: #1e3a5f   Accent: #4a8fd4
// These are used as Tailwind arbitrary values throughout.

// ─── Custom SVG Icons ────────────────────────────────────────────────────────────

const IcoAlert = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
  </svg>
);
const IcoCheck = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoX = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IcoLock = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoStar = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoArrowUp = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const IcoArrowDown = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const IcoGrip = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="9" cy="7" r=".8" fill="currentColor"/><circle cx="15" cy="7" r=".8" fill="currentColor"/>
    <circle cx="9" cy="12" r=".8" fill="currentColor"/><circle cx="15" cy="12" r=".8" fill="currentColor"/>
    <circle cx="9" cy="17" r=".8" fill="currentColor"/><circle cx="15" cy="17" r=".8" fill="currentColor"/>
  </svg>
);
const IcoChevronLeft = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoChevronRight = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoRefresh = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);
const IcoShield = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcoPhone = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IcoClock = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcoUser = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ─── Types ──────────────────────────────────────────────────────────────────────

type ModuleStatus = "locked" | "active" | "completed";
type WizardStep = "intro"|"why"|"username"|"photo"|"bio"|"link"|"public"|"warmup"|"quiz";

interface QuizQ { type:"quiz"; question:string; options:{id:string;text:string}[]; correct:string; explanation:string; }
interface DragQ  { type:"drag"; prompt:string; items:{id:string;text:string}[]; correctOrder:string[]; explanation:string; }
interface ModuleData { id:number; title:string; subtitle:string; description?:string[]; highlights?:{icon:string;text:string}[]; question?:QuizQ|DragQ; wizardMode?:boolean; }

// ─── Wizard step order (for L2 progress granularity) ───────────────────────────

const WIZARD_STEPS: WizardStep[] = ["intro","why","username","photo","bio","link","public","warmup","quiz"];

// ─── Module Definitions ─────────────────────────────────────────────────────────

const MODULES = [
  { id:1, title:"What Cloud Closet Is and What We're Building", subtitle:"Brand foundation & why your content has to feel different", time:"8 min" },
  { id:2, title:"Account Setup & Warm-Up Protocol",            subtitle:"Profile optimization, account linking, and the warm-up plan", time:"10 min", wizardMode:true },
  { id:3, title:"How the TikTok Algorithm Actually Works",      subtitle:"Distribution waves, ranking signals, and why follower count doesn't protect you", time:"10 min" },
  { id:4, title:"Guidelines, Upkeep & Going Live",             subtitle:"Brand rules, daily routine, and how to sustain momentum", time:"10 min" },
];

const WARM_UP_DAYS = [
  { day:"Day 1",    color:"default", action:"Spend 30–45 min watching fashion TikToks (GRWM, outfit ideas, hauls). Like 30+ videos. Follow 10–15 relevant accounts." },
  { day:"Day 2",    color:"default", action:"Comment on 10 videos (genuine, not spam). Search and follow: #outfitoftheday #grwm #fashiontiktok. Save 5 videos you love." },
  { day:"Day 3",    color:"default", action:"Follow 10 more fashion accounts. Your FYP should now be personalizing. Like and share 10 more videos. Do NOT post yet." },
  { day:"Day 4",    color:"accent",  action:"Post your FIRST video — low-stakes warm-up content only (see ideas below). Engage with every single comment." },
  { day:"Days 5–6", color:"default", action:"Post 1 soft personal video per day. Keep watching and liking. Follow 5–10 more accounts each day." },
  { day:"Day 7",    color:"success", action:"Warm-up complete! Review what got the most engagement, take notes. Week 2 = real UGC campaign content." },
];

const WARM_UP_IDEAS = [
  { title:"GRWM for a casual day", desc:"Phone propped up, no script, natural audio — just getting ready" },
  { title:"Current outfit rotation", desc:"Lay-flat of 3–4 recent outfits with trending audio underneath" },
  { title:"Day-in-my-life snippet", desc:"15–30 seconds getting ready in the morning" },
  { title:"Outfit transition", desc:"Before/after look using a viral sound — simple and native-feeling" },
  { title:"Rate my outfits this week", desc:"5 outfits in 30 seconds — CapCut speed ramp effect" },
];

// ─── Shared UI primitives ────────────────────────────────────────────────────────

const NAVY = "from-[#1a2f4a] to-[#1e3a5f]";

function PrimaryBtn({ onClick, disabled, children }: { onClick:()=>void; disabled?:boolean; children:React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a2f4a] to-[#26476e] text-white font-extrabold text-sm tracking-wide
        shadow-[0_6px_24px_rgba(26,47,74,0.45)] hover:shadow-[0_8px_32px_rgba(26,47,74,0.55)]
        hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none
        transition-all duration-200 flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick:()=>void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-5 font-medium">
      <IcoChevronLeft size={13}/> Back
    </button>
  );
}

function StepLabel({ n, total }: { n:number; total:number }) {
  return <p className="text-[11px] font-bold text-[#4a8fd4] uppercase tracking-[0.12em] mb-1">Step {n} of {total}</p>;
}

function ConfirmCheck({ checked, onChange, label }: { checked:boolean; onChange:(v:boolean)=>void; label:string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <motion.div
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.9 }}
        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-200 ${
          checked ? "bg-[#1a2f4a] border-[#1a2f4a]" : "border-slate-300 group-hover:border-[#4a8fd4]"
        }`}
      >
        {checked && <IcoCheck size={11} className="text-white stroke-[3]"/>}
      </motion.div>
      <span className="text-sm text-slate-700 leading-[1.6]">{label}</span>
    </label>
  );
}

// Glassmorphism warning card — designed to sit on a dark navy surface
function GlassAlert({ children }: { children:React.ReactNode }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f4a] to-[#0f1f33]"/>
      <div className="relative backdrop-blur-[10px] bg-white/[0.07] border border-white/[0.15] rounded-2xl p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// Animated list item
function SlideItem({ children, i }: { children:React.ReactNode; i:number }) {
  return (
    <motion.div
      initial={{ opacity:0, x:-14 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay: i*0.07, duration:0.3, ease:"easeOut" as const }}
    >
      {children}
    </motion.div>
  );
}

// ─── Level 1 Wizard ─────────────────────────────────────────────────────────────

function Level1Wizard({ onPass, onStepChange }: { onPass:()=>void; onStepChange:(s:WizardStep)=>void }) {
  const [step, setStep] = useState<WizardStep>("intro");
  const [username, setUsername]       = useState("");
  const [usernameSubmitted, setUSubmit] = useState(false);
  const [photoConfirmed, setPhoto]    = useState(false);
  const [bio, setBio]                 = useState("");
  const [bioSubmitted, setBioSub]     = useState(false);
  const [linkConfirmed, setLink]      = useState(false);
  const [publicConfirmed, setPub]     = useState(false);
  const [warmupRead, setWarmup]       = useState(false);
  const [selected, setSelected]       = useState<string|null>(null);
  const [quizSubmitted, setQuizSub]   = useState(false);

  function go(s:WizardStep) { setStep(s); onStepChange(s); }

  const isQuizCorrect = quizSubmitted && selected === "b";
  const usernameClean = username.trim().toLowerCase().replace(/^@/,"");
  const usernameBrand = ["cloudcloset","cloud_closet","bycloudcloset"].some(w => usernameClean.includes(w));
  const usernameValid = usernameClean.length >= 3 && !usernameBrand;
  const bioTrimmed = bio.trim();
  const bannedWord = ["cheap","buy now","sale","limited time","hurry","discount"].find(w => bioTrimmed.toLowerCase().includes(w));
  const bioValid = !bannedWord && bioTrimmed.length <= 80 && bioTrimmed.length > 0;

  function submitQuiz() {
    if (!selected) return;
    setQuizSub(true);
    if (selected === "b") setTimeout(onPass, 1400);
  }

  const key = step; // AnimatePresence key

  const pageVariants = { initial:{opacity:0,y:18}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-12} };
  const pageTransition = { duration:0.3, ease:"easeOut" as const };

  return (
    <AnimatePresence mode="wait">
      {/* ── Intro ── */}
      {step === "intro" && (
        <motion.div key="intro" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col items-center gap-6 text-center py-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a2f4a] to-[#26476e] flex items-center justify-center shadow-xl">
            <IcoUser size={32} className="text-white"/>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">Getting Started:<br/>UGC Account Setup</h3>
            <p className="text-sm text-slate-500 mt-2 leading-[1.6] max-w-xs mx-auto">
              We'll walk through everything step by step. Grab your phone — it takes about 10 minutes.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {[
              { icon:<IcoClock size={15}/>, text:"About 10 minutes" },
              { icon:<IcoPhone size={15}/>, text:"Get your phone out now" },
              { icon:<IcoShield size={15}/>, text:"Open TikTok (or download it first)" },
            ].map((item, i) => (
              <SlideItem key={i} i={i}>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-600">
                  <span className="text-[#4a8fd4]">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              </SlideItem>
            ))}
          </div>
          <PrimaryBtn onClick={() => go("why")}>Let's Go <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Why This Matters ── */}
      {step === "why" && (
        <motion.div key="why" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("intro")}/>
          <GlassAlert>
            <div className="flex items-start gap-3 mb-3">
              <IcoAlert size={20} className="text-amber-400 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-[0.12em] mb-0.5">Non-Negotiable</p>
                <h3 className="text-base font-extrabold text-white leading-tight">Why This Matters — Read This First</h3>
              </div>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-3">
              <p className="text-xs font-bold text-red-300 uppercase tracking-wide mb-1">⚠ The #1 UGC Mistake</p>
              <p className="text-sm text-white/90 leading-[1.6]">
                New TikTok accounts that immediately post branded content get <strong className="text-white">suppressed by the algorithm.</strong> Accounts that skip the warm-up phase often get <strong className="text-white">permanently sandboxed</strong> — stuck under 500 views forever.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                "Set up your account to look 100% like a real person's",
                "Spend 3 days watching + engaging before ever posting",
                "Post warm-up content on Day 4 — no brand mention",
                "Start real UGC content only in Week 2",
              ].map((t,i) => (
                <SlideItem key={i} i={i}>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <IcoCheck size={14} className="text-emerald-400 flex-shrink-0"/>
                    <span>{t}</span>
                  </div>
                </SlideItem>
              ))}
            </div>
          </GlassAlert>
          <PrimaryBtn onClick={() => go("username")}>Got it — set up my account <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Username ── */}
      {step === "username" && (
        <motion.div key="username" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("why")}/>
          <StepLabel n={1} total={5}/>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight -mt-1">Pick Your Username</h3>
          <div className="flex flex-col gap-2">
            {[
              { ok:true,  text:"Personal and natural — like a real person's account" },
              { ok:true,  text:"Fashion or style-themed works great" },
              { ok:false, text:"Do NOT include CloudCloset, CC, or any brand name" },
              { ok:false, text:"No promotional words like 'shop,' 'deals,' or 'buy'" },
            ].map((r,i) => (
              <SlideItem key={i} i={i}>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                  {r.ok
                    ? <IcoCheck size={15} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                    : <IcoX size={15} className="text-red-400 flex-shrink-0 mt-0.5"/>}
                  <span className="leading-[1.6]">{r.text}</span>
                </div>
              </SlideItem>
            ))}
          </div>
          <div className="bg-[#1a2f4a]/5 border border-[#1a2f4a]/10 rounded-xl px-4 py-3 text-xs text-[#1a2f4a]">
            <p className="font-bold mb-1 uppercase tracking-wide text-[10px] text-[#4a8fd4]">Good examples</p>
            <p>@emilyoutfits · @stylewithjenna · @claudiascloset · @dressingwithdev</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Enter the username you chose</label>
            <div className="flex items-center gap-2 border-2 border-slate-200 rounded-2xl px-4 py-3.5 focus-within:border-[#4a8fd4] transition-colors bg-white shadow-sm">
              <span className="text-slate-400 font-bold text-sm">@</span>
              <input type="text" value={username} onChange={e => { setUsername(e.target.value); setUSubmit(false); }}
                placeholder="yourusername" className="flex-1 text-sm text-slate-800 outline-none bg-transparent placeholder:text-slate-300 font-medium"/>
            </div>
            <AnimatePresence>
              {usernameSubmitted && !usernameValid && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {usernameBrand ? "Username can't include brand or Cloud Closet references. Keep it personal!" : "Username needs to be at least 3 characters."}
                </motion.div>
              )}
              {usernameSubmitted && usernameValid && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <IcoCheck size={12} className="text-emerald-500"/> Great username — that feels natural and personal.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <PrimaryBtn onClick={() => { setUSubmit(true); if (usernameValid) setTimeout(() => go("photo"), 700); }} disabled={username.trim().length < 2}>
            Confirm username <IcoChevronRight size={16}/>
          </PrimaryBtn>
        </motion.div>
      )}

      {/* ── Profile Photo ── */}
      {step === "photo" && (
        <motion.div key="photo" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("username")}/>
          <StepLabel n={2} total={5}/>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight -mt-1">Add Your Profile Photo</h3>
          <p className="text-sm text-slate-500 leading-[1.6]">Your profile photo is the first thing people see. It should make them want to click on your account.</p>
          <div className="flex flex-col gap-2">
            {[
              { label:"Your face", desc:"A real photo of YOU — not an avatar or stock image" },
              { label:"Good lighting", desc:"Bright and well-lit — ring light or near a window" },
              { label:"Fashion-forward", desc:"Wearing an outfit you love — this is your fashion account" },
              { label:"Centered crop", desc:"Face centered, not too far away — square frame" },
            ].map((item, i) => (
              <SlideItem key={i} i={i}>
                <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                  <div className="w-5 h-5 rounded-full bg-[#1a2f4a] text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">{item.desc}</p>
                  </div>
                </div>
              </SlideItem>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <IcoAlert size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-800 leading-[1.6]">Accounts with a real face photo get significantly more follows. Skip the aesthetic graphic — show your face.</p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Confirm when done</p>
            <ConfirmCheck checked={photoConfirmed} onChange={setPhoto} label="I've added a clear, bright photo of my face as my profile picture"/>
          </div>
          <PrimaryBtn onClick={() => go("bio")} disabled={!photoConfirmed}>Next — Write my bio <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Bio ── */}
      {step === "bio" && (
        <motion.div key="bio" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("photo")}/>
          <StepLabel n={3} total={5}/>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight -mt-1">Write Your Bio</h3>
          <p className="text-sm text-slate-500 leading-[1.6]">Casual, relatable, fashion-focused. Under 80 characters. Sound like a real person — not a brand.</p>
          <div className="flex flex-col gap-2">
            <div className="bg-[#1a2f4a]/5 border border-[#1a2f4a]/10 rounded-xl px-4 py-3 text-xs text-slate-700">
              <p className="font-bold text-[10px] text-[#4a8fd4] uppercase tracking-[0.1em] mb-2">Good examples</p>
              {["fashion girlie | outfit inspo daily","getting dressed shouldn't be hard","your closet, elevated"].map((ex,i) => (
                <p key={i} className="mb-0.5 leading-[1.6]"><IcoCheck size={11} className="text-emerald-500 inline mr-1.5"/><em>{ex}</em></p>
              ))}
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
              <p className="font-bold text-[10px] text-red-500 uppercase tracking-[0.1em] mb-1.5">Never use</p>
              <p>cheap · buy now · sale · limited time · hurry · discount</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Your bio</label>
              <span className={`text-xs font-bold ${bioTrimmed.length > 70 ? "text-amber-500" : "text-slate-400"}`}>{bioTrimmed.length}/80</span>
            </div>
            <textarea value={bio} onChange={e => { setBio(e.target.value); setBioSub(false); }} placeholder="e.g. fashion girlie | outfit inspo daily"
              rows={2} maxLength={90}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"/>
            <AnimatePresence>
              {bioSubmitted && bannedWord && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  Contains "{bannedWord}" — that's a brand no-go phrase. Rewrite without it.
                </motion.div>
              )}
              {bioSubmitted && bioTrimmed.length > 80 && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  Too long — keep it under 80 characters.
                </motion.div>
              )}
              {bioSubmitted && bioValid && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <IcoCheck size={12} className="text-emerald-500"/> That bio sounds authentic and on-brand.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <PrimaryBtn onClick={() => { setBioSub(true); if (bioValid) setTimeout(() => go("link"), 700); }} disabled={bioTrimmed.length === 0}>
            Confirm bio <IcoChevronRight size={16}/>
          </PrimaryBtn>
        </motion.div>
      )}

      {/* ── Link ── */}
      {step === "link" && (
        <motion.div key="link" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("bio")}/>
          <StepLabel n={4} total={5}/>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight -mt-1">Add the Cloud Closet Link</h3>
          <p className="text-sm text-slate-500 leading-[1.6]">Two things need to go in your TikTok bio section — the app download link and our brand tag.</p>
          <div className="flex flex-col gap-2">
            {[
              { label:"Link in Bio", value:"Cloud Closet download link", sub:"Your manager will send this — paste it into your TikTok link field" },
              { label:"Tag in Bio", value:"@bycloudcloset", sub:"Type this directly into your TikTok bio text" },
            ].map((item,i) => (
              <SlideItem key={i} i={i}>
                <div className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{item.label}</p>
                  <p className="text-sm font-extrabold text-[#1a2f4a]">{item.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-[1.6]">{item.sub}</p>
                </div>
              </SlideItem>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <IcoAlert size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-800 leading-[1.6]">Don't have the download link yet? Add @bycloudcloset to your bio now and add the link when your manager sends it.</p>
          </div>
          <div className="pt-1 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Confirm when done</p>
            <ConfirmCheck checked={linkConfirmed} onChange={setLink} label="I've added @bycloudcloset to my TikTok bio"/>
          </div>
          <PrimaryBtn onClick={() => go("public")} disabled={!linkConfirmed}>Next <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Public ── */}
      {step === "public" && (
        <motion.div key="public" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("link")}/>
          <StepLabel n={5} total={5}/>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight -mt-1">Set Your Account to Public</h3>
          <p className="text-sm text-slate-500 leading-[1.6]">A private account cannot appear on the FYP — no one will ever see your content if this is skipped.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
            <p className="text-sm font-extrabold text-slate-700">How to set to Public on TikTok</p>
            {[
              "Open TikTok → tap your profile icon (bottom right)",
              "Tap the three lines (top right) → Settings",
              "Tap Privacy",
              "Toggle Private account to OFF",
            ].map((t,i) => (
              <SlideItem key={i} i={i}>
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#1a2f4a] text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <span className="leading-[1.6]">{t}</span>
                </div>
              </SlideItem>
            ))}
          </div>
          <div className="pt-1 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Confirm when done</p>
            <ConfirmCheck checked={publicConfirmed} onChange={setPub} label="My TikTok account is set to Public"/>
          </div>
          <PrimaryBtn onClick={() => go("warmup")} disabled={!publicConfirmed}>Account setup complete — Warm-Up Plan <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Warm-Up Plan ── */}
      {step === "warmup" && (
        <motion.div key="warmup" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-5">
          <BackBtn onClick={() => go("public")}/>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <IcoAlert size={14} className="text-amber-500"/>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.12em]">Non-Negotiable</p>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">Your 7-Day Warm-Up Plan</h3>
            <p className="text-sm text-slate-500 mt-1 leading-[1.6]">Do not post branded content until Day 4. Follow this plan exactly.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {WARM_UP_DAYS.map((row,i) => (
              <SlideItem key={i} i={i}>
                <div className={`rounded-xl px-3.5 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border ${
                  row.color==="accent"  ? "bg-[#1a2f4a]/5 border-[#1a2f4a]/20" :
                  row.color==="success" ? "bg-emerald-50 border-emerald-200" :
                  "bg-white border-slate-100"
                }`}>
                  <span className={`text-xs font-extrabold flex-shrink-0 min-w-[64px] ${
                    row.color==="accent" ? "text-[#1a2f4a]" : row.color==="success" ? "text-emerald-600" : "text-slate-500"
                  }`}>{row.day}</span>
                  <span className="text-xs text-slate-700 leading-[1.6]">{row.action}</span>
                </div>
              </SlideItem>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5">Warm-Up Video Ideas (Day 4+)</p>
            <p className="text-xs text-slate-400 italic mb-2.5 leading-[1.6]">No app mention, no brand mention — just a real person sharing their style.</p>
            <div className="flex flex-col gap-1.5">
              {WARM_UP_IDEAS.map((idea,i) => (
                <SlideItem key={i} i={i}>
                  <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4a8fd4] flex-shrink-0 mt-1.5"/>
                    <div>
                      <p className="text-xs font-extrabold text-slate-700">{idea.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">{idea.desc}</p>
                    </div>
                  </div>
                </SlideItem>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
            <ConfirmCheck checked={warmupRead} onChange={setWarmup} label="I understand the warm-up plan and will NOT post branded content before Day 4"/>
          </div>
          <PrimaryBtn onClick={() => go("quiz")} disabled={!warmupRead}>I'm ready — take the quiz <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {/* ── Quiz ── */}
      {step === "quiz" && (
        <motion.div key="quiz" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
          className="flex flex-col gap-4">
          <BackBtn onClick={() => go("warmup")}/>
          <div className="flex items-center gap-2">
            <IcoStar size={15} className="text-amber-400"/>
            <p className="text-sm font-extrabold text-slate-700">Level 1 Knowledge Check</p>
          </div>
          <p className="text-sm font-semibold text-slate-700 leading-[1.6]">Which bio follows Cloud Closet brand voice?</p>
          <div className="flex flex-col gap-2">
            {[
              { id:"a", text:"\"Cheap fashion finds & buy-now deals!\"" },
              { id:"b", text:"\"Your closet, elevated. Helping you wear what you love.\"" },
              { id:"c", text:"\"Fashion tips for everyone! Shop my links below!\"" },
              { id:"d", text:"\"Honest fashion reviews — click the link now!\"" },
            ].map(opt => {
              const isSel = selected === opt.id, isRight = opt.id==="b";
              let cls = "w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm transition-all duration-200 ";
              if (!quizSubmitted) cls += isSel ? "border-[#1a2f4a] bg-[#1a2f4a]/5 text-[#1a2f4a] font-semibold shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-[#4a8fd4]/50 hover:bg-slate-50";
              else if (isRight) cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold";
              else if (isSel) cls += "border-red-300 bg-red-50 text-red-700";
              else cls += "border-slate-100 bg-slate-50/60 text-slate-400";
              return (
                <button key={opt.id} className={cls} onClick={() => !quizSubmitted && setSelected(opt.id)} disabled={quizSubmitted}>
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold" style={{borderColor:"currentColor"}}>{opt.id.toUpperCase()}</span>
                    <span className="flex-1 text-left leading-[1.6]">{opt.text}</span>
                    {quizSubmitted && isRight && <IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/>}
                    {quizSubmitted && isSel && !isRight && <IcoX size={15} className="text-red-400 flex-shrink-0"/>}
                  </span>
                </button>
              );
            })}
          </div>
          {!quizSubmitted ? (
            <PrimaryBtn onClick={submitQuiz} disabled={!selected}>Submit Answer</PrimaryBtn>
          ) : (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`rounded-2xl p-4 border ${isQuizCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {isQuizCorrect ? <IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/> : <IcoX size={15} className="text-red-400 flex-shrink-0"/>}
                <p className={`font-extrabold text-sm ${isQuizCorrect ? "text-emerald-700" : "text-red-600"}`}>
                  {isQuizCorrect ? "Correct! Moving to Level 2…" : "Not quite — try again!"}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-[1.6]">Option B reflects our brand voice: aspirational, personal, and free of pushy sales language like "cheap" or "buy now."</p>
              {!isQuizCorrect && (
                <button onClick={() => { setSelected(null); setQuizSub(false); }} className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 font-bold">
                  <IcoRefresh size={11}/> Try again
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Module 1 — Shared section header ───────────────────────────────────────────

function SectionHeader({ n, total, label }: { n:number; total:number; label:string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      <div className="w-7 h-7 rounded-full bg-[#1a2f4a] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
      <div>
        <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-[0.14em]">Section {n} of {total}</p>
        <p className="text-sm font-extrabold text-slate-700 leading-tight">{label}</p>
      </div>
    </div>
  );
}

// ─── Module 1 — Section 1: The Simplest Version + Flip Cards ────────────────────

const FLIP_CARDS = [
  {
    front: "What is Cloud Closet?",
    back:  "An app that organizes your outfit history, connects you with real people's style, and lets you shop what moves you — with no ads, no algorithm pushing products at you, and no clutter.",
  },
  {
    front: "Who is it for?",
    back:  "Everyone who has ever gotten dressed and felt something. The thrifter. The archivist. The person who styles their mom's bag in a way nobody saw coming. If you have a closet and an opinion, you belong here.",
  },
  {
    front: "What makes it different?",
    back:  "Most style apps are built around what brands want you to see. Cloud Closet is built around what real people actually wear. The minimalism isn't a design choice — it's intentional. The outfits are the thing that shines. Not ads. Not recommendations. Just real people.",
  },
];

function FlipCard({ front, back, flipped, onFlip }: { front:string; back:string; flipped:boolean; onFlip:()=>void }) {
  return (
    <div className="relative cursor-pointer" style={{ perspective: "900px", minHeight: "160px" }} onClick={onFlip}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" as const }}
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-2xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center p-4 gap-3 shadow-sm hover:border-[#4a8fd4]/50 hover:shadow-md transition-all">
          <div className="w-8 h-8 rounded-full bg-[#1a2f4a]/8 flex items-center justify-center">
            <IcoChevronRight size={14} className="text-[#4a8fd4]"/>
          </div>
          <p className="text-sm font-extrabold text-slate-700 text-center leading-[1.4]">{front}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Tap to reveal</p>
        </div>
        {/* Back */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 rounded-2xl border-2 border-[#1a2f4a]/30 bg-gradient-to-br from-[#1a2f4a] to-[#1e3a5f] flex flex-col items-start justify-center p-4 gap-2 shadow-lg">
          <IcoCheck size={14} className="text-[#4a8fd4] flex-shrink-0"/>
          <p className="text-xs text-white/90 leading-[1.6]">{back}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Section 2 — Framing Toggle ──────────────────────────────────────────────────

const FRAMING_NOT = [
  "Your camera roll is a disaster and you need this.",
  "No one uses Pinterest for outfits anymore.",
  "Stop texting your friends for style advice.",
];
const FRAMING_DO = [
  "I have 4,000 outfit photos in my camera roll and could never find what I needed — until I found one place for all of it.",
  "I kept asking my friends 'what should I wear' and realized there had to be a better way.",
  "I had a Pinterest board I made in 2021 and never opened again. This replaced it.",
];

function FramingToggle({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"no"|"yes">("no");
  const [seenBoth, setSeenBoth] = useState({ no: false, yes: false });

  function switchTab(t: "no"|"yes") {
    setTab(t);
    setSeenBoth(prev => ({ ...prev, [t]: true }));
  }

  const bothSeen = seenBoth.no && seenBoth.yes;

  // Auto-mark "no" as seen on mount
  useState(() => { setSeenBoth(prev => ({ ...prev, no: true })); });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Interactive — view both tabs to continue</p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
        <button onClick={() => switchTab("no")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all ${tab === "no" ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          ✕ What NOT to say
        </button>
        <button onClick={() => switchTab("yes")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all ${tab === "yes" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"} ${!seenBoth.no ? "opacity-50" : ""}`}>
          ✓ What TO say
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "no" && (
          <motion.div key="no" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25,ease:"easeOut" as const}}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Never say this</p>
            {FRAMING_NOT.map((phrase, i) => (
              <div key={i} className="flex items-start gap-3">
                <IcoX size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-red-800 leading-[1.6] italic">"{phrase}"</p>
              </div>
            ))}
          </motion.div>
        )}
        {tab === "yes" && (
          <motion.div key="yes" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25,ease:"easeOut" as const}}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Say this instead</p>
            {FRAMING_DO.map((phrase, i) => (
              <div key={i} className="flex items-start gap-3">
                <IcoCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-emerald-900 leading-[1.6] italic">"{phrase}"</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1a2f4a]/5 border border-[#1a2f4a]/10 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-600 leading-[1.6]">
          <strong className="text-[#1a2f4a]">Notice the difference</strong> — the second set leads with a relatable personal moment. The first set positions the viewer as someone with a problem. Never make the viewer feel like they're behind.
        </p>
      </div>

      {bothSeen && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}}>
          <PrimaryBtn onClick={onDone}>Got it — continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section 3 — Content Test Slider ─────────────────────────────────────────────

const CONTENT_CONCEPTS = [
  {
    concept: "A video about styling a designer bag three different ways",
    correct: "fail" as const,
    explanation: "This only speaks to one corner of the closet — someone who owns or aspires to designer pieces. It positions style as aspirational and product-driven rather than personal and universal.",
  },
  {
    concept: "A video about the feeling of putting on an outfit you forgot you owned",
    correct: "pass" as const,
    explanation: "This speaks to the experience of getting dressed, not a particular way of getting dressed. A maximalist and a minimalist both know this feeling. That's the register Cloud Closet lives in.",
  },
  {
    concept: "A video showing how to build a capsule wardrobe with 10 neutral pieces",
    correct: "fail" as const,
    explanation: "Capsule wardrobe content codes for a specific, minimalist aesthetic. It implicitly tells people their current wardrobe isn't 'right.' Cloud Closet doesn't prescribe — it celebrates whatever someone actually wears.",
  },
  {
    concept: "Reacting to an outfit you found on Cloud Closet from someone in a completely different city with a totally different style — and showing what it sparked for you",
    correct: "pass" as const,
    explanation: "This is The Spark. It's about mutual recognition across difference — the most Cloud Closet thing you can make.",
  },
];

const SCORE_MESSAGES: Record<number, string> = {
  4: "You get it. This is the hardest part for most creators and you nailed it.",
  3: "You're close — re-read the brand pillar section before moving on.",
  2: "You're close — re-read the brand pillar section before moving on.",
  1: "Go back and re-read section 3 — the content test is one of the most important filters you'll use as a Cloud Closet creator.",
  0: "Go back and re-read section 3 — the content test is one of the most important filters you'll use as a Cloud Closet creator.",
};

function ContentTestSlider({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [votes, setVotes] = useState<Record<number, "pass"|"fail">>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const concept = CONTENT_CONCEPTS[idx];
  const voted = votes[idx] !== undefined;
  const isCorrect = voted && votes[idx] === concept.correct;
  const score = CONTENT_CONCEPTS.filter((c, i) => votes[i] === c.correct).length;

  function vote(choice: "pass"|"fail") {
    if (voted) return;
    setVotes(prev => ({ ...prev, [idx]: choice }));
    setRevealed(prev => ({ ...prev, [idx]: true }));
  }

  function next() {
    if (idx < CONTENT_CONCEPTS.length - 1) setIdx(i => i + 1);
    else setFinished(true);
  }

  const answeredAll = Object.keys(votes).length === CONTENT_CONCEPTS.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Does this content pass the Cloud Closet test?</p>
      </div>

      {!finished ? (
        <>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {CONTENT_CONCEPTS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                votes[i] !== undefined
                  ? votes[i] === CONTENT_CONCEPTS[i].correct ? "bg-emerald-400" : "bg-red-400"
                  : i === idx ? "bg-[#4a8fd4]" : "bg-slate-200"
              }`}/>
            ))}
            <span className="text-[10px] font-bold text-slate-400 ml-1">{idx + 1}/4</span>
          </div>

          {/* Concept card */}
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
              transition={{duration:0.3,ease:"easeOut" as const}}
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Concept {idx + 1}</p>
              <p className="text-sm text-slate-700 font-semibold leading-[1.6]">"{concept.concept}"</p>
            </motion.div>
          </AnimatePresence>

          {/* Vote buttons */}
          {!voted && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => vote("pass")}
                className="py-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-emerald-700 font-extrabold text-sm hover:bg-emerald-100 hover:border-emerald-400 active:scale-[0.98] transition-all">
                ✓ Passes the test
              </button>
              <button onClick={() => vote("fail")}
                className="py-3.5 rounded-2xl border-2 border-red-300 bg-red-50 text-red-600 font-extrabold text-sm hover:bg-red-100 hover:border-red-400 active:scale-[0.98] transition-all">
                ✕ Fails the test
              </button>
            </div>
          )}

          {/* Reveal */}
          {revealed[idx] && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}}
              className={`rounded-2xl p-4 border-2 flex flex-col gap-2 ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2">
                {isCorrect
                  ? <IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/>
                  : <IcoX size={15} className="text-red-400 flex-shrink-0"/>}
                <p className={`font-extrabold text-sm ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                  {isCorrect ? "Correct!" : `Not quite — this ${concept.correct === "pass" ? "passes" : "fails"} the test.`}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-[1.6]">{concept.explanation}</p>
              <button onClick={next}
                className="mt-1 self-end flex items-center gap-1.5 text-xs font-extrabold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors">
                {idx < CONTENT_CONCEPTS.length - 1 ? "Next concept" : "See my score"} <IcoChevronRight size={12}/>
              </button>
            </motion.div>
          )}
        </>
      ) : (
        /* Score screen */
        <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.35,ease:"easeOut" as const}}
          className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#1a2f4a] to-[#1e3a5f] rounded-2xl p-6 text-center">
            <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-widest mb-2">Your Score</p>
            <p className="text-5xl font-extrabold text-white mb-1">{score}<span className="text-2xl text-white/40">/4</span></p>
            <p className="text-sm text-white/70 leading-[1.6] mt-3 max-w-xs mx-auto">{SCORE_MESSAGES[score]}</p>
          </div>

          {/* Answer recap */}
          <div className="flex flex-col gap-2">
            {CONTENT_CONCEPTS.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl px-3.5 py-3 border ${
                votes[i] === c.correct ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
              }`}>
                {votes[i] === c.correct
                  ? <IcoCheck size={13} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                  : <IcoX size={13} className="text-red-400 flex-shrink-0 mt-0.5"/>}
                <p className="text-xs text-slate-600 leading-[1.5]">{c.concept}</p>
              </div>
            ))}
          </div>

          <PrimaryBtn onClick={onDone}>Complete Module 1 <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section 4 — Brand Pillars ───────────────────────────────────────────────────

const PILLARS = [
  {
    num: "01", name: "The Closet",
    teaser: "Personal, physical, emotional. Where identity gets negotiated every morning.",
    detail: "The closet isn't just where your clothes live — it's where decisions get made, memories get stored, and identity gets negotiated every single morning. Cloud Closet takes that private, tactile, deeply human space and gives it somewhere to exist tangibly and evolve with you. When you make content about the closet, you're making content about identity. That's the weight of it.",
    tags: ["getting dressed","wardrobe","identity","intentional","emotional"],
    affirm: "Content rooted in The Closet tends to be introspective and personal. Think GRWM, outfit breakdowns, and the emotional story behind what you wear.",
  },
  {
    num: "02", name: "The Cloud",
    teaser: "What happens when every closet connects.",
    detail: "The cloud is the living, breathing community formed between users — the collective of real outfits, real stories, and real engagement that grows every time someone shows up and shares. Your archive feeds it. Others' closets inform yours. The cloud is the whole — dynamic, communal, and always evolving. When you make content about discovering someone else's style, you're making content about the cloud.",
    tags: ["community","connection","collective","shared","discovery"],
    affirm: "Content rooted in The Cloud tends to be community-driven and connective. Think discovery reactions, sharing others' fits, and the collective aspect of style.",
  },
  {
    num: "03", name: "The Spark",
    teaser: "Every fit uploaded is an act of generosity.",
    detail: "Every fit uploaded is an act of generosity: here is how I showed up today, maybe it means something to you. That moment of mutual recognition — when someone else's outfit triggers something in you — is what makes Cloud Closet different from every other platform. It's generative. It creates momentum in self expression. When you make content that captures the spark, you're making Cloud Closet's best content.",
    tags: ["real style","discovery","taste","fit checks","recognition","authenticity"],
    affirm: "Content rooted in The Spark tends to be reactive and generative. Think inspiration moments, unexpected styling, and the 'I never would have thought of that' reaction.",
  },
];

function PillarCards({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const allExpanded = PILLARS.every((_, i) => expanded.includes(i));

  function toggle(i: number) {
    setExpanded(prev => prev.includes(i) ? prev : [...prev, i]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Expand all 3 pillars to continue</p>
      </div>

      <div className="flex flex-col gap-2">
        {PILLARS.map((p, i) => {
          const isOpen = expanded.includes(i);
          return (
            <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
              isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : "border-slate-200 bg-white"
            }`}>
              <button onClick={() => toggle(i)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
                <span className="text-[11px] font-extrabold text-[#4a8fd4] tabular-nums flex-shrink-0">{p.num}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-800">{p.name}</p>
                  {!isOpen && <p className="text-xs text-slate-500 mt-0.5 leading-[1.5] truncate">{p.teaser}</p>}
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isOpen ? "bg-[#1a2f4a] text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {isOpen ? <IcoCheck size={12}/> : <IcoChevronRight size={12}/>}
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                    transition={{duration:0.3,ease:"easeOut" as const}} className="overflow-hidden">
                    <div className="px-5 pb-5 flex flex-col gap-3 border-t border-slate-100 pt-4">
                      <p className="text-sm text-slate-600 leading-[1.6]">{p.detail}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-[#1a2f4a] bg-[#1a2f4a]/8 px-2.5 py-1 rounded-full uppercase tracking-wide">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Pillar affinity question */}
      <AnimatePresence>
        {allExpanded && selected === null && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-extrabold text-slate-700">Before you move on — which pillar does your personal style and content instinct connect with most?</p>
            <p className="text-xs text-slate-400">No wrong answer.</p>
            <div className="flex flex-col gap-2">
              {PILLARS.map((p, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-[#4a8fd4]/50 hover:bg-[#1a2f4a]/3 transition-all active:scale-[0.99]">
                  <span className="text-[10px] font-extrabold text-[#4a8fd4]">{p.num}</span>
                  <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {selected !== null && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}}
            className="bg-[#1a2f4a]/5 border border-[#1a2f4a]/15 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-widest">Your pillar: {PILLARS[selected].num} — {PILLARS[selected].name}</p>
            <p className="text-sm text-slate-700 leading-[1.6]">{PILLARS[selected].affirm}</p>
            <PrimaryBtn onClick={onDone}>Continue to Section 5 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section 5 — Voice Sorting Game ──────────────────────────────────────────────

const VOICE_PHRASES = [
  { phrase: "I've been logging my outfits for three weeks and I keep reaching for the same three things. Interesting.", correct: "yes" as const, explanation: "Dry, observational, personal. This trusts the viewer to find the insight without spelling it out." },
  { phrase: "You NEED to download this app RIGHT NOW it will literally transform your wardrobe!!", correct: "no" as const, explanation: "Too loud, too urgent. Cloud Closet doesn't hype. We trust the product to speak." },
  { phrase: "Someone on this app styled a vintage jacket in a way I genuinely hadn't considered. That's the whole point of this place.", correct: "yes" as const, explanation: "Warm, specific, connected to The Spark. Doesn't over-explain. Ends on the insight." },
  { phrase: "Cloud Closet's curated aesthetic makes it the perfect app for building your personal style.", correct: "no" as const, explanation: "Two problems — 'curated' is on the avoid list, and this is brand-speak, not a person talking." },
  { phrase: "I have a lot of feelings about getting dressed and apparently there's an app for that now.", correct: "yes" as const, explanation: "Dry humor, self-aware, warm. Feels like a real person." },
  { phrase: "This app is so trendy right now — everyone is talking about it and the aesthetic is everything.", correct: "no" as const, explanation: "Trendy, aesthetic as a noun, vague hype — three things on the avoid list in one sentence." },
];

function VoiceSorting({ onDone }: { onDone: () => void }) {
  const [answers, setAnswers] = useState<Record<number, "yes"|"no">>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const current = VOICE_PHRASES[currentIdx];
  const answered = answers[currentIdx] !== undefined;
  const isCorrect = answered && answers[currentIdx] === current.correct;
  const allDone = Object.keys(answers).length === VOICE_PHRASES.length;

  function answer(choice: "yes"|"no") {
    if (answered) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: choice }));
    setRevealed(prev => ({ ...prev, [currentIdx]: true }));
  }

  function advance() {
    if (currentIdx < VOICE_PHRASES.length - 1) setCurrentIdx(i => i + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Sort these phrases — sounds like Cloud Closet or doesn't?</p>
      </div>

      {/* Phrase progress */}
      <div className="flex gap-1">
        {VOICE_PHRASES.map((p, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            answers[i] !== undefined
              ? answers[i] === p.correct ? "bg-emerald-400" : "bg-red-400"
              : i === currentIdx ? "bg-[#4a8fd4]" : "bg-slate-200"
          }`}/>
        ))}
      </div>

      {!allDone ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}
              transition={{duration:0.25,ease:"easeOut" as const}}
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Phrase {currentIdx + 1} of {VOICE_PHRASES.length}</p>
              <p className="text-sm text-slate-700 font-semibold leading-[1.6] italic">"{current.phrase}"</p>
            </motion.div>
          </AnimatePresence>

          {!answered && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => answer("yes")}
                className="py-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-emerald-700 font-extrabold text-xs hover:bg-emerald-100 active:scale-[0.98] transition-all">
                Sounds like Cloud Closet
              </button>
              <button onClick={() => answer("no")}
                className="py-3.5 rounded-2xl border-2 border-red-300 bg-red-50 text-red-600 font-extrabold text-xs hover:bg-red-100 active:scale-[0.98] transition-all">
                Doesn't sound like us
              </button>
            </div>
          )}

          {revealed[currentIdx] && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25,ease:"easeOut" as const}}
              className={`rounded-2xl p-4 border-2 flex flex-col gap-2 ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2">
                {isCorrect ? <IcoCheck size={14} className="text-emerald-500 flex-shrink-0"/> : <IcoX size={14} className="text-red-400 flex-shrink-0"/>}
                <p className={`font-extrabold text-sm ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                  {isCorrect ? "Correct" : `Not quite — this ${current.correct === "yes" ? "does" : "doesn't"} sound like Cloud Closet`}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-[1.6]">{current.explanation}</p>
              {currentIdx < VOICE_PHRASES.length - 1 && (
                <button onClick={advance} className="self-end text-xs font-extrabold text-[#4a8fd4] hover:text-[#1a2f4a] flex items-center gap-1 mt-1 transition-colors">
                  Next phrase <IcoChevronRight size={12}/>
                </button>
              )}
              {currentIdx === VOICE_PHRASES.length - 1 && (
                <button onClick={() => setAnswers(prev => ({ ...prev }))} className="self-end text-xs font-extrabold text-[#4a8fd4] hover:text-[#1a2f4a] flex items-center gap-1 mt-1 transition-colors">
                  See results <IcoChevronRight size={12}/>
                </button>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}
          className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#1a2f4a] to-[#1e3a5f] rounded-2xl p-5 text-center">
            <p className="text-5xl font-extrabold text-white mb-1">
              {VOICE_PHRASES.filter((p, i) => answers[i] === p.correct).length}<span className="text-2xl text-white/40">/{VOICE_PHRASES.length}</span>
            </p>
            <p className="text-sm text-white/70 mt-2 leading-[1.6]">The Cloud Closet voice is quiet confidence. It observes. It trusts. It doesn't yell.</p>
          </div>
          <PrimaryBtn onClick={onDone}>Continue to Section 6 <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section 6 — What We Are Not ─────────────────────────────────────────────────

const NOT_LIST = [
  "We are not an influencer platform",
  "We are not a trend engine or trend forecast tool",
  "We are not an AI stylist that tells you what to wear",
  "We are not loud, busy, or everything at once",
  "We are not for people who want to perform style — we are for people who want to live it",
];

function WhatWeAreNot({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(0);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    let count = 0;
    const id = setInterval(() => {
      count++;
      setVisible(count);
      if (count >= NOT_LIST.length) clearInterval(id);
    }, 420);
  }

  const allVisible = visible >= NOT_LIST.length;

  return (
    <div className="flex flex-col gap-4">
      {!started ? (
        <button onClick={start}
          className="w-full py-3.5 rounded-2xl border-2 border-[#1a2f4a]/20 bg-[#1a2f4a]/5 text-[#1a2f4a] font-extrabold text-sm hover:bg-[#1a2f4a]/10 active:scale-[0.98] transition-all">
          Reveal the list
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {NOT_LIST.map((item, i) => (
            <AnimatePresence key={i}>
              {visible > i && (
                <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:0.35,ease:"easeOut" as const}}
                  className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                  <IcoX size={14} className="text-[#1a2f4a] flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-slate-700 leading-[1.6] font-medium">{item}</p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      )}

      <AnimatePresence>
        {allVisible && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.4,ease:"easeOut" as const}}
            className="flex flex-col gap-4">
            <div className="border-l-4 border-[#4a8fd4] pl-5 py-1">
              <p className="text-sm text-slate-700 leading-[1.7] italic" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>
                "We are quiet on purpose. Perfection is discouraged and shoes are optional. Come as you are, even in sweatpants."
              </p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 7 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section 7 — One Sentence Test ───────────────────────────────────────────────

const LAZY_ANSWERS = ["it's short", "its short", "i worked hard", "i worked on it", "it's good", "its good", "it's funny", "its funny"];

function OneSentenceTest({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) { setError("The answer can't be blank."); return; }
    if (LAZY_ANSWERS.some(a => trimmed.includes(a))) {
      setError("Try again — the answer has to be something the viewer would say, not something you would say about your own effort.");
      return;
    }
    setError("");
    setSubmitted(true);
    setTimeout(onDone, 1400);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Complete this sentence about a content idea you have</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-sm text-slate-600 leading-[1.6] mb-4">
          Before you post or submit anything, ask yourself: does this feel like something a real person made about an app they actually use? Does it feel like a TikTok, or does it feel like an ad? Would it pass the scroll test — meaning, would someone stop and watch, or would they keep going? Would both a maximalist and a minimalist see themselves in it?
        </p>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-extrabold text-slate-700 mb-3 leading-[1.6]">
            "Someone will watch this to the end because <span className="text-[#4a8fd4]">___________.</span>"
          </p>
          {!submitted ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={value}
                onChange={e => { setValue(e.target.value); setError(""); }}
                placeholder="…they've felt this exact thing and didn't know how to say it."
                rows={3}
                className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 leading-[1.6]"
              />
              <AnimatePresence>
                {error && (
                  <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 leading-[1.6]">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <PrimaryBtn onClick={submit} disabled={!value.trim()}>Submit</PrimaryBtn>
            </div>
          ) : (
            <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{duration:0.3,ease:"easeOut" as const}}
              className="bg-[#1a2f4a]/5 border border-[#1a2f4a]/15 rounded-xl p-4">
              <p className="text-sm font-extrabold text-[#1a2f4a] mb-1">Saved.</p>
              <p className="text-xs text-slate-600 leading-[1.6]">Come back to it every time you sit down to make a video.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Module 1 — Full Multi-Section Component ─────────────────────────────────────

function Module1Content({ onComplete }: { onComplete: () => void }) {
  const [section, setSection] = useState(1);
  const [sDone, setSDone] = useState<boolean[]>([false,false,false,false,false,false,false]);
  const [flipped, setFlipped] = useState([false, false, false]);
  const allFlipped = flipped.every(Boolean);
  const TOTAL_SECTIONS = 7;

  function flip(i: number) { setFlipped(prev => { const n=[...prev]; n[i]=true; return n; }); }

  function completeSection(n: number) {
    setSDone(prev => { const next=[...prev]; next[n-1]=true; return next; });
    if (n < TOTAL_SECTIONS) setTimeout(() => setSection(n + 1), 600);
    else setTimeout(onComplete, 900);
  }

  // Section progress bar (7 segments)
  const segmentClass = (n: number) => {
    if (sDone[n-1]) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function SectionDoneTag() {
    return (
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-xs font-bold text-emerald-600">
        <IcoCheck size={13}/> Section complete
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 7-segment progress bar */}
      <div className="flex gap-1">
        {Array.from({length: TOTAL_SECTIONS}, (_, i) => i+1).map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segmentClass(n)}`}/>
        ))}
      </div>

      {/* ── Section 1 ── */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <SectionHeader n={1} total={TOTAL_SECTIONS} label="The simplest version"/>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 leading-[1.6]">Cloud Closet takes all the outfit pics in your camera roll and all the "what are you wearing" texts and puts them into one clean, organized app. Free to use. Community driven. No ads or clutter. Just everything you need and nothing you don't.</p>
          <p className="text-sm text-slate-600 leading-[1.6]">That's the elevator pitch. But here's the thing — the product isn't really about the app. It's about the fact that style is a social experience, and nobody had built the right place for it yet. Not influencer social. People social. The difference matters, and it's the whole reason your content needs to feel the way it does.</p>
          <div className="border-l-4 border-[#4a8fd4] pl-5 py-1">
            <p className="text-base text-slate-700 leading-[1.7] italic" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>"We are a place to share your fit, discover someone else's, and find the pieces that actually move you — not because an algorithm decided they should, but because a real person wore them in a way that lit something up in you."</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1"><IcoStar size={13} className="text-amber-400"/><p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Flip all 3 cards to continue</p></div>
          <p className="text-xs text-slate-400 mb-4">{flipped.filter(Boolean).length} of 3 flipped{allFlipped ? " — nice work!" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FLIP_CARDS.map((card, i) => <FlipCard key={i} front={card.front} back={card.back} flipped={flipped[i]} onFlip={() => flip(i)}/>)}
          </div>
        </div>
        <AnimatePresence>
          {allFlipped && !sDone[0] && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3,ease:"easeOut" as const}}>
              <PrimaryBtn onClick={() => completeSection(1)}>Continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn>
            </motion.div>
          )}
          {sDone[0] && <SectionDoneTag/>}
        </AnimatePresence>
      </motion.div>

      {/* ── Section 2 ── */}
      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL_SECTIONS} label="What we're replacing"/>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 leading-[1.6]">People have always had a system — a camera roll of fits, a Pinterest board, a group chat they rely on for style opinions. What they didn't have was one place that does all three. Shopping, sharing, and communicating. Cloud Closet captures all of them.</p>
            <p className="text-sm text-slate-600 leading-[1.6]">But the way you talk about this as a creator is important. We don't shame people's current method. We don't say their camera roll is a mess or their Pinterest board is outdated. We ask questions that guide people into recognizing on their own that there's a better way. We recognize and guide the conversation. We don't lecture.</p>
          </div>
          {!sDone[1] ? <FramingToggle onDone={() => completeSection(2)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 3 ── */}
      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL_SECTIONS} label="Everyone who has ever gotten dressed and felt something"/>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 leading-[1.6]">That's not marketing language. It's the actual brief. Cloud Closet is for the older sister whose mom's bag finally made its way to her. The younger one who styles it in a way nobody saw coming. The thrifter. The guy who knows exactly what he's doing. The fashion obsessive with an archive. The person in Seoul whose fit stops someone in Alabama cold.</p>
            <p className="text-sm text-slate-600 leading-[1.6]">This matters for your content because your job is not to speak to one corner of the closet.</p>
          </div>
          {!sDone[2] ? <ContentTestSlider onDone={() => completeSection(3)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 4 ── */}
      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL_SECTIONS} label="Three things that anchor every piece of content"/>
          <p className="text-xs text-slate-400 -mt-3 leading-[1.6]">These aren't abstract values. They're what every video should connect back to.</p>
          {!sDone[3] ? <PillarCards onDone={() => completeSection(4)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 5 ── */}
      {section >= 5 && (
        <motion.div key="s5" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={5} total={TOTAL_SECTIONS} label="How Cloud Closet sounds"/>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 leading-[1.6]">Think of a group chat that evolved into an editorial. Confident, observational, dry — but warm underneath. We don't over-explain. We don't hype. We write and speak like we're already friends with the person watching.</p>
            <p className="text-sm text-slate-600 leading-[1.6]">The reference point: SSENSE deadpan but with a beating heart. You trust the viewer to get it. You don't spell out the joke. You don't beg for the follow. You show up and say something true.</p>
          </div>
          {!sDone[4] ? <VoiceSorting onDone={() => completeSection(5)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 6 ── */}
      {section >= 6 && (
        <motion.div key="s6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={6} total={TOTAL_SECTIONS} label="Just as important as what we are"/>
          <p className="text-xs text-slate-400 -mt-3 leading-[1.6]">If your content accidentally positions Cloud Closet as any of the following, it's off-brand.</p>
          {!sDone[5] ? <WhatWeAreNot onDone={() => completeSection(6)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 7 ── */}
      {section >= 7 && (
        <motion.div key="s7" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={7} total={TOTAL_SECTIONS} label="How we measure whether content is working"/>
          {!sDone[6] ? <OneSentenceTest onDone={() => completeSection(7)}/> : (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
              <div>
                <p className="text-sm font-extrabold text-emerald-700">Module 1 complete!</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to the overview — Module 2 is now unlocked.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Module 2 — Interactive components ──────────────────────────────────────────

// True/False rapid-fire quiz
const TF_STATEMENTS = [
  {
    text: "Having more followers means your videos get shown to more people automatically.",
    answer: false,
    explanation: "TikTok tests every video with a small audience first — including a slice of your followers — and only expands based on how that test performs. Follower count gives you a slightly larger initial test pool but does not guarantee distribution.",
  },
  {
    text: "A video with high completion rate but few likes can still go viral.",
    answer: true,
    explanation: "Completion rate is the strongest signal. A video with 80% completion and 50 likes will outperform a video with 20% completion and 500 likes. The algorithm trusts watch behavior more than passive taps.",
  },
  {
    text: "Posting the same video twice will get you double the reach.",
    answer: false,
    explanation: "The algorithm actively identifies and demotes duplicate or recycled content. Original content gets a ranking preference.",
  },
  {
    text: "A video can go viral days after it was posted.",
    answer: true,
    explanation: "TikTok videos have a 7–14 day lifespan. The algorithm can resurface a video if it starts gaining traction — some videos blow up on day 5 or 7 with no explanation. This is very different from Instagram, where reach peaks in 24 hours.",
  },
  {
    text: "Asking people to 'like this video' is an effective growth strategy.",
    answer: false,
    explanation: "Likes are the weakest engagement signal. Shares, saves, and comments carry far more weight. Design your content to earn those instead.",
  },
];

function TrueFalseQuiz({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const current = TF_STATEMENTS[idx];
  const isCorrect = revealed && choice === current.answer;

  function pick(val: boolean) {
    if (revealed) return;
    setChoice(val);
    setRevealed(true);
  }

  function next() {
    if (idx < TF_STATEMENTS.length - 1) {
      setIdx(i => i + 1);
      setChoice(null);
      setRevealed(false);
    } else {
      setDone(true);
      setTimeout(onDone, 800);
    }
  }

  if (done) {
    return (
      <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.3,ease:"easeOut" as const}}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
        <IcoCheck size={18} className="text-emerald-500 flex-shrink-0"/>
        <p className="text-sm font-extrabold text-emerald-700">All 5 statements reviewed!</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {TF_STATEMENTS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < idx ? "bg-[#4a8fd4]" : i === idx ? "bg-[#4a8fd4]/40" : "bg-slate-200"
          }`}/>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
          transition={{duration:0.25,ease:"easeOut" as const}} className="flex flex-col gap-4">
          {/* Statement card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-widest mb-3">
              Statement {idx + 1} of {TF_STATEMENTS.length}
            </p>
            <p className="text-sm font-semibold text-slate-700 leading-[1.6]">&ldquo;{current.text}&rdquo;</p>
          </div>

          {/* True / False buttons */}
          {!revealed && (
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map(val => (
                <button key={String(val)} onClick={() => pick(val)}
                  className="py-4 rounded-2xl border-2 border-slate-200 font-extrabold text-sm text-slate-600
                    hover:border-[#4a8fd4]/60 hover:bg-[#1a2f4a]/3 active:scale-[0.98] transition-all duration-150">
                  {val ? "True" : "False"}
                </button>
              ))}
            </div>
          )}

          {/* Answer reveal */}
          {revealed && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}}
              className={`rounded-2xl p-5 border-2 flex flex-col gap-3 ${
                isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
              }`}>
              <div className="flex items-center gap-2">
                {isCorrect
                  ? <IcoCheck size={16} className="text-emerald-500 flex-shrink-0"/>
                  : <IcoX size={16} className="text-red-400 flex-shrink-0"/>}
                <span className={`text-sm font-extrabold ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                  {isCorrect ? "Correct" : `The answer is ${current.answer ? "True" : "False"}`}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-[1.6]">{current.explanation}</p>
              <button onClick={next}
                className="mt-1 self-start flex items-center gap-1 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors">
                {idx < TF_STATEMENTS.length - 1 ? "Next statement" : "Finish"} <IcoChevronRight size={12}/>
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Ranking signals bar chart
const RANKING_SIGNALS = [
  { name: "Completion rate", pct: 100, detail: "The percentage of your video people watch before scrolling away. The current threshold for viral distribution is ~70%. For a 30-second video, that means the average viewer needs to watch 21+ seconds. This is the number that decides everything else." },
  { name: "Rewatch rate",    pct: 95,  detail: "When someone watches your video more than once, TikTok reads it as a powerful signal of genuine interest. A 15-20%+ rewatch rate is strong. This is why tight, dense videos that reward a second watch outperform padded ones." },
  { name: "Shares",          pct: 75,  detail: "Sharing requires effort and intent — the viewer decides this content is good enough to send to someone else. TikTok weights this heavily because it's a strong indicator of real value. Design for shares by making content that feels like something worth passing on." },
  { name: "Saves",           pct: 70,  detail: "A save says 'I want to come back to this.' Educational content, how-to formats, and content with lasting value earn saves. The educational/how-I-use-it Cloud Closet format is specifically strong for saves." },
  { name: "Comment quality", pct: 45,  detail: "Not just comment count — the algorithm now weighs the length and substance of comments. A video that generates 10 long, thoughtful responses outperforms one with 50 'lol' comments. Content that sparks genuine conversation is rewarded." },
  { name: "Likes",           pct: 20,  detail: "Still a signal, but the weakest one here. Asking people to 'like if you agree' is not a growth strategy. Focus on completion and shares first — likes will follow naturally if the other signals are strong." },
];

function RankingSignals({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  const allExpanded = RANKING_SIGNALS.every((_, i) => expanded.includes(i));

  function toggle(i: number) {
    setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    // mark as seen (can't un-see)
  }

  // track which have been seen (opened at least once)
  const [seen, setSeen] = useState<number[]>([]);
  function open(i: number) {
    setSeen(prev => prev.includes(i) ? prev : [...prev, i]);
    toggle(i);
  }
  const allSeen = RANKING_SIGNALS.every((_, i) => seen.includes(i));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Tap each signal to expand</p>
      </div>

      {RANKING_SIGNALS.map((sig, i) => {
        const isOpen = expanded.includes(i);
        const isSeen = seen.includes(i);
        return (
          <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
            isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : "border-slate-200 bg-white"
          }`}>
            <button onClick={() => open(i)} className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
              {/* Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-extrabold text-slate-800">{sig.name}</p>
                  <span className="text-[10px] font-bold text-[#4a8fd4]">{sig.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#1a2f4a] to-[#4a8fd4]"
                    initial={{ width: 0 }}
                    animate={{ width: `${sig.pct}%` }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" as const }}
                  />
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isSeen ? "bg-[#1a2f4a] text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {isSeen ? <IcoCheck size={11}/> : <IcoChevronRight size={11}/>}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  transition={{duration:0.28,ease:"easeOut" as const}} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-[1.6]">{sig.detail}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {allSeen && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}
            className="flex flex-col gap-4">
            <div className="border-l-4 border-amber-400 pl-5 py-1 bg-amber-50/60 rounded-r-xl">
              <p className="text-xs text-slate-700 leading-[1.6]">Notice what's not on this list: follower count, posting frequency, account age, and paid promotion. TikTok is the most meritocratic major platform — content quality is the only thing that compounds.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wave system diagram
const WAVES = [
  { label: "Wave 1 — Follower test", audience: "~50–200 people", barPct: 5, color: "#4a8fd4", detail: "Your video shows to a small slice of your existing followers first (a 2025 change). If they engage, it moves forward. If they don't, the video largely stops here. This is why posting consistently to a warm audience matters — your followers are your launchpad." },
  { label: "Wave 2 — 100–500 users", audience: "~100–500 people", barPct: 20, color: "#1e3a5f", detail: "Shown to a small relevant audience in the first ~3 hours. TikTok watches completion and engagement closely. This is the most critical window. The first 3 hours after posting matter more than any other variable." },
  { label: "Wave 3 — 10K–100K+", audience: "~10,000–100,000+", barPct: 60, color: "#1a2f4a", detail: "If Wave 2 performs, distribution expands significantly. Strong signals here can push into the millions. Weak signals stop the wave and the video plateaus." },
  { label: "Wave 4+ — Long tail", audience: "Potentially millions", barPct: 100, color: "#0f1f33", detail: "Videos that keep performing get resurfaced. TikTok videos have a 7–14 day viral window. Unlike Instagram (peaks at 24hrs), a strong TikTok video can explode on day 5." },
];

function WaveSystem({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([0]);
  const allRevealed = WAVES.every((_, i) => revealed.includes(i));

  function advance() {
    const next = active + 1;
    if (next < WAVES.length) {
      setActive(next);
      setRevealed(prev => prev.includes(next) ? prev : [...prev, next]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Step through each distribution wave</p>
      </div>

      {/* Wave bars */}
      <div className="flex flex-col gap-2">
        {WAVES.map((wave, i) => {
          const isRevealed = revealed.includes(i);
          const isActive = i === active;
          return (
            <motion.div key={i} layout
              className={`rounded-2xl border-2 overflow-hidden transition-colors duration-300 ${
                isActive ? "border-[#1a2f4a]/40 bg-[#1a2f4a]/4" : isRevealed ? "border-[#4a8fd4]/30 bg-white" : "border-slate-100 bg-slate-50 opacity-40"
              }`}>
              <div className="px-4 py-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-extrabold ${isRevealed ? "text-slate-800" : "text-slate-400"}`}>{wave.label}</p>
                  {isRevealed && <span className="text-[10px] font-bold text-[#4a8fd4] bg-[#4a8fd4]/10 px-2 py-0.5 rounded-full">{wave.audience}</span>}
                </div>
                {isRevealed && (
                  <>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${wave.color}, #4a8fd4)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${wave.barPct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" as const }}
                      />
                    </div>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3,duration:0.4}}
                      className="text-xs text-slate-600 leading-[1.6]">{wave.detail}</motion.p>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {!allRevealed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <PrimaryBtn onClick={advance}>
              {active < WAVES.length - 1 ? `Next: ${WAVES[active + 1].label}` : "See final insight"} <IcoChevronRight size={16}/>
            </PrimaryBtn>
          </motion.div>
        )}
        {allRevealed && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}
            className="flex flex-col gap-4">
            <div className="border-l-4 border-[#4a8fd4] pl-5 py-1">
              <p className="text-sm text-slate-700 leading-[1.7] italic" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>
                "What this means for you: every video gets a fair test. The question is whether your content performs when it gets one."
              </p>
            </div>
            <PrimaryBtn onClick={onDone}>Complete Module 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section 4 — FYP vs Search toggle ───────────────────────────────────────────

function DiscoveryToggle({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState<"fyp"|"search">("fyp");
  const [seen, setSeen] = useState<Set<string>>(new Set(["fyp"]));

  function pick(panel: "fyp"|"search") {
    setActive(panel);
    setSeen(prev => { const next = new Set(prev); next.add(panel); return next; });
  }

  const bothSeen = seen.has("fyp") && seen.has("search");

  const panels = {
    fyp: {
      label: "For You Page",
      tag: "Passive discovery",
      color: "from-[#1a2f4a] to-[#1e3a5f]",
      body: "Driven entirely by behavioral signals — watch time, completion, shares. A video can go viral here without any keyword optimization if it performs. This is the main distribution engine.",
      signals: ["Completion rate", "Rewatch rate", "Shares", "Saves"],
    },
    search: {
      label: "Search",
      tag: "Active discovery",
      color: "from-[#0f3460] to-[#1a4a7a]",
      body: "Works like a search engine. TikTok transcribes your spoken audio, reads on-screen text, and indexes captions and hashtags. A well-keyworded video with weak engagement will rank in search but won't get FYP push.",
      signals: ["Keywords in captions", "Spoken words", "On-screen text", "Hashtags"],
    },
  };

  const panel = panels[active];

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle buttons */}
      <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden">
        {(["fyp","search"] as const).map(key => (
          <button key={key} onClick={() => pick(key)}
            className={`flex-1 py-3 text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
              active === key
                ? "bg-gradient-to-r from-[#1a2f4a] to-[#1e3a5f] text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}>
            {seen.has(key) && active !== key && <IcoCheck size={12} className="text-emerald-400"/>}
            {key === "fyp" ? "For You Page" : "Search"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.25,ease:"easeOut" as const}}
          className={`rounded-2xl bg-gradient-to-br ${panel.color} p-5 flex flex-col gap-4`}>
          <div>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{panel.tag}</span>
            <h4 className="text-base font-extrabold text-white mt-0.5">{panel.label}</h4>
          </div>
          <p className="text-sm text-white/80 leading-[1.6]">{panel.body}</p>
          <div>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Signals that matter</p>
            <div className="flex flex-wrap gap-2">
              {panel.signals.map(sig => (
                <span key={sig} className="text-xs font-bold text-white bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">{sig}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Both at once — animates in after both panels seen */}
      <AnimatePresence>
        {bothSeen && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}}
            className="flex flex-col gap-4">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">Both at once</p>
              <p className="text-sm text-slate-700 leading-[1.6]">Say your keywords out loud. Put them in on-screen text. Write captions the way someone would search — <span className="font-bold text-slate-800">"how I organize my outfits using Cloud Closet"</span> beats <span className="font-bold text-slate-800">"game changing app 🤍."</span> This costs nothing extra and makes your content findable through both paths simultaneously.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 5 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section 5 — Creator commitment checklist ─────────────────────────────────────

const COMMITMENTS = [
  "I will design every video around one question: will someone watch this to the end?",
  "I will name Cloud Closet out loud, in on-screen text, and in the caption on every video.",
  "I will write at least one caption per week the way a viewer would actually search for it.",
  "I will not chase likes. I will design for shares, saves, and completion.",
  "I understand that the first 3 hours after posting matter most — I will post when my audience is active.",
];

function CreatorCommitments({ onDone }: { onDone: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(COMMITMENTS.map(() => false));
  const allChecked = checked.every(Boolean);

  function toggle(i: number) {
    setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {COMMITMENTS.map((text, i) => (
          <motion.label key={i}
            initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
            transition={{delay:i*0.06,duration:0.3,ease:"easeOut" as const}}
            className={`flex items-start gap-3 cursor-pointer rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 ${
              checked[i]
                ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/4"
                : "border-slate-200 bg-white hover:border-[#4a8fd4]/40 hover:bg-slate-50"
            }`}>
            <motion.div
              onClick={() => toggle(i)}
              whileTap={{ scale: 0.88 }}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-200 ${
                checked[i] ? "bg-[#1a2f4a] border-[#1a2f4a]" : "border-slate-300"
              }`}>
              {checked[i] && <IcoCheck size={11} className="text-white stroke-[3]"/>}
            </motion.div>
            <span className={`text-sm leading-[1.6] transition-colors ${checked[i] ? "text-slate-700 font-medium" : "text-slate-500"}`}>{text}</span>
          </motion.label>
        ))}
      </div>

      <AnimatePresence>
        {allChecked && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}}
            className="flex flex-col gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <IcoCheck size={16} className="text-emerald-500 flex-shrink-0"/>
              <p className="text-sm font-extrabold text-emerald-700">All commitments confirmed. You're ready to create.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Complete Module <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Module 3 (index 2) — Full Multi-Section Component ───────────────────────────

function Module3Content({ onComplete }: { onComplete: () => void }) {
  const [section, setSection] = useState(1);
  const [sDone, setSDone] = useState<boolean[]>([false, false, false, false, false]);
  const TOTAL_SECTIONS = 5;

  function completeSection(n: number) {
    setSDone(prev => { const next = [...prev]; next[n - 1] = true; return next; });
    if (n < TOTAL_SECTIONS) setTimeout(() => setSection(n + 1), 600);
    else setTimeout(onComplete, 900);
  }

  const segmentClass = (n: number) => {
    if (sDone[n - 1]) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function SectionDoneTag() {
    return (
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-xs font-bold text-emerald-600">
        <IcoCheck size={13}/> Section complete
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 5-segment progress bar */}
      <div className="flex gap-1">
        {Array.from({length: TOTAL_SECTIONS}, (_, i) => i + 1).map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segmentClass(n)}`}/>
        ))}
      </div>

      {/* ── Section 1 ── */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <SectionHeader n={1} total={TOTAL_SECTIONS} label="The single most important thing"/>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">TikTok is not a social graph. It's an interest graph.</h3>
          <p className="text-sm text-slate-600 leading-[1.6]">Instagram and YouTube are built around who you follow. TikTok is built around what you watch. The algorithm doesn't ask "who does this person follow?" — it asks "what has this person actually watched, rewatched, saved, and shared?" That distinction is everything. It means a brand new account with zero followers can land on 100,000 FYPs tomorrow. It also means a creator with 50,000 followers can post and get 200 views if the content doesn't perform. Follower count does not protect you here.</p>
          <div className="border-l-4 border-[#4a8fd4] pl-5 py-1">
            <p className="text-base text-slate-700 leading-[1.7] italic" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>"The algorithm's first question is not 'did people like this.' It is 'did people keep watching this.'"</p>
          </div>
        </div>
        {!sDone[0] ? <TrueFalseQuiz onDone={() => completeSection(1)}/> : <SectionDoneTag/>}
      </motion.div>

      {/* ── Section 2 ── */}
      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL_SECTIONS} label="What TikTok is actually measuring"/>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-slate-800">What TikTok is actually measuring</h3>
            <p className="text-xs text-slate-400 leading-[1.6]">Listed in order of algorithmic weight.</p>
          </div>
          {!sDone[1] ? <RankingSignals onDone={() => completeSection(2)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 3 ── */}
      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL_SECTIONS} label="How a video actually gets distributed"/>
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-extrabold text-slate-800">How a video actually gets distributed</h3>
            <p className="text-sm text-slate-600 leading-[1.6]">TikTok doesn't show your video to everyone at once. It runs a series of tests, expanding distribution only when each wave performs.</p>
          </div>
          {!sDone[2] ? <WaveSystem onDone={() => completeSection(3)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 4 ── */}
      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL_SECTIONS} label="FYP and Search are different engines"/>
          <p className="text-sm text-slate-600 leading-[1.6]">TikTok has two discovery paths and most creators optimize for only one of them — usually by accident.</p>
          {!sDone[3] ? <DiscoveryToggle onDone={() => completeSection(4)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {/* ── Section 5 ── */}
      {section >= 5 && (
        <motion.div key="s5" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={5} total={TOTAL_SECTIONS} label="Apply this to Cloud Closet content"/>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-slate-800">Your algorithm commitments</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Check each box to confirm you understand. These are the habits that separate creators who grow from creators who plateau.</p>
          </div>
          {!sDone[4] ? <CreatorCommitments onDone={() => completeSection(5)}/> : (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
              <div>
                <p className="text-sm font-extrabold text-emerald-700">Module 3 complete!</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to the overview — Module 4 is now unlocked.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────────
// Numbered circles → checkmarks on complete; "Level X of Y" lives in module header

function Stepper({ modules, statuses, current, onChange }: {
  modules:ModuleData[]; statuses:ModuleStatus[]; current:number; onChange:(i:number)=>void;
}) {
  return (
    <div className="flex items-start w-full">
      {modules.map((m,i) => (
        <div key={m.id} className="flex items-center flex-1 last:flex-none">
          <button onClick={() => statuses[i]!=="locked"&&onChange(i)} disabled={statuses[i]==="locked"}
            className="flex flex-col items-center gap-1.5 w-full">
            <motion.div
              animate={{ scale: i===current ? 1.12 : 1 }}
              transition={{ type:"spring", stiffness:300, damping:20 }}
              className={[
                "w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors duration-300",
                i===current ? "bg-gradient-to-br from-[#1a2f4a] to-[#26476e] text-white shadow-[0_4px_16px_rgba(26,47,74,0.4)]" :
                statuses[i]==="completed" ? "bg-emerald-500 text-white" :
                statuses[i]==="locked"    ? "bg-slate-100 text-slate-300" :
                "bg-[#1a2f4a]/10 text-[#1a2f4a] hover:bg-[#1a2f4a]/20",
              ].join(" ")}
            >
              {statuses[i]==="completed" ? <IcoCheck size={17}/> :
               statuses[i]==="locked"    ? <IcoLock size={13}/> :
               <span>{m.id}</span>}
            </motion.div>
            <span className={`text-[10px] font-bold leading-tight text-center hidden sm:block max-w-[56px] tracking-wide ${
              i===current ? "text-[#1a2f4a]" : statuses[i]==="completed" ? "text-emerald-600" : "text-slate-400"
            }`}>{m.title}</span>
          </button>
          {i<modules.length-1 && (
            <div className={`flex-1 h-0.5 mx-1.5 mb-5 sm:mb-4 rounded-full transition-all duration-700 ${statuses[i]==="completed"?"bg-emerald-400":"bg-slate-200"}`}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Welcome Modal ────────────────────────────────────────────────────────────────

function WelcomeModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.88,y:24}} animate={{opacity:1,scale:1,y:0}} transition={{type:"spring",stiffness:260,damping:22}}
        className="bg-white rounded-3xl shadow-2xl max-w-xs w-full p-8 text-center">
        <div className="w-32 h-32 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#1a2f4a]/10 to-emerald-100 flex flex-col items-center justify-center border border-[#1a2f4a]/10 gap-1">
          <span className="text-5xl">🎉</span>
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">GIF Placeholder</p>
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight">Welcome to the Team!</h2>
        <p className="text-sm text-slate-500 leading-[1.6] mb-6">
          You've completed all four training modules. You're officially ready to create content for Cloud Closet — let's make something amazing together.
        </p>
        <PrimaryBtn onClick={onClose}>Let's Go 🚀</PrimaryBtn>
      </motion.div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────────

export function UGCOnboardingPage({ profile }: { profile:{ full_name?:string } }) {
  const [view, setView] = useState<"overview"|"module">("overview");
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["active","locked","locked","locked"]);
  const [showModal, setShowModal] = useState(false);
  const [l2Step, setL2Step] = useState<WizardStep>("intro");

  // Progress: each completed module = 25%
  const completedCount = statuses.filter(s => s === "completed").length;
  const progressPct = (completedCount / MODULES.length) * 100;

  async function triggerConfetti() {
    try {
      const { default: confetti } = await import("canvas-confetti");
      confetti({ particleCount:150, spread:90, origin:{y:0.55}, colors:["#1a2f4a","#4a8fd4","#10b981","#f59e0b","#8b5cf6"] });
      setTimeout(()=>{ confetti({particleCount:80,angle:60,spread:55,origin:{x:0,y:0.6}}); confetti({particleCount:80,angle:120,spread:55,origin:{x:1,y:0.6}}); },300);
    } catch { /* silently skip */ }
  }

  function handlePass(moduleIdx:number) {
    setStatuses(prev => {
      const next=[...prev] as ModuleStatus[];
      next[moduleIdx]="completed";
      if (moduleIdx+1<next.length) next[moduleIdx+1]="active";
      return next;
    });
    // Return to overview after completing a module
    setTimeout(() => setView("overview"), 900);
    if (moduleIdx === MODULES.length - 1) setTimeout(() => { triggerConfetti(); setShowModal(true); }, 950);
  }

  function openModule(i:number) {
    if (statuses[i] === "locked") return;
    setCurrentModule(i);
    setView("module");
  }

  const mod = MODULES[currentModule];
  const isCompleted = statuses[currentModule] === "completed";

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-12">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Creator Onboarding</h1>
          <p className="text-sm text-slate-500 mt-1 leading-[1.6]">Complete all 4 modules to unlock your creator dashboard</p>
        </div>
        {view === "module" && (
          <button onClick={() => setView("overview")} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mt-1 flex-shrink-0">
            <IcoChevronLeft size={13}/> Overview
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Training Progress</p>
          <p className="text-[11px] font-extrabold text-[#1a2f4a]">{completedCount} of {MODULES.length} complete · {Math.round(progressPct)}%</p>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#1a2f4a] to-[#4a8fd4]"
            animate={{ width:`${progressPct}%` }}
            transition={{ duration:0.7, ease:"easeOut" as const }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {[0,25,50,75,100].map(p => (
            <span key={p} className={`text-[9px] font-bold ${progressPct >= p ? "text-[#4a8fd4]" : "text-slate-300"}`}>{p}%</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Overview screen ── */}
        {view === "overview" && (
          <motion.div key="overview" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3,ease:"easeOut" as const}}
            className="flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em] px-0.5">Modules</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODULES.map((m, i) => {
                const status = statuses[i];
                const locked = status === "locked";
                const complete = status === "completed";
                return (
                  <motion.button key={m.id} onClick={() => openModule(i)}
                    whileHover={!locked ? {scale:1.02} : {}} whileTap={!locked ? {scale:0.98} : {}}
                    disabled={locked}
                    className={[
                      "text-left rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all shadow-sm",
                      locked   ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" :
                      complete ? "border-emerald-200 bg-emerald-50/60" :
                      "border-[#1a2f4a]/15 bg-white hover:border-[#4a8fd4]/50 hover:shadow-md cursor-pointer",
                    ].join(" ")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className={[
                        "w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0",
                        locked   ? "bg-slate-200 text-slate-400" :
                        complete ? "bg-emerald-500 text-white" :
                        "bg-gradient-to-br from-[#1a2f4a] to-[#26476e] text-white shadow-md",
                      ].join(" ")}>
                        {complete ? <IcoCheck size={15}/> : locked ? <IcoLock size={13}/> : m.id}
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        locked ? "bg-slate-200 text-slate-400" :
                        complete ? "bg-emerald-100 text-emerald-700" :
                        "bg-[#1a2f4a]/8 text-[#1a2f4a]"
                      }`}>
                        {locked ? "Locked" : complete ? "Complete" : `~${m.time}`}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-extrabold leading-tight mb-1 ${locked ? "text-slate-400" : "text-slate-800"}`}>{m.title}</p>
                      <p className={`text-xs leading-[1.6] ${locked ? "text-slate-300" : "text-slate-500"}`}>{m.subtitle}</p>
                    </div>
                    {!locked && !complete && (
                      <div className="flex items-center gap-1 text-[#4a8fd4] text-xs font-bold mt-auto">
                        Start module <IcoChevronRight size={12}/>
                      </div>
                    )}
                    {complete && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-auto">
                        <IcoCheck size={12}/> Completed — tap to review
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Module view ── */}
        {view === "module" && (
          <motion.div key={`module-${currentModule}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.35,ease:"easeOut" as const}}
            className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            {/* Navy header */}
            <div className="bg-gradient-to-r from-[#1a2f4a] to-[#1e3a5f] px-5 py-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-[0.14em]">Module {mod.id} of {MODULES.length} · ~{mod.time}</p>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                    <IcoCheck size={11}/> Complete
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white leading-tight">{mod.title}</h2>
              <p className="text-sm text-white/60 mt-0.5 leading-[1.6]">{mod.subtitle}</p>
            </div>

            <div className="p-5">
              {/* Module 1 */}
              {currentModule === 0 && !isCompleted && (
                <Module1Content onComplete={() => handlePass(0)}/>
              )}
              {currentModule === 0 && isCompleted && (
                <div className="flex flex-col gap-5">
                  <Module1Content onComplete={() => {}}/>
                </div>
              )}

              {/* Module 2 — setup wizard */}
              {currentModule === 1 && !isCompleted && (
                <Level1Wizard key="l2" onPass={() => handlePass(1)} onStepChange={s => setL2Step(s)}/>
              )}
              {currentModule === 1 && isCompleted && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <IcoCheck size={28} className="text-emerald-500"/>
                  </div>
                  <p className="text-base font-extrabold text-slate-700">Module 2 Complete!</p>
                  <p className="text-sm text-slate-500 leading-[1.6]">Your account is set up and you know the warm-up plan.</p>
                  <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1">
                    <IcoChevronLeft size={12}/> Back to overview
                  </button>
                </div>
              )}

              {/* Module 3 — How the Algorithm Works */}
              {currentModule === 2 && !isCompleted && (
                <Module3Content onComplete={() => handlePass(2)}/>
              )}
              {currentModule === 2 && isCompleted && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <IcoCheck size={28} className="text-emerald-500"/>
                  </div>
                  <p className="text-base font-extrabold text-slate-700">Module 3 Complete!</p>
                  <p className="text-sm text-slate-500 leading-[1.6]">You understand how TikTok distributes content and what it rewards.</p>
                  <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1">
                    <IcoChevronLeft size={12}/> Back to overview
                  </button>
                </div>
              )}

              {/* Module 4 — coming soon */}
              {currentModule === 3 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a2f4a]/8 flex items-center justify-center">
                    <IcoStar size={24} className="text-[#4a8fd4]"/>
                  </div>
                  <p className="text-base font-extrabold text-slate-700">Coming soon</p>
                  <p className="text-sm text-slate-500 leading-[1.6] max-w-xs">This module is being built out. Check back soon.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && <WelcomeModal onClose={() => setShowModal(false)}/>}
    </div>
  );
}
