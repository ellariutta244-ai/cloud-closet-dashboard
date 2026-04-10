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

// ─── Module definitions ───────────────────────────────────────────────────────────

const BEGINNER_MODULES = [
  { id:"5B", title:"Account Setup and Profile Optimization", subtitle:"Profile, settings, posting cadence, and your account brief", time:"8 min" },
  { id:"6B", title:"Production Basics",                       subtitle:"Gear, filming technique, and editing principles", time:"10 min" },
  { id:"7B", title:"Building Your UGC Portfolio",             subtitle:"What a portfolio is, what to include, and how to present it", time:"10 min" },
];
const ADVANCED_MODULES = [
  { id:"5A", title:"Content Strategy & Positioning",   subtitle:"Niche mapping, content pillars, and competitive differentiation", time:"10 min" },
  { id:"6A", title:"Hook Psychology & Script Writing", subtitle:"Psychological triggers, script architecture, and testing frameworks", time:"12 min" },
  { id:"7A", title:"Analytics & Iteration",            subtitle:"Reading your data, diagnosing underperformance, and iterating fast", time:"10 min" },
];

// ─── Main Track 2 Export ──────────────────────────────────────────────────────────

export function Track2OnboardingPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [path, setPath] = useState<"beginner" | "advanced" | null>(null);
  const [view, setView] = useState<"path-select" | "overview" | "module">("path-select");
  const [currentModule, setCurrentModule] = useState(0);
  const [statuses, setStatuses] = useState<ModuleStatus[]>(["locked","locked","locked"]);
  const [allDone, setAllDone] = useState(false);

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

          <div className="relative text-left rounded-2xl border-2 border-slate-100 bg-slate-50 opacity-60 p-5 flex flex-col gap-3 cursor-not-allowed">
            <div className="absolute top-3 right-3">
              <span className="text-[9px] font-extrabold uppercase tracking-widest bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Coming soon</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-400 text-xs font-extrabold flex items-center justify-center">A</div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-400">32 min total</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-400 mb-1">I&apos;ve made content before and want to go deeper.</p>
              <p className="text-xs text-slate-300 leading-[1.6]">Covers content strategy, hook psychology, and reading your analytics.</p>
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              {ADVANCED_MODULES.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span className="font-extrabold">{m.id}</span>
                  <span className="font-semibold truncate">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
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
          {currentModule === 0 && path === "beginner" && !isCompleted && <Module5BContent onComplete={() => handlePass(0)} isAdmin={isAdmin}/>}
          {currentModule === 0 && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><IcoCheck size={28} className="text-emerald-500"/></div>
              <p className="text-base font-extrabold text-slate-700">Module 5B Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">Your account is set up and your brief is written.</p>
              <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1"><IcoChevronLeft size={12}/> Back to overview</button>
            </div>
          )}
          {currentModule === 1 && path === "beginner" && !isCompleted && <Module6BContent onComplete={() => handlePass(1)} isAdmin={isAdmin}/>}
          {currentModule === 1 && isCompleted && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><IcoCheck size={28} className="text-emerald-500"/></div>
              <p className="text-base font-extrabold text-slate-700">Module 6B Complete!</p>
              <p className="text-sm text-slate-500 leading-[1.6]">You have the gear knowledge and filming fundamentals.</p>
              <button onClick={() => setView("overview")} className="mt-2 text-xs font-bold text-[#4a8fd4] hover:text-[#1a2f4a] transition-colors flex items-center gap-1"><IcoChevronLeft size={12}/> Back to overview</button>
            </div>
          )}
          {currentModule === 2 && path === "beginner" && !isCompleted && <Module7BContent onComplete={() => handlePass(2)} isAdmin={isAdmin}/>}
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
