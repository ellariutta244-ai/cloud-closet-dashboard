"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons ────────────────────────────────────────────────────────────────────────
const IcoCheck = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoChevronRight = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoChevronLeft = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoChevronDown = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcoLock = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoAlert = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
  </svg>
);
const IcoStar = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ─── Shared UI ────────────────────────────────────────────────────────────────────

type ModuleStatus = "locked" | "active" | "completed";

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a2f4a] to-[#26476e] text-white font-extrabold text-sm tracking-wide
        shadow-[0_6px_24px_rgba(26,47,74,0.45)] hover:shadow-[0_8px_32px_rgba(26,47,74,0.55)]
        hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none
        transition-all duration-200 flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

function SectionHeader({ n, total, label }: { n: number; total: number; label: string }) {
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

function SectionDoneTag() {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-xs font-bold text-emerald-600">
      <IcoCheck size={13}/> Section complete
    </motion.div>
  );
}

// ─── Module 5B — Interactive components ──────────────────────────────────────────

const PROFILE_CHECKLIST_ITEMS = [
  { title: "Username", guidance: "Keep it clean, simple, and easy to remember. Avoid numbers, underscores, or anything that looks auto-generated. If you're building a personal creator brand, use your name or a simple variation. You can always change it — but consistency over time builds recognition, so choose something you can commit to." },
  { title: "Profile photo", guidance: "Use a real photo of yourself — well-lit, in frame, ideally showing an outfit. A real face matters for UGC credibility. Avoid logos, cartoons, or blurry selfies. The profile photo is the first signal that a real person is behind this account." },
  { title: "Bio", guidance: "You have 80 characters. Use them to communicate what your content is about, not adjectives about yourself. 'Outfits, closet stories, and the Cloud Closet community' is more useful than 'fashion lover ✨ style inspo 🧥.' End with a CTA if you have a link." },
  { title: "Link in bio", guidance: "Set this to the Cloud Closet download link or your creator-specific referral link if one is provided. This is your primary CTA landing spot for every video — verify it works before you post anything." },
];

function ProfileChecklistBuilder({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<boolean[]>([false, false, false, false]);
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const [seen, setSeen] = useState<boolean[]>([false, false, false, false]);

  function toggle(i: number) {
    setExpanded(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
    setSeen(prev => { const n = [...prev]; n[i] = true; return n; });
  }
  function check(i: number) {
    setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }
  const allComplete = checked.every(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Expand each item — check it off when done</p>
      </div>
      {PROFILE_CHECKLIST_ITEMS.map((item, i) => {
        const isOpen = expanded[i];
        const isDone = checked[i];
        return (
          <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
            isDone ? "border-emerald-200 bg-emerald-50/60" : isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : "border-slate-200 bg-white"
          }`}>
            <div className="w-full flex items-center gap-3 px-4 py-3.5">
              <button
                onClick={e => { e.stopPropagation(); if (seen[i]) check(i); }}
                disabled={!seen[i]}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isDone ? "bg-emerald-500 border-emerald-500" : seen[i] ? "border-slate-300 hover:border-emerald-400 cursor-pointer" : "border-slate-200 opacity-40 cursor-not-allowed"
                }`}
              >
                {isDone && <IcoCheck size={11} className="text-white"/>}
              </button>
              <button onClick={() => toggle(i)} className="flex items-center gap-2 flex-1 text-left">
                <p className={`text-sm font-extrabold flex-1 ${isDone ? "text-emerald-700" : "text-slate-800"}`}>{item.title}</p>
                <IcoChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}/>
              </button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  transition={{duration:0.25,ease:"easeOut" as const}} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-[1.65]">{item.guidance}</p>
                    {!isDone && seen[i] && (
                      <button onClick={() => check(i)} className="mt-3 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] flex items-center gap-1 transition-colors">
                        <IcoCheck size={12}/> Mark as done
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {allComplete && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SETTINGS_TURN_ON = [
  "Creator account (not personal)",
  "Allow Duet and Stitch",
  "Public account visibility",
  "Auto-captions",
  "Analytics access",
];
const SETTINGS_CHECK = [
  "Location set correctly",
  "Content preferences unrestricted",
  "Comments set to public",
  "TikTok LIVE access (available at 1K followers)",
];

function SettingsToggleChecklist({ onDone }: { onDone: () => void }) {
  const [on, setOn] = useState<boolean[]>(Array(SETTINGS_TURN_ON.length).fill(false));
  const [checked, setChecked] = useState<boolean[]>(Array(SETTINGS_CHECK.length).fill(false));
  const allOn = on.every(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-1">Turn these on</p>
          {SETTINGS_TURN_ON.map((label, i) => (
            <button key={i} onClick={() => setOn(prev => { const n=[...prev]; n[i]=!n[i]; return n; })}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                on[i] ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:border-[#4a8fd4]/40"
              }`}>
              <div className={`w-9 h-5 rounded-full transition-all duration-200 flex items-center flex-shrink-0 ${on[i] ? "bg-emerald-500" : "bg-slate-200"}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 mx-0.5 ${on[i] ? "translate-x-4" : "translate-x-0"}`}/>
              </div>
              <p className={`text-xs font-semibold flex-1 ${on[i] ? "text-emerald-700" : "text-slate-600"}`}>{label}</p>
              {on[i] && <IcoCheck size={13} className="text-emerald-500 flex-shrink-0"/>}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">Check these</p>
          {SETTINGS_CHECK.map((label, i) => (
            <button key={i} onClick={() => setChecked(prev => { const n=[...prev]; n[i]=!n[i]; return n; })}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                checked[i] ? "border-[#4a8fd4]/30 bg-[#4a8fd4]/5" : "border-slate-200 bg-white hover:border-slate-300"
              }`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked[i] ? "bg-[#4a8fd4] border-[#4a8fd4]" : "border-slate-300"
              }`}>
                {checked[i] && <IcoCheck size={10} className="text-white"/>}
              </div>
              <p className={`text-xs font-semibold leading-[1.4] ${checked[i] ? "text-[#1a2f4a]" : "text-slate-600"}`}>{label}</p>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {allOn && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-4 flex gap-3">
              <IcoAlert size={16} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-slate-700 leading-[1.65]">
                <span className="font-extrabold">Don&apos;t set your account to private while you&apos;re getting started.</span> A private account cannot appear on the FYP and cannot be found through search. You need to be public from day one.
              </p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountBrief({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ready = value.trim().length >= 15;

  function submit() {
    if (!ready) return;
    setSubmitted(true);
    setTimeout(onDone, 600);
  }

  if (submitted) {
    return (
      <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.3,ease:"easeOut" as const}}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2"><IcoCheck size={16} className="text-emerald-500"/><p className="text-sm font-extrabold text-emerald-700">Saved.</p></div>
        <p className="text-xs text-slate-600 leading-[1.6]">This is your filter for every content decision you make.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-500 italic leading-[1.6]">Example: &ldquo;My account is where I document getting dressed, share what I discover on Cloud Closet, and show the real story behind what I wear.&rdquo;</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-extrabold text-slate-700">My account is where I</label>
        <textarea value={value} onChange={e => setValue(e.target.value)} rows={3}
          placeholder="document what I actually wear every day and connect it to the Cloud Closet community..."
          className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"
        />
        <p className={`text-[10px] font-bold text-right transition-colors ${ready ? "text-emerald-500" : "text-slate-300"}`}>
          {value.trim().length} chars{value.trim().length < 15 ? ` · ${15 - value.trim().length} more to unlock` : " · ✓"}
        </p>
      </div>
      <PrimaryBtn onClick={submit} disabled={!ready}>Save and complete module <IcoChevronRight size={16}/></PrimaryBtn>
    </div>
  );
}

function Module5BContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 4;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);

  const segClass = (n: number) => {
    const done = [s1Done,s2Done,s3Done,s4Done][n-1];
    if (done) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function advance(n: number) {
    [setS1Done,setS2Done,setS3Done,setS4Done][n-1](true);
    if (n < TOTAL) setTimeout(() => setSection(n+1), 600);
    else setTimeout(onComplete, 800);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-1">{[1,2,3,4].map(n => <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(n)}`}/>)}</div>

      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <SectionHeader n={1} total={TOTAL} label="Before you film anything"/>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Your account is your first impression</h3>
          <p className="text-sm text-slate-600 leading-[1.7]">A creator with a well-configured account and 200 followers will be taken more seriously than a creator with a messy account and 2,000. Cloud Closet looks at your profile before it looks at your content. Brands do the same. The setup takes 20 minutes and you only do it once — get it right from the start.</p>
          <div className="bg-[#1a2f4a]/4 border-l-4 border-[#1a2f4a] rounded-r-2xl px-4 py-4">
            <p className="text-xs font-extrabold text-[#1a2f4a] uppercase tracking-widest mb-2">Personal vs. creator account</p>
            <p className="text-sm text-slate-600 leading-[1.65]">There&apos;s a difference between your personal TikTok account and your UGC creator account. You don&apos;t need to delete your personal account. But if your personal account is off-brand, inconsistent, or full of content unrelated to style — set up a separate account for your Cloud Closet UGC work. This keeps your creator presence clean and intentional.</p>
          </div>
        </div>
        {!s1Done ? <ProfileChecklistBuilder onDone={() => advance(1)}/> : <SectionDoneTag/>}
      </motion.div>

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="Account settings"/>
          <h3 className="text-base font-extrabold text-slate-800">A few settings that actually affect your reach</h3>
          {!s2Done ? <SettingsToggleChecklist onDone={() => advance(2)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="Posting cadence"/>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-slate-800">How often to post and why it matters algorithmically</h3>
            <p className="text-sm text-slate-600 leading-[1.7]">Posting 3 or more times per week produces significantly higher follower growth than sporadic posting, regardless of video quality. This isn&apos;t because quantity beats quality — it&apos;s because consistent posting gives the algorithm more data to understand your content, builds a warmer follower base that performs better in Wave 1 testing, and compounds your discoverability over time. For Cloud Closet creators: aim for a minimum of 3 posts per week while you&apos;re getting started. Imperfect content that goes up consistently will always outperform perfect content that rarely goes up.</p>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-4 flex gap-3">
              <IcoCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">Week 1 starting cadence</p>
                <p className="text-xs text-slate-700 leading-[1.65]">3 posts — one per format (try the Relatable Getting-Dressed Moment, the Outfit Showcase, and the GRWM). Use these to find what feels most natural on camera. Don&apos;t optimize yet — just post and observe.</p>
              </div>
            </div>
          </div>
          {!s3Done ? <PrimaryBtn onClick={() => advance(3)}>Got it — continue to Section 4 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Niche consistency"/>
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-extrabold text-slate-800">Write your account brief before you post anything</h3>
            <p className="text-sm text-slate-600 leading-[1.7]">Before you start posting, write one sentence that describes your account — not a bio, a brief for yourself. This keeps your content choices anchored when you&apos;re not sure what to post.</p>
          </div>
          {!s4Done
            ? <AccountBrief onDone={() => advance(4)}/>
            : (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
                <div><p className="text-sm font-extrabold text-emerald-700">Module 5B complete!</p><p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to overview — Module 6B is now unlocked.</p></div>
              </motion.div>
            )}
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module 6B — Interactive components ──────────────────────────────────────────

const GEAR_ITEMS = [
  { title: "Phone", guidance: "Always use the rear camera — it's significantly higher quality than front-facing. Film in portrait mode (vertical). Lock exposure before filming: tap and hold the subject on screen until AE/AF lock appears." },
  { title: "Lighting", guidance: "Face a window. Natural window light from the front is soft, flattering, and free. Light source in front of you, not behind you — filming with a window behind creates a silhouette. At night: a basic ring light or LED panel costs under $30. Avoid overhead-only lighting — it creates harsh shadows." },
  { title: "Audio", guidance: "This is the most important and most overlooked element. Bad audio loses viewers faster than bad visuals. Rules: no wind, no echo (film in a bedroom not a bathroom), no competing background noise. If you want to upgrade one thing: a $20 clip-on lavalier mic is the single highest-ROI gear purchase a beginner can make." },
  { title: "Stability", guidance: "Don't hold your phone and film yourself at the same time. Prop your phone against books, a mug, or a water bottle — or buy a $10 phone tripod. For full-body outfit shots, set your phone at waist height and use the timer or a Bluetooth remote to film yourself." },
  { title: "Editing app", guidance: "Use CapCut. It's free, TikTok-native, and has everything you need: cuts, text overlays, auto-captions, speed adjustments, and trending sound integration. Start here before considering anything else." },
];

function GearAccordion({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<boolean[]>(Array(GEAR_ITEMS.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(GEAR_ITEMS.length).fill(false));

  function toggle(i: number) {
    setExpanded(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }
  const allSeen = seen.every(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2"><IcoStar size={13} className="text-amber-400"/><p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Open all 5 categories to continue</p></div>
        <span className="text-[10px] font-bold text-slate-400">{seen.filter(Boolean).length}/5 opened</span>
      </div>
      {GEAR_ITEMS.map((item, i) => {
        const isOpen = expanded[i];
        const isSeen = seen[i];
        return (
          <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
            isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : isSeen ? "border-emerald-200/60 bg-emerald-50/40" : "border-slate-200 bg-white"
          }`}>
            <button onClick={() => toggle(i)} className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSeen ? "bg-[#1a2f4a] text-white" : "bg-slate-100 text-slate-400"}`}>
                {isSeen ? <IcoCheck size={11}/> : <IcoChevronRight size={11}/>}
              </div>
              <p className="text-sm font-extrabold text-slate-800 flex-1">{item.title}</p>
              <IcoChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}/>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  transition={{duration:0.28,ease:"easeOut" as const}} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-[1.65]">{item.guidance}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {allSeen && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FILMING_CARDS = [
  { front: "Frame yourself correctly", back: "Eyes in the upper third of the frame, not the center. Leave headroom. For outfit videos, shoot from far enough that your full body is visible — film from distance and crop in editing." },
  { front: "Start rolling before you start talking", back: "Begin recording 2–3 seconds before you speak. This gives you clean footage to cut into and prevents the awkward open-mouth-mid-word hook that wastes your first impression." },
  { front: "Film more than you think you need", back: "A 30-second video might require 3–5 minutes of raw footage. Don't stop because you stumbled — keep rolling, then cut it. A natural recovery often looks better than a perfect first take anyway." },
  { front: "Move the camera", back: "Static footage for an entire video is harder to watch. A subtle zoom, walking toward camera, or a cut to a phone screen closeup keeps visual energy up without feeling gimmicky." },
  { front: "Film B-roll", back: "B-roll is supplementary footage over your voice — outfit details, the Cloud Closet app screen, your hands in your closet. Film 3–5 B-roll clips per video. It makes editing easier, hides imperfect takes, and makes the final video feel more dynamic." },
];

function FilmingFlipCards({ onDone }: { onDone: () => void }) {
  const [flipped, setFlipped] = useState<boolean[]>(Array(FILMING_CARDS.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(FILMING_CARDS.length).fill(false));

  function flip(i: number) {
    setFlipped(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }
  const allSeen = seen.every(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2"><IcoStar size={13} className="text-amber-400"/><p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Tap each card to flip it</p></div>
        <span className="text-[10px] font-bold text-slate-400">{seen.filter(Boolean).length}/5 flipped</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FILMING_CARDS.map((card, i) => (
          <div key={i} className="cursor-pointer" style={{perspective:"800px",height:"128px"}} onClick={() => flip(i)}>
            <motion.div
              animate={{rotateY: flipped[i] ? 180 : 0}}
              transition={{duration:0.45,ease:"easeInOut" as const}}
              style={{transformStyle:"preserve-3d",position:"relative",width:"100%",height:"100%"}}
            >
              <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"} as React.CSSProperties}
                className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center px-4 text-center ${
                  seen[i] ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-[#1a2f4a]/3 hover:border-[#4a8fd4]/40"
                }`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tip {i+1}</p>
                <p className="text-sm font-extrabold text-slate-700 leading-tight">{card.front}</p>
                <p className="text-[10px] text-slate-400 mt-2">{seen[i] ? "✓ flipped" : "tap to reveal"}</p>
              </div>
              <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)"} as React.CSSProperties}
                className="absolute inset-0 rounded-2xl border-2 border-[#4a8fd4]/30 bg-gradient-to-br from-[#1a2f4a] to-[#1e3a5f] flex flex-col justify-center px-4 overflow-auto">
                <p className="text-xs text-white/90 leading-[1.6]">{card.back}</p>
                <p className="text-[9px] text-white/40 mt-2 font-bold uppercase tracking-widest">tap to flip back</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {allSeen && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 4 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const EDITING_PRINCIPLES = [
  { label: "Cut on the word, not after it", detail: "Cut between takes mid-action rather than waiting for silence. Cuts that land on the beat of a word or movement feel energetic. Cuts into silence feel slow." },
  { label: "Remove every pause longer than half a second", detail: "Silence is the enemy of completion rate. If you need a transition, use a B-roll cut rather than dead air." },
  { label: "Add on-screen text to every video", detail: "At minimum: hook text in the first 3 seconds. Ideally: 2–3 text overlays reinforcing key points or adding a second meaning layer. Use CapCut's auto-caption as a starting point, then clean it up." },
  { label: "Sound-off test", detail: "Watch your finished video with no sound before posting. If it's unclear what the video is about — add more on-screen text. A large portion of TikTok is watched on mute." },
  { label: "Export at highest resolution", detail: "Always export at 1080p, 60fps if available. TikTok compresses uploaded video — starting with highest quality means the compressed version looks better." },
];

function EditingChecklist({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<boolean[]>(Array(EDITING_PRINCIPLES.length).fill(false));
  const [checked, setChecked] = useState<boolean[]>(Array(EDITING_PRINCIPLES.length).fill(false));
  const allChecked = checked.every(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Mark each one as understood</p>
      </div>
      {EDITING_PRINCIPLES.map((p, i) => {
        const isOpen = expanded[i];
        const isDone = checked[i];
        return (
          <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
            isDone ? "border-emerald-200 bg-emerald-50/60" : isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : "border-slate-200 bg-white"
          }`}>
            <div className="w-full flex items-center gap-3 px-4 py-3.5">
              <div onClick={() => setChecked(prev => { const n=[...prev]; n[i]=!n[i]; return n; })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-400"
                }`}>
                {isDone && <IcoCheck size={11} className="text-white"/>}
              </div>
              <button onClick={() => setExpanded(prev => { const n=[...prev]; n[i]=!n[i]; return n; })} className="flex items-center gap-2 flex-1 text-left">
                <p className={`text-sm font-extrabold flex-1 ${isDone ? "text-emerald-700" : "text-slate-800"}`}>{p.label}</p>
                <IcoChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}/>
              </button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  transition={{duration:0.25,ease:"easeOut" as const}} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-[1.65]">{p.detail}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {allChecked && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-4 flex gap-3">
              <IcoAlert size={16} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-slate-700 leading-[1.65]"><span className="font-extrabold">The most common beginner editing mistake: over-editing.</span> Excessive transitions, too many effects, and heavy filters break the native feel. Cut cleanly, add text, balance audio, and stop there.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Complete Module 6B <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Module6BContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 4;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);

  const segClass = (n: number) => {
    const done = [s1Done,s2Done,s3Done,s4Done][n-1];
    if (done) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function advance(n: number) {
    [setS1Done,setS2Done,setS3Done,setS4Done][n-1](true);
    if (n < TOTAL) setTimeout(() => setSection(n+1), 600);
    else setTimeout(onComplete, 800);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-1">{[1,2,3,4].map(n => <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(n)}`}/>)}</div>

      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <SectionHeader n={1} total={TOTAL} label="The right mindset"/>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">&ldquo;Authentic&rdquo; is not an excuse for hard to watch</h3>
          <p className="text-sm text-slate-600 leading-[1.7]">Cloud Closet content is meant to feel real and native — not polished and produced. But &apos;real&apos; doesn&apos;t mean sloppy. Bad lighting, muffled audio, and shaky framing are not authenticity signals — they&apos;re friction that makes people scroll away. The goal is to look like a real person made this thoughtfully. That bar is achievable with a phone and a window.</p>
        </div>
        {!s1Done ? <PrimaryBtn onClick={() => advance(1)}>Got it — continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
      </motion.div>

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="Gear"/>
          {!s2Done ? <GearAccordion onDone={() => advance(2)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="Filming"/>
          {!s3Done ? <FilmingFlipCards onDone={() => advance(3)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Editing"/>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-slate-800">Five editing principles</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Mark each one as understood.</p>
          </div>
          {!s4Done
            ? <EditingChecklist onDone={() => advance(4)}/>
            : (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
                <div><p className="text-sm font-extrabold text-emerald-700">Module 6B complete!</p><p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to overview — Module 7B is now unlocked.</p></div>
              </motion.div>
            )}
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module 7B — Interactive components ──────────────────────────────────────────

const PORTFOLIO_ITEMS = [
  { title: "3–5 Cloud Closet UGC videos", detail: "Each should use a different format from Module 5 to demonstrate range. Use at least one hook type from Module 4 in each video. These don't have to be published on TikTok — they can be practice rounds filmed specifically for the portfolio. If published, include any real performance data alongside the link." },
  { title: "A one-paragraph creator bio", detail: "3–5 sentences. Who you are, what you make, and why you connect with Cloud Closet's brand. Write it in the same voice you use on camera — not formal, not a resume. It should sound like you, not a job application." },
  { title: "Stats (if you have them)", detail: "If your videos have been posted and have data, include it. Prioritize completion rate, saves, and shares over raw view count. If you have no stats yet, skip this section entirely. The videos are the portfolio — stats are supporting evidence." },
];

function PortfolioChecklist({ onDone }: { onDone: () => void }) {
  const [expanded, setExpanded] = useState<boolean[]>(Array(PORTFOLIO_ITEMS.length).fill(false));
  const [checked, setChecked] = useState<boolean[]>(Array(PORTFOLIO_ITEMS.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(PORTFOLIO_ITEMS.length).fill(false));

  function toggle(i: number) {
    setExpanded(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }
  const allChecked = checked.every(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <IcoStar size={13} className="text-amber-400"/>
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Review and check off each requirement</p>
      </div>
      {PORTFOLIO_ITEMS.map((item, i) => {
        const isOpen = expanded[i];
        const isDone = checked[i];
        return (
          <motion.div key={i} layout className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
            isDone ? "border-emerald-200 bg-emerald-50/60" : isOpen ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/3" : "border-slate-200 bg-white"
          }`}>
            <div className="w-full flex items-center gap-3 px-4 py-3.5">
              <button onClick={e => { e.stopPropagation(); if (seen[i]) setChecked(prev => { const n=[...prev]; n[i]=!n[i]; return n; }); }}
                disabled={!seen[i]}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isDone ? "bg-emerald-500 border-emerald-500 cursor-pointer" : seen[i] ? "border-slate-300 hover:border-emerald-400 cursor-pointer" : "border-slate-200 opacity-40 cursor-not-allowed"
                }`}>
                {isDone && <IcoCheck size={11} className="text-white"/>}
              </button>
              <button onClick={() => toggle(i)} className="flex items-center gap-2 flex-1 text-left">
                <p className={`text-sm font-extrabold flex-1 ${isDone ? "text-emerald-700" : "text-slate-800"}`}>{item.title}</p>
                <IcoChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}/>
              </button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  transition={{duration:0.25,ease:"easeOut" as const}} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-[1.65]">{item.detail}</p>
                    {!isDone && seen[i] && (
                      <button onClick={() => setChecked(prev => { const n=[...prev]; n[i]=true; return n; })} className="mt-3 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] flex items-center gap-1 transition-colors">
                        <IcoCheck size={12}/> Mark as understood
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {allChecked && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlatformSelector({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<"notion" | "drive" | null>(null);

  const content = {
    notion: "Create a new Notion page. Add your creator bio at the top. Embed video links as bookmarks or paste TikTok URLs (they preview inline). Create a simple table: Format / Hook Used / View Count / Completion Rate / Saves. Share as \"Anyone with the link.\"",
    drive: "Create a folder: \"[Your Name] — Cloud Closet Portfolio.\" Upload video files directly or add a doc with links. Add a one-page PDF or doc with your bio and stats. Share settings: \"Anyone with the link can view.\"",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {(["notion","drive"] as const).map(p => (
          <button key={p} onClick={() => setSelected(p)}
            className={[
              "text-left rounded-2xl border-2 p-4 transition-all duration-200",
              selected === p ? "border-[#1a2f4a] bg-[#1a2f4a]/5 shadow-sm" : "border-slate-200 bg-white hover:border-[#4a8fd4]/40",
            ].join(" ")}>
            <p className={`text-sm font-extrabold mb-0.5 ${selected === p ? "text-[#1a2f4a]" : "text-slate-700"}`}>{p === "notion" ? "Notion" : "Google Drive"}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{p === "notion" ? "Best for structure + sharing" : "Best for file storage"}</p>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div key={selected} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.25,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">{selected === "notion" ? "Notion setup" : "Google Drive setup"}</p>
              <p className="text-xs text-slate-600 leading-[1.7]">{content[selected]}</p>
            </div>
            <div className="bg-[#1a2f4a]/4 border-l-4 border-[#1a2f4a] rounded-r-2xl px-4 py-4">
              <p className="text-xs font-extrabold text-[#1a2f4a] uppercase tracking-widest mb-2">Portfolio review test</p>
              <p className="text-xs text-slate-600 leading-[1.65]">Before you share with Cloud Closet, open your portfolio link in an incognito browser window. Does it load? Are the videos watchable? Is the bio readable? Would you give this creator a brief? If no to any of these — fix it before sending.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 4 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BeginnerReflection({ onDone }: { onDone: () => void }) {
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ready = a1.trim().length >= 20 && a2.trim().length >= 15;

  function submit() {
    if (!ready) return;
    setSubmitted(true);
    setTimeout(onDone, 600);
  }

  if (submitted) {
    return (
      <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.3,ease:"easeOut" as const}}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
        <IcoCheck size={18} className="text-emerald-500 flex-shrink-0"/>
        <p className="text-sm font-extrabold text-emerald-700">Reflection saved.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold text-slate-700 leading-[1.5]">What format from Module 5 do you plan to use for your first portfolio video, and what&apos;s the genuine personal moment you&apos;re building it around?</label>
        <textarea value={a1} onChange={e => setA1(e.target.value)} rows={3}
          placeholder="e.g. The Relatable Getting-Dressed Moment — I'm going to open with my actual closet problem..."
          className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"
        />
        <p className={`text-[10px] font-bold text-right transition-colors ${a1.trim().length >= 20 ? "text-emerald-500" : "text-slate-300"}`}>
          {a1.trim().length} chars{a1.trim().length < 20 ? ` · ${20 - a1.trim().length} more to unlock` : " · ✓"}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold text-slate-700 leading-[1.5]">What&apos;s the one production element you know you need to work on most before your first filming session?</label>
        <textarea value={a2} onChange={e => setA2(e.target.value)} rows={3}
          placeholder="e.g. Lighting — I need to figure out where in my apartment the natural light is best..."
          className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"
        />
        <p className={`text-[10px] font-bold text-right transition-colors ${a2.trim().length >= 15 ? "text-emerald-500" : "text-slate-300"}`}>
          {a2.trim().length} chars{a2.trim().length < 15 ? ` · ${15 - a2.trim().length} more to unlock` : " · ✓"}
        </p>
      </div>
      <PrimaryBtn onClick={submit} disabled={!ready}>Submit reflection <IcoChevronRight size={16}/></PrimaryBtn>
    </div>
  );
}

function Module7BContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 4;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const segClass = (n: number) => {
    const done = [s1Done,s2Done,s3Done,s4Done][n-1];
    if (done) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function advance(n: number) {
    [setS1Done,setS2Done,setS3Done,setS4Done][n-1](true);
    if (n < TOTAL) setTimeout(() => setSection(n+1), 600);
  }

  function onReflectionDone() {
    setS4Done(true);
    setTimeout(() => setShowCompletion(true), 900);
  }

  if (showCompletion) {
    return (
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <div className="flex gap-1">{[1,2,3,4].map(n => <div key={n} className="h-1 flex-1 rounded-full bg-[#4a8fd4]"/>)}</div>
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a2f4a] to-[#26476e] flex items-center justify-center shadow-lg">
            <IcoCheck size={28} className="text-white"/>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-tight">Beginner path complete.</h3>
            <p className="text-sm text-slate-500 mt-2 leading-[1.7] max-w-sm mx-auto">You have what you need to set up your account, film your first videos, and build a portfolio Cloud Closet can work with.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-400">Track 3 — Operating Procedures</p>
              <p className="text-xs text-slate-300 mt-0.5">Coming soon</p>
            </div>
            <IcoLock size={16} className="text-slate-300 flex-shrink-0"/>
          </div>
          <PrimaryBtn onClick={onComplete}>Finish Beginner Path <IcoChevronRight size={16}/></PrimaryBtn>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-1">{[1,2,3,4].map(n => <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(n)}`}/>)}</div>

      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6">
        <SectionHeader n={1} total={TOTAL} label="What a portfolio is and isn't"/>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Brands aren&apos;t buying your account. They&apos;re buying your content.</h3>
          <p className="text-sm text-slate-600 leading-[1.7]">A UGC portfolio is not a follower count. It&apos;s not a highlight reel of your personal moments. It&apos;s a curated set of videos demonstrating you can produce content that serves a brand&apos;s objective — authentically, reliably, and in the right voice. You can build a strong portfolio with zero paid work and zero followers. What you need is 3–5 well-made videos that show you understand what good UGC looks like.</p>
        </div>
        {!s1Done ? <PrimaryBtn onClick={() => advance(1)}>Got it — continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
      </motion.div>

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="What to put in it"/>
          {!s2Done ? <PortfolioChecklist onDone={() => advance(2)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="How to build the page"/>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-slate-800">Choose your platform</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Pick where you&apos;ll host your portfolio — either works.</p>
          </div>
          {!s3Done ? <PlatformSelector onDone={() => advance(3)}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-6 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Making your practice videos"/>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-slate-800">Your first videos don&apos;t need to be perfect. They need to be real.</h3>
            <p className="text-sm text-slate-600 leading-[1.7]">The best portfolio videos come from a genuine moment — not a staged demo. Use your own Cloud Closet account. Film a real morning. React to something you actually found in the app. Show an outfit you actually wore. The goal is to demonstrate you understand the Cloud Closet voice and can produce content native to it.</p>
            <div className="bg-[#4a8fd4]/8 border border-[#4a8fd4]/20 rounded-2xl px-4 py-4">
              <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">Before you film portfolio videos, revisit</p>
              <ul className="flex flex-col gap-1.5">
                {["Module 1 — brand pillars (make sure your concept connects to at least one)","Module 3 — video structure checklist","Module 5 — formats (use a different one for each portfolio video)"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <IcoChevronRight size={12} className="text-[#4a8fd4] flex-shrink-0 mt-0.5"/>
                    <p className="text-xs text-slate-600 leading-[1.6]">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {!s4Done ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-extrabold text-slate-800">Before you finish the Beginner path</h3>
                <p className="text-xs text-slate-500 leading-[1.6]">Two questions. No right answer — just your honest plan.</p>
              </div>
              <BeginnerReflection onDone={onReflectionDone}/>
            </div>
          ) : <SectionDoneTag/>}
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module 5A — Interactive components ──────────────────────────────────────────

const TREND_TOOLS = [
  { title: "TikTok Creative Center", usage: "Go to ads.tiktok.com/business/creativecenter. Filter by region and category (fashion/lifestyle). Check Trending Songs and Trending Hashtags daily. Use a trending sound in its first 24–48 hours — after that, benefit degrades fast." },
  { title: "TikTok Discover tab", usage: "Found in the app's Discover section. Shows rising hashtags in real time. Skim it every morning — 3 minutes. You're looking for trends where Cloud Closet fits naturally, not trends you'd have to stretch to fit." },
  { title: "Creator research", usage: "Identify 5–10 creators in fashion/style whose content performs well. Check their recent posts weekly. You're pattern-recognizing — what formats are working, what sounds are they using, what topics are generating comments?" },
  { title: "Your own analytics", usage: "Your best trend signal is your own performance data. What did your audience engage with most last week? That's a trend in your own niche. Build on it before you look for outside signals." },
];

function TrendToolMap({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState<boolean[]>(Array(TREND_TOOLS.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(TREND_TOOLS.length).fill(false));
  const allSeen = seen.every(Boolean);

  function toggle(i: number) {
    setOpen(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }

  return (
    <div className="flex flex-col gap-3">
      {TREND_TOOLS.map((tool, i) => (
        <div key={i} className={`border-2 rounded-2xl overflow-hidden transition-colors ${seen[i] ? "border-[#1a2f4a]/20" : "border-slate-200"}`}>
          <button onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              {seen[i]
                ? <IcoCheck size={13} className="text-emerald-500 flex-shrink-0"/>
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0"/>}
              <p className="text-sm font-extrabold text-slate-800">{tool.title}</p>
            </div>
            <motion.div animate={{rotate: open[i] ? 180 : 0}} transition={{duration:0.2}}>
              <IcoChevronDown size={14} className="text-slate-400 flex-shrink-0"/>
            </motion.div>
          </button>
          <AnimatePresence>
            {open[i] && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25,ease:"easeOut" as const}} style={{overflow:"hidden"}}>
                <div className="px-4 pb-4 pt-1">
                  <div className="bg-[#4a8fd4]/6 border border-[#4a8fd4]/20 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-600 leading-[1.7]">{tool.usage}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <AnimatePresence>
        {allSeen && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BEFORE_ITEMS = [
  "Write hooks for each video (3 variations each)",
  "Pull outfits and have them ready",
  "Check trending sounds — note 2–3 options",
  "Review any active Cloud Closet brief",
  "Write rough bullet points (not word-for-word scripts)",
];
const DURING_ITEMS = [
  "Film all hooks first across all videos",
  "Film body content for each",
  "Film 2–3 B-roll clips per video",
  "Don't edit as you go — stay in filming mode",
  "Label clips clearly before closing the camera",
];

function ContentDayPlanner({ onDone }: { onDone: () => void }) {
  const [before, setBefore] = useState<boolean[]>(Array(BEFORE_ITEMS.length).fill(false));
  const [during, setDuring] = useState<boolean[]>(Array(DURING_ITEMS.length).fill(false));
  const [showHookNote, setShowHookNote] = useState(false);
  const allChecked = before.every(Boolean) && during.every(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { items: BEFORE_ITEMS, state: before, setter: setBefore, label: "Before your content day" },
          { items: DURING_ITEMS, state: during, setter: setDuring, label: "During your content day" },
        ].map(({ items, state, setter, label }) => (
          <div key={label} className="flex flex-col gap-2">
            <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-1">{label}</p>
            {items.map((item, i) => (
              <label key={i} className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 px-3 py-2.5 transition-all duration-200 ${
                state[i] ? "border-[#1a2f4a]/25 bg-[#1a2f4a]/4" : "border-slate-200 bg-white hover:border-[#4a8fd4]/40"
              }`}>
                <motion.div onClick={() => setter(prev => { const n=[...prev]; n[i]=!n[i]; return n; })} whileTap={{scale:0.88}}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    state[i] ? "bg-[#1a2f4a] border-[#1a2f4a]" : "border-slate-300"
                  }`}>
                  {state[i] && <IcoCheck size={11} className="text-white"/>}
                </motion.div>
                <span className={`text-xs leading-[1.6] ${state[i] ? "text-slate-700 font-medium" : "text-slate-500"}`}>{item}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <AnimatePresence>
        {allChecked && !showHookNote && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={() => setShowHookNote(true)}>See the hook-first method <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showHookNote && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="border-l-4 border-[#4a8fd4] pl-5 py-3 bg-slate-50/80 rounded-r-xl">
              <p className="text-xs font-extrabold text-[#4a8fd4] uppercase tracking-wide mb-1.5">The hook-first method</p>
              <p className="text-sm text-slate-700 leading-[1.7]">Film every hook variation for every video before you film anything else. Hooks require the most energy. When you&apos;re fresh at the start of a session, hooks come out better. By the time you&apos;ve filmed hooks for 4 videos, you&apos;re in a rhythm and the body content flows faster.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 4 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FORMATS_5A = [
  { id:1, name:"The Relatable Getting-Dressed Moment", category:"personal" },
  { id:2, name:"The Outfit Showcase / Styling Demo",   category:"visual" },
  { id:3, name:"Before / After or Transformation",     category:"personal" },
  { id:4, name:"GRWM / Day-in-the-Life Integration",   category:"personal" },
  { id:5, name:"The Educational / How I Use It Breakdown", category:"educational" },
  { id:6, name:"The Discovery / Community Moment",     category:"community" },
  { id:7, name:"Trend-Jacking",                        category:"trend" },
];
const FORMAT_CATEGORY_META: Record<string, { type: string; reward: string }> = {
  personal:    { type:"personal storytelling",    reward:"storytelling depth and emotional resonance" },
  visual:      { type:"visual/showcase",          reward:"aesthetic consistency and repeat views" },
  educational: { type:"educational",              reward:"saves, shares, and long-term searchability" },
  community:   { type:"community/discovery",      reward:"discovery moments and profile visits" },
  trend:       { type:"trend-aware",              reward:"burst reach and algorithmic momentum" },
};

function SignatureFormatSelector({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggle(id: number) {
    if (submitted) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const canSubmit = selected.length >= 3 && selected.length <= 5;

  const counts: Record<string, number> = {};
  selected.forEach(id => {
    const cat = FORMATS_5A.find(f => f.id === id)?.category ?? "personal";
    counts[cat] = (counts[cat] ?? 0) + 1;
  });
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "personal";
  const typeList = [...new Set(selected.map(id => FORMATS_5A.find(f=>f.id===id)?.category).filter(Boolean))]
    .map(c => FORMAT_CATEGORY_META[c!]?.type).filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-500">Select <span className="font-bold text-slate-700">3–5 formats</span></p>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
          canSubmit ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
        }`}>{selected.length} selected</span>
      </div>
      <div className="flex flex-col gap-2">
        {FORMATS_5A.map(fmt => {
          const isSelected = selected.includes(fmt.id);
          const atMax = selected.length >= 5 && !isSelected;
          return (
            <motion.button key={fmt.id} onClick={() => !atMax && toggle(fmt.id)} whileTap={!atMax ? {scale:0.98} : {}}
              disabled={submitted}
              className={[
                "flex items-center gap-3 text-left rounded-2xl border-2 px-4 py-3 transition-all duration-200",
                submitted && isSelected ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/6" :
                submitted ? "border-slate-100 bg-slate-50 opacity-50" :
                isSelected ? "border-[#1a2f4a]/30 bg-[#1a2f4a]/6 cursor-pointer" :
                atMax ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed" :
                "border-slate-200 bg-white hover:border-[#4a8fd4]/50 cursor-pointer",
              ].join(" ")}>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                isSelected ? "bg-[#1a2f4a] border-[#1a2f4a]" : "border-slate-300"
              }`}>
                {isSelected && <IcoCheck size={11} className="text-white"/>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-0.5">Format {String(fmt.id).padStart(2,"0")}</p>
                <p className={`text-sm font-extrabold leading-tight ${isSelected ? "text-slate-800" : "text-slate-600"}`}>{fmt.name}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {!submitted && canSubmit && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
            <PrimaryBtn onClick={() => setSubmitted(true)}>Confirm my formats <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}}
            className="flex flex-col gap-3">
            <div className="bg-[#1a2f4a]/4 border border-[#1a2f4a]/15 rounded-2xl p-5">
              <p className="text-xs font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">Your selection</p>
              <p className="text-sm text-slate-700 leading-[1.7]">Your selection suggests strength in <span className="font-bold text-slate-800">{typeList || FORMAT_CATEGORY_META[dominant].type}</span> content. These formats tend to reward <span className="font-bold text-slate-800">{FORMAT_CATEGORY_META[dominant].reward}</span>. Start with these, post at least once in each, and let your analytics confirm or redirect you.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-600 leading-[1.65]"><span className="font-extrabold text-amber-700">Note:</span> Don&apos;t pick based on which formats perform best in general — pick based on which ones you can produce authentically and repeatedly. Formats you dread making will show in the final video.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 5 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DEFAULT_WEEK = [
  { day:"Monday",    task:"Trend check + analytics review (15 min)" },
  { day:"Tuesday",   task:"Content day — film 3–5 videos" },
  { day:"Wednesday", task:"Edit and schedule posts" },
  { day:"Thursday",  task:"Edit and schedule posts" },
  { day:"Friday",    task:"Engage with comments + plan next week" },
];

function WeeklyScheduleBuilder({ onDone }: { onDone: () => void }) {
  const [tasks, setTasks] = useState(DEFAULT_WEEK.map(d => d.task));
  const [editing, setEditing] = useState<number|null>(null);
  const [confirmed, setConfirmed] = useState<boolean[]>(Array(5).fill(false));
  const [saved, setSaved] = useState(false);
  const allConfirmed = confirmed.every(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {DEFAULT_WEEK.map((row, i) => (
        <div key={i} className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${confirmed[i] ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold transition-colors ${
                confirmed[i] ? "bg-emerald-500 text-white" : "bg-[#1a2f4a]/10 text-[#1a2f4a]"
              }`}>
                {confirmed[i] ? <IcoCheck size={13}/> : row.day.slice(0,3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{row.day}</p>
                {editing === i ? (
                  <input value={tasks[i]} onChange={e => setTasks(prev => { const n=[...prev]; n[i]=e.target.value; return n; })} autoFocus
                    className="w-full text-xs font-medium text-slate-800 bg-transparent border-b border-[#4a8fd4] outline-none py-0.5 mt-0.5"/>
                ) : (
                  <p className={`text-xs font-medium leading-tight truncate ${confirmed[i] ? "text-emerald-700" : "text-slate-700"}`}>{tasks[i]}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!confirmed[i] && editing !== i && (
                <button onClick={() => setEditing(i)} className="text-[10px] font-bold text-slate-400 hover:text-[#4a8fd4] transition-colors px-2 py-1 rounded-lg">Edit</button>
              )}
              {editing === i && (
                <button onClick={() => setEditing(null)} className="text-[10px] font-bold text-[#4a8fd4] px-2 py-1 rounded-lg bg-[#4a8fd4]/10">Done</button>
              )}
              <button onClick={() => { setConfirmed(prev => { const n=[...prev]; n[i]=!n[i]; return n; }); setEditing(null); }}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all ${
                  confirmed[i] ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-[#1a2f4a] text-white hover:bg-[#26476e]"
                }`}>
                {confirmed[i] ? "✓ Set" : "Set"}
              </button>
            </div>
          </div>
        </div>
      ))}
      <AnimatePresence>
        {allConfirmed && !saved && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="bg-[#4a8fd4]/6 border border-[#4a8fd4]/20 rounded-xl px-4 py-3.5">
              <p className="text-xs text-slate-600 leading-[1.7]"><span className="font-extrabold text-slate-700">The specific days matter less than having a fixed structure.</span> Creators with a set routine post 40% more consistently than creators who decide day-to-day.</p>
            </div>
            <PrimaryBtn onClick={() => { setSaved(true); setTimeout(onDone, 400); }}>Save my schedule <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Module5AContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 6;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);
  const [s5Done, setS5Done] = useState(false);
  const [s6Done, setS6Done] = useState(false);

  const segClass = (n: number) => {
    const done = [s1Done,s2Done,s3Done,s4Done,s5Done,s6Done][n-1];
    if (done) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function done(n: number, setter: () => void) {
    setter();
    if (n < TOTAL) setTimeout(() => setSection(n + 1), 600);
    else setTimeout(onComplete, 900);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1">
        {Array.from({length:TOTAL},(_,i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(i+1)}`}/>)}
      </div>

      {section >= 1 && (
        <motion.div key="s1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5">
          <SectionHeader n={1} total={TOTAL} label="The consistency problem"/>
          <h3 className="text-base font-extrabold text-slate-800">&ldquo;The consistency problem isn&apos;t motivation. It&apos;s infrastructure.&rdquo;</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">Most experienced creators don&apos;t fail because their content is bad — they fail because they have no system. They post when inspired, scramble for ideas under deadline, and treat every video as a from-scratch creative problem. That&apos;s exhausting and inconsistent. The algorithm rewards consistency. The way to be consistent without burning out is to build infrastructure: a content calendar, a repeatable batching process, and a small set of signature formats you own.</p>
          <div className="border-l-4 border-[#4a8fd4] pl-5 py-3 bg-slate-50/80 rounded-r-xl">
            <p className="text-sm italic text-slate-700 leading-[1.7]">&ldquo;You don&apos;t need infinite creativity. You need a small number of formats you&apos;re genuinely good at, and a system for producing them reliably.&rdquo;</p>
          </div>
          {!s1Done ? <PrimaryBtn onClick={() => done(1, () => setS1Done(true))}>Continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="Trend monitoring"/>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Trend monitoring tool map</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Open each tool to see how to use it. All four must be opened to continue.</p>
          </div>
          {!s2Done ? <TrendToolMap onDone={() => done(2, () => setS2Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="Content batching"/>
          <h3 className="text-base font-extrabold text-slate-800">How to film a week of content in one session</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">Content days — dedicated blocks where you film multiple videos back-to-back — are the most efficient way to maintain posting consistency. The setup cost (getting ready, finding your angle, setting up your space) is fixed whether you film one video or five.</p>
          {!s3Done ? <ContentDayPlanner onDone={() => done(3, () => setS3Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Signature formats"/>
          <h3 className="text-base font-extrabold text-slate-800">Identify your 3–5 signature formats</h3>
          {!s4Done ? <SignatureFormatSelector onDone={() => done(4, () => setS4Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 5 && (
        <motion.div key="s5" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={5} total={TOTAL} label="Weekly content calendar"/>
          <h3 className="text-base font-extrabold text-slate-800">A simple weekly structure</h3>
          {!s5Done ? <WeeklyScheduleBuilder onDone={() => done(5, () => setS5Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 6 && (
        <motion.div key="s6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={6} total={TOTAL} label="Balancing briefs with original content"/>
          <h3 className="text-base font-extrabold text-slate-800">How to make brief-led content feel personal</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">When Cloud Closet gives you a brief, your job isn&apos;t to execute it literally — it&apos;s to find the version of that brief that feels true to you. A brief that says &ldquo;show the discovery feature&rdquo; is an assignment. &ldquo;I showed my roommate the Cloud Closet discover page and she immediately found something she&apos;d been looking for for two years&rdquo; is a video. Always translate the brief into your own language, your own moment, your own story. The brief defines the objective — you define the execution.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
            <p className="text-xs text-slate-600 leading-[1.65]"><span className="font-extrabold text-amber-700">Important:</span> If you ever receive a brief and can&apos;t find a genuine personal angle, flag it to the Cloud Closet team before filming. A forced video is always worse than an honest conversation about approach.</p>
          </div>
          {!s6Done ? (
            <PrimaryBtn onClick={() => done(6, () => setS6Done(true))}>Complete Module 5A <IcoChevronRight size={16}/></PrimaryBtn>
          ) : (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
              <div><p className="text-sm font-extrabold text-emerald-700">Module 5A complete!</p><p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to overview — Module 6A is now unlocked.</p></div>
            </motion.div>
          )}
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module 6A — Interactive components ──────────────────────────────────────────

const PSYCH_FORCES = [
  {
    num:"01", title:"Pattern interruption",
    detail:"The TikTok scroll is automatic behavior — muscle memory. A pattern interrupt is anything that breaks the automatic rhythm and forces the brain to consciously process what it just saw. Visual movement, an unexpected phrase, a surprising juxtaposition, or an extreme expression all qualify. The brain can't scroll past something it hasn't finished processing.",
    example:'"I wore the same outfit three times this week and I have zero regrets." — the admission interrupts expected content behavior.',
    other:"the curiosity gap and social proof signal",
  },
  {
    num:"02", title:"The curiosity gap",
    detail:"The brain experiences the space between 'what I know' and 'what I want to know' as mild discomfort — and is motivated to close it. A great hook opens a gap without closing it. The video's job is to close the gap gradually, not immediately. If you resolve the tension in the hook itself, there's no reason to keep watching.",
    example:'"I didn\'t expect to find my next outfit on an app — but here we are." — gap: what app, what outfit, what happened?',
    other:"pattern interruption and identity recognition",
  },
  {
    num:"03", title:"Identity recognition",
    detail:"When a viewer sees themselves reflected in content — in a problem, a personality, a situation — they experience a moment of recognition that creates emotional investment. They're not watching a stranger; they're watching themselves. This is the most powerful hook force for Cloud Closet content because the brand is built on universal style experiences.",
    example:'"My camera roll has 4,000 outfit photos and I can never find anything." — almost everyone with a phone and a style instinct has had this experience.',
    other:"the curiosity gap and social proof signal",
  },
  {
    num:"04", title:"Social proof signal",
    detail:"Humans are wired to pay attention to what other humans find worth paying attention to. A hook that implies 'something happened that was worth showing people' creates implicit social proof before a single piece of evidence is shown.",
    example:'"Someone on Cloud Closet stopped me cold and I\'ve been thinking about it ever since." — the implied proof: this was worth filming and sharing.',
    other:"pattern interruption and identity recognition",
  },
];

function PsychForceExplorer({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState<boolean[]>(Array(PSYCH_FORCES.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(PSYCH_FORCES.length).fill(false));
  const [natural, setNatural] = useState<number|null>(null);
  const allSeen = seen.every(Boolean);

  function toggle(i: number) {
    setOpen(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }

  return (
    <div className="flex flex-col gap-3">
      {PSYCH_FORCES.map((force, i) => (
        <div key={i} className={`border-2 rounded-2xl overflow-hidden transition-colors ${seen[i] ? "border-[#1a2f4a]/20" : "border-slate-200"}`}>
          <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-[#4a8fd4] w-7 flex-shrink-0">F{force.num}</span>
              <p className="text-sm font-extrabold text-slate-800">{force.title}</p>
              {seen[i] && <IcoCheck size={12} className="text-emerald-500"/>}
            </div>
            <motion.div animate={{rotate: open[i] ? 180 : 0}} transition={{duration:0.2}}>
              <IcoChevronDown size={14} className="text-slate-400 flex-shrink-0"/>
            </motion.div>
          </button>
          <AnimatePresence>
            {open[i] && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25,ease:"easeOut" as const}} style={{overflow:"hidden"}}>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <p className="text-sm text-slate-600 leading-[1.7]">{force.detail}</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Example</p>
                    <p className="text-xs text-slate-600 leading-[1.65] italic">{force.example}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <AnimatePresence>
        {allSeen && natural === null && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}} className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <p className="text-sm font-extrabold text-slate-800">Which force do you use most naturally in your hooks?</p>
            <div className="grid grid-cols-2 gap-2">
              {PSYCH_FORCES.map((force, i) => (
                <button key={i} onClick={() => setNatural(i)}
                  className="text-left rounded-2xl border-2 border-slate-200 p-3 hover:border-[#4a8fd4]/50 hover:bg-slate-50 transition-all">
                  <p className="text-[10px] font-bold text-[#4a8fd4] mb-0.5">F{force.num}</p>
                  <p className="text-xs font-extrabold text-slate-700 leading-tight">{force.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {natural !== null && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-3">
            <div className="bg-[#1a2f4a]/4 border border-[#1a2f4a]/15 rounded-2xl p-5">
              <p className="text-xs font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">Your natural strength</p>
              <p className="text-sm text-slate-700 leading-[1.7]">Your natural strength is <span className="font-bold text-slate-800">{PSYCH_FORCES[natural].title}</span>. To write stronger hook variations, deliberately try <span className="font-bold text-slate-800">{PSYCH_FORCES[natural].other}</span> next time. Forcing yourself out of your default pattern is where the best hooks often live.</p>
            </div>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STORY_ROUNDS_6A = [
  {
    a:"This video will show how Cloud Closet works, what features it has, and why you should download it.",
    b:"I spent 20 minutes getting dressed this morning and I'm wearing the same thing I always wear. I opened Cloud Closet to look at my upload history and I finally understood why.",
    correct:"B" as const,
    explanation:"B leads with tension — the frustrated morning — and uses the 'and then' structure that moves the story forward. A is an outline, not a story.",
  },
  {
    a:"I realized I buy the same color in different items without knowing it. Cloud Closet showed me this when I uploaded everything I own.",
    b:"Cloud Closet's wardrobe organization features allow you to identify patterns in your personal style over time.",
    correct:"A" as const,
    explanation:"A is specific — a personal discovery with a specific cause. B is general — it describes a feature without a human moment attached to it.",
  },
  {
    a:"Three things I've learned about myself from using Cloud Closet for a month.",
    b:"Here is a quick overview of Cloud Closet and what you can do with it.",
    correct:"A" as const,
    explanation:"A creates a curiosity gap (what three things?) and promises personal, specific insight. B is a product description — it informs without creating investment.",
  },
];

function StoryStructureChallenge({ onDone }: { onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<"A"|"B"|null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const current = STORY_ROUNDS_6A[round];
  const isCorrect = selected === current.correct;

  function next() {
    if (round < STORY_ROUNDS_6A.length - 1) {
      setRound(r => r + 1); setSelected(null); setRevealed(false);
    } else { setDone(true); setTimeout(onDone, 700); }
  }

  if (done) return (
    <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
      <IcoCheck size={18} className="text-emerald-500 flex-shrink-0"/>
      <p className="text-sm font-extrabold text-emerald-700">All 3 rounds complete.</p>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        {STORY_ROUNDS_6A.map((_,i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < round ? "bg-[#4a8fd4]" : i === round ? "bg-[#4a8fd4]/40" : "bg-slate-200"}`}/>)}
      </div>
      <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-widest">Round {round + 1} of {STORY_ROUNDS_6A.length}</p>
      <p className="text-sm font-extrabold text-slate-800">Which has better story structure?</p>
      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.25,ease:"easeOut" as const}} className="flex flex-col gap-3">
          {(["A","B"] as const).map(opt => {
            const text = opt === "A" ? current.a : current.b;
            const isSelected = selected === opt;
            const isRight = revealed && opt === current.correct;
            const isWrong = revealed && isSelected && opt !== current.correct;
            return (
              <button key={opt} onClick={() => !revealed && setSelected(opt)}
                className={["text-left rounded-2xl border-2 px-4 py-4 transition-all",
                  isRight ? "border-emerald-400 bg-emerald-50" : isWrong ? "border-red-300 bg-red-50" :
                  isSelected ? "border-[#1a2f4a]/40 bg-[#1a2f4a]/6" :
                  revealed ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 bg-white hover:border-[#4a8fd4]/50 cursor-pointer",
                ].join(" ")}>
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    isRight ? "bg-emerald-200 text-emerald-800" : isWrong ? "bg-red-100 text-red-700" : isSelected ? "bg-[#1a2f4a] text-white" : "bg-slate-200 text-slate-500"
                  }`}>Option {opt}</span>
                  <p className="text-xs text-slate-600 leading-[1.65]">{text}</p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
      {!revealed && selected && <PrimaryBtn onClick={() => setRevealed(true)}>Check answer <IcoChevronRight size={16}/></PrimaryBtn>}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35}} className="flex flex-col gap-3">
            <div className={`rounded-2xl px-4 py-3.5 ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className={`text-xs font-extrabold mb-1.5 ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                {isCorrect ? `Correct — Option ${current.correct}` : `Not quite — Option ${current.correct} is stronger`}
              </p>
              <p className="text-xs text-slate-600 leading-[1.65]">{current.explanation}</p>
            </div>
            <PrimaryBtn onClick={next}>{round < STORY_ROUNDS_6A.length - 1 ? "Next round" : "Finish"} <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CTA_EXAMPLES_6A = [
  { text:"Download Cloud Closet — link in bio.", works:true,  explanation:"Simple, direct, one ask. Assumes the video already created the desire. The CTA is just the door." },
  { text:"So if you want to try it, you can check the link in my bio, and also follow me for more content, and leave a comment if you want to see more Cloud Closet videos!", works:false, explanation:"Three CTAs, zero priority. When you ask for everything you get nothing. Pick one." },
  { text:"Honestly just go download it. Your camera roll will thank you.", works:true,  explanation:"Dry, personal, specific. Feels like a recommendation from a person, not a prompt from an ad. Connects back to the camera roll moment which is a Cloud Closet-native pain point." },
  { text:"Follow for more outfit inspo and style tips!", works:false, explanation:"This CTA is for a personal style account, not a UGC creator driving app downloads. Cloud Closet's primary CTA goal is downloads. Follows are a secondary signal, not the target action." },
];

function CTAAudit({ onDone }: { onDone: () => void }) {
  const [ratings, setRatings] = useState<(boolean|null)[]>(Array(CTA_EXAMPLES_6A.length).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(Array(CTA_EXAMPLES_6A.length).fill(false));
  const allRevealed = revealed.every(Boolean);

  function rate(i: number, val: boolean) {
    if (revealed[i]) return;
    setRatings(prev => { const n=[...prev]; n[i]=val; return n; });
    setRevealed(prev => { const n=[...prev]; n[i]=true; return n; });
  }

  return (
    <div className="flex flex-col gap-4">
      {CTA_EXAMPLES_6A.map((cta, i) => (
        <div key={i} className={`border-2 rounded-2xl overflow-hidden transition-all ${
          revealed[i] ? (ratings[i]===cta.works ? "border-emerald-200" : "border-amber-200") : "border-slate-200"
        }`}>
          <div className="px-4 py-4 flex flex-col gap-3">
            <p className="text-sm text-slate-700 leading-[1.65] font-medium italic">&ldquo;{cta.text}&rdquo;</p>
            {!revealed[i] ? (
              <div className="flex items-center gap-2">
                <button onClick={() => rate(i, true)} className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-xs font-extrabold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all">This works</button>
                <button onClick={() => rate(i, false)} className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-xs font-extrabold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all">This doesn&apos;t work</button>
              </div>
            ) : (
              <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${ratings[i]===cta.works ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {ratings[i]===cta.works ? "Correct" : "Not quite"}
                  </span>
                  <span className={`text-[10px] font-bold ${cta.works ? "text-emerald-600" : "text-red-500"}`}>→ {cta.works ? "Works" : "Doesn't work"}</span>
                </div>
                <p className="text-xs text-slate-600 leading-[1.65]">{cta.explanation}</p>
              </motion.div>
            )}
          </div>
        </div>
      ))}
      <AnimatePresence>
        {allRevealed && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 5 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HookVariationPractice({ onDone }: { onDone: () => void }) {
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");
  const [h3, setH3] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ready = h1.trim().length >= 10 && h2.trim().length >= 10 && h3.trim().length >= 10;

  if (submitted) return (
    <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="flex flex-col gap-3">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
        <IcoCheck size={18} className="text-emerald-500 flex-shrink-0"/>
        <p className="text-sm font-extrabold text-emerald-700">Three hook variations saved.</p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
        <p className="text-xs text-slate-600 leading-[1.7]">Read them aloud. The one that sounds most like something a real person would actually say is usually the right one. Save your two alternates — test them on future videos with the same concept.</p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#1a2f4a]/4 border border-[#1a2f4a]/15 rounded-2xl px-4 py-4">
        <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">Content concept</p>
        <p className="text-sm text-slate-700 leading-[1.7]">You&apos;ve been using Cloud Closet for two weeks and you just uploaded your entire outfit history. Looking at it all at once revealed something unexpected about your actual style.</p>
      </div>
      {[
        { val:h1, set:setH1, label:"Hook 1 — Identity recognition", hint:"Something the viewer sees themselves in:" },
        { val:h2, set:setH2, label:"Hook 2 — Curiosity gap",         hint:"Something that opens a question without answering it:" },
        { val:h3, set:setH3, label:"Hook 3 — Pattern interruption",  hint:"Something unexpected that breaks the scroll:" },
      ].map(({ val, set, label, hint }, i) => (
        <div key={i} className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-slate-700">{label}</label>
          <p className="text-xs text-slate-400 leading-[1.5]">{hint}</p>
          <textarea value={val} onChange={e => set(e.target.value)} rows={2}
            placeholder="Write your hook here..."
            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"
          />
          <p className={`text-[10px] font-bold text-right transition-colors ${val.trim().length >= 10 ? "text-emerald-500" : "text-slate-300"}`}>
            {val.trim().length < 10 ? `${10 - val.trim().length} more chars to unlock` : "✓"}
          </p>
        </div>
      ))}
      <PrimaryBtn onClick={() => { setSubmitted(true); setTimeout(onDone, 600); }} disabled={!ready}>Submit all three hooks <IcoChevronRight size={16}/></PrimaryBtn>
    </div>
  );
}

function Module6AContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 5;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);
  const [s5Done, setS5Done] = useState(false);

  const segClass = (n: number) => {
    const d = [s1Done,s2Done,s3Done,s4Done,s5Done][n-1];
    if (d) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function done(n: number, setter: () => void) {
    setter();
    if (n < TOTAL) setTimeout(() => setSection(n + 1), 600);
    else setTimeout(onComplete, 900);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1">
        {Array.from({length:TOTAL},(_,i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(i+1)}`}/>)}
      </div>

      {section >= 1 && (
        <motion.div key="s1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5">
          <SectionHeader n={1} total={TOTAL} label="Why this module exists"/>
          <h3 className="text-base font-extrabold text-slate-800">&ldquo;Most experienced creators know how to make content. Few know why it converts.&rdquo;</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">You&apos;ve been making content long enough to have a feel for what works. This module gives you the framework behind that feel — so you can apply it deliberately instead of hoping to replicate it by accident. Understanding the psychology doesn&apos;t make content feel mechanical. It makes you faster, more consistent, and significantly harder to stump by a brief.</p>
          {!s1Done ? <PrimaryBtn onClick={() => done(1, () => setS1Done(true))}>Continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="Hook psychology"/>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Why people stop: the four forces</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Open all four. Then identify which force comes most naturally to you.</p>
          </div>
          {!s2Done ? <PsychForceExplorer onDone={() => done(2, () => setS2Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="Storytelling structure"/>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Story structure rewrite challenge</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">3 rounds. Pick the version with better story structure — then see why.</p>
          </div>
          {!s3Done ? <StoryStructureChallenge onDone={() => done(3, () => setS3Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Conversion psychology"/>
          <h3 className="text-base font-extrabold text-slate-800">What makes people act after watching</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">Action doesn&apos;t happen because you asked for it. It happens because the video created a feeling that made the action feel like a natural next step. The CTA is just the door. The video has to make them want to walk through it.</p>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 mb-1">Is this CTA working?</h4>
            <p className="text-xs text-slate-500 leading-[1.6]">Rate each closing line — then see the answer.</p>
          </div>
          {!s4Done ? <CTAAudit onDone={() => done(4, () => setS4Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 5 && (
        <motion.div key="s5" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={5} total={TOTAL} label="Writing 3 hook variations"/>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Write 3 hook variations for this concept</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Each must use a different psychological force. All three required.</p>
          </div>
          {!s5Done ? <HookVariationPractice onDone={() => done(5, () => setS5Done(true))}/> : (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><IcoCheck size={18} className="text-white"/></div>
              <div><p className="text-sm font-extrabold text-emerald-700">Module 6A complete!</p><p className="text-xs text-slate-500 mt-0.5 leading-[1.6]">Returning to overview — Module 7A is now unlocked.</p></div>
            </motion.div>
          )}
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module 7A — Interactive components ──────────────────────────────────────────

const METRICS_7A = [
  { name:"Completion rate",           benchmark:"70%+ for viral push",                          diagnostic:"Below 40%: hook or pacing problem. 40–60%: decent with room. 60–70%: strong. 70%+: viral distribution threshold. If completion rate is low, don't make a new video until you understand why this one bled viewers." },
  { name:"Average watch time",         benchmark:"As high as possible relative to video length", diagnostic:"Read alongside completion rate. A 60-second video with 80% completion (48 seconds average) generates more raw watch time signal than a 15-second video at the same completion rate. Use this to calibrate your video length decisions over time." },
  { name:"Drop-off point",             benchmark:"No significant cliff before 80% of the video", diagnostic:"Drop-off at 3 seconds: hook isn't working. Drop-off at 8–10 seconds: setup is dragging. Drop-off near the end: close is weak or video went too long. Match the drop-off point to the Module 3 video structure to identify the exact section to fix." },
  { name:"Save rate",                  benchmark:"2%+ is strong",                               diagnostic:"Saves signal lasting value — the viewer wants to return. Educational content and content with clear takeaways earn saves. If you're not earning saves, your content might be entertaining but not useful enough to return to." },
  { name:"Share rate",                 benchmark:"1–2%+ is strong",                             diagnostic:"The highest-value viewer action. Ask yourself before filming: would someone send this to a friend? If the honest answer is no — redesign the concept." },
  { name:"Profile visits from video",  benchmark:"Above-average relative to your other videos", diagnostic:"High profile visits means your personal presence is working — your energy and personality are drawing people in beyond the content itself. Low profile visits from a high-view video means the content was good but you weren't memorable in it." },
];

function MetricExplainer({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState<boolean[]>(Array(METRICS_7A.length).fill(false));
  const [seen, setSeen] = useState<boolean[]>(Array(METRICS_7A.length).fill(false));
  const allSeen = seen.every(Boolean);

  function toggle(i: number) {
    setOpen(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
    setSeen(prev => { const n=[...prev]; n[i]=true; return n; });
  }

  return (
    <div className="flex flex-col gap-2">
      {METRICS_7A.map((metric, i) => (
        <div key={i} className={`border-2 rounded-2xl overflow-hidden transition-colors ${seen[i] ? "border-[#1a2f4a]/20" : "border-slate-200"}`}>
          <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-slate-800">{metric.name}</p>
                {seen[i] && <IcoCheck size={12} className="text-emerald-500 flex-shrink-0"/>}
              </div>
              <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-wide">Benchmark: {metric.benchmark}</p>
            </div>
            <motion.div animate={{rotate: open[i] ? 180 : 0}} transition={{duration:0.2}} className="flex-shrink-0">
              <IcoChevronDown size={14} className="text-slate-400"/>
            </motion.div>
          </button>
          <AnimatePresence>
            {open[i] && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25,ease:"easeOut" as const}} style={{overflow:"hidden"}}>
                <div className="px-4 pb-4">
                  <div className="bg-[#4a8fd4]/6 border border-[#4a8fd4]/20 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-1.5">Diagnostic</p>
                    <p className="text-xs text-slate-600 leading-[1.7]">{metric.diagnostic}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <AnimatePresence>
        {allSeen && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}>
            <PrimaryBtn onClick={onDone}>Continue to Section 3 <IcoChevronRight size={16}/></PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TRACKER_COLS = ["Date posted","Format used","Hook type","Completion rate","Save rate","Share rate","Drop-off point","Observation"];

function TrackerSetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<"notion"|"sheets"|null>(null);
  const [fields, setFields] = useState<string[]>(Array(TRACKER_COLS.length).fill(""));
  const allFilled = fields.every(f => f.trim().length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${
              step > s ? "bg-emerald-500 text-white" : step === s ? "bg-[#1a2f4a] text-white" : "bg-slate-200 text-slate-400"
            }`}>{step > s ? <IcoCheck size={11}/> : s}</div>
            {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-colors ${step > s ? "bg-emerald-400" : "bg-slate-200"}`}/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div key="step1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3,ease:"easeOut" as const}} className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-extrabold text-slate-800 mb-1">Step 1 — Choose your platform</p>
            <p className="text-xs text-slate-500 leading-[1.6]">Pick where you&apos;ll keep your tracker. Either works — what matters is that you actually use it.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["notion","sheets"] as const).map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${platform === p ? "border-[#1a2f4a]/40 bg-[#1a2f4a]/6" : "border-slate-200 bg-white hover:border-[#4a8fd4]/40"}`}>
                <p className="text-sm font-extrabold text-slate-800 mb-1">{p === "sheets" ? "Google Sheets" : "Notion"}</p>
                <p className="text-xs text-slate-500 leading-[1.5]">{p === "notion" ? "Great for adding notes and context per video" : "Best if you want to sort and filter by metrics"}</p>
              </button>
            ))}
          </div>
          {platform && (
            <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                {platform === "notion"
                  ? <p className="text-xs text-slate-600 leading-[1.7]"><span className="font-extrabold">Setup:</span> In Notion, create a new database (table view). Add these as columns: {TRACKER_COLS.join(", ")}. Set completion rate, save rate, and share rate as Number type. Set date posted as Date. Everything else is Text.</p>
                  : <p className="text-xs text-slate-600 leading-[1.7]"><span className="font-extrabold">Setup:</span> Open a new Google Sheet. Row 1 = headers: <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">{TRACKER_COLS.join(" | ")}</span>. Freeze Row 1. Use conditional formatting on Completion Rate: red = below 40, yellow = 40–60, green = 60+.</p>
                }
              </div>
              <PrimaryBtn onClick={() => setStep(2)}>Tracker set up — continue <IcoChevronRight size={16}/></PrimaryBtn>
            </motion.div>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3,ease:"easeOut" as const}} className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-extrabold text-slate-800 mb-1">Step 2 — Log your most recent video</p>
            <p className="text-xs text-slate-500 leading-[1.6]">Fill in what you know. Rates can be estimated if exact analytics aren&apos;t available yet.</p>
          </div>
          <div className="flex flex-col gap-3">
            {TRACKER_COLS.map((col, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-xs font-extrabold text-slate-700">{col}</label>
                <input value={fields[i]} onChange={e => setFields(prev => { const n=[...prev]; n[i]=e.target.value; return n; })}
                  placeholder={col === "Observation" ? "e.g. Hook felt weak — try identity recognition next time" : col === "Date posted" ? "e.g. April 10, 2026" : ""}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors placeholder:text-slate-300 font-medium"
                />
              </div>
            ))}
          </div>
          <PrimaryBtn onClick={() => setStep(3)} disabled={!allFilled}>Log this video <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div key="step3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3,ease:"easeOut" as const}} className="flex flex-col gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <IcoCheck size={18} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-extrabold text-emerald-700 mb-1">Your tracker is started.</p>
              <p className="text-xs text-slate-600 leading-[1.65]">Set a 10-minute block every Monday to update it after checking last week&apos;s analytics. After 10 videos, patterns will start to emerge.</p>
            </div>
          </div>
          <PrimaryBtn onClick={onDone}>Continue to Section 4 <IcoChevronRight size={16}/></PrimaryBtn>
        </motion.div>
      )}
    </div>
  );
}

function AdvancedReflection({ onDone }: { onDone: () => void }) {
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ready = a1.trim().length >= 25 && a2.trim().length >= 20;

  if (submitted) return (
    <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
      <IcoCheck size={18} className="text-emerald-500 flex-shrink-0"/>
      <p className="text-sm font-extrabold text-emerald-700">Reflection saved.</p>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-5">
      {[
        { val:a1, set:setA1, min:25, label:"Based on the four psychological hook forces, which one do you use least — and what's a Cloud Closet content concept you could try it with?", placeholder:"e.g. I rarely use social proof — I could try 'Someone in the Cloud Closet community styled...'" },
        { val:a2, set:setA2, min:20, label:"What's one metric from the analytics module you haven't been tracking closely enough — and what will you watch for in your next 5 videos?", placeholder:"e.g. I've never tracked save rate — I'm going to look for it after every post this week..." },
      ].map(({ val, set, min, label, placeholder }, i) => (
        <div key={i} className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-slate-700 leading-[1.5]">{label}</label>
          <textarea value={val} onChange={e => set(e.target.value)} rows={3} placeholder={placeholder}
            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-[#4a8fd4] transition-colors resize-none placeholder:text-slate-300 shadow-sm font-medium leading-[1.6]"
          />
          <p className={`text-[10px] font-bold text-right transition-colors ${val.trim().length >= min ? "text-emerald-500" : "text-slate-300"}`}>
            {val.trim().length} chars{val.trim().length < min ? ` · ${min - val.trim().length} more to unlock` : " · ✓"}
          </p>
        </div>
      ))}
      <PrimaryBtn onClick={() => { setSubmitted(true); setTimeout(onDone, 600); }} disabled={!ready}>Submit reflection <IcoChevronRight size={16}/></PrimaryBtn>
    </div>
  );
}

function Module7AContent({ onComplete, isAdmin = false }: { onComplete: () => void; isAdmin?: boolean }) {
  const TOTAL = 4;
  const [section, setSection] = useState(isAdmin ? TOTAL : 1);
  const [s1Done, setS1Done] = useState(false);
  const [s2Done, setS2Done] = useState(false);
  const [s3Done, setS3Done] = useState(false);
  const [s4Done, setS4Done] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const segClass = (n: number) => {
    const d = [s1Done,s2Done,s3Done,s4Done][n-1];
    if (d) return "bg-[#4a8fd4]";
    if (n === section) return "bg-[#4a8fd4]/40";
    return "bg-slate-200";
  };

  function advance(n: number, setter: () => void) {
    setter();
    if (n < TOTAL) setTimeout(() => setSection(n + 1), 600);
  }

  if (showCompletion) return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.5,ease:"easeOut" as const}}
      className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a2f4a] to-[#26476e] flex items-center justify-center shadow-xl">
        <IcoStar size={32} className="text-amber-400"/>
      </div>
      <div>
        <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-[0.16em] mb-2">Advanced Path Complete</p>
        <h2 className="text-xl font-extrabold text-slate-800 leading-tight mb-3">You&apos;re operating at a different level.</h2>
        <p className="text-sm text-slate-500 leading-[1.7] max-w-sm mx-auto">You have a content system, a psychological framework for hooks, and a way to read what your videos are telling you.</p>
      </div>
      <div className="bg-[#4a8fd4]/6 border border-[#4a8fd4]/20 rounded-2xl px-5 py-4 w-full text-left">
        <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-widest mb-2">Coming next: Track 3</p>
        <p className="text-xs font-extrabold text-slate-700 mb-1">Operating Procedures</p>
        <p className="text-xs text-slate-500 leading-[1.6]">Submission standards, approval workflow, revision process, and how to grow your role on the Cloud Closet team.</p>
      </div>
      <PrimaryBtn onClick={onComplete}>Finish Advanced Path <IcoChevronRight size={16}/></PrimaryBtn>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1">
        {Array.from({length:TOTAL},(_,i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${segClass(i+1)}`}/>)}
      </div>

      {section >= 1 && (
        <motion.div key="s1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5">
          <SectionHeader n={1} total={TOTAL} label="Why most creators use analytics wrong"/>
          <h3 className="text-base font-extrabold text-slate-800">&ldquo;View count is the least useful number on your analytics page.&rdquo;</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">Most creators open analytics, see view counts, feel good or bad, and close the tab. That&apos;s not analytics — that&apos;s ego monitoring. Real analytics work starts with the metrics that tell you something actionable: completion rate, average watch time, drop-off point, save rate, and share rate. These numbers tell you exactly what&apos;s working in your video structure and what isn&apos;t.</p>
          {!s1Done ? <PrimaryBtn onClick={() => advance(1, () => setS1Done(true))}>Continue to Section 2 <IcoChevronRight size={16}/></PrimaryBtn> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 2 && (
        <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={2} total={TOTAL} label="The metrics that matter"/>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Metric explainer</h3>
            <p className="text-xs text-slate-500 leading-[1.6]">Open each metric to see its benchmark and diagnostic. All 6 must be opened to continue.</p>
          </div>
          {!s2Done ? <MetricExplainer onDone={() => advance(2, () => setS2Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 3 && (
        <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={3} total={TOTAL} label="Building a personal tracker"/>
          <h3 className="text-base font-extrabold text-slate-800">The 10-minute weekly practice that compounds over time</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">Keep a simple log for every video you post. A spreadsheet or Notion table with these columns is enough: date posted, format used, hook type, completion rate, save rate, share rate, drop-off point, one observation. Don&apos;t skip the observation column — it&apos;s where the learning lives.</p>
          {!s3Done ? <TrackerSetupWizard onDone={() => advance(3, () => setS3Done(true))}/> : <SectionDoneTag/>}
        </motion.div>
      )}

      {section >= 4 && (
        <motion.div key="s4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}} className="flex flex-col gap-5 pt-2 border-t border-slate-100">
          <SectionHeader n={4} total={TOTAL} label="Reading failure correctly"/>
          <h3 className="text-base font-extrabold text-slate-800">&ldquo;There&apos;s no such thing as a wasted post if you read it correctly.&rdquo;</h3>
          <p className="text-sm text-slate-600 leading-[1.75]">A video with 200 views and 25% completion isn&apos;t a failure — it&apos;s a data point. It tells you something specific didn&apos;t work. Read the drop-off point. Check the hook. Compare it to a video that did perform. The difference between them is the lesson.</p>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-4 flex gap-3">
            <IcoAlert size={16} className="text-amber-500 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-slate-700 leading-[1.65]"><span className="font-extrabold">Don&apos;t delete low-performing videos.</span> Deleting removes data and can signal to the algorithm that your account produces unreliable content. Leave it up, log the data, learn from it, and move forward. TikTok&apos;s algorithm is forward-looking — one low performer doesn&apos;t define your next video&apos;s distribution.</p>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 mb-1">Before you finish the Advanced path</h4>
            <p className="text-xs text-slate-500 leading-[1.6]">Two questions. Your honest answers — not the right ones.</p>
          </div>
          {!s4Done
            ? <AdvancedReflection onDone={() => { advance(4, () => setS4Done(true)); setTimeout(() => setShowCompletion(true), 700); }}/>
            : <SectionDoneTag/>
          }
        </motion.div>
      )}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <button onClick={onComplete} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors">Mark module complete — admin view</button>
        </div>
      )}
    </div>
  );
}

// ─── Module definitions ───────────────────────────────────────────────────────────

const BEGINNER_MODULES = [
  { id:"5B", title:"Account Setup and Profile Optimization", subtitle:"Profile, settings, posting cadence, and your account brief", time:"8 min" },
  { id:"6B", title:"Production Basics",                       subtitle:"Gear, filming technique, and editing principles", time:"10 min" },
  { id:"7B", title:"Building Your UGC Portfolio",             subtitle:"What a portfolio is, what to include, and how to present it", time:"10 min" },
];
const ADVANCED_MODULES = [
  { id:"5A", title:"Content Strategy and Volume",                   subtitle:"Consistency infrastructure, trend monitoring, batching, and a weekly system", time:"11 min" },
  { id:"6A", title:"Hooks, Storytelling and Conversion Psychology", subtitle:"The four stop forces, story structure, CTA psychology, and hook writing practice", time:"11 min" },
  { id:"7A", title:"Analytics and Iteration",                       subtitle:"The metrics that matter, building a personal tracker, and reading failure correctly", time:"10 min" },
];

// ─── Main Track 2 Export ──────────────────────────────────────────────────────────

export function Track2OnboardingPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [path, setPath] = useState<"beginner" | "advanced" | null>(null);
  const [view, setView] = useState<"path-select" | "overview" | "module">("path-select");
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["locked","locked","locked"]);
  const [allDone, setAllDone] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);

  const completedCount = statuses.filter(s => s === "completed").length;
  const progressPct = path ? (completedCount / 3) * 100 : 0;

  function selectPath(p: "beginner" | "advanced") {
    setPath(p);
    setStatuses(isAdmin ? ["active","active","active"] : ["active","locked","locked"]);
    setView("overview");
  }

  function handlePass(idx: number) {
    setStatuses(prev => {
      const next = [...prev] as ModuleStatus[];
      next[idx] = "completed";
      if (idx + 1 < next.length) next[idx + 1] = "active";
      return next;
    });
    if (idx === 2) setTimeout(() => setAllDone(true), 900);
    else setTimeout(() => setView("overview"), 900);
  }

  function openModule(i: number) {
    if (statuses[i] === "locked") return;
    setCurrentModule(i);
    setView("module");
  }

  const modules = path === "beginner" ? BEGINNER_MODULES : ADVANCED_MODULES;
  const mod = modules[currentModule];
  const isCompleted = statuses[currentModule] === "completed";

  // ── Path selection ──
  if (view === "path-select") {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors self-start">
          <IcoChevronLeft size={13}/> Back to Track 1
        </button>
        <div>
          <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-[0.16em] mb-1">Track 2 of 3</p>
          <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Creator Training</h1>
          <p className="text-sm text-slate-500 mt-1 leading-[1.6]">Choose the path that fits where you are right now.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button onClick={() => selectPath("beginner")}
            whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            className="text-left rounded-2xl border-2 border-[#1a2f4a]/15 bg-white hover:border-[#4a8fd4]/50 hover:shadow-md p-5 flex flex-col gap-3 transition-all shadow-sm cursor-pointer">
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a2f4a] to-[#26476e] text-white text-xs font-extrabold flex items-center justify-center shadow-md">B</div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">28 min total</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800 mb-1">I&apos;m newer to content creation or brand work.</p>
              <p className="text-xs text-slate-500 leading-[1.6]">Covers account setup, production basics, and building your first portfolio.</p>
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              {BEGINNER_MODULES.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-extrabold text-[#4a8fd4]">{m.id}</span>
                  <span className="font-semibold truncate">{m.title}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[#4a8fd4] text-xs font-bold mt-1">Start Beginner path <IcoChevronRight size={12}/></div>
          </motion.button>

          <motion.button onClick={() => selectPath("advanced")}
            whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            className="text-left rounded-2xl border-2 border-[#1a2f4a]/15 bg-white hover:border-[#4a8fd4]/50 hover:shadow-md p-5 flex flex-col gap-3 transition-all shadow-sm cursor-pointer">
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a2f4a] to-[#26476e] text-white text-xs font-extrabold flex items-center justify-center shadow-md">A</div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1a2f4a]/8 text-[#1a2f4a]">32 min total</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800 mb-1">I&apos;ve made content before and want to go deeper.</p>
              <p className="text-xs text-slate-500 leading-[1.6]">Covers content strategy, hook psychology, and reading your analytics.</p>
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              {ADVANCED_MODULES.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-extrabold text-[#4a8fd4]">{m.id}</span>
                  <span className="font-semibold truncate">{m.title}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[#4a8fd4] text-xs font-bold mt-1">Start Advanced path <IcoChevronRight size={12}/></div>
          </motion.button>
        </div>

        <div className="bg-[#4a8fd4]/6 border border-[#4a8fd4]/20 rounded-2xl px-4 py-3.5 flex gap-2.5">
          <IcoAlert size={14} className="text-[#4a8fd4] flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-slate-600 leading-[1.65]"><span className="font-bold">Not sure?</span> Go with Beginner — it&apos;s fast and covers things even experienced creators often miss. You can always access the other path afterward.</p>
        </div>
      </div>
    );
  }

  // ── Overview ──
  if (view === "overview") {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-12">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-[0.16em] mb-1">Track 2 — {path === "beginner" ? "Beginner" : "Advanced"} Path</p>
            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Creator Training</h1>
            <p className="text-sm text-slate-500 mt-1 leading-[1.6]">Complete all 3 modules to finish Track 2</p>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mt-1 flex-shrink-0">
            <IcoChevronLeft size={13}/> Track 1
          </button>
        </div>

        {!showSwitchConfirm ? (
          <button onClick={() => setShowSwitchConfirm(true)}
            className="self-start text-[11px] font-bold text-slate-400 hover:text-[#4a8fd4] transition-colors underline underline-offset-2">
            Switch to {path === "beginner" ? "Advanced" : "Beginner"} path →
          </button>
        ) : (
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:0.25,ease:"easeOut" as const}}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex flex-col gap-3">
            <p className="text-xs font-extrabold text-amber-700">Switch to the {path === "beginner" ? "Advanced" : "Beginner"} path?</p>
            {completedCount > 0
              ? <p className="text-xs text-slate-600 leading-[1.65]">You&apos;ve completed {completedCount} module{completedCount > 1 ? "s" : ""} on the {path} path. Switching will start the new path from scratch — your progress here won&apos;t be lost, but you&apos;ll need to complete the new path separately.</p>
              : <p className="text-xs text-slate-600 leading-[1.65]">You haven&apos;t started any modules yet, so switching is free.</p>
            }
            <div className="flex items-center gap-2">
              <button onClick={() => { selectPath(path === "beginner" ? "advanced" : "beginner"); setShowSwitchConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-[#1a2f4a] text-white text-xs font-extrabold hover:bg-[#26476e] transition-colors">
                Yes, switch path
              </button>
              <button onClick={() => setShowSwitchConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-extrabold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                Stay on {path} path
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Track 2 Progress</p>
            <p className="text-[11px] font-extrabold text-[#1a2f4a]">{completedCount} of 3 complete · {Math.round(progressPct)}%</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#1a2f4a] to-[#4a8fd4]"
              animate={{width:`${progressPct}%`}} transition={{duration:0.7,ease:"easeOut" as const}}/>
          </div>
          <div className="flex justify-between mt-1.5">
            {[0,33,66,100].map(p => (
              <span key={p} className={`text-[9px] font-bold ${progressPct >= p ? "text-[#4a8fd4]" : "text-slate-300"}`}>{p}%</span>
            ))}
          </div>
        </div>

        {allDone && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut" as const}}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center"><IcoCheck size={22} className="text-white"/></div>
            <div>
              <p className="text-base font-extrabold text-slate-800">Track 2 complete.</p>
              <p className="text-xs text-slate-500 mt-1 leading-[1.6]">Track 3 — Operating Procedures is coming soon.</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em] px-0.5">Modules</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((m, i) => {
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
                    <div className={["w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0",
                      locked ? "bg-slate-200 text-slate-400" : complete ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-[#1a2f4a] to-[#26476e] text-white shadow-md"].join(" ")}>
                      {complete ? <IcoCheck size={15}/> : locked ? <IcoLock size={13}/> : m.id}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      locked ? "bg-slate-200 text-slate-400" : complete ? "bg-emerald-100 text-emerald-700" : "bg-[#1a2f4a]/8 text-[#1a2f4a]"
                    }`}>{locked ? "Locked" : complete ? "Complete" : `~${m.time}`}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-extrabold leading-tight mb-1 ${locked ? "text-slate-400" : "text-slate-800"}`}>{m.title}</p>
                    <p className={`text-xs leading-[1.6] ${locked ? "text-slate-300" : "text-slate-500"}`}>{m.subtitle}</p>
                  </div>
                  {!locked && !complete && <div className="flex items-center gap-1 text-[#4a8fd4] text-xs font-bold mt-auto">Start module <IcoChevronRight size={12}/></div>}
                  {complete && <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-auto"><IcoCheck size={12}/> Completed — tap to review</div>}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Module view ──
  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold text-[#4a8fd4] uppercase tracking-[0.16em] mb-1">Track 2 — {path === "beginner" ? "Beginner" : "Advanced"} Path</p>
          <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Creator Training</h1>
        </div>
        <button onClick={() => setView("overview")} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mt-1 flex-shrink-0">
          <IcoChevronLeft size={13}/> Overview
        </button>
      </div>

      <motion.div key={`module-${currentModule}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:"easeOut" as const}}
        className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#1a2f4a] to-[#1e3a5f] px-5 py-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-[#4a8fd4] uppercase tracking-[0.14em]">Module {mod.id} · ~{mod.time}</p>
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
          {currentModule === 0 && path === "beginner"  && !isCompleted && <Module5BContent onComplete={() => handlePass(0)} isAdmin={isAdmin}/>}
          {currentModule === 0 && path === "advanced"  && !isCompleted && <Module5AContent onComplete={() => handlePass(0)} isAdmin={isAdmin}/>}
          {currentModule === 0 && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><IcoCheck size={28} className="text-emerald-500"/></div>
              <p className="text-base font-extrabold text-slate-700">Module 5B Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">Your account is set up and your brief is written.</p>
              <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1"><IcoChevronLeft size={12}/> Back to overview</button>
            </div>
          )}
          {currentModule === 1 && path === "beginner"  && !isCompleted && <Module6BContent onComplete={() => handlePass(1)} isAdmin={isAdmin}/>}
          {currentModule === 1 && path === "advanced"  && !isCompleted && <Module6AContent onComplete={() => handlePass(1)} isAdmin={isAdmin}/>}
          {currentModule === 1 && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><IcoCheck size={28} className="text-emerald-500"/></div>
              <p className="text-base font-extrabold text-slate-700">Module 6B Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">You have the gear knowledge and filming fundamentals.</p>
              <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1"><IcoChevronLeft size={12}/> Back to overview</button>
            </div>
          )}
          {currentModule === 2 && path === "beginner"  && !isCompleted && <Module7BContent onComplete={() => handlePass(2)} isAdmin={isAdmin}/>}
          {currentModule === 2 && path === "advanced"  && !isCompleted && <Module7AContent onComplete={() => handlePass(2)} isAdmin={isAdmin}/>}
          {currentModule === 2 && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><IcoCheck size={28} className="text-emerald-500"/></div>
              <p className="text-base font-extrabold text-slate-700">Beginner Path Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">You have what you need to film and build your portfolio.</p>
              <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1"><IcoChevronLeft size={12}/> Back to overview</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
