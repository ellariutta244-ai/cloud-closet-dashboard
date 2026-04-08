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

// ─── Wizard step order (for progress) ───────────────────────────────────────────

const WIZARD_STEPS: WizardStep[] = ["intro","why","username","photo","bio","link","public","warmup","quiz"];
// Total progress ticks: 8 L1 sub-steps (intro=0→quiz pass=8) + 1 each for L2,L3,L4 = 11
const TOTAL_TICKS = 11;

// ─── Module Definitions ─────────────────────────────────────────────────────────

const MODULES: ModuleData[] = [
  { id:1, title:"The Setup", subtitle:"Account Setup & Warm-Up Protocol", wizardMode:true },
  {
    id:2, title:"The First Week", subtitle:"Your First 3 Videos & Hook Mastery",
    description:[
      "Your first three UGC videos set the tone for your entire account: The Unboxing, The Style-Inspo, and The Honest Review.",
      "The most important skill you'll build in week one? Hooks that stop the scroll in the first 2 seconds.",
    ],
    highlights:[
      { icon:"📦", text:"Video 1 — The Unboxing: Authentic reaction, item arriving on camera" },
      { icon:"💫", text:"Video 2 — The Style-Inspo: 3+ ways to wear the same piece" },
      { icon:"⭐", text:"Video 3 — The Honest Review: Real talk, real opinion — keep it genuine" },
      { icon:"⏱", text:"Your hook must land in the first 2 seconds or viewers scroll away" },
    ],
    question:{ type:"quiz", question:"Which of these is a strong opening hook?",
      options:[
        { id:"a", text:"\"Hey guys, welcome back to my channel!\"" },
        { id:"b", text:"\"Hi, today I'm going to show you some cute outfits.\"" },
        { id:"c", text:"\"I wore the same 3 pieces 7 different ways — here's how.\"" },
        { id:"d", text:"\"So I just got a package and wanted to share it with you all.\"" },
      ],
      correct:"c", explanation:"Option C is specific, creates curiosity, and promises value immediately. The others start with generic greetings or vague setups that lose viewers before the video begins.",
    },
  },
  {
    id:3, title:"Daily Upkeep", subtitle:"Dashboard Check-Ins, Comments & Uploads",
    description:[
      "Consistency isn't just about posting — it's the routine behind it. Top creators spend 15–20 minutes per day on upkeep.",
      "Put these daily tasks in the right order, from most to least important.",
    ],
    highlights:[
      { icon:"📊", text:"Check your dashboard for new briefs every morning" },
      { icon:"🎥", text:"Film and post your scheduled content for the day" },
      { icon:"📤", text:"Upload your raw footage to the platform after filming" },
      { icon:"💬", text:"Engage with comments — reply within the first hour of posting" },
      { icon:"📈", text:"Review analytics from your last post before sleeping" },
    ],
    question:{ type:"drag", prompt:"Order these daily tasks from most → least important:",
      items:[
        { id:"engage", text:"💬 Engage with comments" },
        { id:"upload", text:"📤 Upload raw footage" },
        { id:"brief",  text:"📊 Check dashboard for new briefs" },
        { id:"film",   text:"🎥 Film your scheduled content" },
        { id:"analytics", text:"📈 Review last post's analytics" },
      ],
      correctOrder:["brief","film","upload","engage","analytics"],
      explanation:"Start your day by checking for briefs (so you know what to film), then create and upload content, engage with your community, and wind down by reviewing analytics to improve tomorrow.",
    },
  },
  {
    id:4, title:"Guidelines", subtitle:"Lighting, Language & Music Rules",
    description:[
      "Cloud Closet has non-negotiable content standards that protect the brand and keep your content performing.",
      "Lighting requirements, banned phrases, and music usage rights are all covered here — read these carefully.",
    ],
    highlights:[
      { icon:"💡", text:"Lighting: Natural or ring light only — no dark or grainy footage" },
      { icon:"🚫", text:"No-Go phrases: \"cheap,\" \"buy now,\" \"sale,\" \"limited time,\" \"hurry\"" },
      { icon:"🎵", text:"Music: TikTok commercial sounds only — no unlicensed audio" },
      { icon:"🎨", text:"Background: Clean and uncluttered, no competitor brand items visible" },
    ],
    question:{ type:"quiz", question:"Which caption is NOT allowed in Cloud Closet content?",
      options:[
        { id:"a", text:"\"I've been styling this three different ways all week.\"" },
        { id:"b", text:"\"This is the most versatile piece in my closet right now.\"" },
        { id:"c", text:"\"So cheap — you need to buy this before it sells out!\"" },
        { id:"d", text:"\"I tested this outfit for a full week, here's my honest take.\"" },
      ],
      correct:"c", explanation:"Option C contains two banned phrases: \"cheap\" (undermines brand positioning) and \"buy\" (pushy sales language). All other options reflect authentic Cloud Closet voice.",
    },
  },
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

// ─── Quiz Section (Levels 2–4) ──────────────────────────────────────────────────

function QuizSection({ question, onPass }: { question:QuizQ; onPass:()=>void }) {
  const [selected, setSelected] = useState<string|null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === question.correct;
  function submit() { if (!selected) return; setSubmitted(true); if (selected===question.correct) setTimeout(onPass,1400); }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-extrabold text-slate-700 leading-[1.6]">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.options.map(opt => {
          const isSel=selected===opt.id, isRight=opt.id===question.correct;
          let cls="w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm transition-all duration-200 ";
          if (!submitted) cls+=isSel?"border-[#1a2f4a] bg-[#1a2f4a]/5 text-[#1a2f4a] font-semibold shadow-sm":"border-slate-200 bg-white text-slate-700 hover:border-[#4a8fd4]/50 hover:bg-slate-50 active:scale-[0.99]";
          else if (isRight) cls+="border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold";
          else if (isSel) cls+="border-red-300 bg-red-50 text-red-700";
          else cls+="border-slate-100 bg-slate-50/60 text-slate-400";
          return (
            <button key={opt.id} className={cls} onClick={() => !submitted&&setSelected(opt.id)} disabled={submitted}>
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold" style={{borderColor:"currentColor"}}>{opt.id.toUpperCase()}</span>
                <span className="flex-1 text-left leading-[1.6]">{opt.text}</span>
                {submitted&&isRight&&<IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/>}
                {submitted&&isSel&&!isRight&&<IcoX size={15} className="text-red-400 flex-shrink-0"/>}
              </span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <PrimaryBtn onClick={submit} disabled={!selected}>Submit Answer</PrimaryBtn>
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`rounded-2xl p-4 border ${isCorrect?"bg-emerald-50 border-emerald-200":"bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect?<IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/>:<IcoX size={15} className="text-red-400 flex-shrink-0"/>}
            <p className={`font-extrabold text-sm ${isCorrect?"text-emerald-700":"text-red-600"}`}>{isCorrect?"Correct! Moving to the next module…":"Not quite — try again!"}</p>
          </div>
          <p className="text-xs text-slate-600 leading-[1.6]">{question.explanation}</p>
          {!isCorrect&&<button onClick={()=>{setSelected(null);setSubmitted(false);}} className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 font-bold"><IcoRefresh size={11}/> Try again</button>}
        </motion.div>
      )}
    </div>
  );
}

function DragDropSection({ question, onPass }: { question:DragQ; onPass:()=>void }) {
  const [items, setItems] = useState([...question.items]);
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number|null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null);
  const isCorrect = items.map(i=>i.id).join(",")===question.correctOrder.join(",");
  function move(from:number, to:number) { const n=[...items]; const [x]=n.splice(from,1); n.splice(to,0,x); setItems(n); }
  function handleSubmit() { setSubmitted(true); if(isCorrect) setTimeout(onPass,1400); }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-extrabold text-slate-700 leading-[1.6]">{question.prompt}</p>
        <p className="text-xs text-slate-400 mt-0.5">Drag to reorder, or use the ↑↓ buttons</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item,idx) => (
          <div key={item.id} draggable={!submitted}
            onDragStart={()=>setDragIdx(idx)} onDragEnter={()=>setDragOverIdx(idx)} onDragOver={e=>e.preventDefault()}
            onDragEnd={()=>{ if(dragIdx!==null&&dragOverIdx!==null&&dragIdx!==dragOverIdx) move(dragIdx,dragOverIdx); setDragIdx(null);setDragOverIdx(null); }}
            className={["flex items-center gap-3 px-3 py-3 rounded-2xl border-2 text-sm transition-all",
              submitted?"cursor-default":"cursor-grab active:cursor-grabbing",
              dragIdx===idx?"opacity-40 scale-[0.98]":"",
              dragOverIdx===idx&&dragIdx!==null&&dragIdx!==idx?"border-[#4a8fd4] bg-[#1a2f4a]/5 shadow-md":
              submitted?isCorrect?"border-emerald-300 bg-emerald-50":"border-slate-200 bg-white":
              "border-slate-200 bg-white hover:border-slate-300",
            ].filter(Boolean).join(" ")}>
            <IcoGrip size={15} className="text-slate-300 flex-shrink-0"/>
            <span className="w-5 h-5 rounded-full bg-[#1a2f4a] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">{idx+1}</span>
            <span className="flex-1 text-slate-700 leading-[1.6]">{item.text}</span>
            {!submitted&&(
              <div className="flex flex-col gap-0.5 ml-auto flex-shrink-0">
                <button onClick={()=>idx>0&&move(idx,idx-1)} disabled={idx===0} className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"><IcoArrowUp size={12}/></button>
                <button onClick={()=>idx<items.length-1&&move(idx,idx+1)} disabled={idx===items.length-1} className="p-1 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"><IcoArrowDown size={12}/></button>
              </div>
            )}
            {submitted&&isCorrect&&<IcoCheck size={14} className="text-emerald-500 flex-shrink-0 ml-auto"/>}
          </div>
        ))}
      </div>
      {!submitted ? (
        <PrimaryBtn onClick={handleSubmit}>Submit Order</PrimaryBtn>
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`rounded-2xl p-4 border ${isCorrect?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isCorrect?<IcoCheck size={15} className="text-emerald-500 flex-shrink-0"/>:<IcoX size={15} className="text-amber-500 flex-shrink-0"/>}
            <p className={`font-extrabold text-sm ${isCorrect?"text-emerald-700":"text-amber-700"}`}>{isCorrect?"Perfect order! Moving on…":"Not quite — give it another try!"}</p>
          </div>
          <p className="text-xs text-slate-600 leading-[1.6]">{question.explanation}</p>
          {!isCorrect&&<button onClick={()=>{setItems([...question.items]);setSubmitted(false);}} className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-600 font-bold"><IcoRefresh size={11}/> Try again</button>}
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
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["active","locked","locked","locked"]);
  const [showModal, setShowModal] = useState(false);
  const [l1Step, setL1Step] = useState<WizardStep>("intro");

  // Granular progress: L1 wizard has 8 sub-steps (intro=0 → quiz pass=8), then +1 per module for L2–L4 = 11 total
  const wizardIdx = WIZARD_STEPS.indexOf(l1Step);
  const completedModules = statuses.filter((s,i) => s==="completed" && i>0).length; // L2–L4 completions
  const l1Done = statuses[0]==="completed";
  const currentTicks = l1Done ? 8 + completedModules : wizardIdx;
  const progressPct = Math.min((currentTicks / TOTAL_TICKS) * 100, 100);

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
    if (moduleIdx+1<MODULES.length) setTimeout(()=>setCurrentModule(moduleIdx+1), 900);
    else setTimeout(()=>{ triggerConfetti(); setShowModal(true); }, 900);
  }

  const mod = MODULES[currentModule];
  const isCompleted = statuses[currentModule]==="completed";

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Creator Onboarding</h1>
        <p className="text-sm text-slate-500 mt-1 leading-[1.6]">Complete all 4 modules to unlock your creator dashboard</p>
      </div>

      {/* Progress card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Training Progress</p>
          <p className="text-[11px] font-extrabold text-[#1a2f4a]">{Math.round(progressPct)}% complete</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#1a2f4a] to-[#4a8fd4]"
            animate={{ width:`${progressPct}%` }}
            transition={{ duration:0.6, ease:"easeOut" as const }}
          />
        </div>
        <Stepper modules={MODULES} statuses={statuses} current={currentModule} onChange={setCurrentModule}/>
      </div>

      {/* Module card */}
      <motion.div key={currentModule} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}
        className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Navy header */}
        <div className="bg-gradient-to-r from-[#1a2f4a] to-[#1e3a5f] px-5 py-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-[0.14em]">Level {mod.id} of {MODULES.length}</p>
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
          {/* Level 1 wizard */}
          {mod.wizardMode && !isCompleted && (
            <Level1Wizard key="l1" onPass={() => handlePass(0)} onStepChange={s => setL1Step(s)}/>
          )}
          {mod.wizardMode && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <IcoCheck size={28} className="text-emerald-500"/>
              </div>
              <p className="text-base font-extrabold text-slate-700">Level 1 Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">Your account is set up and you know the warm-up plan. Select Level 2 above to continue.</p>
            </div>
          )}

          {/* Levels 2–4 */}
          {!mod.wizardMode && (
            <div className="flex flex-col gap-5">
              {mod.description && (
                <div className="flex flex-col gap-2">
                  {mod.description.map((para,i) => (
                    <p key={i} className="text-sm text-slate-600 leading-[1.6]">{para}</p>
                  ))}
                </div>
              )}
              {mod.highlights && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">Key Takeaways</p>
                  <div className="flex flex-col gap-2.5">
                    {mod.highlights.map((h,i) => (
                      <SlideItem key={i} i={i}>
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="text-base flex-shrink-0 leading-snug">{h.icon}</span>
                          <span className="leading-[1.6]">{h.text}</span>
                        </div>
                      </SlideItem>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <IcoStar size={14} className="text-amber-400"/>
                  <p className="text-sm font-extrabold text-slate-700">Knowledge Check</p>
                  {isCompleted && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <IcoCheck size={11}/> Passed
                    </span>
                  )}
                </div>
                {isCompleted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                    <IcoCheck size={28} className="text-emerald-500 mx-auto mb-2"/>
                    <p className="text-sm font-extrabold text-emerald-700">Module Complete!</p>
                    <p className="text-xs text-slate-500 mt-1 leading-[1.6]">Select the next module above to continue.</p>
                  </div>
                ) : mod.question?.type==="quiz" ? (
                  <QuizSection key={`quiz-${currentModule}`} question={mod.question as QuizQ} onPass={() => handlePass(currentModule)}/>
                ) : mod.question?.type==="drag" ? (
                  <DragDropSection key={`drag-${currentModule}`} question={mod.question as DragQ} onPass={() => handlePass(currentModule)}/>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {showModal && <WelcomeModal onClose={() => setShowModal(false)}/>}
    </div>
  );
}
