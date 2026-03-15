"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PwaSetup } from "@/components/PwaSetup";
import {
  LayoutDashboard, CheckSquare, Mail, MessageCircle, FileText,
  FolderOpen, Users, BarChart3, Plus, Search, Bell,
  ArrowRight, Send, CheckCircle2, X, ChevronRight,
  LogOut, Upload, Pencil, Trash2, UserPlus,
  Loader2, Menu, CalendarDays, Inbox, Code2, Video,
  CalendarClock, ShoppingBag, Coffee, HelpCircle, MapPin,
  Play, Trophy, ExternalLink, ArrowUpRight, MessageSquare, TrendingUp,
  Settings as SettingsIcon, Zap, ChevronDown, ChevronUp, AlertTriangle, Bookmark, Copy,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "admin" | "intern" | "ugc_creator";
type Profile = { id: string; full_name: string; email: string; role: Role; team?: string; active?: boolean };
type Task = { id: string; title: string; description?: string; assigned_to?: string; category?: string; priority?: string; status: string; due_date?: string; created_at: string; completed_at?: string };
type Outreach = { id: string; intern_id?: string; brand_or_creator: string; platform?: string; contact_name?: string; date_contacted?: string; status: string; notes?: string; created_at: string };
type Reply = { id: string; question_id: string; author_id?: string; body: string; created_at: string };
type Question = { id: string; author_id?: string; title: string; category?: string; description?: string; status: string; created_at: string; question_replies?: Reply[] };
type Report = { id: string; intern_id?: string; week_of?: string; tasks_completed?: string; outreach_sent?: string; responses_received?: string; wins?: string; challenges?: string; ideas?: string; reviewed: boolean; created_at: string; file_url?: string; custom_data?: Record<string,any> };
type Resource = { id: string; title: string; description?: string; category?: string; file_url?: string; created_at: string };
type Announcement = { id: string; title: string; body?: string; pinned?: boolean; target_teams?: string[] | null; created_at: string };
type Activity = { id: string; user_id?: string; user_name?: string; activity?: string; metadata?: any; created_at: string };
type RequestType = { id: string; name: string; description?: string; icon?: string; kind?: string; calendly_ella?: string; calendly_noel?: string; active?: boolean };
type Request = { id: string; intern_id?: string; type_id?: string; type_name?: string; message: string; status: string; replies: RequestReply[]; created_at: string };
type RequestReply = { author: string; author_name: string; body: string; created_at: string };
type EventMaterial = { item: string; qty: string; fulfilled?: boolean };
type CCEvent = { id: string; title: string; description?: string; date?: string; time?: string; location?: string; status: string; intern_id?: string; team_members?: string[]; materials?: EventMaterial[]; created_at: string; file_url?: string };
type TechProject = { id: string; title: string; description?: string; status: string; priority?: string; owner_id?: string; contributors?: string[]; tech_stack?: string; github_url?: string; progress: number; created_at: string; updated_at?: string };
type ContentVideo = { id: string; creator_id?: string; title: string; tiktok_url?: string; views?: number; likes?: number; comments?: number; date_posted?: string; status: string; created_at: string };
type AppSettings = Record<string, string>;
type ReportFieldConfig = { tasks_completed:boolean; outreach_sent:boolean; responses_received:boolean; wins:boolean; challenges:boolean; ideas:boolean; custom_fields:{key:string;label:string;type:"checkbox"|"text"}[] };
type ReportConfig = Record<string, ReportFieldConfig>;

// ── Constants ─────────────────────────────────────────────────────────────────
const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
  "Tech/AI":          { bg: "#FEF3C7", text: "#92400E" },
  "Strategy":         { bg: "#EDE9FE", text: "#5B21B6" },
  "Events/Outreach":  { bg: "#D1FAE5", text: "#065F46" },
  "Design":           { bg: "#FCE7F3", text: "#9D174D" },
  "Curation Team":    { bg: "#CFFAFE", text: "#155E75" },
  "Content Creation": { bg: "#DBEAFE", text: "#1E40AF" },
};
const AV_COLORS = ["#E8D5C4","#C4D4E8","#D4E8C4","#E8C4D4","#D4C4E8","#C4E8D4","#E8E0C4","#C4E8E8"];
const STATUS_COLORS: Record<string, string> = { not_started:"#D1D5DB", in_progress:"#F59E0B", submitted:"#8B5CF6", completed:"#10B981" };
const PRI_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg:"#F3F4F6", text:"#6B7280" }, medium: { bg:"#FEF3C7", text:"#92400E" },
  high: { bg:"#FEE2E2", text:"#991B1B" }, urgent: { bg:"#EDE9FE", text:"#5B21B6" },
};

const DEFAULT_REPORT_FIELDS: ReportFieldConfig = { tasks_completed:true, outreach_sent:true, responses_received:true, wins:true, challenges:true, ideas:true, custom_fields:[] };

function avColor(name: string) { let h=0; for (let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xffff; return AV_COLORS[h%AV_COLORS.length]; }
function initials(name: string) { return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
function fmt(dt?: string) { if (!dt) return ""; return new Date(dt).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Av({ name, size=32 }: { name: string; size?: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:avColor(name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:600, color:"#3D3229", flexShrink:0 }}>
      {initials(name)}
    </div>
  );
}

type BV = "default"|"success"|"warning"|"danger"|"info"|"purple";
const BG_CLS: Record<BV,string> = { default:"bg-stone-100 text-stone-600", success:"bg-emerald-50 text-emerald-700", warning:"bg-amber-50 text-amber-700", danger:"bg-red-50 text-red-600", info:"bg-sky-50 text-sky-700", purple:"bg-violet-50 text-violet-700" };
function Bg({ v="default", children }: { v?: BV; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BG_CLS[v]}`}>{children}</span>;
}
function TB({ team }: { team?: string }) {
  const tc = team ? TEAM_COLORS[team] : undefined;
  if (!tc) return <span className="text-xs text-stone-400">{team||"—"}</span>;
  return <span style={{ background:tc.bg, color:tc.text }} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">{team}</span>;
}
function SD({ status }: { status: string }) {
  return <span style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLORS[status]||"#D1D5DB", display:"inline-block", flexShrink:0 }} />;
}
function PB({ priority }: { priority?: string }) {
  if (!priority) return null;
  const c = PRI_COLORS[priority]||PRI_COLORS.low;
  return <span style={{ background:c.bg, color:c.text }} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize">{priority}</span>;
}
function Btn({ onClick, children, variant="primary", disabled, className="", type="button", size="md" }: { onClick?: ()=>void; children: React.ReactNode; variant?: "primary"|"secondary"|"ghost"|"danger"; disabled?: boolean; className?: string; type?: "button"|"submit"; size?: "sm"|"md" }) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer min-h-[44px]";
  const sz = { sm:"px-3 py-1.5 text-xs", md:"px-4 py-2 text-sm" };
  const vv = { primary:"bg-stone-800 text-white hover:bg-stone-700 shadow-sm", secondary:"bg-stone-100 text-stone-700 hover:bg-stone-200", ghost:"text-stone-600 hover:bg-stone-100", danger:"bg-red-50 text-red-600 hover:bg-red-100" };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz[size]} ${vv[variant]} ${className}`}>{children}</button>;
}
function TI({ label, value, onChange, placeholder, type="text", required }: { label?: string; value: string; onChange:(v:string)=>void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-base text-stone-800 focus:outline-none focus:border-stone-400" />
    </div>
  );
}
function TA({ label, value, onChange, placeholder, rows=3 }: { label?: string; value: string; onChange:(v:string)=>void; placeholder?: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-base text-stone-800 focus:outline-none focus:border-stone-400 resize-none" />
    </div>
  );
}
function Sel({ label, value, onChange, options }: { label?: string; value: string; onChange:(v:string)=>void; options:{value:string;label:string}[] }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-base text-stone-800 focus:outline-none focus:border-stone-400">
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function ES({ icon, message }: { icon?: React.ReactNode; message: string }) {
  return <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-400">{icon && <div className="opacity-40">{icon}</div>}<p className="text-sm">{message}</p></div>;
}
function SC({ label, value, sub }: { label: string; value: string|number; sub?: string }) {
  return (
    <div className="bg-white border border-stone-200/60 rounded-xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}
function Md({ open, onClose, title, children }: { open: boolean; onClose:()=>void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FileDropZone({ file, setFile }: { file:File|null; setFile:(f:File|null)=>void }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={e=>{e.preventDefault();setDrag(true);}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setFile(f);}}
      className={`flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none ${drag?"border-stone-500 bg-stone-50":"border-stone-200 hover:border-stone-400 hover:bg-stone-50"}`}>
      <Upload size={18} className={drag?"text-stone-600":"text-stone-400"}/>
      {file
        ? <div className="text-center"><p className="text-sm font-medium text-stone-700">{file.name}</p><p className="text-xs text-stone-400">{(file.size/1024).toFixed(0)} KB · <span className="text-red-400" onClick={e=>{e.preventDefault();setFile(null);}}>Remove</span></p></div>
        : <div className="text-center"><p className="text-sm text-stone-500">Drag &amp; drop or <span className="text-stone-700 font-medium underline">browse</span></p><p className="text-xs text-stone-400 mt-0.5">Any file type</p></div>
      }
      <input type="file" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
    </label>
  );
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
function AdminDash({ interns, tasks, outreach, questions, activity, announcements, setAnnouncements, ugcPivotQueue, ugcSubmissions, ugcCreators, smartAlerts, sb }: { interns:Profile[]; tasks:Task[]; outreach:Outreach[]; questions:Question[]; activity:Activity[]; announcements:Announcement[]; setAnnouncements:(a:Announcement[])=>void; ugcPivotQueue:UGCPivotQueue[]; ugcSubmissions:UGCSubmission[]; ugcCreators:UGCCreatorProfile[]; smartAlerts:SmartAlert[]; sb:any }) {
  const completed = tasks.filter(t=>t.status==="completed").length;
  const openQ = questions.filter(q=>q.status==="open").length;
  const activeCount = interns.filter(i=>i.active!==false).length;
  const pendingPivots = ugcPivotQueue.filter(q => q.status === "pending").length;
  const currentWeek = getMondayOfWeek(new Date());
  const submittedThisWeek = ugcSubmissions.filter(s => s.week_date === currentWeek);
  const killRuleAlerts = ugcSubmissions.filter(s => s.week_date === currentWeek && s.total_views < 1000);
  const scaleRuleAlerts = ugcSubmissions.filter(s => s.week_date === currentWeek && s.total_views >= 10000);
  const TEAMS = ["Tech/AI","Strategy","Events/Outreach","Design","Curation Team","Content Creation","UGC Creators"];
  const [aModal, setAModal] = useState(false);
  const [aForm, setAForm] = useState({ title:"", body:"", pinned:false, target_teams:[] as string[] });
  const [aSaving, setASaving] = useState(false);
  function toggleTeam(team:string) {
    setAForm(f => ({ ...f, target_teams: f.target_teams.includes(team) ? f.target_teams.filter(t=>t!==team) : [...f.target_teams, team] }));
  }
  async function createAnnouncement() {
    if (!aForm.title.trim()) return;
    setASaving(true);
    const { data, error } = await sb.from("announcements").insert({
      title: aForm.title, body: aForm.body || "", pinned: aForm.pinned,
      target_teams: aForm.target_teams.length > 0 ? aForm.target_teams : null,
      created_at: new Date().toISOString(),
    }).select().single();
    setASaving(false);
    if (error) { console.error("[announcements insert]", error.message, error.code, error.details, error.hint); return; }
    setAnnouncements([data as Announcement, ...announcements]);
    setAModal(false); setAForm({ title:"", body:"", pinned:false, target_teams:[] });
  }
  async function deleteAnnouncement(id:string) {
    await sb.from("announcements").delete().eq("id", id);
    setAnnouncements(announcements.filter(a=>a.id!==id));
  }

  const teams = useMemo(() => {
    const m: Record<string,{members:Profile[];tasks:number;done:number;out:number}> = {};
    interns.forEach(i=>{ const t=i.team||"Other"; if(!m[t]) m[t]={members:[],tasks:0,done:0,out:0}; m[t].members.push(i); });
    tasks.forEach(t=>{ const i=interns.find(x=>x.id===t.assigned_to); const tm=i?.team||"Other"; if(!m[tm]) m[tm]={members:[],tasks:0,done:0,out:0}; m[tm].tasks++; if(t.status==="completed") m[tm].done++; });
    outreach.forEach(o=>{ const i=interns.find(x=>x.id===o.intern_id); const tm=i?.team||"Other"; if(!m[tm]) m[tm]={members:[],tasks:0,done:0,out:0}; m[tm].out++; });
    return m;
  }, [interns, tasks, outreach]);

  return (
    <div className="flex flex-col gap-6">
      {smartAlerts.filter(a => a.urgency === "purple").map(alert => (
        <div key={alert.id} className="border-2 rounded-xl p-4 flex items-center gap-3" style={{ borderColor: "#c4b5fd", backgroundColor: "#faf5ff" }}>
          <span className="text-xl">🚀</span>
          <p className="flex-1 text-sm font-semibold" style={{ color: "#7c3aed" }}>{alert.message}</p>
        </div>
      ))}
      <div>
        <h1 className="text-xl font-bold text-stone-800">Content Lab Overview</h1>
        <p className="text-sm text-stone-400 mt-0.5">Real-time team activity and progress</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SC label="Total Outreach" value={outreach.length} sub={`${activeCount} interns`}/>
        <SC label="Tasks Completed" value={completed}/>
        <SC label="Open Questions" value={openQ}/>
        <SC label="Active Interns" value={activeCount}/>
      </div>

      {/* UGC Overview */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-4">
        <p className="text-sm font-semibold text-stone-700 mb-3">UGC Team This Week</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <SC label="Pending Pivots" value={pendingPivots} sub={pendingPivots > 0 ? "needs review" : "all clear"} />
          <SC label="Submitted This Week" value={submittedThisWeek.length} sub={`of ${ugcCreators.length} creators`} />
          <SC label="Kill Rule Alerts" value={killRuleAlerts.length} sub="under 1k views" />
          <SC label="Scale Rule" value={scaleRuleAlerts.length} sub="10k+ views 🔥" />
        </div>
        {scaleRuleAlerts.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-700 mb-1">🚀 Scale Rule Triggered</p>
            {scaleRuleAlerts.map(s => {
              const creator = ugcCreators.find(c => c.id === s.creator_id);
              return <p key={s.id} className="text-xs text-emerald-600">{creator?.full_name || "Unknown"} — {s.total_views.toLocaleString()} views (replicate with 3 hook variations)</p>;
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-stone-700 flex items-center gap-1.5"><Bell size={14} className="text-stone-400"/>Announcements</p>
            <Btn onClick={()=>setAModal(true)}><Plus size={12}/>New</Btn>
          </div>
          {announcements.length===0 ? <ES message="No announcements"/> : (
            <div className="flex flex-col gap-3">
              {announcements.slice(0,6).map(a=>(
                <div key={a.id} className="border-l-2 border-stone-300 pl-3 group flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {a.pinned && <Bg v="warning">Pinned</Bg>}
                      {a.target_teams && a.target_teams.length > 0
                        ? a.target_teams.map(t=><Bg key={t} v="info">{t}</Bg>)
                        : <Bg v="default">All Interns</Bg>}
                    </div>
                    <p className="text-xs font-medium text-stone-700 mt-1">{a.title}</p>
                    {a.body && <p className="text-xs text-stone-500 mt-0.5">{a.body}</p>}
                  </div>
                  <button onClick={()=>{ if(window.confirm("Delete this announcement?")) deleteAnnouncement(a.id); }} className="p-1 rounded opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"><Trash2 size={11}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Md open={aModal} onClose={()=>setAModal(false)} title="New Announcement">
          <div className="flex flex-col gap-3">
            <TI label="Title" value={aForm.title} onChange={v=>setAForm({...aForm,title:v})} required/>
            <TA label="Body (optional)" value={aForm.body} onChange={v=>setAForm({...aForm,body:v})}/>
            <div>
              <p className="text-xs font-medium text-stone-600 mb-2">Send to</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <button onClick={()=>setAForm({...aForm,target_teams:[]})} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${aForm.target_teams.length===0?"bg-stone-800 text-white border-stone-800":"border-stone-200 text-stone-500 hover:border-stone-400"}`}>All Interns</button>
                {TEAMS.map(t=>(
                  <button key={t} onClick={()=>toggleTeam(t)} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${aForm.target_teams.includes(t)?"bg-stone-800 text-white border-stone-800":"border-stone-200 text-stone-500 hover:border-stone-400"}`}>{t}</button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={aForm.pinned} onChange={e=>setAForm({...aForm,pinned:e.target.checked})} className="rounded"/>
              <span className="text-sm text-stone-600">Pin to intern dashboard</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" onClick={()=>setAModal(false)}>Cancel</Btn>
              <Btn onClick={createAnnouncement} disabled={!aForm.title.trim()||aSaving}>{aSaving?"Sending...":"Send Announcement"}</Btn>
            </div>
          </div>
        </Md>
      </div>
      {Object.keys(teams).length>0 && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-3">Team Snapshot</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(teams).map(([team,d])=>(
              <div key={team} className="border border-stone-100 rounded-lg p-3">
                <TB team={team}/>
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="text-xs text-stone-500">{d.members.length} members</span>
                  <span className="text-xs text-stone-500">{d.tasks} tasks · {d.done} done</span>
                  <span className="text-xs text-stone-500">{d.out} outreach</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Intern Dashboard ───────────────────────────────────────────────────────────
function InternDash({ profile, tasks, outreach, announcements, requests, setPage }: { profile:Profile; tasks:Task[]; outreach:Outreach[]; announcements:Announcement[]; requests:Request[]; setPage:(p:string)=>void }) {
  const myTasks = tasks.filter(t=>t.assigned_to===profile.id);
  const active = myTasks.filter(t=>t.status!=="completed").length;
  const myOut = outreach.filter(o=>o.intern_id===profile.id);
  const responded = myOut.filter(o=>["responded","interested"].includes(o.status)).length;
  const rate = myOut.length>0 ? Math.round((responded/myOut.length)*100) : 0;
  const myAnnouncements = announcements.filter(a => !a.target_teams || a.target_teams.length === 0 || a.target_teams.includes(profile.team || ""));
  const pinned = myAnnouncements.filter(a=>a.pinned);
  const first = profile.full_name?.split(" ")[0]||"there";
  const unreadReplies = requests.filter(r=>r.intern_id===profile.id && r.replies.length>0 && r.status!=="resolved");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Hey {first}</h1>
          <p className="text-sm text-stone-400 mt-0.5">Here&apos;s what&apos;s on your plate</p>
        </div>
        <Btn onClick={()=>setPage("outreach")}><Plus size={14}/>Log Outreach</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SC label="Active Tasks" value={active}/>
        <SC label="Outreach Sent" value={myOut.length}/>
        <SC label="Response Rate" value={`${rate}%`}/>
      </div>
      {unreadReplies.length>0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><MessageSquare size={14} className="text-emerald-600"/><span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Messages from Ella &amp; Noel</span></div>
            <button onClick={()=>setPage("requests")} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">View all<ChevronRight size={12}/></button>
          </div>
          {unreadReplies.slice(0,2).map(r=>{
            const last=r.replies[r.replies.length-1];
            return (
              <div key={r.id} onClick={()=>setPage("requests")} className="bg-white border-2 border-emerald-300 shadow-sm shadow-emerald-50 rounded-xl p-4 cursor-pointer">
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/><span className="text-xs text-stone-400">{r.type_name}</span></div>
                <p className="text-xs text-stone-400 mb-1 line-clamp-1">You: {r.message}</p>
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-2 flex items-start gap-2">
                  <Av name={last.author_name||"Admin"} size={20}/>
                  <div><p className="text-xs font-medium text-sky-700">{last.author_name}</p><p className="text-xs text-stone-600">{last.body}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {pinned.length>0 && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Announcements</p>
          <div className="flex flex-col gap-2">
            {pinned.map(a=><div key={a.id}><p className="text-sm font-medium text-amber-800">{a.title}</p>{a.body&&<p className="text-xs text-amber-700 mt-0.5">{a.body}</p>}</div>)}
          </div>
        </div>
      )}
      <div className="bg-white border border-stone-200/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Your Tasks</p>
          <button className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5" onClick={()=>setPage("tasks")}>View all<ChevronRight size={12}/></button>
        </div>
        {myTasks.length===0 ? <ES icon={<CheckSquare size={24}/>} message="No tasks assigned yet"/> : (
          <div className="flex flex-col gap-2">
            {myTasks.slice(0,4).map(t=>(
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                <SD status={t.status}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 truncate">{t.title}</p>
                  {t.due_date&&<p className="text-xs text-stone-400">Due {fmt(t.due_date)}</p>}
                </div>
                <PB priority={t.priority}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tasks Page ─────────────────────────────────────────────────────────────────
function TasksPg({ profile, interns, tasks, setTasks, sb, addActivity }: { profile:Profile; interns:Profile[]; tasks:Task[]; setTasks:(t:Task[])=>void; sb:any; addActivity:(a:any)=>void }) {
  const [filter,setFilter]=useState("all");
  const [modal,setModal]=useState(false);
  const [detail,setDetail]=useState<Task|null>(null);
  const [form,setForm]=useState({ title:"", description:"", assigned_to:"", category:"brand_outreach", priority:"medium", status:"not_started", due_date:"" });
  const [dateTbd,setDateTbd]=useState(false);
  const isAdmin=profile.role==="admin";
  const visible=isAdmin ? tasks : tasks.filter(t=>t.assigned_to===profile.id);
  const filtered=filter==="all" ? visible : visible.filter(t=>t.status===filter);
  const SL: Record<string,string> = { not_started:"Not Started", in_progress:"In Progress", submitted:"Submitted", completed:"Completed" };
  const CATS = [{value:"brand_outreach",label:"Brand Outreach"},{value:"creator_outreach",label:"Creator Outreach"},{value:"campus_partnerships",label:"Campus Partnerships"},{value:"content_creation",label:"Content Creation"},{value:"research",label:"Research"},{value:"other",label:"Other"}];
  const iName=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"—";

  async function create() {
    if (!form.title.trim()) return;
    const {data,error}=await sb.from("tasks").insert({...form,due_date:dateTbd?null:(form.due_date||null),created_at:new Date().toISOString()}).select().single();
    if (error){console.error("[tasks insert]", error.message, error.code, error.details, error.hint);return;}
    setTasks([data as Task, ...tasks.filter(t => t.id !== data.id)]);setModal(false);setDateTbd(false);
    setForm({title:"",description:"",assigned_to:"",category:"brand_outreach",priority:"medium",status:"not_started",due_date:""});
  }
  async function updateStatus(task:Task,status:string) {
    const upd:any={status};
    if (status==="completed") upd.completed_at=new Date().toISOString();
    await sb.from("tasks").update(upd).eq("id",task.id);
    setTasks(tasks.map(t=>t.id===task.id?{...t,...upd}:t));
    if (detail?.id===task.id) setDetail({...detail,...upd});
    if (status==="completed") addActivity({user_id:profile.id,user_name:profile.full_name,activity:"task_completed",metadata:{task:task.title}});
  }
  async function del(id:string) {
    await sb.from("tasks").delete().eq("id",id);
    setTasks(tasks.filter(t=>t.id!==id));if(detail?.id===id)setDetail(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">{isAdmin?"All Tasks":"My Tasks"}</h1>
        {isAdmin&&<Btn onClick={()=>setModal(true)}><Plus size={14}/>New Task</Btn>}
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {["all","not_started","in_progress","submitted","completed"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s?"bg-white text-stone-800 shadow-sm":"text-stone-500 hover:text-stone-700"}`}>
            {s==="all"?"All":SL[s]}
          </button>
        ))}
      </div>
      {filtered.length===0 ? <ES icon={<CheckSquare size={24}/>} message="No tasks here"/> : (
        <div className="flex flex-col gap-2">
          {filtered.map(t=>(
            <div key={t.id} onClick={()=>setDetail(t)} className="bg-white border border-stone-200/60 rounded-xl p-4 cursor-pointer hover:border-stone-300 transition-all flex items-center gap-3">
              <SD status={t.status}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{t.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {isAdmin&&<span className="text-xs text-stone-400">{iName(t.assigned_to)}</span>}
                  {t.due_date&&<span className="text-xs text-stone-400">Due {fmt(t.due_date)}</span>}
                </div>
              </div>
              <PB priority={t.priority}/><ChevronRight size={14} className="text-stone-300"/>
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={()=>{setModal(false);setDateTbd(false);}} title="New Task">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={form.title} onChange={v=>setForm({...form,title:v})} required/>
          <TA label="Description" value={form.description} onChange={v=>setForm({...form,description:v})}/>
          <Sel label="Assign To" value={form.assigned_to} onChange={v=>setForm({...form,assigned_to:v})} options={[{value:"",label:"— Select intern —"},...interns.filter(i=>i.active!==false).map(i=>({value:i.id,label:i.full_name}))]}/>
          <Sel label="Category" value={form.category} onChange={v=>setForm({...form,category:v})} options={CATS}/>
          <Sel label="Priority" value={form.priority} onChange={v=>setForm({...form,priority:v})} options={["low","medium","high","urgent"].map(p=>({value:p,label:p.charAt(0).toUpperCase()+p.slice(1)}))}/>
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1.5">Due Date</label>
            <div className="flex items-center gap-3">
              <input type="date" value={dateTbd?"":form.due_date} disabled={dateTbd} onChange={e=>setForm({...form,due_date:e.target.value})} className={`flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 ${dateTbd?"opacity-40 cursor-not-allowed":""}`}/>
              <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer whitespace-nowrap"><input type="checkbox" checked={dateTbd} onChange={e=>setDateTbd(e.target.checked)} className="rounded"/>TBD</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>{setModal(false);setDateTbd(false);}}>Cancel</Btn>
            <Btn onClick={create} disabled={!form.title.trim()}>Create Task</Btn>
          </div>
        </div>
      </Md>
      <Md open={!!detail} onClose={()=>setDetail(null)} title="Task Detail">
        {detail&&(
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><SD status={detail.status}/><span className="text-xs text-stone-500">{SL[detail.status]||detail.status}</span></div>
              <h3 className="text-base font-semibold text-stone-800">{detail.title}</h3>
              {detail.description&&<p className="text-sm text-stone-500 mt-1">{detail.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <PB priority={detail.priority}/>
              {isAdmin&&<span className="text-xs text-stone-500">→ {iName(detail.assigned_to)}</span>}
              {detail.due_date&&<span className="text-xs text-stone-400">Due {fmt(detail.due_date)}</span>}
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {["not_started","in_progress","submitted","completed"].map(s=>(
                  <button key={s} onClick={()=>updateStatus(detail,s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${detail.status===s?"bg-stone-800 text-white":"bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{SL[s]}</button>
                ))}
              </div>
            </div>
            {isAdmin&&<div className="flex justify-end pt-2 border-t border-stone-100"><Btn variant="danger" onClick={()=>del(detail.id)}><Trash2 size={14}/>Delete</Btn></div>}
          </div>
        )}
      </Md>
    </div>
  );
}

// ── Outreach Page ──────────────────────────────────────────────────────────────
function OutPg({ profile, interns, outreach, setOutreach, sb, addActivity }: { profile:Profile; interns:Profile[]; outreach:Outreach[]; setOutreach:(o:Outreach[])=>void; sb:any; addActivity:(a:any)=>void }) {
  const [modal,setModal]=useState(false);
  const [filter,setFilter]=useState("all");
  const [form,setForm]=useState({brand_or_creator:"",platform:"email",contact_name:"",date_contacted:"",status:"contacted",notes:""});
  const isAdmin=profile.role==="admin";
  const visible=isAdmin ? outreach : outreach.filter(o=>o.intern_id===profile.id);
  const filtered=filter==="all" ? visible : visible.filter(o=>o.status===filter);
  const STATS=["contacted","follow_up_needed","responded","interested","closed"];
  const SL: Record<string,string>={contacted:"Contacted",follow_up_needed:"Follow Up",responded:"Responded",interested:"Interested",closed:"Closed"};
  const SV: Record<string,BV>={contacted:"default",follow_up_needed:"warning",responded:"info",interested:"success",closed:"danger"};
  const counts=useMemo(()=>{ const c:Record<string,number>={};STATS.forEach(s=>{c[s]=visible.filter(o=>o.status===s).length;});return c; },[visible]);
  const iName=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"—";

  async function log() {
    if (!form.brand_or_creator.trim()) return;
    const {data,error}=await sb.from("outreach_logs").insert({...form,intern_id:profile.id,created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setOutreach([data,...outreach]);
    addActivity({user_id:profile.id,user_name:profile.full_name,activity:"outreach_logged",metadata:{detail:form.brand_or_creator}});
    setModal(false);setForm({brand_or_creator:"",platform:"email",contact_name:"",date_contacted:"",status:"contacted",notes:""});
  }
  async function updateSt(id:string,status:string) {
    await sb.from("outreach_logs").update({status}).eq("id",id);
    setOutreach(outreach.map(o=>o.id===id?{...o,status}:o));
  }
  async function deleteLog(id:string) {
    await sb.from("outreach_logs").delete().eq("id",id);
    setOutreach(outreach.filter(o=>o.id!==id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Outreach Log</h1>
        <Btn onClick={()=>setModal(true)}><Plus size={14}/>Log Outreach</Btn>
      </div>
      {isAdmin&&(
        <div className="grid grid-cols-5 gap-2">
          {STATS.map(s=><div key={s} className="bg-white border border-stone-200/60 rounded-xl p-3 text-center"><p className="text-lg font-bold text-stone-800">{counts[s]||0}</p><p className="text-xs text-stone-400">{SL[s]}</p></div>)}
        </div>
      )}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        <button onClick={()=>setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter==="all"?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>All</button>
        {STATS.map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{SL[s]}</button>)}
      </div>
      {filtered.length===0 ? <ES icon={<Mail size={24}/>} message="No outreach entries here"/> : (
        <div className="flex flex-col gap-2">
          {filtered.map(o=>(
            <div key={o.id} className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800">{o.brand_or_creator}</p>
                  <Bg v={SV[o.status]||"default"}>{SL[o.status]||o.status}</Bg>
                </div>
                {o.contact_name&&<p className="text-xs text-stone-500 mt-0.5">Contact: {o.contact_name}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {o.platform&&<span className="text-xs text-stone-400 capitalize">{o.platform}</span>}
                  {o.date_contacted&&<span className="text-xs text-stone-400">{fmt(o.date_contacted)}</span>}
                  {isAdmin&&<span className="text-xs text-stone-400">{iName(o.intern_id)}</span>}
                </div>
                {o.notes&&<p className="text-xs text-stone-500 mt-1 italic">{o.notes}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select value={o.status} onChange={e=>updateSt(o.id,e.target.value)} onClick={e=>e.stopPropagation()} className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-600">
                  {STATS.map(s=><option key={s} value={s}>{SL[s]}</option>)}
                </select>
                {isAdmin&&<button onClick={()=>{ if(window.confirm("Delete this outreach entry?")) deleteLog(o.id); }} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13}/></button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={()=>setModal(false)} title="Log Outreach">
        <div className="flex flex-col gap-3">
          <TI label="Brand or Creator" value={form.brand_or_creator} onChange={v=>setForm({...form,brand_or_creator:v})} required/>
          <Sel label="Platform" value={form.platform} onChange={v=>setForm({...form,platform:v})} options={["email","instagram","tiktok","linkedin","phone","other"].map(p=>({value:p,label:p.charAt(0).toUpperCase()+p.slice(1)}))}/>
          <TI label="Contact Name" value={form.contact_name} onChange={v=>setForm({...form,contact_name:v})}/>
          <TI label="Date Contacted" value={form.date_contacted} onChange={v=>setForm({...form,date_contacted:v})} type="date"/>
          <Sel label="Status" value={form.status} onChange={v=>setForm({...form,status:v})} options={STATS.map(s=>({value:s,label:SL[s]}))}/>
          <TA label="Notes" value={form.notes} onChange={v=>setForm({...form,notes:v})}/>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn onClick={log} disabled={!form.brand_or_creator.trim()}>Log Entry</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── Questions Page ─────────────────────────────────────────────────────────────
function QPg({ profile, interns, questions, setQuestions, sb, addActivity }: { profile:Profile; interns:Profile[]; questions:Question[]; setQuestions:(q:Question[])=>void; sb:any; addActivity:(a:any)=>void }) {
  const [modal,setModal]=useState(false);
  const [detail,setDetail]=useState<Question|null>(null);
  const [filter,setFilter]=useState("all");
  const [reply,setReply]=useState("");
  const [form,setForm]=useState({title:"",category:"outreach",description:""});
  const isAdmin=profile.role==="admin";
  const filtered=filter==="all" ? questions : questions.filter(q=>q.status===filter);
  const SV: Record<string,BV>={open:"warning",answered:"info",resolved:"success"};
  const aName=(id?:string)=>{ if(!id)return"—"; if(id===profile.id)return profile.full_name; return interns.find(i=>i.id===id)?.full_name||id; };

  async function post() {
    if (!form.title.trim()) return;
    const {data,error}=await sb.from("questions").insert({...form,author_id:profile.id,status:"open",created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setQuestions([{...data,question_replies:[]}, ...questions.filter(q => q.id !== data.id)]);
    addActivity({user_id:profile.id,user_name:profile.full_name,activity:"question_posted",metadata:{title:form.title}});
    setModal(false);setForm({title:"",category:"outreach",description:""});
  }
  async function sendReply() {
    if (!reply.trim()||!detail) return;
    const {data,error}=await sb.from("question_replies").insert({question_id:detail.id,author_id:profile.id,body:reply,created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    const updated=questions.map(q=>q.id===detail.id?{...q,status:q.status==="open"?"answered":q.status,question_replies:[...(q.question_replies||[]),data]}:q);
    setQuestions(updated);
    if (detail.status==="open") await sb.from("questions").update({status:"answered"}).eq("id",detail.id);
    setDetail(updated.find(q=>q.id===detail.id)||null);setReply("");
  }
  async function resolve(id:string) {
    await sb.from("questions").update({status:"resolved"}).eq("id",id);
    setQuestions(questions.map(q=>q.id===id?{...q,status:"resolved"}:q));
    if (detail?.id===id) setDetail({...detail,status:"resolved"});
  }
  async function deleteQuestion(id:string) {
    await sb.from("questions").delete().eq("id",id);
    setQuestions(questions.filter(q=>q.id!==id));
    setDetail(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Questions</h1>
        <Btn onClick={()=>setModal(true)}><Plus size={14}/>Ask Question</Btn>
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {["all","open","answered","resolved"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      {filtered.length===0 ? <ES icon={<MessageCircle size={24}/>} message="No questions here"/> : (
        <div className="flex flex-col gap-2">
          {filtered.map(q=>(
            <div key={q.id} onClick={()=>setDetail(q)} className="bg-white border border-stone-200/60 rounded-xl p-4 cursor-pointer hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{q.title}</p>
                    <Bg v={SV[q.status]||"default"}>{q.status}</Bg>
                  </div>
                  {q.description&&<p className="text-xs text-stone-500 mt-1 line-clamp-2">{q.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-stone-400">{aName(q.author_id)}</span>
                    <span className="text-xs text-stone-400">{fmt(q.created_at)}</span>
                    {(q.question_replies?.length||0)>0&&<span className="text-xs text-stone-400">{q.question_replies?.length} {q.question_replies?.length===1?"reply":"replies"}</span>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-stone-300 mt-1 flex-shrink-0"/>
              </div>
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={()=>setModal(false)} title="Ask a Question">
        <div className="flex flex-col gap-3">
          <TI label="Question" value={form.title} onChange={v=>setForm({...form,title:v})} required/>
          <Sel label="Category" value={form.category} onChange={v=>setForm({...form,category:v})} options={["outreach","partnerships","content","technical","other"].map(c=>({value:c,label:c.charAt(0).toUpperCase()+c.slice(1)}))}/>
          <TA label="Details" value={form.description} onChange={v=>setForm({...form,description:v})}/>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn onClick={post} disabled={!form.title.trim()}>Post Question</Btn>
          </div>
        </div>
      </Md>
      <Md open={!!detail} onClose={()=>setDetail(null)} title="Question">
        {detail&&(
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><Bg v={SV[detail.status]||"default"}>{detail.status}</Bg>{detail.category&&<Bg v="default">{detail.category}</Bg>}</div>
              <h3 className="text-base font-semibold text-stone-800">{detail.title}</h3>
              {detail.description&&<p className="text-sm text-stone-500 mt-1">{detail.description}</p>}
              <p className="text-xs text-stone-400 mt-1">Asked by {aName(detail.author_id)} · {fmt(detail.created_at)}</p>
            </div>
            {(detail.question_replies?.length||0)>0&&(
              <div className="flex flex-col gap-3">
                <p className="text-xs text-stone-400 uppercase tracking-widest">Replies</p>
                {detail.question_replies?.map(r=>(
                  <div key={r.id} className="flex items-start gap-2.5">
                    <Av name={aName(r.author_id)} size={26}/>
                    <div className="bg-stone-50 rounded-xl p-3 flex-1">
                      <p className="text-xs font-medium text-stone-600">{aName(r.author_id)}</p>
                      <p className="text-sm text-stone-700 mt-1">{r.body}</p>
                      <p className="text-xs text-stone-400 mt-1">{fmt(r.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {detail.status!=="resolved"&&(
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a reply..." rows={2} className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
                <div className="flex flex-col gap-2">
                  <Btn onClick={sendReply} disabled={!reply.trim()}><Send size={14}/></Btn>
                  {isAdmin&&<Btn variant="secondary" size="sm" onClick={()=>resolve(detail.id)}><CheckCircle2 size={12}/>Resolve</Btn>}
                </div>
              </div>
            )}
            {isAdmin&&(
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <Btn variant="danger" size="sm" onClick={()=>{ if(window.confirm("Delete this question and all its replies?")) deleteQuestion(detail.id); }}><Trash2 size={12}/>Delete</Btn>
              </div>
            )}
          </div>
        )}
      </Md>
    </div>
  );
}

// ── Reports Page ───────────────────────────────────────────────────────────────
function RPg({ profile, interns, reports, setReports, sb, addActivity, settings }: { profile:Profile; interns:Profile[]; reports:Report[]; setReports:(r:Report[])=>void; sb:any; addActivity:(a:any)=>void; settings:AppSettings }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({week_of:"",tasks_completed:"",outreach_sent:"",responses_received:"",wins:"",challenges:"",ideas:""});
  const isAdmin=profile.role==="admin";
  const visible=isAdmin ? reports : reports.filter(r=>r.intern_id===profile.id);
  const iName=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"—";
  const reportCfg: ReportFieldConfig = useMemo(()=>{ try { const cfg: ReportConfig = JSON.parse(settings.report_config||"{}"); return cfg[profile.team||""]||cfg["default"]||DEFAULT_REPORT_FIELDS; } catch { return DEFAULT_REPORT_FIELDS; } },[settings,profile.team]);
  const [customData, setCustomData] = useState<Record<string,any>>({});
  const [reportFile, setReportFile] = useState<File|null>(null);

  async function submit() {
    if (!form.week_of) return;
    let file_url: string|null = null;
    if (reportFile) {
      const path = `${Date.now()}-${reportFile.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const { error: upErr } = await sb.storage.from("reports").upload(path, reportFile, { upsert: false });
      if (!upErr) { const { data: ud } = sb.storage.from("reports").getPublicUrl(path); file_url = ud.publicUrl; }
    }
    const {data,error}=await sb.from("weekly_reports").insert({...form,intern_id:profile.id,reviewed:false,file_url,custom_data:customData,created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setReports([data,...reports]);
    addActivity({user_id:profile.id,user_name:profile.full_name,activity:"report_submitted",metadata:{week:form.week_of}});
    setModal(false);setReportFile(null);setCustomData({});
    setForm({week_of:"",tasks_completed:"",outreach_sent:"",responses_received:"",wins:"",challenges:"",ideas:""});
  }
  async function markReviewed(id:string) {
    await sb.from("weekly_reports").update({reviewed:true}).eq("id",id);
    setReports(reports.map(r=>r.id===id?{...r,reviewed:true}:r));
  }
  async function deleteReport(id:string) {
    await sb.from("weekly_reports").delete().eq("id",id);
    setReports(reports.filter(r=>r.id!==id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">{isAdmin?"Weekly Reports":"Submit Weekly Update"}</h1>
        {!isAdmin&&<Btn onClick={()=>setModal(true)}><FileText size={14}/>Submit Report</Btn>}
      </div>
      {visible.length===0 ? <ES icon={<FileText size={24}/>} message={isAdmin?"No reports submitted yet":"Submit your first weekly update"}/> : (
        <div className="flex flex-col gap-3">
          {visible.map(r=>(
            <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800">Week of {fmt(r.week_of||r.created_at)}</p>
                    <Bg v={r.reviewed?"success":"warning"}>{r.reviewed?"Reviewed":"Pending"}</Bg>
                  </div>
                  {isAdmin&&<p className="text-xs text-stone-400 mt-0.5">{iName(r.intern_id)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin&&!r.reviewed&&<Btn size="sm" variant="secondary" onClick={()=>markReviewed(r.id)}><CheckCircle2 size={12}/>Mark Reviewed</Btn>}
                  {isAdmin&&<button onClick={()=>{ if(window.confirm("Delete this report?")) deleteReport(r.id); }} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13}/></button>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                {r.tasks_completed&&<div><p className="text-stone-400 uppercase tracking-widest mb-0.5">Tasks Completed</p><p className="text-stone-600">{r.tasks_completed}</p></div>}
                {(r.outreach_sent||r.responses_received)&&<div><p className="text-stone-400 uppercase tracking-widest mb-0.5">Outreach</p><p className="text-stone-600">{r.outreach_sent||0} sent · {r.responses_received||0} replies</p></div>}
                {r.wins&&<div><p className="text-stone-400 uppercase tracking-widest mb-0.5">Wins</p><p className="text-stone-600">{r.wins}</p></div>}
                {r.challenges&&<div><p className="text-stone-400 uppercase tracking-widest mb-0.5">Challenges</p><p className="text-stone-600">{r.challenges}</p></div>}
                {r.ideas&&<div className="col-span-2"><p className="text-stone-400 uppercase tracking-widest mb-0.5">Ideas</p><p className="text-stone-600">{r.ideas}</p></div>}
                {r.custom_data&&Object.entries(r.custom_data).filter(([,v])=>v!==false&&v!=="").map(([k,v])=>(
                  <div key={k}><p className="text-stone-400 uppercase tracking-widest mb-0.5">{k.replace(/_\d+$/,"").replace(/_/g," ")}</p><p className="text-stone-600">{typeof v==="boolean"?"Yes":String(v)}</p></div>
                ))}
              </div>
              {r.file_url && <div className="mt-2"><a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"><ExternalLink size={11}/>View attachment</a></div>}
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={()=>{setModal(false);setReportFile(null);setCustomData({});}} title="Submit Weekly Update">
        <div className="flex flex-col gap-3">
          <TI label="Week of" value={form.week_of} onChange={v=>setForm({...form,week_of:v})} type="date" required/>
          {reportCfg.tasks_completed && <TA label="Tasks Completed" value={form.tasks_completed} onChange={v=>setForm({...form,tasks_completed:v})}/>}
          {(reportCfg.outreach_sent||reportCfg.responses_received) && (
            <div className="grid grid-cols-2 gap-3">
              {reportCfg.outreach_sent && <TI label="Outreach Sent" value={form.outreach_sent} onChange={v=>setForm({...form,outreach_sent:v})}/>}
              {reportCfg.responses_received && <TI label="Responses Received" value={form.responses_received} onChange={v=>setForm({...form,responses_received:v})}/>}
            </div>
          )}
          {reportCfg.wins && <TA label="Wins" value={form.wins} onChange={v=>setForm({...form,wins:v})} placeholder="What went well?"/>}
          {reportCfg.challenges && <TA label="Challenges" value={form.challenges} onChange={v=>setForm({...form,challenges:v})} placeholder="Any blockers?"/>}
          {reportCfg.ideas && <TA label="Ideas" value={form.ideas} onChange={v=>setForm({...form,ideas:v})} placeholder="Suggestions for the team"/>}
          {(reportCfg.custom_fields||[]).map(cf=>(
            <div key={cf.key} className="flex flex-col gap-1">
              {cf.type==="checkbox"
                ? <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5"><input type="checkbox" checked={!!customData[cf.key]} onChange={e=>setCustomData(p=>({...p,[cf.key]:e.target.checked}))} className="rounded accent-stone-700"/>{cf.label}</label>
                : <TA label={cf.label} value={customData[cf.key]||""} onChange={v=>setCustomData(p=>({...p,[cf.key]:v}))}/>
              }
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1.5">Attach file <span className="text-stone-400 font-normal capitalize">(optional)</span></p>
            <FileDropZone file={reportFile} setFile={setReportFile}/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>{setModal(false);setReportFile(null);setCustomData({});}}>Cancel</Btn>
            <Btn onClick={submit} disabled={!form.week_of}>Submit</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── Resources Page ─────────────────────────────────────────────────────────────
function ResPg({ profile, resources, setResources, sb }: { profile:Profile; resources:Resource[]; setResources:(r:Resource[])=>void; sb:any }) {
  const [modal,setModal]=useState(false);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({title:"",description:"",category:"outreach_template"});
  const [file,setFile]=useState<File|null>(null);
  const [uploading,setUploading]=useState(false);
  const [uploadErr,setUploadErr]=useState("");
  const isAdmin=profile.role==="admin";
  const CATS=[{value:"outreach_template",label:"Outreach Template"},{value:"training_guide",label:"Training Guide"},{value:"brand_messaging",label:"Brand Messaging"},{value:"strategy_update",label:"Strategy Update"},{value:"other",label:"Other"}];
  const CV: Record<string,BV>={outreach_template:"info",training_guide:"success",brand_messaging:"purple",strategy_update:"warning",other:"default"};
  const filtered=resources.filter(r=>r.title.toLowerCase().includes(search.toLowerCase())||(r.description||"").toLowerCase().includes(search.toLowerCase()));

  async function upload() {
    if (!form.title.trim()) return;
    setUploading(true); setUploadErr("");
    let file_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const { error: upErr } = await sb.storage.from("resources").upload(path, file, { upsert: false });
      if (upErr) { setUploadErr(`File upload failed: ${upErr.message}`); setUploading(false); return; }
      const { data: urlData } = sb.storage.from("resources").getPublicUrl(path);
      file_url = urlData.publicUrl;
    }
    const {data,error}=await sb.from("resources").insert({...form,file_url,created_at:new Date().toISOString()}).select().single();
    setUploading(false);
    if(error){console.error(error);setUploadErr(error.message);return;}
    setResources([data,...resources]);
    setModal(false);
    setForm({title:"",description:"",category:"outreach_template"});
    setFile(null);
  }
  async function del(id:string) {
    await sb.from("resources").delete().eq("id",id);setResources(resources.filter(r=>r.id!==id));
  }
  function closeModal() { setModal(false); setFile(null); setUploadErr(""); setForm({title:"",description:"",category:"outreach_template"}); }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Resources</h1>
        {isAdmin&&<Btn onClick={()=>setModal(true)}><Upload size={14}/>Upload</Btn>}
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
      </div>
      {filtered.length===0 ? <ES icon={<FolderOpen size={24}/>} message="No resources found"/> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(r=>(
            <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap"><Bg v={CV[r.category||""]||"default"}>{CATS.find(c=>c.value===r.category)?.label||r.category||"Other"}</Bg></div>
                  <p className="text-sm font-medium text-stone-800">{r.title}</p>
                  {r.description&&<p className="text-xs text-stone-500 mt-1">{r.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-stone-400">{fmt(r.created_at)}</p>
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-0.5 font-medium">
                        <ExternalLink size={11}/>Open file
                      </a>
                    )}
                  </div>
                </div>
                {isAdmin&&<button onClick={()=>del(r.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-stone-300 hover:text-red-500 transition-all"><Trash2 size={12}/></button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={closeModal} title="Upload Resource">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={form.title} onChange={v=>setForm({...form,title:v})} required/>
          <TA label="Description" value={form.description} onChange={v=>setForm({...form,description:v})}/>
          <Sel label="Category" value={form.category} onChange={v=>setForm({...form,category:v})} options={CATS}/>
          <div>
            <p className="text-xs font-medium text-stone-600 mb-1.5">Attach file <span className="text-stone-400 font-normal">(optional)</span></p>
            <FileDropZone file={file} setFile={setFile}/>
          </div>
          {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={upload} disabled={!form.title.trim()||uploading}>{uploading?"Uploading...":"Upload"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── Intern Management ──────────────────────────────────────────────────────────
function IntMgmt({ interns, setInterns, sb }: { interns:Profile[]; setInterns:(i:Profile[])=>void; sb:any }) {
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState<Profile|null>(null);
  const [form,setForm]=useState({full_name:"",email:"",team:"Tech/AI"});
  const TEAMS=["Tech/AI","Strategy","Events/Outreach","Design","Curation Team","Content Creation"];

  function open(i?:Profile) { setEdit(i||null); setForm(i?{full_name:i.full_name,email:i.email,team:i.team||"Tech/AI"}:{full_name:"",email:"",team:"Tech/AI"}); setModal(true); }
  async function save() {
    if (!form.full_name.trim()) return;
    if (edit) {
      const {error}=await sb.from("profiles").update({full_name:form.full_name,email:form.email,team:form.team}).eq("id",edit.id);
      if(error){console.error(error);return;}
      setInterns(interns.map(i=>i.id===edit.id?{...i,...form}:i));
    }
    setModal(false);
  }
  async function toggleActive(id:string,active:boolean) {
    await sb.from("profiles").update({active}).eq("id",id);
    setInterns(interns.map(i=>i.id===id?{...i,active}:i));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Intern Management</h1>
        <Btn onClick={()=>open()}><UserPlus size={14}/>Add Intern</Btn>
      </div>
      {interns.length===0 ? <ES icon={<Users size={24}/>} message="No interns yet"/> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interns.map(i=>(
            <div key={i.id} className={`bg-white border rounded-xl p-4 transition-all ${i.active===false?"opacity-60 border-stone-100":"border-stone-200/60"}`}>
              <div className="flex items-center gap-3">
                <Av name={i.full_name} size={36}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{i.full_name}</p>
                  <p className="text-xs text-stone-400">{i.email}</p>
                  {i.team&&<div className="mt-1"><TB team={i.team}/></div>}
                </div>
                <div className="flex gap-1 items-center">
                  <button onClick={()=>open(i)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"><Pencil size={12}/></button>
                  <button onClick={()=>toggleActive(i.id,i.active===false)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${i.active===false?"bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600":"bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500"}`}>
                    {i.active===false?"Activate":"Deactivate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Md open={modal} onClose={()=>setModal(false)} title={edit?"Edit Intern":"Add Intern"}>
        <div className="flex flex-col gap-3">
          <TI label="Full Name" value={form.full_name} onChange={v=>setForm({...form,full_name:v})} required/>
          <TI label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
          <Sel label="Team" value={form.team} onChange={v=>setForm({...form,team:v})} options={TEAMS.map(t=>({value:t,label:t}))}/>
          {!edit&&<p className="text-xs text-stone-400 bg-stone-50 rounded-lg p-3">New interns need to be invited via Supabase Auth first. You can update profile details for existing interns here.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!form.full_name.trim()}>Save</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── Analytics Page ─────────────────────────────────────────────────────────────
function AnPg({ interns, tasks, outreach, content, requests, questions, techProjects }: { interns:Profile[]; tasks:Task[]; outreach:Outreach[]; content:ContentVideo[]; requests:Request[]; questions:Question[]; techProjects:TechProject[] }) {
  const active=interns.filter(i=>i.active!==false);
  const completed=tasks.filter(t=>t.status==="completed").length;
  const responded=outreach.filter(o=>["responded","interested"].includes(o.status)).length;
  const rate=outreach.length>0?Math.round((responded/outreach.length)*100):0;
  const EMOJI: Record<string,string>={email:"✉️",instagram:"📸",tiktok:"🎵",linkedin:"💼",phone:"📱",other:"🔗"};

  const byPlatform=useMemo(()=>{ const m:Record<string,number>={}; outreach.forEach(o=>{const p=o.platform||"other";m[p]=(m[p]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[outreach]);
  const maxP=byPlatform[0]?.[1]||1;

  const byIntern=useMemo(()=>{ const m:Record<string,number>={}; outreach.forEach(o=>{if(o.intern_id)m[o.intern_id]=(m[o.intern_id]||0)+1;}); return Object.entries(m).map(([id,count])=>({intern:interns.find(i=>i.id===id),count})).filter(x=>x.intern).sort((a,b)=>b.count-a.count).slice(0,8); },[outreach,interns]);
  const maxI=byIntern[0]?.count||1;

  const taskRows=useMemo(()=>active.map(i=>{ const mt=tasks.filter(t=>t.assigned_to===i.id); return{intern:i,total:mt.length,ns:mt.filter(t=>t.status==="not_started").length,ip:mt.filter(t=>t.status==="in_progress").length,sub:mt.filter(t=>t.status==="submitted").length,done:mt.filter(t=>t.status==="completed").length}; }).filter(r=>r.total>0),[active,tasks]);

  const contentByCreator=useMemo(()=>{ const m:Record<string,number>={}; content.forEach(c=>{if(c.creator_id)m[c.creator_id]=(m[c.creator_id]||0)+1;}); return Object.entries(m).map(([id,count])=>({intern:interns.find(i=>i.id===id),count})).filter(x=>x.intern).sort((a,b)=>b.count-a.count).slice(0,6); },[content,interns]);
  const maxC=contentByCreator[0]?.count||1;
  const published=content.filter(c=>c.status==="published").length;
  const totalViews=content.reduce((s,c)=>s+(c.views||0),0);

  const openReqs=requests.filter(r=>r.status!=="resolved");
  const reqByType=useMemo(()=>{ const m:Record<string,number>={}; openReqs.forEach(r=>{const t=r.type_name||"Other";m[t]=(m[t]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[openReqs]);
  const answeredQ=questions.filter(q=>q.status!=="open").length;

  const activeProjects=techProjects.filter(p=>p.status!=="completed");
  const SV_TP: Record<string,BV>={planning:"warning",in_progress:"info",completed:"success"};

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SC label="Total Outreach" value={outreach.length}/><SC label="Response Rate" value={`${rate}%`}/><SC label="Tasks Completed" value={completed}/><SC label="Active Interns" value={active.length}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-4">Outreach by Platform</p>
          {byPlatform.length===0 ? <ES message="No data yet"/> : (
            <div className="flex flex-col gap-3">
              {byPlatform.map(([p,c])=>(
                <div key={p} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{EMOJI[p]||"🔗"}</span>
                  <span className="text-xs text-stone-600 w-20 capitalize">{p}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2"><div className="bg-stone-600 h-2 rounded-full" style={{width:`${(c/maxP)*100}%`}}/></div>
                  <span className="text-xs text-stone-500 w-5 text-right">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-4">Outreach by Intern</p>
          {byIntern.length===0 ? <ES message="No data yet"/> : (
            <div className="flex flex-col gap-3">
              {byIntern.map(({intern,count})=>(
                <div key={intern!.id} className="flex items-center gap-3">
                  <Av name={intern!.full_name} size={24}/>
                  <span className="text-xs text-stone-600 w-20 truncate">{intern!.full_name.split(" ")[0]}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2"><div className="bg-stone-600 h-2 rounded-full" style={{width:`${(count/maxI)*100}%`}}/></div>
                  <span className="text-xs text-stone-500 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {taskRows.length>0&&(
        <div className="bg-white border border-stone-200/60 rounded-xl p-4 overflow-x-auto">
          <p className="text-sm font-semibold text-stone-700 mb-4">Tasks per Intern</p>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-100">
              <th className="text-left py-2 pr-4 text-stone-400 font-medium">Intern</th>
              <th className="text-left py-2 pr-4 text-stone-400 font-medium">Team</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Total</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Not Started</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">In Progress</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Submitted</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Completed</th>
            </tr></thead>
            <tbody>
              {taskRows.map(row=>(
                <tr key={row.intern.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-2 pr-4"><div className="flex items-center gap-2"><Av name={row.intern.full_name} size={22}/><span className="text-stone-700">{row.intern.full_name}</span></div></td>
                  <td className="py-2 pr-4"><TB team={row.intern.team}/></td>
                  <td className="py-2 px-2 text-center font-semibold text-stone-700">{row.total}</td>
                  <td className="py-2 px-2 text-center text-stone-500">{row.ns}</td>
                  <td className="py-2 px-2 text-center text-amber-600">{row.ip}</td>
                  <td className="py-2 px-2 text-center text-violet-600">{row.sub}</td>
                  <td className="py-2 px-2 text-center text-emerald-600">{row.done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Analytics */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-4">
        <p className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2"><Video size={14} className="text-stone-400"/>Content Analytics</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <SC label="Total Videos" value={content.length}/>
          <SC label="Published" value={published}/>
          <SC label="Total Views" value={totalViews.toLocaleString()}/>
        </div>
        {contentByCreator.length===0 ? <ES message="No content yet"/> : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Top Contributors</p>
            {contentByCreator.map(({intern,count})=>(
              <div key={intern!.id} className="flex items-center gap-3">
                <Av name={intern!.full_name} size={24}/>
                <span className="text-xs text-stone-600 w-24 truncate">{intern!.full_name.split(" ")[0]}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-2"><div className="bg-violet-400 h-2 rounded-full" style={{width:`${(count/maxC)*100}%`}}/></div>
                <span className="text-xs text-stone-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requests & Questions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2"><Inbox size={14} className="text-stone-400"/>Open Requests <span className="text-xs font-normal text-stone-400 ml-1">({openReqs.length})</span></p>
          {reqByType.length===0 ? <ES message="No open requests"/> : (
            <div className="flex flex-col gap-2">
              {reqByType.map(([type,count])=>(
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">{type}</span>
                  <Bg v="warning">{count}</Bg>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2"><MessageCircle size={14} className="text-stone-400"/>Questions</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between"><span className="text-xs text-stone-600">Total asked</span><span className="text-sm font-semibold text-stone-700">{questions.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-stone-600">Answered / Resolved</span><span className="text-sm font-semibold text-emerald-600">{answeredQ}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-stone-600">Still open</span><span className="text-sm font-semibold text-amber-600">{questions.length-answeredQ}</span></div>
            {questions.length>0 && (
              <div className="mt-1">
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-2 bg-emerald-400 rounded-full transition-all" style={{width:`${Math.round((answeredQ/questions.length)*100)}%`}}/></div>
                <p className="text-xs text-stone-400 mt-1">{Math.round((answeredQ/questions.length)*100)}% answered</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Tech Projects */}
      {activeProjects.length>0 && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2"><Code2 size={14} className="text-stone-400"/>Active Tech Projects</p>
          <div className="flex flex-col gap-3">
            {activeProjects.map(p=>(
              <div key={p.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-stone-700 truncate">{p.title}</span>
                    <Bg v={SV_TP[p.status]||"default"}>{p.status==="in_progress"?"In Progress":p.status.charAt(0).toUpperCase()+p.status.slice(1)}</Bg>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-1.5 bg-stone-600 rounded-full transition-all" style={{width:`${p.progress}%`}}/></div>
                </div>
                <span className="text-xs text-stone-400 shrink-0">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Intern Requests ───────────────────────────────────────────────────────────
const REQUEST_ICONS: Record<string, React.ElementType> = { calendar:CalendarClock, shopping:ShoppingBag, coffee:Coffee, help:HelpCircle };

const REQ_OPTIONS = [
  { value:"ella_meeting",    label:"Schedule meeting with Ella",       kind:"calendar", person:"ella"      },
  { value:"noel_meeting",    label:"Schedule meeting with Noel",       kind:"calendar", person:"noel"      },
  { value:"caroline_meeting",label:"Request meeting with Caroline",    kind:"form",     person:null        },
  { value:"merch_order",     label:"Request merch order",              kind:"form",     person:null        },
  { value:"other",           label:"Other request",                    kind:"form",     person:null        },
] as const;
type ReqOption = typeof REQ_OPTIONS[number];

const REQ_ICONS: Record<string, React.ElementType> = {
  ella_meeting: CalendarClock, noel_meeting: CalendarClock, caroline_meeting: Coffee,
  merch_order: ShoppingBag, other: HelpCircle,
};

function InternRequests({ requests, setRequests, profile, sb, settings }: { requests:Request[]; setRequests:(r:Request[])=>void; profile:Profile; sb:any; settings:Record<string,string> }) {
  const [selOpt, setSelOpt] = useState<ReqOption|null>(null);
  const [msg, setMsg] = useState("");
  const [availability, setAvailability] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const myRequests = requests || [];
  const unread = myRequests.filter(r => (r.replies||[]).length > 0 && r.status !== "resolved");
  const SV: Record<string,BV> = {new:"warning",in_progress:"info",resolved:"success"};
  const SL: Record<string,string> = {new:"New",in_progress:"In Progress",resolved:"Resolved"};
  const isCaroline = selOpt?.value === "caroline_meeting";

  function openOpt(opt: ReqOption) { setSelOpt(opt); setMsg(""); setAvailability(""); setReason(""); }
  function closeModal() { setSelOpt(null); setMsg(""); setAvailability(""); setReason(""); }

  async function submit() {
    if (!selOpt) return;
    const isForm = selOpt.kind === "form";
    if (isCaroline && (!reason.trim() || !availability.trim())) return;
    if (!isCaroline && isForm && !msg.trim()) return;
    setSending(true);
    const message = isCaroline
      ? `Reason: ${reason.trim()}\n\nAvailability: ${availability.trim()}`
      : msg.trim() || selOpt.label;
    const { data, error } = await sb.from("requests").insert({
      intern_id: profile.id,
      type_name: selOpt.label,
      message,
      status: "new",
      replies: [],
      created_at: new Date().toISOString(),
    }).select().single();
    setSending(false);
    if (error) { console.error("[requests insert]", error.message, error.code, error.details); return; }
    setRequests([data as Request, ...myRequests.filter(r => r.id !== data.id)]);
    // Auto-email Caroline
    if (isCaroline && settings.caroline_email) {
      const subject = encodeURIComponent(`Meeting Request from ${profile.full_name}`);
      const body = encodeURIComponent(`Hi Caroline,\n\n${profile.full_name} would like to meet with you.\n\nReason: ${reason.trim()}\n\nAvailability: ${availability.trim()}\n\nThis request was submitted via Cloud Closet Ops.`);
      window.open(`mailto:${settings.caroline_email}?subject=${subject}&body=${body}`, "_blank");
    }
    closeModal();
  }

  const calendlyUrl = selOpt?.person === "ella" ? settings.calendly_ella
    : selOpt?.person === "noel" ? settings.calendly_noel
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Requests</h1>
        <p className="text-sm text-stone-400 mt-0.5">What can we help you with?</p>
      </div>

      {/* Messages from admins */}
      {unread.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><MessageSquare size={14} className="text-emerald-600"/><span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Messages from Ella &amp; Noel</span></div>
          {unread.map(r => {
            const last = (r.replies||[])[r.replies.length-1];
            return (
              <div key={r.id} className="bg-white border-2 border-emerald-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/><span className="text-xs text-stone-400 uppercase tracking-widest">{r.type_name}</span></div>
                <p className="text-xs text-stone-400 mb-2">You: {r.message}</p>
                {last && <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex items-start gap-2">
                  <Av name={last.author_name||"Admin"} size={24}/><div><p className="text-xs font-medium text-sky-700">{last.author_name}</p><p className="text-sm text-stone-700">{last.body}</p></div>
                </div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Request type cards — always visible */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Select a request type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REQ_OPTIONS.map(opt => {
            const Icon = REQ_ICONS[opt.value] || HelpCircle;
            const isCalendar = opt.kind === "calendar";
            return (
              <button key={opt.value} onClick={() => openOpt(opt)}
                className="bg-white border border-stone-200/60 rounded-xl p-4 text-left hover:border-stone-400 hover:shadow-sm transition-all flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCalendar ? "bg-violet-50" : "bg-stone-100"}`}>
                  <Icon size={18} className={isCalendar ? "text-violet-600" : "text-stone-500"}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {opt.value === "caroline_meeting" ? "Share availability & reason" : isCalendar ? "Opens booking link" : "Send a message"}
                  </p>
                </div>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 shrink-0"/>
              </button>
            );
          })}
        </div>
      </div>

      {/* Past requests */}
      {myRequests.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Your Past Requests</p>
          <div className="flex flex-col gap-2">
            {myRequests.slice(0,5).map(r => (
              <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-xs text-stone-600 font-medium">{r.type_name}</span><span className="text-xs text-stone-400">{fmt(r.created_at)}</span></div>
                  <Bg v={SV[r.status]||"default"}>{SL[r.status]||r.status}</Bg>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">{r.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Md open={!!selOpt} onClose={closeModal} title={selOpt?.label||"Request"}>
        {selOpt && (
          <div className="flex flex-col gap-4">
            {isCaroline ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                  <Mail size={13} className="mt-0.5 shrink-0"/>
                  <span>After submitting, a meeting request email will be sent directly to Caroline.</span>
                </div>
                <TA label="Reason for meeting" placeholder="What would you like to discuss?" value={reason} onChange={v=>setReason(v)}/>
                <TA label="Your availability" placeholder="e.g. Mon/Wed afternoons, anytime after 2pm this week..." value={availability} onChange={v=>setAvailability(v)}/>
              </>
            ) : selOpt.kind === "calendar" ? (
              <>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-violet-700 mb-3 flex items-center gap-1.5"><CalendarClock size={13}/>Book directly:</p>
                  {calendlyUrl
                    ? <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors">
                        <CalendarClock size={14}/>Open Calendly<ArrowUpRight size={13}/>
                      </a>
                    : <p className="text-xs text-violet-500 italic">Calendly link not set yet — send a message and we&apos;ll follow up.</p>
                  }
                  <p className="text-xs text-violet-400 mt-3">Or leave a note below if you need a specific time.</p>
                </div>
                <TA label="Note (optional)" placeholder="Any notes on timing or agenda..." value={msg} onChange={v=>setMsg(v)}/>
              </>
            ) : (
              <TA label="Message" placeholder="Describe your request..." value={msg} onChange={v=>setMsg(v)}/>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={submit} disabled={sending || (isCaroline ? (!reason.trim()||!availability.trim()) : (selOpt.kind==="form"&&!msg.trim()))}>
                <Send size={14}/>{sending ? "Sending..." : isCaroline ? "Send Meeting Request" : "Send Request"}
              </Btn>
            </div>
          </div>
        )}
      </Md>
    </div>
  );
}

// ── Admin Request Inbox ────────────────────────────────────────────────────────
function AdminRequestInbox({ requests, setRequests, requestTypes, setRequestTypes, interns, sb, settings }: { requests:Request[]; setRequests:(r:Request[])=>void; requestTypes:RequestType[]; setRequestTypes:(t:RequestType[])=>void; interns:Profile[]; sb:any; settings:AppSettings }) {
  const [tab, setTab] = useState("inbox");
  const [replyText, setReplyText] = useState<Record<string,string>>({});
  const [showAddType, setShowAddType] = useState(false);
  const [editType, setEditType] = useState<RequestType|null>(null);
  const [nt, setNt] = useState({name:"",description:"",icon:"help",kind:"form",calendly_ella:"",calendly_noel:""});
  const gn=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"Intern";
  const gt=(id?:string)=>interns.find(i=>i.id===id)?.team||"";
  const active=requests.filter(r=>r.status!=="resolved").sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const resolved=requests.filter(r=>r.status==="resolved").sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const newCount=requests.filter(r=>r.status==="new").length;
  const SV: Record<string,BV>={new:"warning",in_progress:"info",resolved:"success"};
  const SL: Record<string,string>={new:"New",in_progress:"In Progress",resolved:"Resolved"};

  async function updateStatus(id:string,status:string) {
    await sb.from("requests").update({status}).eq("id",id);
    setRequests(requests.map(r=>r.id===id?{...r,status}:r));
  }
  async function sendReply(reqId:string) {
    const text=replyText[reqId];
    if (!text?.trim()) return;
    const reply:RequestReply={author:"admin",author_name:"Ella",body:text.trim(),created_at:new Date().toISOString()};
    const req=requests.find(r=>r.id===reqId);
    if (!req) return;
    const newReplies=[...req.replies,reply];
    const newStatus=req.status==="new"?"in_progress":req.status;
    await sb.from("requests").update({replies:newReplies,status:newStatus}).eq("id",reqId);
    setRequests(requests.map(r=>r.id===reqId?{...r,replies:newReplies,status:newStatus}:r));
    setReplyText(p=>({...p,[reqId]:""}));
  }
  async function addType() {
    const {data,error}=await sb.from("request_types").insert({...nt,active:true}).select().single();
    if(error){console.error(error);return;}
    setRequestTypes([...requestTypes,data]);setShowAddType(false);
    setNt({name:"",description:"",icon:"help",kind:"form",calendly_ella:"",calendly_noel:""});
  }
  async function saveEditType() {
    if (!editType) return;
    await sb.from("request_types").update(editType).eq("id",editType.id);
    setRequestTypes(requestTypes.map(t=>t.id===editType.id?editType:t));setEditType(null);
  }
  async function toggleType(id:string,active:boolean) {
    await sb.from("request_types").update({active}).eq("id",id);
    setRequestTypes(requestTypes.map(t=>t.id===id?{...t,active}:t));
  }
  async function deleteRequest(id:string) {
    await sb.from("requests").delete().eq("id",id);
    setRequests(requests.filter(r=>r.id!==id));
  }

  function renderRequest(req:Request) {
    return (
      <div key={req.id} className={`bg-white border rounded-2xl p-5 transition-all ${req.status==="new"?"border-amber-200 shadow-sm shadow-amber-50":"border-stone-200/60"}`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Av name={gn(req.intern_id)} size={36}/>
            <div>
              <p className="text-sm font-semibold text-stone-800">{gn(req.intern_id)}</p>
              <div className="flex items-center gap-2"><span className="text-xs text-stone-400">{gt(req.intern_id)}</span><span className="text-xs text-stone-400">{fmt(req.created_at)}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{req.type_name}</span>
            <Bg v={SV[req.status]||"default"}>{SL[req.status]||req.status}</Bg>
            <button onClick={()=>{ if(window.confirm("Delete this request?")) deleteRequest(req.id); }} className="p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
          </div>
        </div>
        <p className="text-sm text-stone-700 mb-3 leading-relaxed">{req.message}</p>
        {req.replies.length>0 && (
          <div className="flex flex-col gap-2 mb-3 pl-4 border-l-2 border-stone-100">
            {req.replies.map((rp,i)=>(
              <div key={i} className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1"><Av name={rp.author_name||"Admin"} size={20}/><span className="text-xs font-medium text-sky-700">{rp.author_name}</span><span className="text-xs text-stone-400">{fmt(rp.created_at)}</span></div>
                <p className="text-sm text-stone-700 ml-6">{rp.body}</p>
              </div>
            ))}
          </div>
        )}
        {req.status!=="resolved" && (
          <div className="flex items-end gap-2 flex-wrap">
            <input placeholder="Reply to this request..." value={replyText[req.id]||""} onChange={e=>setReplyText(p=>({...p,[req.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendReply(req.id);}}}
              className="flex-1 min-w-40 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 placeholder:text-stone-300"/>
            <Btn size="sm" onClick={()=>sendReply(req.id)} disabled={!replyText[req.id]?.trim()}><Send size={14}/>Reply</Btn>
            {req.status!=="in_progress" && <Btn size="sm" variant="secondary" onClick={()=>updateStatus(req.id,"in_progress")}>In Progress</Btn>}
            <Btn size="sm" variant="secondary" onClick={()=>updateStatus(req.id,"resolved")}><CheckCircle2 size={12}/>Resolve</Btn>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Requests</h1><p className="text-sm text-stone-400 mt-0.5">Inbox from your team</p></div>
        {newCount>0 && <Bg v="warning">{newCount} new</Bg>}
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {["inbox","resolved","settings"].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {tab==="inbox" && (active.length===0 ? <ES icon={<Inbox size={24}/>} message="No open requests"/> : <div className="flex flex-col gap-3">{active.map(renderRequest)}</div>)}
      {tab==="resolved" && (resolved.length===0 ? <ES message="No resolved requests"/> : <div className="flex flex-col gap-3">{resolved.map(renderRequest)}</div>)}
      {tab==="settings" && (
        <div className="flex flex-col gap-4">
          {/* Fixed request options interns see */}
          <div>
            <p className="text-sm font-semibold text-stone-700 mb-1">Intern Request Options</p>
            <p className="text-xs text-stone-400 mb-3">These 5 options always appear on the intern requests page.</p>
            <div className="flex flex-col gap-2">
              {REQ_OPTIONS.map(opt=>{
                const calendlyUrl = opt.person==="ella" ? settings.calendly_ella : opt.person==="noel" ? settings.calendly_noel : null;
                return (
                  <div key={opt.value} className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-stone-700">{opt.label}</p>
                      <p className="text-xs text-stone-400">{opt.kind==="calendar" ? (calendlyUrl ? `Calendly: ${calendlyUrl}` : "⚠️ No Calendly link set — update in Settings") : opt.value==="caroline_meeting" ? "Email form (set Caroline's email in Settings)" : "Message form"}</p>
                    </div>
                    <Bg v={opt.kind==="calendar" ? (calendlyUrl?"success":"warning") : "default"}>{opt.kind==="calendar"?"Calendly":"Form"}</Bg>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-stone-700">DB Request Types</p><Btn size="sm" onClick={()=>setShowAddType(true)}><Plus size={14}/>Add Type</Btn></div>
          </div>
          <div className="flex flex-col gap-2">
            {requestTypes.length===0 ? <p className="text-xs text-stone-400 italic">No DB request types. Add one above or run the migration SQL.</p> : requestTypes.map(t=>(
              <div key={t.id} className={`bg-white border border-stone-200/60 rounded-xl p-4 flex items-center gap-3 ${t.active===false?"opacity-50":""}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-800">{t.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{t.description}</p>
                  <div className="flex gap-2 mt-1"><span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{t.kind}</span><span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{t.icon}</span></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>setEditType(t)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={12}/></button>
                  <button onClick={()=>toggleType(t.id,!t.active)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${t.active===false?"bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600":"bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500"}`}>{t.active===false?"Enable":"Disable"}</button>
                </div>
              </div>
            ))}
          </div>
          <Md open={showAddType} onClose={()=>setShowAddType(false)} title="Add Request Type">
            <div className="flex flex-col gap-3">
              <TI label="Name" value={nt.name} onChange={v=>setNt({...nt,name:v})} required/>
              <TA label="Description" value={nt.description} onChange={v=>setNt({...nt,description:v})}/>
              <Sel label="Icon" value={nt.icon} onChange={v=>setNt({...nt,icon:v})} options={["calendar","shopping","coffee","help"].map(i=>({value:i,label:i}))}/>
              <Sel label="Kind" value={nt.kind} onChange={v=>setNt({...nt,kind:v})} options={[{value:"form",label:"Form"},{value:"calendar",label:"Calendar (Calendly)"}]}/>
              {nt.kind==="calendar" && <>
                <TI label="Calendly URL — Ella" value={nt.calendly_ella} onChange={v=>setNt({...nt,calendly_ella:v})}/>
                <TI label="Calendly URL — Noel/Caroline" value={nt.calendly_noel} onChange={v=>setNt({...nt,calendly_noel:v})}/>
              </>}
              <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary" onClick={()=>setShowAddType(false)}>Cancel</Btn><Btn onClick={addType} disabled={!nt.name.trim()}>Add</Btn></div>
            </div>
          </Md>
          <Md open={!!editType} onClose={()=>setEditType(null)} title="Edit Request Type">
            {editType && <div className="flex flex-col gap-3">
              <TI label="Name" value={editType.name} onChange={v=>setEditType({...editType,name:v})}/>
              <TA label="Description" value={editType.description||""} onChange={v=>setEditType({...editType,description:v})}/>
              <Sel label="Icon" value={editType.icon||"help"} onChange={v=>setEditType({...editType,icon:v})} options={["calendar","shopping","coffee","help"].map(i=>({value:i,label:i}))}/>
              <Sel label="Kind" value={editType.kind||"form"} onChange={v=>setEditType({...editType,kind:v})} options={[{value:"form",label:"Form"},{value:"calendar",label:"Calendar (Calendly)"}]}/>
              {editType.kind==="calendar" && <>
                <TI label="Calendly URL — Ella" value={editType.calendly_ella||""} onChange={v=>setEditType({...editType,calendly_ella:v})}/>
                <TI label="Calendly URL — Noel/Caroline" value={editType.calendly_noel||""} onChange={v=>setEditType({...editType,calendly_noel:v})}/>
              </>}
              <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary" onClick={()=>setEditType(null)}>Cancel</Btn><Btn onClick={saveEditType}>Save</Btn></div>
            </div>}
          </Md>
        </div>
      )}
    </div>
  );
}

// ── Events Page ────────────────────────────────────────────────────────────────
function EventsPage({ profile, interns, events, setEvents, sb }: { profile:Profile; interns:Profile[]; events:CCEvent[]; setEvents:(e:CCEvent[])=>void; sb:any }) {
  const [showC, setShowC] = useState(false);
  const [sel, setSel] = useState<CCEvent|null>(null);
  const [filter, setFilter] = useState("all");
  const [calMonth, setCalMonth] = useState(new Date());
  const [ne, setNe] = useState({title:"",description:"",date:"",time:"",location:"",materials:[{item:"",qty:""}] as EventMaterial[]});
  const [dateTbd, setDateTbd] = useState(false);
  const [eventFile, setEventFile] = useState<File|null>(null);
  const gn=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"?";
  const fd=filter==="all"?events:events.filter(e=>e.status===filter);
  const sorted=[...fd].sort((a,b)=>new Date(a.date||"9999").getTime()-new Date(b.date||"9999").getTime());
  const SV: Record<string,BV>={planning:"warning",upcoming:"purple",completed:"success",cancelled:"danger"};

  async function create() {
    const mats=ne.materials.filter(m=>m.item.trim());
    let file_url: string|null = null;
    if (eventFile) {
      const path = `${Date.now()}-${eventFile.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const { error: upErr } = await sb.storage.from("events").upload(path, eventFile, { upsert: false });
      if (!upErr) { const { data: ud } = sb.storage.from("events").getPublicUrl(path); file_url = ud.publicUrl; }
    }
    const {data,error}=await sb.from("events").insert({...ne,date:dateTbd?null:(ne.date||null),materials:mats,intern_id:profile.id,team_members:[],status:"planning",file_url,created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setEvents([data,...events]);setShowC(false);setDateTbd(false);setEventFile(null);
    setNe({title:"",description:"",date:"",time:"",location:"",materials:[{item:"",qty:""}]});
  }
  async function updateStatus(id:string,status:string) {
    await sb.from("events").update({status}).eq("id",id);
    setEvents(events.map(e=>e.id===id?{...e,status}:e));
    if(sel?.id===id) setSel({...sel,status});
  }
  async function toggleMaterial(eventId:string,idx:number,fulfilled:boolean) {
    const ev=events.find(e=>e.id===eventId);
    if(!ev) return;
    const mats=(ev.materials||[]).map((m,i)=>i===idx?{...m,fulfilled}:m);
    await sb.from("events").update({materials:mats}).eq("id",eventId);
    setEvents(events.map(e=>e.id===eventId?{...e,materials:mats}:e));
    if(sel?.id===eventId) setSel({...sel,materials:mats});
  }
  async function deleteEvent(id:string) {
    await sb.from("events").delete().eq("id",id);
    setEvents(events.filter(e=>e.id!==id));
    setSel(null);
  }

  // Mini calendar
  const yr=calMonth.getFullYear(), mo=calMonth.getMonth();
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const firstDay=new Date(yr,mo,1).getDay();
  const today=new Date();
  const evByDay=events.filter(e=>e.status!=="cancelled").reduce<Record<number,CCEvent>>((acc,e)=>{
    if(e.date){const d=new Date(e.date+"T12:00:00");if(d.getFullYear()===yr&&d.getMonth()===mo)acc[d.getDate()]=e;}
    return acc;
  },{});
  const statusDot: Record<string,string>={planning:"#F59E0B",upcoming:"#8B5CF6",completed:"#10B981"};

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Events</h1><p className="text-sm text-stone-400 mt-0.5">{events.length} events</p></div>
        <Btn onClick={()=>setShowC(true)}><Plus size={14}/>Add Event</Btn>
      </div>
      {/* Mini calendar */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">{calMonth.toLocaleString("en-US",{month:"long",year:"numeric"})}</p>
          <div className="flex gap-1">
            <button onClick={()=>setCalMonth(new Date(yr,mo-1,1))} className="p-1 rounded hover:bg-stone-100 text-stone-400 text-xs">‹</button>
            <button onClick={()=>setCalMonth(new Date(yr,mo+1,1))} className="p-1 rounded hover:bg-stone-100 text-stone-400 text-xs">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="text-xs text-stone-400 font-medium py-1">{d}</div>)}
          {Array.from({length:firstDay},(_,i)=><div key={"e"+i}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1;
            const ev=evByDay[day];
            const isToday=day===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear();
            return (
              <div key={day} onClick={()=>ev&&setSel(ev)} className={`relative flex items-center justify-center rounded-lg text-xs transition-all aspect-square ${isToday?"bg-stone-800 text-white font-bold":"text-stone-600 hover:bg-stone-50"}${ev?" cursor-pointer font-semibold":""}`}>
                {day}
                {ev && <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full" style={{background:statusDot[ev.status]||"#8B5CF6"}}/>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {["all","planning","upcoming","completed"].map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
      </div>
      {sorted.length===0 ? <ES icon={<CalendarDays size={24}/>} message="No events"/> : (
        <div className="flex flex-col gap-2">
          {sorted.map(ev=>(
            <div key={ev.id} onClick={()=>setSel(ev)} className="bg-white border border-stone-200/60 rounded-xl p-4 hover:border-stone-300 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 text-center shrink-0 pt-0.5">
                    <p className="text-lg font-bold text-stone-800">{ev.date?new Date(ev.date+"T12:00:00").getDate():"?"}</p>
                    <p className="text-xs text-stone-400 uppercase">{ev.date?new Date(ev.date+"T12:00:00").toLocaleString("en-US",{month:"short"}):""}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800">{ev.title}</p>
                    {ev.description && <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{ev.description}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {ev.location && <span className="text-xs text-stone-400 flex items-center gap-1"><MapPin size={10}/>{ev.location}</span>}
                      {ev.time && <span className="text-xs text-stone-400">{ev.time}</span>}
                      <span className="text-xs text-stone-400">{gn(ev.intern_id)}</span>
                      {(ev.materials||[]).length>0 && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1"><ShoppingBag size={10}/>{(ev.materials||[]).filter(m=>m.fulfilled).length}/{(ev.materials||[]).length} materials</span>}
                    </div>
                  </div>
                </div>
                <Bg v={SV[ev.status]||"default"}>{ev.status.charAt(0).toUpperCase()+ev.status.slice(1)}</Bg>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Create modal */}
      <Md open={showC} onClose={()=>{setShowC(false);setDateTbd(false);}} title="Add Event">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={ne.title} onChange={v=>setNe({...ne,title:v})} required/>
          <TA label="Description" value={ne.description} onChange={v=>setNe({...ne,description:v})}/>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1.5">Date</label>
              <div className="flex items-center gap-3">
                <input type="date" value={dateTbd?"":ne.date} disabled={dateTbd} onChange={e=>setNe({...ne,date:e.target.value})} className={`flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 ${dateTbd?"opacity-40 cursor-not-allowed":""}`}/>
                <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer whitespace-nowrap"><input type="checkbox" checked={dateTbd} onChange={e=>setDateTbd(e.target.checked)} className="rounded"/>TBD</label>
              </div>
            </div>
            <TI label="Time" value={ne.time} onChange={v=>setNe({...ne,time:v})} placeholder="e.g. 2:00 PM"/>
          </div>
          <TI label="Location" value={ne.location} onChange={v=>setNe({...ne,location:v})}/>
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-2">Materials Needed</label>
            {ne.materials.map((m,i)=>(
              <div key={i} className="flex gap-2 mb-2">
                <input value={m.item} onChange={e=>{const mats=[...ne.materials];mats[i]={...mats[i],item:e.target.value};setNe({...ne,materials:mats});}} placeholder="Item name" className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                <input value={m.qty} onChange={e=>{const mats=[...ne.materials];mats[i]={...mats[i],qty:e.target.value};setNe({...ne,materials:mats});}} placeholder="Qty" className="w-20 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                {ne.materials.length>1 && <button onClick={()=>setNe({...ne,materials:ne.materials.filter((_,j)=>j!==i)})} className="p-2 text-stone-300 hover:text-red-500"><X size={14}/></button>}
              </div>
            ))}
            <button onClick={()=>setNe({...ne,materials:[...ne.materials,{item:"",qty:""}]})} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"><Plus size={12}/>Add item</button>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide block mb-1.5">Attach file <span className="text-stone-400 font-normal capitalize">(optional)</span></p>
            <FileDropZone file={eventFile} setFile={setEventFile}/>
          </div>
          <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary" onClick={()=>{setShowC(false);setEventFile(null);}}>Cancel</Btn><Btn onClick={create} disabled={!ne.title.trim()}>Create Event</Btn></div>
        </div>
      </Md>
      {/* Detail modal */}
      <Md open={!!sel} onClose={()=>setSel(null)} title="Event Detail">
        {sel && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><Bg v={SV[sel.status]||"default"}>{sel.status.charAt(0).toUpperCase()+sel.status.slice(1)}</Bg></div>
              <h3 className="text-base font-semibold text-stone-800">{sel.title}</h3>
              {sel.description && <p className="text-sm text-stone-500 mt-1">{sel.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-400">
                {sel.date && <span>{new Date(sel.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"})}</span>}
                {sel.time && <span>{sel.time}</span>}
                {sel.location && <span className="flex items-center gap-1"><MapPin size={10}/>{sel.location}</span>}
                <span>Led by {gn(sel.intern_id)}</span>
                {sel.file_url && <a href={sel.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"><ExternalLink size={10}/>Attachment</a>}
              </div>
            </div>
            {(sel.materials||[]).length>0 && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Materials</p>
                <div className="flex flex-col gap-1.5">
                  {(sel.materials||[]).map((m,i)=>(
                    <div key={i} className="flex items-center gap-3 py-1.5 px-3 bg-stone-50 rounded-lg">
                      <input type="checkbox" checked={!!m.fulfilled} onChange={e=>toggleMaterial(sel.id,i,e.target.checked)} className="rounded accent-emerald-600"/>
                      <span className={`text-sm flex-1 ${m.fulfilled?"line-through text-stone-400":"text-stone-700"}`}>{m.item}</span>
                      {m.qty && <span className="text-xs text-stone-400">×{m.qty}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {["planning","upcoming","completed","cancelled"].map(s=><button key={s} onClick={()=>updateStatus(sel.id,s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sel.status===s?"bg-stone-800 text-white":"bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
              </div>
            </div>
            {profile.role==="admin" && (
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <Btn variant="danger" size="sm" onClick={()=>{ if(window.confirm("Delete this event?")) deleteEvent(sel.id); }}><Trash2 size={12}/>Delete Event</Btn>
              </div>
            )}
          </div>
        )}
      </Md>
    </div>
  );
}

// ── Tech Projects Page ─────────────────────────────────────────────────────────
function TechProjectsPage({ profile, interns, projects, setProjects, sb }: { profile:Profile; interns:Profile[]; projects:TechProject[]; setProjects:(p:TechProject[])=>void; sb:any }) {
  const [showC, setShowC] = useState(false);
  const [sel, setSel] = useState<TechProject|null>(null);
  const [filter, setFilter] = useState("all");
  const [np, setNp] = useState({title:"",description:"",tech_stack:"",priority:"medium"});
  const gn=(id?:string)=>interns.find(i=>i.id===id)?.full_name||"?";
  const fd=filter==="all"?projects:projects.filter(p=>p.status===filter);
  const inProgress=projects.filter(p=>p.status==="in_progress").length;
  const completed=projects.filter(p=>p.status==="completed").length;
  const avgProg=projects.length>0?Math.round(projects.reduce((s,p)=>s+p.progress,0)/projects.length):0;
  const SV: Record<string,BV>={planning:"warning",in_progress:"info",completed:"success"};
  const SL: Record<string,string>={planning:"Planning",in_progress:"In Progress",completed:"Completed"};

  async function create() {
    const {data,error}=await sb.from("tech_projects").insert({...np,owner_id:profile.id,contributors:[],status:"planning",github_url:"",progress:0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setProjects([data,...projects]);setShowC(false);
    setNp({title:"",description:"",tech_stack:"",priority:"medium"});
  }
  async function updateProgress(id:string,progress:number) {
    const status=progress>=100?"completed":progress>0?"in_progress":"planning";
    await sb.from("tech_projects").update({progress,status,updated_at:new Date().toISOString()}).eq("id",id);
    setProjects(projects.map(p=>p.id===id?{...p,progress,status}:p));
    if(sel?.id===id) setSel({...sel,progress,status});
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Tech Projects</h1><p className="text-sm text-stone-400 mt-0.5">Built by the Tech/AI team</p></div>
        <Btn onClick={()=>setShowC(true)}><Plus size={14}/>New Project</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SC label="In Progress" value={inProgress}/><SC label="Completed" value={completed}/><SC label="Avg Progress" value={`${avgProg}%`}/>
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {["all","planning","in_progress","completed"].map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===s?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{s==="all"?"All":SL[s]}</button>)}
      </div>
      {fd.length===0 ? <ES icon={<Code2 size={24}/>} message="No projects here"/> : (
        <div className="flex flex-col gap-3">
          {fd.map(pr=>(
            <div key={pr.id} onClick={()=>setSel(pr)} className="bg-white border border-stone-200/60 rounded-xl p-5 hover:border-stone-300 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-stone-800">{pr.title}</span><PB priority={pr.priority}/></div>
                  <p className="text-xs text-stone-400 line-clamp-1">{pr.description}</p>
                </div>
                <Bg v={SV[pr.status]||"default"}>{SL[pr.status]||pr.status}</Bg>
              </div>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <span className="text-xs text-stone-400 flex items-center gap-1"><Av name={gn(pr.owner_id)} size={16}/>{gn(pr.owner_id)}</span>
                {pr.tech_stack && <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{pr.tech_stack}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pr.progress>=100?"bg-emerald-500":pr.progress>50?"bg-sky-500":"bg-amber-400"}`} style={{width:`${pr.progress}%`}}/>
                </div>
                <span className="text-xs font-semibold text-stone-600 w-10 text-right">{pr.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <Md open={showC} onClose={()=>setShowC(false)} title="New Project">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={np.title} onChange={v=>setNp({...np,title:v})} required/>
          <TA label="Description" value={np.description} onChange={v=>setNp({...np,description:v})}/>
          <TI label="Tech Stack" value={np.tech_stack} onChange={v=>setNp({...np,tech_stack:v})} placeholder="e.g. React, Python, Supabase"/>
          <Sel label="Priority" value={np.priority} onChange={v=>setNp({...np,priority:v})} options={["low","medium","high","urgent"].map(p=>({value:p,label:p.charAt(0).toUpperCase()+p.slice(1)}))}/>
          <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary" onClick={()=>setShowC(false)}>Cancel</Btn><Btn onClick={create} disabled={!np.title.trim()}>Create</Btn></div>
        </div>
      </Md>
      <Md open={!!sel} onClose={()=>setSel(null)} title="Project Detail">
        {sel && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><PB priority={sel.priority}/><Bg v={SV[sel.status]||"default"}>{SL[sel.status]||sel.status}</Bg></div>
              <h3 className="text-lg font-bold text-stone-800">{sel.title}</h3>
              {sel.description && <p className="text-sm text-stone-500 mt-1 leading-relaxed">{sel.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 rounded-lg p-3"><p className="text-xs text-stone-400 mb-1">Owner</p><p className="text-sm font-medium text-stone-700">{gn(sel.owner_id)}</p></div>
              <div className="bg-stone-50 rounded-lg p-3"><p className="text-xs text-stone-400 mb-1">Tech Stack</p><p className="text-sm font-medium text-stone-700">{sel.tech_stack||"TBD"}</p></div>
            </div>
            {(sel.contributors||[]).length>0 && (
              <div><p className="text-xs text-stone-400 mb-2">Contributors</p><div className="flex gap-2 flex-wrap">{(sel.contributors||[]).map(id=><span key={id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-50 rounded-lg text-xs text-stone-600"><Av name={gn(id)} size={16}/>{gn(id)}</span>)}</div></div>
            )}
            <div>
              <p className="text-xs font-medium text-stone-500 mb-2">Progress: {sel.progress}%</p>
              <input type="range" min="0" max="100" step="5" value={sel.progress}
                onChange={e=>updateProgress(sel.id,parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer accent-stone-800"/>
              <div className="flex justify-between text-xs text-stone-400 mt-1"><span>Planning</span><span>In Progress</span><span>Complete</span></div>
            </div>
            {sel.github_url && <a href={sel.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700"><ExternalLink size={12}/>View on GitHub</a>}
          </div>
        )}
      </Md>
    </div>
  );
}

// ── Content Tracker Page ───────────────────────────────────────────────────────
function ContentPage({ profile, interns, content, setContent, ugcHooks, setUGCHooks, savedHooks, setSavedHooks, settings, sb }: { profile:Profile; interns:Profile[]; content:ContentVideo[]; setContent:(c:ContentVideo[])=>void; ugcHooks:UGCHook[]; setUGCHooks:(h:UGCHook[])=>void; savedHooks:SavedHook[]; setSavedHooks:(h:SavedHook[])=>void; settings:AppSettings; sb:any }) {
  const [view, setView] = useState("leaderboard");
  const [showC, setShowC] = useState(false);
  const [nc, setNc] = useState({title:"",tiktok_url:"",views:"",likes:"",comments:""});
  const creators=interns.filter(i=>i.team==="Content Creation"&&i.active!==false);
  const fmtN=(n:number)=>{ if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return(n/1000).toFixed(1)+"K"; return n.toString(); };

  async function submit() {
    const {data,error}=await sb.from("content_videos").insert({...nc,creator_id:profile.id,views:parseInt(nc.views)||0,likes:parseInt(nc.likes)||0,comments:parseInt(nc.comments)||0,date_posted:new Date().toISOString().split("T")[0],status:nc.tiktok_url?"published":"draft",created_at:new Date().toISOString()}).select().single();
    if(error){console.error(error);return;}
    setContent([data,...content]);setShowC(false);
    setNc({title:"",tiktok_url:"",views:"",likes:"",comments:""});
  }

  const leaderboard=useMemo(()=>creators.map(c=>{
    const vids=content.filter(v=>v.creator_id===c.id&&v.status==="published");
    return{...c,vids:vids.length,totalViews:vids.reduce((s,v)=>s+(v.views||0),0),totalLikes:vids.reduce((s,v)=>s+(v.likes||0),0)};
  }).sort((a,b)=>b.totalViews-a.totalViews),[content,creators]);

  const allVids=useMemo(()=>[...content].filter(v=>v.status==="published").sort((a,b)=>(b.views||0)-(a.views||0)),[content]);
  const drafts=useMemo(()=>content.filter(v=>v.status==="draft"),[content]);
  const pubCount=content.filter(c=>c.status==="published").length;
  const totalViews=content.reduce((s,c)=>s+(c.views||0),0);
  const totalLikes=content.reduce((s,c)=>s+(c.likes||0),0);
  const avgViews=pubCount>0?Math.round(totalViews/pubCount):0;
  const medals=["🥇","🥈","🥉"];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Content Tracker</h1><p className="text-sm text-stone-400 mt-0.5">TikTok performance by creator</p></div>
        <Btn onClick={()=>setShowC(true)}><Plus size={14}/>Submit Video</Btn>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SC label="Total Videos" value={pubCount}/><SC label="Total Views" value={fmtN(totalViews)}/><SC label="Total Likes" value={fmtN(totalLikes)}/><SC label="Avg Views" value={fmtN(avgViews)}/>
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {["leaderboard","all","drafts","hooks"].map(v=><button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v?"bg-white text-stone-800 shadow-sm":"text-stone-500"}`}>{v==="leaderboard"?"Creator Leaderboard":v==="all"?"All Videos":v==="drafts"?"Drafts":"⚡ Hook Generator"}</button>)}
      </div>
      {view==="leaderboard" && (
        <div className="flex flex-col gap-3">
          {leaderboard.length===0 ? <ES icon={<Video size={24}/>} message="No published videos yet"/> : leaderboard.map((cr,i)=>(
            <div key={cr.id} className="bg-white border border-stone-200/60 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i===0?"bg-amber-100 text-amber-700":i===1?"bg-stone-200 text-stone-600":i===2?"bg-orange-100 text-orange-700":"bg-stone-100 text-stone-500"}`}>{i<3?medals[i]:i+1}</div>
                <Av name={cr.full_name} size={36}/>
                <div className="flex-1"><p className="text-sm font-semibold text-stone-800">{cr.full_name}</p><p className="text-xs text-stone-400">{cr.vids} videos</p></div>
                <div className="flex items-center gap-6 text-center">
                  <div><p className="text-lg font-bold text-stone-800">{fmtN(cr.totalViews)}</p><p className="text-xs text-stone-400">Views</p></div>
                  <div><p className="text-lg font-bold text-stone-800">{fmtN(cr.totalLikes)}</p><p className="text-xs text-stone-400">Likes</p></div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 ml-12">
                {content.filter(v=>v.creator_id===cr.id&&v.status==="published").sort((a,b)=>(b.views||0)-(a.views||0)).map(vid=>(
                  <div key={vid.id} className="flex items-center gap-3 py-1.5 px-3 bg-stone-50 rounded-lg">
                    <Play size={12} className="text-stone-400 shrink-0"/>
                    <span className="text-xs text-stone-600 flex-1 truncate">{vid.title}</span>
                    <span className="text-xs text-stone-400">{fmt(vid.date_posted)}</span>
                    <span className="text-xs font-semibold text-violet-600">{fmtN(vid.views||0)} views</span>
                    {vid.tiktok_url && <a href={vid.tiktok_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="text-stone-400 hover:text-stone-600"><ExternalLink size={12}/></a>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {view==="all" && (
        allVids.length===0 ? <ES icon={<Video size={24}/>} message="No published videos"/> : (
          <div className="bg-white border border-stone-200/60 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-stone-100 bg-stone-50"><th className="text-left p-3 text-stone-400 font-medium">Title</th><th className="text-left p-3 text-stone-400 font-medium">Creator</th><th className="text-right p-3 text-stone-400 font-medium">Views</th><th className="text-right p-3 text-stone-400 font-medium">Likes</th><th className="p-3"></th></tr></thead>
              <tbody>{allVids.map(v=>(
                <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="p-3 text-stone-700 font-medium">{v.title}</td>
                  <td className="p-3 text-stone-500">{interns.find(i=>i.id===v.creator_id)?.full_name||"?"}</td>
                  <td className="p-3 text-right font-semibold text-violet-600">{fmtN(v.views||0)}</td>
                  <td className="p-3 text-right text-stone-500">{fmtN(v.likes||0)}</td>
                  <td className="p-3 text-right">{v.tiktok_url&&<a href={v.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-600 inline-flex"><ExternalLink size={12}/></a>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}
      {view==="drafts" && (
        drafts.length===0 ? <ES icon={<Video size={24}/>} message="No drafts"/> : (
          <div className="flex flex-col gap-2">
            {drafts.map(v=>(
              <div key={v.id} className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-center gap-3">
                <Play size={14} className="text-stone-400 shrink-0"/>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-stone-800 truncate">{v.title}</p><p className="text-xs text-stone-400">{interns.find(i=>i.id===v.creator_id)?.full_name||"?"}</p></div>
                <Bg v="default">Draft</Bg>
              </div>
            ))}
          </div>
        )
      )}
      {view==="hooks" && (
        <HookGeneratorPage profile={profile as unknown as UGCCreatorProfile} ugcCreators={[]} ugcHooks={ugcHooks} setUGCHooks={setUGCHooks} savedHooks={savedHooks} setSavedHooks={setSavedHooks} settings={settings} sb={sb}/>
      )}
      <Md open={showC} onClose={()=>setShowC(false)} title="Submit Video">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={nc.title} onChange={v=>setNc({...nc,title:v})} required/>
          <TI label="TikTok URL" value={nc.tiktok_url} onChange={v=>setNc({...nc,tiktok_url:v})} placeholder="https://tiktok.com/@cloudcloset/..."/>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TI label="Views" value={nc.views} onChange={v=>setNc({...nc,views:v})}/>
            <TI label="Likes" value={nc.likes} onChange={v=>setNc({...nc,likes:v})}/>
            <TI label="Comments" value={nc.comments} onChange={v=>setNc({...nc,comments:v})}/>
          </div>
          <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary" onClick={()=>setShowC(false)}>Cancel</Btn><Btn onClick={submit} disabled={!nc.title.trim()}>Submit</Btn></div>
        </div>
      </Md>
    </div>
  );
}

// ── Push Notifications Page ────────────────────────────────────────────────────
function NotificationPg({ interns, ugcCreators }: { interns: Profile[]; ugcCreators: UGCCreatorProfile[] }) {
  const TARGETS = [
    { label: "All Interns", team: undefined, role: undefined },
    { label: "Tech/AI", team: "Tech/AI", role: undefined },
    { label: "Strategy", team: "Strategy", role: undefined },
    { label: "Events/Outreach", team: "Events/Outreach", role: undefined },
    { label: "Design", team: "Design", role: undefined },
    { label: "Curation Team", team: "Curation Team", role: undefined },
    { label: "Content Creation", team: "Content Creation", role: undefined },
    { label: "UGC Creators", team: undefined, role: "ugc_creator" },
  ];
  const [form, setForm] = useState({ title: "", body: "", targetLabel: "All Interns" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);

  const selectedTarget = TARGETS.find(t => t.label === form.targetLabel) ?? TARGETS[0];

  async function send() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSending(true); setResult(null);
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, body: form.body, team: selectedTarget.team, role: selectedTarget.role }),
      });
      const json = await res.json();
      setResult(json);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h1 className="text-xl font-bold text-stone-800">Push Notifications</h1><p className="text-sm text-stone-400 mt-0.5">Send a push notification to interns or UGC creators who have enabled alerts.</p></div>
      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <TI label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. New task assigned" required />
        <TA label="Message" value={form.body} onChange={v => setForm({ ...form, body: v })} placeholder="Notification body text..." rows={3} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Send to</label>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map(t => (
              <button key={t.label} onClick={() => setForm({ ...form, targetLabel: t.label })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.targetLabel === t.label ? "bg-stone-800 text-white border-stone-800" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {result && (
          <div className={`text-sm px-3 py-2 rounded-lg ${result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {result.ok ? `Sent to ${result.sent} device${result.sent !== 1 ? "s" : ""}` : `Error: ${result.error}`}
          </div>
        )}
        <div className="flex justify-end">
          <Btn onClick={send} disabled={sending || !form.title.trim() || !form.body.trim()}>
            <Send size={14} />{sending ? "Sending..." : "Send Notification"}
          </Btn>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex flex-col gap-1">
        <p className="font-semibold">Users must allow notifications</p>
        <p>When a user first opens the dashboard, their browser will ask for permission. Only users who approved will receive push notifications.</p>
        <p className="mt-1 font-medium">{interns.length} interns · {ugcCreators.length} UGC creators registered.</p>
      </div>
    </div>
  );
}

// ── Merged Wisconsin Pages ─────────────────────────────────────────────────────
function OutreachRequestsPage({ profile, interns, outreach, setOutreach, requests, setRequests, requestTypes, setRequestTypes, sb, settings, addActivity }: {
  profile: Profile; interns: Profile[]; outreach: Outreach[]; setOutreach: (o: Outreach[]) => void;
  requests: Request[]; setRequests: (r: Request[]) => void; requestTypes: RequestType[];
  setRequestTypes: (rt: RequestType[]) => void; sb: any; settings: AppSettings; addActivity: (a: string, m?: any) => void;
}) {
  const [tab, setTab] = useState<"outreach" | "requests">("outreach");
  const isAdmin = profile.role === "admin";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("outreach")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "outreach" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Outreach Log</button>
        <button onClick={() => setTab("requests")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "requests" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Request Inbox</button>
      </div>
      {tab === "outreach"
        ? <OutPg profile={profile} interns={interns} sb={sb} addActivity={addActivity} outreach={outreach} setOutreach={setOutreach} />
        : isAdmin
          ? <AdminRequestInbox requests={requests} setRequests={setRequests} requestTypes={requestTypes} setRequestTypes={setRequestTypes} interns={interns} sb={sb} settings={settings} />
          : <InternRequests profile={profile} requests={requests.filter(r => r.intern_id === profile.id)} setRequests={setRequests} sb={sb} settings={settings} />
      }
    </div>
  );
}

function ReportsAnalyticsPage({ profile, interns, tasks, outreach, content, requests, questions, techProjects, reports, setReports, sb, settings, addActivity }: {
  profile: Profile; interns: Profile[]; tasks: Task[]; outreach: Outreach[]; content: ContentVideo[];
  requests: Request[]; questions: Question[]; techProjects: TechProject[];
  reports: Report[]; setReports: (r: Report[]) => void; sb: any; settings: AppSettings; addActivity: (a: string, m?: any) => void;
}) {
  const [tab, setTab] = useState<"reports" | "analytics">("reports");
  const isAdmin = profile.role === "admin";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("reports")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "reports" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Weekly Report</button>
        {isAdmin && <button onClick={() => setTab("analytics")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "analytics" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Analytics</button>}
      </div>
      {tab === "reports"
        ? <RPg profile={profile} interns={interns} sb={sb} addActivity={addActivity} reports={reports} setReports={setReports} settings={settings} />
        : <AnPg interns={interns} tasks={tasks} outreach={outreach} content={content} requests={requests} questions={questions} techProjects={techProjects} />
      }
    </div>
  );
}

// ── Merged UGC Pages ───────────────────────────────────────────────────────────
function UGCPivotsHubPage({ profile, pivotQueue, setPivotQueue, pivots, setPivots, ugcCreators, sb }: {
  profile: UGCCreatorProfile; pivotQueue: UGCPivotQueue[]; setPivotQueue: (q: UGCPivotQueue[]) => void;
  pivots: UGCPivot[]; setPivots: (p: UGCPivot[]) => void; ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const [tab, setTab] = useState<"queue" | "history">("queue");
  const isAdmin = profile.role === "admin";
  const pendingCount = pivotQueue.filter(q => q.status === "pending").length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("queue")} className={`text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${tab === "queue" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>
          Pivot Queue {pendingCount > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{pendingCount}</span>}
        </button>
        <button onClick={() => setTab("history")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "history" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Pivot History</button>
      </div>
      {tab === "queue"
        ? isAdmin
          ? <UGCPivotQueuePage profile={profile} pivotQueue={pivotQueue} setPivotQueue={setPivotQueue} ugcCreators={ugcCreators} sb={sb} />
          : null
        : isAdmin
          ? <UGCPivotHistoryPage profile={profile} pivots={pivots} setPivots={setPivots} ugcCreators={ugcCreators} sb={sb} />
          : null
      }
    </div>
  );
}

function UGCBriefsAnnouncementsPage({ profile, briefs, setBriefs, announcements, setAnnouncements, sb }: {
  profile: UGCCreatorProfile; briefs: UGCBrief[]; setBriefs: (b: UGCBrief[]) => void;
  announcements: UGCAnnouncement[]; setAnnouncements: (a: UGCAnnouncement[]) => void; sb: any;
}) {
  const [tab, setTab] = useState<"briefs" | "announcements">("briefs");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("briefs")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "briefs" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Weekly Brief</button>
        <button onClick={() => setTab("announcements")} className={`text-sm px-4 py-2 rounded-lg transition-all ${tab === "announcements" ? "bg-white shadow-sm font-medium text-stone-800" : "text-stone-500 hover:text-stone-700"}`}>Announcements</button>
      </div>
      {tab === "briefs"
        ? <UGCBriefPage briefs={briefs} setBriefs={setBriefs} sb={sb} />
        : <UGCAnnouncementsPage profile={profile} announcements={announcements} setAnnouncements={setAnnouncements} sb={sb} />
      }
    </div>
  );
}

// ── Smart Alerts Page ──────────────────────────────────────────────────────────
function AlertsPage({ alerts, setAlerts, sb }: { alerts: SmartAlert[]; setAlerts: (a: SmartAlert[]) => void; sb: any }) {
  async function dismiss(id: string) {
    await sb.from("smart_alerts").update({ dismissed: true }).eq("id", id);
    setAlerts(alerts.filter(a => a.id !== id));
  }
  async function dismissAll() {
    if (!window.confirm("Dismiss all alerts?")) return;
    await sb.from("smart_alerts").update({ dismissed: true }).in("id", alerts.map(a => a.id));
    setAlerts([]);
  }

  const urgencyOrder = ["purple", "red", "orange", "yellow"];
  const urgencyLabel: Record<string, string> = { purple: "🟣 Viral", red: "🔴 Urgent", orange: "🟠 Warning", yellow: "🟡 Heads Up" };
  const urgencyStyle: Record<string, { border: string; bg: string; text: string }> = {
    purple: { border: "#c4b5fd", bg: "#faf5ff", text: "#7c3aed" },
    red:    { border: "#fca5a5", bg: "#fff1f2", text: "#b91c1c" },
    orange: { border: "#fdba74", bg: "#fff7ed", text: "#c2410c" },
    yellow: { border: "#fde68a", bg: "#fffbeb", text: "#92400e" },
  };

  const grouped = urgencyOrder.reduce((acc, u) => {
    acc[u] = alerts.filter(a => a.urgency === u);
    return acc;
  }, {} as Record<string, SmartAlert[]>);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Alerts Center</h1>
          <p className="text-sm text-stone-400 mt-0.5">{alerts.length} active alert{alerts.length !== 1 ? "s" : ""}</p>
        </div>
        {alerts.length > 0 && <Btn variant="secondary" onClick={dismissAll}>Dismiss All</Btn>}
      </div>

      {alerts.length === 0 ? (
        <ES icon={<Bell size={24} />} message="No active alerts — all clear!" />
      ) : (
        urgencyOrder.map(urgency => {
          const group = grouped[urgency];
          if (group.length === 0) return null;
          const s = urgencyStyle[urgency];
          return (
            <div key={urgency}>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">{urgencyLabel[urgency]}</p>
              <div className="flex flex-col gap-2">
                {group.map(alert => (
                  <div key={alert.id} className="border rounded-xl p-4 flex items-start justify-between gap-3" style={{ borderColor: s.border, backgroundColor: s.bg }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug" style={{ color: s.text }}>{alert.message}</p>
                      <p className="text-xs mt-1" style={{ color: s.text, opacity: 0.6 }}>{fmt(alert.created_at)}{alert.week_date ? ` · Week of ${alert.week_date}` : ""}</p>
                    </div>
                    <button onClick={() => dismiss(alert.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-all" style={{ color: s.text }} title="Dismiss"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Settings Page ──────────────────────────────────────────────────────────────
function SettingsPg({ settings, setSettings, sb }: { settings:AppSettings; setSettings:(s:AppSettings)=>void; sb:any }) {
  const TEAMS = ["Tech/AI","Strategy","Events/Outreach","Design","Curation Team","Content Creation"];
  const STD_FIELDS: {key:keyof Omit<ReportFieldConfig,"custom_fields">;label:string}[] = [
    {key:"tasks_completed",label:"Tasks Completed"},
    {key:"outreach_sent",label:"Outreach Sent"},
    {key:"responses_received",label:"Responses Received"},
    {key:"wins",label:"Wins"},
    {key:"challenges",label:"Challenges"},
    {key:"ideas",label:"Ideas / Suggestions"},
  ];
  const [form, setForm] = useState({ calendly_ella:settings.calendly_ella||"", calendly_noel:settings.calendly_noel||"", caroline_email:settings.caroline_email||"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rcTeam, setRcTeam] = useState("Tech/AI");
  const [reportConfig, setReportConfig] = useState<ReportConfig>(()=>{ try { return JSON.parse(settings.report_config||"{}"); } catch { return {}; } });
  const [newField, setNewField] = useState({label:"",type:"checkbox" as "checkbox"|"text"});
  const [rcSaving, setRcSaving] = useState(false);
  const [rcSaved, setRcSaved] = useState(false);

  // UGC pivot system prompt
  const DEFAULT_PIVOT_PROMPT = `You are the content strategist for Cloud Closet — a platform where real people share how they get dressed. Not influencers. Not trends. Real style, real people, real closets.

Cloud Closet brand voice: confident, observational, dry but warm underneath. Think a group chat that became a formal editorial. We don't over-explain. We don't hype. We trust people to get it. Write like you're already friends with this creator — direct, specific, no fluff. Never corporate, never coach-y, never hype.

Cloud Closet is not an influencer platform. It is not a trend engine. Content should speak to the universal experience of getting dressed — not one corner of fashion.

YOU MUST FOLLOW THESE RULES BEFORE WRITING ANY PIVOT:

RULE 1 — Only change ONE variable at a time. Never tell a creator to change their hook AND format AND length in the same week. Pick the single most important fix based on the data and focus there only.

RULE 2 — Every format must be tested at least 5 times before killing it. If a creator has tested a format fewer than 5 times, never recommend killing it. Instead recommend improving one element.

RULE 3 — Do not panic after one bad post. If last week was an outlier, say so directly and tell them to stay the course.

RULE 4 — Never recommend deleting underperforming videos.

RULE 5 — Minimum 1 video per day. If their submission shows fewer than 7 videos posted that week, flag this first before anything else.

DECISION TREE — follow this exactly based on their submitted numbers:

STEP 1 — Check 3-second hold rate first:
- If under 60%: the hook is weak. Tell them to fix the hook only. Do not change format yet. Give them 3 specific replacement hooks word for word.

STEP 2 — If 3-second hold is 65%+ but watch time is low:
- The hook worked but the video loses people after. Fix: cut video 20% shorter, move the result earlier, change camera angle every 1-2 seconds, remove pauses.

STEP 3 — If watch time is good but views are low:
- Content is good but distribution did not hit. Fix: post same format again at a different time, try a trending sound, slightly adjust caption.

STEP 4 — If shares are 5%+ of total views:
- Potential breakout format. Tell them to recreate this exact format 3 times, change only the hook, post within 5 days.

FORMAT KILL RULES — only recommend killing a format if ALL of these are true:
- Tested at least 5 times
- Average views under 2,000
- 3-second hold under 55%
- No shares

FORMAT KEEP RULES — tell them to keep a format if ANY of these are true:
- At least 1 video above 10,000 views
- Shares over 4%
- Completion rate over 30%

BENCHMARK TIERS:
- Under 500 views by day 2: hook failed
- 500-2,000 views: average, keep format, test 3 different hooks
- 2,000-10,000 views: good, make 3 variations of this exact hook immediately
- 10,000-50,000 views: strong, double down
- 50,000+ views: viral, stop everything and figure out exactly why it worked

Never say: "great job", "awesome", "keep it up", "consider trying", "you might want to", "perhaps"
Never recommend changing more than one variable at a time.
Never recommend killing a format tested fewer than 5 times.

Always structure every pivot exactly like this:

**WHAT WORKED:** (one specific thing backed by a real number from their submission)

**THE MAIN ISSUE:** (the single most important fix this week, backed by their specific data)

**YOUR ONE CHANGE THIS WEEK:** (exactly one variable to change — hook, length, posting time, sound, or opening frame)

**YOUR 3 HOOKS FOR THIS WEEK:** (three word-for-word hooks in Cloud Closet voice)

**FORMAT STATUS:** (keep, improve, or kill — include how many times they have tested this format)

**THIS WEEK'S CHALLENGE:** (one specific measurable goal tied directly to their weakest metric)`;

  const [pivotPrompt, setPivotPrompt] = useState(settings.ugc_pivot_system_prompt || DEFAULT_PIVOT_PROMPT);
  const [ppSaving, setPpSaving] = useState(false);
  const [ppSaved, setPpSaved] = useState(false);
  const [ppTesting, setPpTesting] = useState(false);
  const [ppTestResult, setPpTestResult] = useState<string | null>(null);

  const DEFAULT_ALERT_SETTINGS = { missed_submission: true, no_post: true, declining_performance: true, missed_streak: true, scale_rule: true, viral: true, same_format: true, creator_inactive: true };
  const ALERT_LABELS: Record<string, string> = {
    missed_submission: "Missed Submission (Friday)",
    no_post: "No Post Alert (under 7 videos)",
    declining_performance: "Declining Performance (30%+ drop)",
    missed_streak: "Missed Streak (3 weeks under 1k views)",
    scale_rule: "Scale Rule (10k+ views)",
    viral: "Viral Alert (50k+ views)",
    same_format: "Same Format Alert",
    creator_inactive: "Creator Inactive (7+ days)",
  };
  const [alertSettings, setAlertSettings] = useState<Record<string, boolean>>(() => {
    try { return { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(settings.alert_settings || '{}') }; } catch { return DEFAULT_ALERT_SETTINGS; }
  });
  const [asSaving, setAsSaving] = useState(false);
  const [asSaved, setAsSaved] = useState(false);

  async function saveAlertSettings() {
    setAsSaving(true);
    await sb.from("settings").upsert({ key: "alert_settings", value: JSON.stringify(alertSettings) }, { onConflict: "key" });
    setSettings({ ...settings, alert_settings: JSON.stringify(alertSettings) });
    setAsSaving(false); setAsSaved(true); setTimeout(() => setAsSaved(false), 2000);
  }

  async function savePivotPrompt() {
    setPpSaving(true);
    await sb.from("settings").upsert({ key: "ugc_pivot_system_prompt", value: pivotPrompt }, { onConflict: "key" });
    setSettings({ ...settings, ugc_pivot_system_prompt: pivotPrompt });
    setPpSaving(false); setPpSaved(true); setTimeout(() => setPpSaved(false), 2000);
  }

  async function testPivotPrompt() {
    setPpTesting(true); setPpTestResult(null);
    const mockAnalytics = {
      total_views: 1200, likes: 84, comments: 12, shares: 6, saves: 31,
      followers_gained: 18, followers_lost: 5, net_follower_change: 13,
      total_account_views: 4800, videos_posted: 5,
      hook_text: "Here's what I wore this week", format_type: "GRWM",
      video_length_seconds: 62, niche: "everyday styling",
      trending_sound: false, has_cta: false,
      avg_watch_time_seconds: 18, watch_completion_rate: 29,
      profile_visits: 44, traffic_fyp_pct: 71, traffic_following_pct: 22, traffic_search_pct: 7,
      comment_sentiment: "positive", best_video_link: "",
      benchmark_tier: "average", week_date: new Date().toISOString().split("T")[0],
    };
    try {
      const res = await fetch("/api/ugc-pivot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preview: true, creatorName: "Sample Creator", tiktokHandle: "samplecreator", analytics: mockAnalytics }),
      });
      const data = await res.json();
      if (data.error) setPpTestResult(`Error: ${data.error}`);
      else setPpTestResult(data.aiPivot || "No output returned.");
    } catch (e: any) {
      setPpTestResult(`Error: ${e.message}`);
    }
    setPpTesting(false);
  }

  const teamCfg: ReportFieldConfig = reportConfig[rcTeam] || {...DEFAULT_REPORT_FIELDS};

  function setTeamCfg(cfg: ReportFieldConfig) { setReportConfig(p=>({...p,[rcTeam]:cfg})); }
  function toggleField(field: keyof Omit<ReportFieldConfig,"custom_fields">) { setTeamCfg({...teamCfg,[field]:!teamCfg[field]}); }
  function addCustomField() {
    if(!newField.label.trim()) return;
    const key=newField.label.toLowerCase().replace(/[^a-z0-9]/g,"_")+"_"+Date.now();
    setTeamCfg({...teamCfg,custom_fields:[...(teamCfg.custom_fields||[]),{key,label:newField.label,type:newField.type}]});
    setNewField({label:"",type:"checkbox"});
  }
  function removeCustomField(key:string) { setTeamCfg({...teamCfg,custom_fields:(teamCfg.custom_fields||[]).filter(f=>f.key!==key)}); }

  async function save() {
    setSaving(true);
    await Promise.all(Object.entries(form).map(([key,value])=>sb.from("settings").upsert({key,value},{onConflict:"key"})));
    setSettings({...settings,...form});
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000);
  }
  async function saveReportConfig() {
    setRcSaving(true);
    const value=JSON.stringify(reportConfig);
    await sb.from("settings").upsert({key:"report_config",value},{onConflict:"key"});
    setSettings({...settings,report_config:value});
    setRcSaving(false); setRcSaved(true); setTimeout(()=>setRcSaved(false),2000);
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h1 className="text-xl font-bold text-stone-800">Settings</h1><p className="text-sm text-stone-400 mt-0.5">Admin configuration</p></div>
      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><CalendarClock size={15} className="text-violet-500"/>Calendly &amp; Contact</p>
        <TI label="Ella's Calendly URL" value={form.calendly_ella} onChange={v=>setForm({...form,calendly_ella:v})} placeholder="https://calendly.com/ella/..."/>
        <TI label="Noel's Calendly URL" value={form.calendly_noel} onChange={v=>setForm({...form,calendly_noel:v})} placeholder="https://calendly.com/noel/..."/>
        <TI label="Caroline's Email" value={form.caroline_email} onChange={v=>setForm({...form,caroline_email:v})} placeholder="caroline@example.com"/>
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
          <Btn onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</Btn>
        </div>
      </div>
      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <div><p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><FileText size={15} className="text-stone-400"/>Weekly Report Fields by Team</p><p className="text-xs text-stone-400 mt-1">Choose which fields each team sees when submitting their weekly report. Add custom fields (checkboxes or text).</p></div>
        <div className="flex flex-wrap gap-1">
          {TEAMS.map(t=><button key={t} onClick={()=>setRcTeam(t)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${rcTeam===t?"bg-stone-800 text-white":"bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>{t}</button>)}
        </div>
        <div className="border border-stone-100 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Standard Fields — {rcTeam}</p>
          <div className="grid grid-cols-2 gap-2">
            {STD_FIELDS.map(f=>(
              <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">
                <input type="checkbox" checked={!!teamCfg[f.key]} onChange={()=>toggleField(f.key)} className="rounded accent-stone-700"/>
                {f.label}
              </label>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Custom Fields</p>
            {(teamCfg.custom_fields||[]).length===0 && <p className="text-xs text-stone-400 italic mb-2">No custom fields for {rcTeam} yet.</p>}
            {(teamCfg.custom_fields||[]).map(cf=>(
              <div key={cf.key} className="flex items-center gap-2 mb-2">
                <span className="flex-1 text-xs text-stone-700 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">{cf.label} <span className="text-stone-400">({cf.type})</span></span>
                <button onClick={()=>removeCustomField(cf.key)} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newField.label} onChange={e=>setNewField(p=>({...p,label:e.target.value}))} placeholder="Field label..." className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
              <select value={newField.type} onChange={e=>setNewField(p=>({...p,type:e.target.value as "checkbox"|"text"}))} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none">
                <option value="checkbox">Checkbox</option>
                <option value="text">Text</option>
              </select>
              <Btn size="sm" onClick={addCustomField} disabled={!newField.label.trim()}><Plus size={13}/>Add</Btn>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          {rcSaved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
          <Btn onClick={saveReportConfig} disabled={rcSaving}>{rcSaving?"Saving...":"Save Report Config"}</Btn>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><AlertTriangle size={15} className="text-orange-500"/>Alert Settings</p>
          <p className="text-xs text-stone-400 mt-1">Choose which automated alerts are active. Changes take effect immediately.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(ALERT_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">
              <input type="checkbox" checked={!!alertSettings[key]} onChange={() => setAlertSettings(prev => ({ ...prev, [key]: !prev[key] }))} className="rounded accent-stone-700" />
              {label}
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3">
          {asSaved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
          <Btn onClick={saveAlertSettings} disabled={asSaving}>{asSaving ? "Saving..." : "Save Alert Settings"}</Btn>
        </div>
      </div>

      {/* UGC Pivot System Prompt */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><TrendingUp size={15} className="text-violet-500"/>UGC Pivot System Prompt</p>
          <p className="text-xs text-stone-400 mt-1">This is the strategy ruleset sent to Gemini AI when generating creator pivots. Edit here — changes take effect on the next submission. Use the test button to preview output with sample data.</p>
        </div>
        <textarea
          value={pivotPrompt}
          onChange={e => setPivotPrompt(e.target.value)}
          rows={20}
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono leading-relaxed focus:outline-none focus:border-stone-400 resize-y"
        />
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => { if (window.confirm("Reset to default prompt? This will overwrite your changes.")) setPivotPrompt(DEFAULT_PIVOT_PROMPT); }}
            className="text-xs text-stone-400 hover:text-stone-600 underline"
          >Reset to default</button>
          <div className="flex items-center gap-3">
            {ppSaved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
            <Btn variant="secondary" onClick={testPivotPrompt} disabled={ppTesting}>{ppTesting ? "Testing..." : "Test with Sample Data"}</Btn>
            <Btn onClick={savePivotPrompt} disabled={ppSaving}>{ppSaving ? "Saving..." : "Save Prompt"}</Btn>
          </div>
        </div>
        {ppTestResult && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-200">
              <p className="text-xs font-semibold text-stone-600">Test Output — Sample Creator</p>
              <button onClick={() => setPpTestResult(null)} className="text-stone-400 hover:text-stone-600"><X size={14}/></button>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <PivotContent text={ppTestResult} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── UGC Types ─────────────────────────────────────────────────────────────────
type UGCSubmission = { id: string; creator_id?: string; week_date: string; total_views: number; likes: number; comments: number; shares: number; saves: number; followers_gained: number; followers_lost: number; net_follower_change: number; best_video_link?: string; benchmark_tier?: string; hook_text?: string; format_type?: string; video_length_seconds?: number; niche?: string; trending_sound?: boolean; has_cta?: boolean; avg_watch_time_seconds?: number; watch_completion_rate?: number; profile_visits?: number; traffic_fyp_pct?: number; traffic_following_pct?: number; traffic_search_pct?: number; comment_sentiment?: string; total_account_views?: number; videos_posted?: number; created_at: string };
type UGCPivotQueue = { id: string; creator_id?: string; submission_id?: string; week_date: string; analytics_snapshot?: any; ai_pivot?: string; admin_notes?: string; example_video_link?: string; status: string; created_at: string };
type UGCPivot = { id: string; creator_id?: string; queue_id?: string; week_date: string; ai_pivot?: string; admin_notes?: string; example_video_link?: string; created_at: string };
type UGCHook = { id: string; hook_text: string; view_count?: number; week_date?: string; creator_id?: string; admin_notes?: string; pushed_to?: string; push_note?: string; video_topic?: string; format_type?: string; goal?: string; audience?: string; save_count?: number; created_at: string };
type SavedHook = { id: string; creator_id?: string; hook_text: string; video_topic?: string; format_type?: string; goal?: string; audience?: string; saved_at: string };
type UGCBrief = { id: string; week_date: string; hooks?: string; format_recs?: string; brand_guidelines?: string; created_at: string };
type UGCAnnouncement = { id: string; title: string; body?: string; pinned?: boolean; created_at: string };
type UGCResource = { id: string; title: string; description?: string; category?: string; file_url?: string; link?: string; created_at: string };
type UGCQuestion = { id: string; creator_id?: string; question: string; created_at: string; ugc_qa_replies?: UGCReply[] };
type UGCReply = { id: string; question_id: string; creator_id?: string; reply: string; created_at: string };
type UGCCreatorProfile = Profile & { tiktok_handle?: string; ugc_status?: string };
type SmartAlert = { id: string; creator_id?: string; alert_type: string; message: string; urgency: 'red' | 'orange' | 'yellow' | 'purple'; dismissed: boolean; week_date?: string; created_at: string; };

// ── UGC Helpers ────────────────────────────────────────────────────────────────
function BenchmarkBadge({ tier }: { tier?: string }) {
  const map: Record<string, { v: BV; label: string }> = {
    hook_failed: { v: "danger", label: "Hook Failed" },
    average: { v: "warning", label: "Average" },
    good: { v: "info", label: "Good" },
    strong: { v: "success", label: "Strong" },
    viral: { v: "purple", label: "Viral 🔥" },
  };
  const t = tier ? map[tier] : null;
  if (!t) return null;
  return <Bg v={t.v}>{t.label}</Bg>;
}

function calcBenchmarkTier(_completionRate: number, total_views: number): string {
  if (total_views < 500) return "hook_failed";
  if (total_views < 2000) return "average";
  if (total_views < 10000) return "good";
  if (total_views < 50000) return "strong";
  return "viral";
}

function fmtViews(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function timeAgo(dt: string): string {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getMondayOfWeek(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split("T")[0];
}

function LineGraph({ data, labels, color = "#1C1917", height = 120 }: { data: number[]; labels?: string[]; color?: string; height?: number }) {
  if (data.length < 2) return <div className="flex items-center justify-center h-20 text-xs text-stone-400">Not enough data</div>;
  const W = 400;
  const H = height;
  const pad = { top: 10, bottom: labels ? 28 : 10, left: 10, right: 10 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * iW,
    y: pad.top + iH - ((v - minV) / range) * iH,
    v,
  }));
  const poly = pts.map(p => `${p.x},${p.y}`).join(" ");
  // Grid lines
  const gridLines = [0, 0.5, 1].map(r => pad.top + iH * (1 - r));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {gridLines.map((y, i) => (
        <line key={i} x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#E7E5E4" strokeWidth="1" />
      ))}
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} />
          <title>{labels?.[i] ? `${labels[i]}: ` : ""}{fmtViews(p.v)} views</title>
          <circle cx={p.x} cy={p.y} r={8} fill="transparent" />
        </g>
      ))}
      {labels && pts.map((p, i) => (
        <text key={`l${i}`} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#78716C">
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

function TwoLineGraph({ data1, data2, labels, color1 = "#1C1917", color2 = "#7C3AED", height = 120 }: { data1: number[]; data2: number[]; labels?: string[]; color1?: string; color2?: string; height?: number }) {
  const allData = [...data1, ...data2];
  if (allData.length < 2) return <div className="flex items-center justify-center h-20 text-xs text-stone-400">Not enough data</div>;
  const W = 400;
  const H = height;
  const pad = { top: 10, bottom: labels ? 28 : 10, left: 10, right: 10 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const minV = Math.min(...allData);
  const maxV = Math.max(...allData);
  const range = maxV - minV || 1;
  const toY = (v: number) => pad.top + iH - ((v - minV) / range) * iH;
  const maxLen = Math.max(data1.length, data2.length);
  const pts1 = data1.map((v, i) => ({ x: pad.left + (i / (maxLen - 1)) * iW, y: toY(v), v }));
  const pts2 = data2.map((v, i) => ({ x: pad.left + (i / (maxLen - 1)) * iW, y: toY(v), v }));
  const poly1 = pts1.map(p => `${p.x},${p.y}`).join(" ");
  const poly2 = pts2.map(p => `${p.x},${p.y}`).join(" ");
  const gridLines = [0, 0.5, 1].map(r => pad.top + iH * (1 - r));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {gridLines.map((y, i) => (
        <line key={i} x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#E7E5E4" strokeWidth="1" />
      ))}
      {data1.length > 1 && <polyline points={poly1} fill="none" stroke={color1} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {data2.length > 1 && <polyline points={poly2} fill="none" stroke={color2} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {pts1.map((p, i) => (
        <g key={`p1${i}`}><circle cx={p.x} cy={p.y} r={3.5} fill={color1} /><title>{labels?.[i]} · {fmtViews(p.v)}</title></g>
      ))}
      {pts2.map((p, i) => (
        <g key={`p2${i}`}><circle cx={p.x} cy={p.y} r={3.5} fill={color2} /><title>{labels?.[i]} · {fmtViews(p.v)}</title></g>
      ))}
      {labels && pts1.map((p, i) => (
        <text key={`l${i}`} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#78716C">{labels[i]}</text>
      ))}
    </svg>
  );
}

// ── UGC Dashboard ──────────────────────────────────────────────────────────────
function UGCDashboard({ profile, ugcCreators, submissions, pivots, briefs, announcements, sb, setPage }: {
  profile: UGCCreatorProfile; ugcCreators: UGCCreatorProfile[]; submissions: UGCSubmission[];
  pivots: UGCPivot[]; briefs: UGCBrief[]; announcements: UGCAnnouncement[];
  sb: any; setPage: (p: string) => void;
}) {
  const isAdmin = profile.role === "admin";
  const mySubmissions = isAdmin ? submissions : submissions.filter(s => s.creator_id === profile.id);
  const myPivots = isAdmin ? pivots : pivots.filter(p => p.creator_id === profile.id);
  const pinned = announcements.filter(a => a.pinned);
  const currentWeek = getMondayOfWeek(new Date());
  const hasSubmittedThisWeek = mySubmissions.some(s => s.week_date === currentWeek);
  const latestBrief = briefs[0];
  const latestPivot = myPivots[0];

  // Views stats
  const thisWeekSubs = mySubmissions.filter(s => s.week_date === currentWeek);
  const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = getMondayOfWeek(lastWeek);
  const lastWeekSubs = mySubmissions.filter(s => s.week_date === lastWeekStr);
  const thisViews = thisWeekSubs.reduce((s, x) => s + x.total_views, 0);
  const lastViews = lastWeekSubs.reduce((s, x) => s + x.total_views, 0);
  const viewsDiff = lastViews > 0 ? Math.round(((thisViews - lastViews) / lastViews) * 100) : 0;
  const first = profile.full_name?.split(" ")[0] || "there";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Hey {first} 👋</h1>
          <p className="text-sm text-stone-400 mt-0.5">Your UGC creator dashboard</p>
        </div>
        {!hasSubmittedThisWeek && (
          <Btn onClick={() => setPage("ugc_submit")}><BarChart3 size={14}/>Submit Analytics</Btn>
        )}
      </div>

      {pinned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">📌 Announcements</p>
          <div className="flex flex-col gap-2">
            {pinned.map(a => (
              <div key={a.id}>
                <p className="text-sm font-medium text-amber-800">{a.title}</p>
                {a.body && <p className="text-xs text-amber-700 mt-0.5">{a.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SC label="Views This Week" value={fmtViews(thisViews)} sub={lastViews > 0 ? `${viewsDiff > 0 ? "+" : ""}${viewsDiff}% vs last week` : undefined} />
        <SC label="Total Submissions" value={mySubmissions.length} />
      </div>

      {!hasSubmittedThisWeek && (
        <div className="bg-sky-50 border border-sky-200/60 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sky-800">Submit your analytics for this week</p>
            <p className="text-xs text-sky-600 mt-0.5">Week of {currentWeek}</p>
          </div>
          <Btn onClick={() => setPage("ugc_submit")}><ArrowRight size={14}/>Submit Now</Btn>
        </div>
      )}

      {latestBrief && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Current Weekly Brief — {latestBrief.week_date}</p>
          <div className="flex flex-col gap-3">
            {latestBrief.hooks && <div><p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Hooks</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{latestBrief.hooks}</p></div>}
            {latestBrief.format_recs && <div><p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Format Recs</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{latestBrief.format_recs}</p></div>}
            {latestBrief.brand_guidelines && <div><p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Brand Guidelines</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{latestBrief.brand_guidelines}</p></div>}
          </div>
        </div>
      )}

      {latestPivot && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Latest Pivot</p>
            <span className="text-xs text-stone-400">{latestPivot.week_date}</span>
          </div>
          <p className="text-sm text-stone-700 line-clamp-4 whitespace-pre-wrap">{latestPivot.ai_pivot}</p>
          {latestPivot.admin_notes && <p className="text-xs text-stone-500 mt-2 italic">Admin: {latestPivot.admin_notes}</p>}
          <button onClick={() => setPage("ugc_pivots")} className="text-xs text-stone-500 hover:text-stone-700 mt-2 flex items-center gap-1">View all pivots<ChevronRight size={12}/></button>
        </div>
      )}
    </div>
  );
}

// ── UGC Submit Page ────────────────────────────────────────────────────────────
function UGCSubmitPage({ profile, submissions, setSubmissions, ugcCreators, sb }: {
  profile: UGCCreatorProfile; submissions: UGCSubmission[];
  setSubmissions: (s: UGCSubmission[]) => void; ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const currentWeek = getMondayOfWeek(new Date());
  const emptyForm = {
    week_date: currentWeek, creator_id: isAdmin ? "" : profile.id,
    // Video metadata
    hook_text: "", format_type: "talking_head", video_length_seconds: "",
    niche: "", trending_sound: false, has_cta: false,
    // View data
    total_views: "", avg_watch_time_seconds: "", watch_completion_rate: "",
    profile_visits: "", traffic_fyp_pct: "", traffic_following_pct: "", traffic_search_pct: "",
    // Engagement
    likes: "", comments: "", shares: "", saves: "", comment_sentiment: "neutral",
    // Account health
    followers_gained: "", followers_lost: "",
    total_account_views: "", videos_posted: "",
    best_video_link: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCreator = isAdmin ? ugcCreators.find(c => c.id === form.creator_id) || null : (profile as UGCCreatorProfile);

  const trafficSum = (parseFloat(form.traffic_fyp_pct) || 0) + (parseFloat(form.traffic_following_pct) || 0) + (parseFloat(form.traffic_search_pct) || 0);
  const trafficValid = trafficSum === 0 || Math.abs(trafficSum - 100) < 0.1;

  async function submit() {
    if (!form.week_date || (isAdmin && !form.creator_id)) return;
    if (!trafficValid) { setErrorMsg("Traffic source percentages must add up to 100%."); setStatus("error"); return; }
    setLoading(true); setStatus("generating"); setErrorMsg("");

    const tv = parseInt(form.total_views) || 0;
    const gained = parseInt(form.followers_gained) || 0;
    const lost = parseInt(form.followers_lost) || 0;
    const tier = calcBenchmarkTier(parseFloat(form.watch_completion_rate) || 0, tv);

    const submissionData: Record<string, any> = {
      creator_id: form.creator_id || profile.id,
      week_date: form.week_date,
      total_views: tv,
      hook_text: form.hook_text || null,
      format_type: form.format_type || null,
      video_length_seconds: parseInt(form.video_length_seconds as string) || null,
      niche: form.niche || null,
      trending_sound: form.trending_sound,
      has_cta: form.has_cta,
      avg_watch_time_seconds: parseFloat(form.avg_watch_time_seconds) || null,
      watch_completion_rate: parseFloat(form.watch_completion_rate) || null,
      profile_visits: parseInt(form.profile_visits) || 0,
      traffic_fyp_pct: parseFloat(form.traffic_fyp_pct) || 0,
      traffic_following_pct: parseFloat(form.traffic_following_pct) || 0,
      traffic_search_pct: parseFloat(form.traffic_search_pct) || 0,
      likes: parseInt(form.likes) || 0,
      comments: parseInt(form.comments) || 0,
      shares: parseInt(form.shares) || 0,
      saves: parseInt(form.saves) || 0,
      comment_sentiment: form.comment_sentiment,
      followers_gained: gained,
      followers_lost: lost,
      net_follower_change: gained - lost,
      total_account_views: parseInt(form.total_account_views) || 0,
      videos_posted: parseInt(form.videos_posted) || 0,
      best_video_link: form.best_video_link || null,
      benchmark_tier: tier,
      created_at: new Date().toISOString(),
    };

    const { data: sub, error: subErr } = await sb.from("ugc_submissions").insert(submissionData).select().single();
    if (subErr) { setStatus("error"); setErrorMsg(subErr.message); setLoading(false); return; }
    setSubmissions([sub as UGCSubmission, ...submissions]);

    const creatorName = selectedCreator?.full_name || profile.full_name;
    const tiktokHandle = selectedCreator?.tiktok_handle || "";

    try {
      const pivotRes = await fetch("/api/ugc-pivot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: sub.id, creatorName, tiktokHandle, analytics: submissionData }),
      });
      if (!pivotRes.ok) {
        const pivotErr = await pivotRes.json().catch(() => ({}));
        console.error("pivot api error", pivotErr);
        setErrorMsg(`Submission saved, but pivot generation failed: ${pivotErr.error || pivotRes.status}. Check Vercel logs.`);
        setStatus("error"); setLoading(false); return;
      }
    } catch (e) {
      console.error("pivot api error", e);
      setErrorMsg(`Submission saved, but pivot API request failed: ${String(e)}`);
      setStatus("error"); setLoading(false); return;
    }

    try {
      await fetch("/api/ugc-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorName, tiktokHandle, ...submissionData }),
      });
    } catch (e) { console.error("sheets api error", e); }

    setStatus("success"); setLoading(false);
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center"><CheckCircle2 size={28} className="text-emerald-600"/></div>
        <h2 className="text-lg font-bold text-stone-800">Analytics Submitted!</h2>
        <p className="text-sm text-stone-500 max-w-sm">Your pivot strategy will appear after admin review. Check back in your Pivots page.</p>
        <Btn onClick={() => { setStatus("idle"); setForm(emptyForm); }}>Submit Another</Btn>
      </div>
    );
  }

  const ni = (field: string, label: string, decimals = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
      <input type="number" min="0" step={decimals ? "0.1" : "1"} value={(form as any)[field]}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-base text-stone-800 focus:outline-none focus:border-stone-400" />
    </div>
  );
  const tog = (field: "trending_sound" | "has_cta", label: string) => (
    <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
      <span className="text-sm text-stone-700">{label}</span>
      <button type="button" onClick={() => setForm({ ...form, [field]: !(form as any)[field] })}
        className={`w-10 h-6 rounded-full transition-colors relative ${(form as any)[field] ? "bg-stone-800" : "bg-stone-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as any)[field] ? "translate-x-4 left-0.5" : "left-0.5"}`}/>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Submit Weekly Analytics</h1>
        <p className="text-sm text-stone-400 mt-0.5">Your data generates a personalized AI pivot strategy.</p>
      </div>

      {status === "error" && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{errorMsg || "Something went wrong."}</div>}

      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-5">
        <TI label="Week Date (Monday)" value={form.week_date} onChange={v => setForm({ ...form, week_date: v })} type="date" />
        {isAdmin && <Sel label="Creator" value={form.creator_id} onChange={v => setForm({ ...form, creator_id: v })}
          options={[{ value: "", label: "— Select creator —" }, ...ugcCreators.filter(c => c.active !== false).map(c => ({ value: c.id, label: `${c.full_name}${c.tiktok_handle ? ` (@${c.tiktok_handle})` : ""}` }))]} />}

        {/* Video Metadata */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Video Metadata</p>
          <TI label="Hook Text (first 3 seconds)" value={form.hook_text} onChange={v => setForm({ ...form, hook_text: v })} placeholder="What did your video open with?" />
          <Sel label="Format Type" value={form.format_type} onChange={v => setForm({ ...form, format_type: v })}
            options={[{ value: "talking_head", label: "Talking Head" }, { value: "voiceover", label: "Voiceover" }, { value: "pov", label: "POV" }, { value: "transition", label: "Transition" }, { value: "other", label: "Other" }]} />
          <div className="grid grid-cols-2 gap-3">
            {ni("video_length_seconds", "Video Length (seconds)")}
            <TI label="Niche / Topic" value={form.niche} onChange={v => setForm({ ...form, niche: v })} placeholder="e.g. fashion, styling tips" />
          </div>
          {tog("trending_sound", "Used a trending sound?")}
          {tog("has_cta", "Included a CTA?")}
        </div>

        {/* View Data */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">View Data</p>
          <div className="grid grid-cols-2 gap-3">
            {ni("total_views", "Total Views")}
            {ni("avg_watch_time_seconds", "Avg Watch Time (sec)", true)}
            {ni("watch_completion_rate", "Watch Completion Rate (%)", true)}
            {ni("profile_visits", "Profile Visits")}
          </div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Traffic Source (must total 100%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ni("traffic_fyp_pct", "For You Page %", true)}
            {ni("traffic_following_pct", "Following %", true)}
            {ni("traffic_search_pct", "Search %", true)}
          </div>
          {(form.traffic_fyp_pct || form.traffic_following_pct || form.traffic_search_pct) && (
            <div className={`text-xs px-3 py-2 rounded-lg ${trafficValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              Total: {trafficSum.toFixed(1)}% {trafficValid ? "✓" : "— must equal 100%"}
            </div>
          )}
        </div>

        {/* Engagement */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Engagement Quality</p>
          <div className="grid grid-cols-2 gap-3">
            {ni("likes", "Likes")}
            {ni("comments", "Comments")}
            {ni("shares", "Shares")}
            {ni("saves", "Saves")}
          </div>
          <Sel label="Comment Sentiment" value={form.comment_sentiment} onChange={v => setForm({ ...form, comment_sentiment: v })}
            options={[{ value: "positive", label: "Positive" }, { value: "neutral", label: "Neutral" }, { value: "negative", label: "Negative" }]} />
        </div>

        {/* Account Health */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Account Health</p>
          <div className="grid grid-cols-2 gap-3">
            {ni("followers_gained", "Followers Gained")}
            {ni("followers_lost", "Followers Lost")}
            {ni("total_account_views", "Total Account Views (week)")}
            {ni("videos_posted", "Videos Posted (week)")}
          </div>
          {(form.followers_gained || form.followers_lost) && (
            <div className="text-xs px-3 py-2 rounded-lg bg-stone-50 text-stone-600">
              Net follower change: <span className={`font-semibold ${(parseInt(form.followers_gained)||0)-(parseInt(form.followers_lost)||0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {((parseInt(form.followers_gained)||0)-(parseInt(form.followers_lost)||0)) >= 0 ? "+" : ""}{(parseInt(form.followers_gained)||0)-(parseInt(form.followers_lost)||0)}
              </span>
            </div>
          )}
        </div>

        <TI label="Best Video Link (optional)" value={form.best_video_link} onChange={v => setForm({ ...form, best_video_link: v })} placeholder="https://tiktok.com/..." />

        {form.total_views && (
          <div className="flex items-center gap-2 py-2 px-3 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-500">Benchmark tier:</span>
            <BenchmarkBadge tier={calcBenchmarkTier(parseFloat(form.watch_completion_rate) || 0, parseInt(form.total_views) || 0)} />
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <Btn onClick={submit} disabled={loading || !form.week_date || (isAdmin && !form.creator_id) || !trafficValid} className="w-full sm:w-auto justify-center">
            {loading ? <><Loader2 size={14} className="animate-spin"/>Generating pivot...</> : <><Send size={14}/>Submit Analytics</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Pivot Markdown Renderer ────────────────────────────────────────────────────
function PivotContent({ text }: { text: string }) {
  const sectionStyles: Record<string, { border: string; bg: string }> = {
    "Performance Analysis": { border: "#bae6fd", bg: "#f0f9ff" },
    "Working":              { border: "#a7f3d0", bg: "#f0fdf4" },
    "Change":               { border: "#fde68a", bg: "#fffbeb" },
    "Hook":                 { border: "#ddd6fe", bg: "#f5f3ff" },
    "Format":               { border: "#fecdd3", bg: "#fff1f2" },
    "Variation":            { border: "#ddd6fe", bg: "#f5f3ff" },
  };
  const sectionIcons: Record<string, string> = {
    "Performance Analysis": "📊", "Working": "✅",
    "Change": "🔄", "Hook": "🎣",
    "Format": "🎬", "Variation": "🔁",
  };

  // Detect a section header line (handles many Gemini output formats)
  function isHeader(line: string): boolean {
    const t = line.trim();
    return (
      /^\d+\.\s*\*\*.+/.test(t) ||       // "1. **Title**" or "1. **Title"
      /^\*\*\d+\..+\*\*/.test(t) ||       // "**1. Title**"
      /^\*\*[A-Z].{3,}\*\*\s*$/.test(t) || // "**Title**" alone on a line
      /^#{1,3}\s+.+/.test(t)              // "## Title" or "### Title"
    );
  }

  function cleanTitle(line: string): string {
    return line.trim()
      .replace(/^#{1,3}\s+/, '')
      .replace(/^\*\*(\d+\.\s*)/, '')
      .replace(/^\d+\.\s*\*\*/, '')
      .replace(/\*\*/g, '')
      .replace(/\*$/, '')
      .split(/\s*[—–:]\s*/)[0]
      .trim();
  }

  function renderLines(lines: string[]) {
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1.5" />;
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      if (/^\s*[-•*]\s/.test(line)) {
        return (
          <div key={i} className="flex gap-2 mb-1.5">
            <span className="text-stone-400 shrink-0 mt-0.5">•</span>
            <span className="text-sm text-stone-700 leading-snug" dangerouslySetInnerHTML={{ __html: html.replace(/^\s*[-•*]\s*/, '') }} />
          </div>
        );
      }
      return <p key={i} className="text-sm text-stone-700 leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  // Parse line-by-line into sections
  const allLines = text.split('\n');
  const sections: { title: string; lines: string[] }[] = [];
  let preambleLines: string[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of allLines) {
    if (isHeader(line)) {
      if (current) sections.push(current);
      current = { title: cleanTitle(line), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  if (current) sections.push(current);

  // No sections found — plain fallback
  if (sections.length === 0) {
    return (
      <div className="text-sm text-stone-700 leading-relaxed">
        {renderLines(allLines)}
      </div>
    );
  }

  const getStyle = (title: string) =>
    Object.entries(sectionStyles).find(([k]) => title.includes(k))?.[1] ?? { border: "#e7e5e4", bg: "#fafaf9" };
  const getIcon = (title: string) =>
    Object.entries(sectionIcons).find(([k]) => title.includes(k))?.[1] ?? "💡";

  return (
    <div className="flex flex-col gap-3">
      {preambleLines.some(l => l.trim()) && (
        <div className="text-sm text-stone-500 leading-relaxed">
          {renderLines(preambleLines)}
        </div>
      )}
      {sections.map((section, idx) => {
        const style = getStyle(section.title);
        const icon = getIcon(section.title);
        return (
          <div key={idx} className="border rounded-xl p-4" style={{ borderColor: style.border, backgroundColor: style.bg }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{icon}</span>
              <p className="text-sm font-bold text-stone-800">{section.title}</p>
            </div>
            <div>{renderLines(section.lines)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── UGC My Pivots ─────────────────────────────────────────────────────────────
function UGCMyPivotsPage({ profile, pivots, submissions }: {
  profile: UGCCreatorProfile; pivots: UGCPivot[]; submissions: UGCSubmission[];
}) {
  const isAdmin = profile.role === "admin";
  const myPivots = isAdmin ? pivots : pivots.filter(p => p.creator_id === profile.id);
  const mySubmissions = isAdmin ? submissions : submissions.filter(s => s.creator_id === profile.id);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...mySubmissions].sort((a, b) => new Date(a.week_date).getTime() - new Date(b.week_date).getTime());
  const graphData = sorted.map(s => s.total_views);
  const graphLabels = sorted.map(s => s.week_date.slice(5));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">My Pivots</h1>

      {sorted.length >= 2 && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Views Over Time</p>
          <LineGraph data={graphData} labels={graphLabels} height={140} />
        </div>
      )}

      {myPivots.length === 0 ? (
        <ES icon={<TrendingUp size={24} />} message="No approved pivots yet. Submit your analytics and check back soon." />
      ) : (
        <div className="flex flex-col gap-3">
          {[...myPivots].sort((a, b) => new Date(b.week_date).getTime() - new Date(a.week_date).getTime()).map(p => {
            const isExp = expanded === p.id;
            const matchSub = mySubmissions.find(s => s.week_date === p.week_date);
            return (
              <div key={p.id} className="bg-white border border-stone-200/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-800">Week of {p.week_date}</span>
                    {matchSub && <BenchmarkBadge tier={matchSub.benchmark_tier} />}
                  </div>
                  <button onClick={() => setExpanded(isExp ? null : p.id)} className="text-stone-400 hover:text-stone-600">
                    {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {isExp ? (
                  p.ai_pivot ? <PivotContent text={p.ai_pivot} /> : null
                ) : (
                  <>
                    <p className="text-sm text-stone-500 line-clamp-2">{p.ai_pivot?.replace(/\*\*/g, '').replace(/\n/g, ' ')}</p>
                    {p.ai_pivot && p.ai_pivot.length > 100 && (
                      <button onClick={() => setExpanded(p.id)} className="text-xs text-sky-600 hover:text-sky-700 mt-1 font-medium">Read full pivot →</button>
                    )}
                  </>
                )}
                {p.admin_notes && <p className="text-xs text-stone-500 mt-3 p-2 bg-stone-50 rounded-lg italic">Admin note: {p.admin_notes}</p>}
                {p.example_video_link && (
                  <a href={p.example_video_link} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1">
                    <ExternalLink size={11} />Example video
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Hook Generator ────────────────────────────────────────────────────────────
const HOOK_FORMULAS = ["honest observation","relatable moment","specific detail","contrast","quiet flex","the question"];
function detectFormula(hook: string): string {
  const h = hook.toLowerCase();
  if (h.includes("why") || h.includes("look off") || h.includes("wrong")) return "honest observation";
  if (h.includes("times") || h.includes("wore") || h.includes("still")) return "relatable moment";
  if (h.includes("piece") || h.includes("changed") || h.includes("morning")) return "specific detail";
  if (h.includes("told") || h.includes("everyone") || h.includes("but")) return "contrast";
  if (h.includes("$") || h.includes("found") || h.includes("goes with")) return "quiet flex";
  if (h.includes("when") || h.includes("?") || h.includes("why")) return "the question";
  return "";
}

function HookGeneratorPage({ profile, ugcCreators, ugcHooks, setUGCHooks, savedHooks, setSavedHooks, settings, sb }: {
  profile: UGCCreatorProfile; ugcCreators: UGCCreatorProfile[];
  ugcHooks: UGCHook[]; setUGCHooks: (h: UGCHook[]) => void;
  savedHooks: SavedHook[]; setSavedHooks: (h: SavedHook[]) => void;
  settings: AppSettings; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("talking head");
  const [goal, setGoal] = useState("get views");
  const [audience, setAudience] = useState("everyone");
  const [inspiration, setInspiration] = useState("");
  const [targetCreator, setTargetCreator] = useState("");
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [showFormulas, setShowFormulas] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"generate"|"saved">("generate");
  const [pushModal, setPushModal] = useState<{ hook: string; idx: number } | null>(null);
  const [pushNote, setPushNote] = useState("");
  const [pushTarget, setPushTarget] = useState("");
  const [pushing, setPushing] = useState(false);
  const [showLibraryConfirm, setShowLibraryConfirm] = useState<number | null>(null);

  const hookOfWeek = settings.hook_of_week_text || "";

  const mySavedHooks = isAdmin
    ? savedHooks
    : savedHooks.filter(h => h.creator_id === profile.id);

  const myPushedHooks = isAdmin
    ? []
    : ugcHooks.filter(h => h.pushed_to === profile.id);

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true); setGenError(""); setGeneratedHooks([]); setSavedIds(new Set());
    try {
      const res = await fetch("/api/ugc-hook-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, format, goal, audience, inspiration: inspiration || undefined }),
      });
      const data = await res.json();
      if (data.error) { setGenError(data.error); setGenerating(false); return; }
      setGeneratedHooks(data.hooks || []);
    } catch (e: any) { setGenError(e.message); }
    setGenerating(false);
  }

  function copy(hook: string, idx: number) {
    navigator.clipboard.writeText(hook);
    setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500);
  }

  async function saveHook(hook: string, idx: number) {
    const creatorId = isAdmin && targetCreator ? targetCreator : profile.id;
    const { data, error } = await sb.from("saved_hooks").insert({
      creator_id: creatorId,
      hook_text: hook,
      video_topic: topic,
      format_type: format,
      goal,
      audience,
      saved_at: new Date().toISOString(),
    }).select().single();
    if (error) { console.error(error); return; }
    setSavedHooks([data as SavedHook, ...savedHooks]);
    setSavedIds(prev => new Set(prev).add(idx));
    // Increment save_count on library hooks if already there
    const existing = ugcHooks.find(h => h.hook_text === hook);
    if (existing) {
      const newCount = (existing.save_count || 0) + 1;
      await sb.from("ugc_hooks").update({ save_count: newCount }).eq("id", existing.id);
      setUGCHooks(ugcHooks.map(h => h.id === existing.id ? { ...h, save_count: newCount } : h));
    }
  }

  async function saveToLibrary(hook: string, idx: number) {
    const creatorId = isAdmin && targetCreator ? targetCreator : null;
    const { data, error } = await sb.from("ugc_hooks").insert({
      hook_text: hook, video_topic: topic, format_type: format, goal, audience,
      creator_id: creatorId || null,
      save_count: 0, created_at: new Date().toISOString(),
    }).select().single();
    if (error) { console.error(error); return; }
    setUGCHooks([data as UGCHook, ...ugcHooks]);
    setShowLibraryConfirm(idx);
    setTimeout(() => setShowLibraryConfirm(null), 2000);
  }

  async function pushToCreator() {
    if (!pushModal || !pushTarget) return;
    setPushing(true);
    const { data, error } = await sb.from("ugc_hooks").insert({
      hook_text: pushModal.hook, video_topic: topic, format_type: format, goal, audience,
      pushed_to: pushTarget, push_note: pushNote || null,
      creator_id: null, save_count: 0, created_at: new Date().toISOString(),
    }).select().single();
    setPushing(false);
    if (error) { console.error(error); return; }
    setUGCHooks([data as UGCHook, ...ugcHooks]);
    setPushModal(null); setPushNote(""); setPushTarget("");
  }

  async function setHookOfWeek(hook: string) {
    await sb.from("settings").upsert({ key: "hook_of_week_text", value: hook }, { onConflict: "key" });
    // optimistic update handled by parent settings refresh
    alert("Hook of the Week updated! Refresh to see it on creator dashboards.");
  }

  async function deleteSaved(id: string) {
    await sb.from("saved_hooks").delete().eq("id", id);
    setSavedHooks(savedHooks.filter(h => h.id !== id));
  }

  const topSaved = [...ugcHooks].filter(h => (h.save_count || 0) > 0).sort((a, b) => (b.save_count || 0) - (a.save_count || 0)).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Hook Generator</h1>
          <p className="text-sm text-stone-400 mt-0.5">Generate 10 Cloud Closet hooks instantly</p>
        </div>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {(["generate","saved"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab===t?"bg-white shadow-sm text-stone-800":"text-stone-500 hover:text-stone-700"}`}>{t === "saved" ? `Saved (${mySavedHooks.length})` : "Generate"}</button>
          ))}
        </div>
      </div>

      {tab === "generate" && (
        <>
          {/* Hook of the Week */}
          {hookOfWeek && (
            <div className="border-2 rounded-xl p-4 flex items-start gap-3" style={{ borderColor: "#ddd6fe", backgroundColor: "#faf5ff" }}>
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#7c3aed" }}>Hook of the Week</p>
                <p className="text-sm font-medium text-stone-800">{hookOfWeek}</p>
              </div>
            </div>
          )}

          {/* Generator Form */}
          <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
            {isAdmin && (
              <Sel label="Generate for creator (optional)" value={targetCreator} onChange={setTargetCreator}
                options={[{ value: "", label: "— General / All Creators —" }, ...ugcCreators.map(c => ({ value: c.id, label: `${c.full_name}${c.tiktok_handle ? ` @${c.tiktok_handle}` : ""}` }))]} />
            )}
            <TI label="What is this video about?" value={topic} onChange={setTopic} placeholder="e.g. styling the same white tee 5 ways" required />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Sel label="Format" value={format} onChange={setFormat} options={[
                { value: "talking head", label: "Talking Head" },
                { value: "voiceover", label: "Voiceover" },
                { value: "POV", label: "POV" },
                { value: "transition", label: "Transition" },
                { value: "other", label: "Other" },
              ]} />
              <Sel label="Goal" value={goal} onChange={setGoal} options={[
                { value: "get views", label: "Get Views" },
                { value: "get saves", label: "Get Saves" },
                { value: "get shares", label: "Get Shares" },
                { value: "get follows", label: "Get Follows" },
              ]} />
              <Sel label="Audience" value={audience} onChange={setAudience} options={[
                { value: "everyone", label: "Everyone" },
                { value: "fashion lovers", label: "Fashion Lovers" },
                { value: "college women", label: "College Women" },
                { value: "thrifters", label: "Thrifters" },
                { value: "minimalists", label: "Minimalists" },
                { value: "maximalists", label: "Maximalists" },
              ]} />
            </div>
            <TI label="Inspiration hook (optional — paste one that worked before)" value={inspiration} onChange={setInspiration} placeholder="e.g. This is why your outfits look off" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer">
                <input type="checkbox" checked={showFormulas} onChange={e => setShowFormulas(e.target.checked)} className="rounded accent-stone-700" />
                Show formula tags
              </label>
              <Btn onClick={generate} disabled={generating || !topic.trim()}>
                {generating ? "Generating..." : generatedHooks.length > 0 ? "↺ Regenerate" : "Generate Hooks"}
              </Btn>
            </div>
            {genError && <p className="text-xs text-red-500">{genError}</p>}
          </div>

          {/* Generated Hooks */}
          {generatedHooks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Generated Hooks</p>
              {generatedHooks.map((hook, idx) => {
                const formula = showFormulas ? detectFormula(hook) : "";
                const isSaved = savedIds.has(idx);
                const isCopied = copiedIdx === idx;
                const isLibrarySaved = showLibraryConfirm === idx;
                return (
                  <div key={idx} className="bg-white border border-stone-200/60 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-stone-300 text-xs font-bold mt-0.5 shrink-0 w-5">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 leading-snug">{hook}</p>
                        {formula && <span className="text-[10px] text-stone-400 mt-1 inline-block capitalize">{formula}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                        <button onClick={() => copy(hook, idx)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${isCopied ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"}`}>
                          {isCopied ? "Copied!" : <><Copy size={11} className="inline mr-1"/>Copy</>}
                        </button>
                        <button onClick={() => saveHook(hook, idx)} disabled={isSaved} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${isSaved ? "bg-violet-50 border-violet-200 text-violet-600" : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"}`}>
                          {isSaved ? "Saved ✓" : <><Bookmark size={11} className="inline mr-1"/>Save</>}
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => { setPushModal({ hook, idx }); setPushTarget(targetCreator); }} className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-all">
                              <Send size={11} className="inline mr-1"/>Push
                            </button>
                            <button onClick={() => saveToLibrary(hook, idx)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${isLibrarySaved ? "bg-amber-50 border-amber-200 text-amber-600" : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"}`}>
                              {isLibrarySaved ? "Added ✓" : <><Zap size={11} className="inline mr-1"/>Library</>}
                            </button>
                            <button onClick={() => setHookOfWeek(hook)} className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-violet-300 hover:text-violet-600 transition-all" title="Set as Hook of the Week">⭐</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top 5 Most Saved (admin only) */}
          {isAdmin && topSaved.length > 0 && (
            <div className="bg-white border border-stone-200/60 rounded-xl p-4">
              <p className="text-sm font-semibold text-stone-700 mb-3">🔥 Most Saved Hooks</p>
              <div className="flex flex-col gap-2">
                {topSaved.map(h => (
                  <div key={h.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-500 w-5">{h.save_count}</span>
                    <p className="text-sm text-stone-700 flex-1 truncate">{h.hook_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hooks pushed to this creator */}
          {!isAdmin && myPushedHooks.length > 0 && (
            <div className="bg-white border border-stone-200/60 rounded-xl p-4">
              <p className="text-sm font-semibold text-stone-700 mb-3">Hooks from your team</p>
              <div className="flex flex-col gap-2">
                {myPushedHooks.map(h => (
                  <div key={h.id} className="border border-stone-100 rounded-xl p-3">
                    <p className="text-sm font-medium text-stone-800">{h.hook_text}</p>
                    {h.push_note && <p className="text-xs text-violet-600 mt-1 italic">"{h.push_note}"</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {h.video_topic && <span className="text-xs text-stone-400">{h.video_topic}</span>}
                      <button onClick={() => copy(h.hook_text, -1)} className="text-xs text-stone-400 hover:text-stone-600"><Copy size={11} className="inline mr-0.5"/>Copy</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "saved" && (
        <div className="flex flex-col gap-3">
          {mySavedHooks.length === 0 ? (
            <ES icon={<Bookmark size={24} />} message="No saved hooks yet — generate some and save your favorites" />
          ) : (
            mySavedHooks.map(h => (
              <div key={h.id} className="bg-white border border-stone-200/60 rounded-xl p-4 group">
                <div className="flex items-start gap-3">
                  <Bookmark size={14} className="text-violet-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{h.hook_text}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {h.video_topic && <span className="text-xs text-stone-400">{h.video_topic}</span>}
                      {h.format_type && <span className="text-xs text-stone-400">{h.format_type}</span>}
                      {h.goal && <span className="text-xs text-stone-400">{h.goal}</span>}
                      <span className="text-xs text-stone-400">{fmt(h.saved_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => copy(h.hook_text, -1)} className="text-xs px-2 py-1 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-700"><Copy size={11}/></button>
                    <button onClick={() => deleteSaved(h.id)} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Push to Creator Modal */}
      <Md open={!!pushModal} onClose={() => { setPushModal(null); setPushNote(""); setPushTarget(""); }} title="Push Hook to Creator">
        {pushModal && (
          <div className="flex flex-col gap-3">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <p className="text-sm font-medium text-stone-800">"{pushModal.hook}"</p>
            </div>
            <Sel label="Send to creator" value={pushTarget} onChange={setPushTarget}
              options={[{ value: "", label: "— Select creator —" }, ...ugcCreators.map(c => ({ value: c.id, label: `${c.full_name}${c.tiktok_handle ? ` @${c.tiktok_handle}` : ""}` }))]} />
            <TA label="Note for creator (optional)" value={pushNote} onChange={setPushNote} placeholder="e.g. Try this for your next GRWM — matches your niche perfectly" />
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" onClick={() => { setPushModal(null); setPushNote(""); setPushTarget(""); }}>Cancel</Btn>
              <Btn onClick={pushToCreator} disabled={!pushTarget || pushing}>{pushing ? "Pushing..." : "Push Hook"}</Btn>
            </div>
          </div>
        )}
      </Md>
    </div>
  );
}

// ── UGC Hook Library ──────────────────────────────────────────────────────────
function UGCHooksPage({ profile, hooks, setHooks, ugcCreators, sb }: {
  profile: UGCCreatorProfile; hooks: UGCHook[]; setHooks: (h: UGCHook[]) => void;
  ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ hook_text: "", view_count: "", week_date: "", creator_id: "", admin_notes: "" });
  const [saving, setSaving] = useState(false);

  const filtered = hooks.filter(h =>
    h.hook_text.toLowerCase().includes(search.toLowerCase()) ||
    (h.admin_notes || "").toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

  const cName = (id?: string) => ugcCreators.find(c => c.id === id)?.full_name || "";
  const cHandle = (id?: string) => ugcCreators.find(c => c.id === id)?.tiktok_handle || "";

  async function addHook() {
    if (!form.hook_text.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("ugc_hooks").insert({
      hook_text: form.hook_text,
      view_count: parseInt(form.view_count) || 0,
      week_date: form.week_date || null,
      creator_id: form.creator_id || null,
      admin_notes: form.admin_notes || null,
      created_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { console.error(error); return; }
    setHooks([data as UGCHook, ...hooks]);
    setModal(false);
    setForm({ hook_text: "", view_count: "", week_date: "", creator_id: "", admin_notes: "" });
  }

  async function deleteHook(id: string) {
    if (!window.confirm("Delete this hook?")) return;
    await sb.from("ugc_hooks").delete().eq("id", id);
    setHooks(hooks.filter(h => h.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Hook Library</h1><p className="text-sm text-stone-400 mt-0.5">High-performing hooks sorted by views</p></div>
        {isAdmin && <Btn onClick={() => setModal(true)}><Plus size={14} />Add Hook</Btn>}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hooks..."
          className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400" />
      </div>

      {filtered.length === 0 ? (
        <ES icon={<Zap size={24} />} message="No hooks yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(h => (
            <div key={h.id} className="bg-white border border-stone-200/60 rounded-xl p-4 group">
              <div className="flex items-start gap-3">
                <Zap size={14} className="text-amber-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{h.hook_text}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {(h.view_count || 0) > 0 && <span className="text-xs text-emerald-600 font-medium">{fmtViews(h.view_count!)} views</span>}
                    {h.week_date && <span className="text-xs text-stone-400">{h.week_date}</span>}
                    {h.creator_id && <span className="text-xs text-stone-400">{cName(h.creator_id)}{cHandle(h.creator_id) ? ` @${cHandle(h.creator_id)}` : ""}</span>}
                  </div>
                  {h.admin_notes && <p className="text-xs text-stone-500 mt-1 italic">{h.admin_notes}</p>}
                </div>
                {isAdmin && (
                  <button onClick={() => deleteHook(h.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Md open={modal} onClose={() => setModal(false)} title="Add Hook">
        <div className="flex flex-col gap-3">
          <TA label="Hook Text" value={form.hook_text} onChange={v => setForm({ ...form, hook_text: v })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <TI label="View Count" value={form.view_count} onChange={v => setForm({ ...form, view_count: v })} type="number" />
            <TI label="Week Date" value={form.week_date} onChange={v => setForm({ ...form, week_date: v })} type="date" />
          </div>
          <Sel label="Creator (optional)" value={form.creator_id} onChange={v => setForm({ ...form, creator_id: v })}
            options={[{ value: "", label: "— None —" }, ...ugcCreators.map(c => ({ value: c.id, label: `${c.full_name}${c.tiktok_handle ? ` @${c.tiktok_handle}` : ""}` }))]} />
          <TA label="Admin Notes" value={form.admin_notes} onChange={v => setForm({ ...form, admin_notes: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={addHook} disabled={!form.hook_text.trim() || saving}>{saving ? "Saving..." : "Add Hook"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── UGC Leaderboard ────────────────────────────────────────────────────────────
function UGCLeaderboardPage({ submissions, ugcCreators }: {
  submissions: UGCSubmission[]; ugcCreators: UGCCreatorProfile[];
}) {
  const medals = ["🥇", "🥈", "🥉"];
  const currentWeek = getMondayOfWeek(new Date());

  // Group submissions by week
  const weeks = [...new Set(submissions.map(s => s.week_date))].sort((a, b) => b.localeCompare(a));

  const rankForWeek = (weekDate: string) => {
    const weekSubs = submissions.filter(s => s.week_date === weekDate);
    const byCreator: Record<string, number> = {};
    weekSubs.forEach(s => { if (s.creator_id) byCreator[s.creator_id] = (byCreator[s.creator_id] || 0) + s.total_views; });
    return Object.entries(byCreator)
      .map(([id, views]) => ({ creator: ugcCreators.find(c => c.id === id), views }))
      .filter(x => x.creator)
      .sort((a, b) => b.views - a.views);
  };

  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const toggleWeek = (w: string) => setOpenWeeks(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);

  if (weeks.length === 0) return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-800">Leaderboard</h1>
      <ES icon={<Trophy size={24} />} message="No submissions yet" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">Leaderboard</h1>

      {/* Current week */}
      {weeks.includes(currentWeek) && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" />
            <p className="text-sm font-semibold text-stone-700">This Week — {currentWeek}</p>
          </div>
          <div className="flex flex-col gap-3">
            {rankForWeek(currentWeek).map((entry, i) => (
              <div key={entry.creator!.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-amber-50 border border-amber-100" : "bg-stone-50"}`}>
                <div className="w-8 text-center text-lg">{i < 3 ? medals[i] : <span className="text-sm font-bold text-stone-500">{i + 1}</span>}</div>
                <Av name={entry.creator!.full_name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{entry.creator!.full_name}</p>
                  {entry.creator!.tiktok_handle && <p className="text-xs text-stone-400">@{entry.creator!.tiktok_handle}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-stone-800">{fmtViews(entry.views)}</p>
                  <p className="text-xs text-stone-400">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past weeks */}
      {weeks.filter(w => w !== currentWeek).map(w => {
        const ranked = rankForWeek(w);
        const isOpen = openWeeks.includes(w);
        return (
          <div key={w} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
            <button onClick={() => toggleWeek(w)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-all">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-stone-400" />
                <span className="text-sm font-medium text-stone-700">Week of {w}</span>
                <span className="text-xs text-stone-400">· {ranked.length} creators</span>
              </div>
              {isOpen ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
            </button>
            {isOpen && (
              <div className="px-5 pb-4 flex flex-col gap-2">
                {ranked.map((entry, i) => (
                  <div key={entry.creator!.id} className="flex items-center gap-3">
                    <div className="w-6 text-center">{i < 3 ? medals[i] : <span className="text-xs text-stone-400">{i + 1}</span>}</div>
                    <Av name={entry.creator!.full_name} size={24} />
                    <span className="text-xs text-stone-700 flex-1">{entry.creator!.full_name}</span>
                    <span className="text-xs font-semibold text-stone-600">{fmtViews(entry.views)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── UGC Q&A ───────────────────────────────────────────────────────────────────
function UGCQAPage({ profile, questions, setQuestions, ugcCreators, sb }: {
  profile: UGCCreatorProfile; questions: UGCQuestion[];
  setQuestions: (q: UGCQuestion[]) => void; ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const [modal, setModal] = useState(false);
  const [qText, setQText] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const cName = (id?: string) => {
    if (!id) return "Unknown";
    if (id === profile.id) return profile.full_name;
    return ugcCreators.find(c => c.id === id)?.full_name || "Creator";
  };
  const cHandle = (id?: string) => ugcCreators.find(c => c.id === id)?.tiktok_handle || "";

  async function postQuestion() {
    if (!qText.trim()) return;
    setPosting(true);
    const { data, error } = await sb.from("ugc_qa").insert({
      creator_id: profile.id, question: qText, created_at: new Date().toISOString(),
    }).select().single();
    setPosting(false);
    if (error) { console.error(error); return; }
    setQuestions([{ ...data as UGCQuestion, ugc_qa_replies: [] }, ...questions]);
    setQText(""); setModal(false);
  }

  async function postReply(qId: string) {
    const text = replyTexts[qId];
    if (!text?.trim()) return;
    const { data, error } = await sb.from("ugc_qa_replies").insert({
      question_id: qId, creator_id: profile.id, reply: text, created_at: new Date().toISOString(),
    }).select().single();
    if (error) { console.error(error); return; }
    setQuestions(questions.map(q => q.id === qId ? { ...q, ugc_qa_replies: [...(q.ugc_qa_replies || []), data as UGCReply] } : q));
    setReplyTexts(prev => ({ ...prev, [qId]: "" }));
  }

  async function deleteQuestion(id: string) {
    if (!window.confirm("Delete this question?")) return;
    await sb.from("ugc_qa").delete().eq("id", id);
    setQuestions(questions.filter(q => q.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Community Q&A</h1>
        <Btn onClick={() => setModal(true)}><Plus size={14} />Ask Question</Btn>
      </div>

      {questions.length === 0 ? (
        <ES icon={<MessageCircle size={24} />} message="No questions yet. Be the first to ask!" />
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map(q => {
            const isExp = expanded === q.id;
            const canDel = isAdmin || q.creator_id === profile.id;
            const repliesCount = (q.ugc_qa_replies || []).length;
            return (
              <div key={q.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Av name={cName(q.creator_id)} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-stone-700">{cName(q.creator_id)}</span>
                      {cHandle(q.creator_id) && <span className="text-xs text-stone-400">@{cHandle(q.creator_id)}</span>}
                      <span className="text-xs text-stone-400">{timeAgo(q.created_at)}</span>
                    </div>
                    <p className="text-sm text-stone-800 mt-1">{q.question}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {repliesCount > 0 && (
                        <button onClick={() => setExpanded(isExp ? null : q.id)} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                          {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
                          {isExp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                      <button onClick={() => setExpanded(isExp ? null : q.id)} className="text-xs text-stone-400 hover:text-stone-600">Reply</button>
                      {canDel && <button onClick={() => deleteQuestion(q.id)} className="text-xs text-stone-300 hover:text-red-500">Delete</button>}
                    </div>
                  </div>
                </div>

                {isExp && (
                  <div className="mt-3 pl-11 flex flex-col gap-3">
                    {(q.ugc_qa_replies || []).map(r => (
                      <div key={r.id} className="flex items-start gap-2.5">
                        <Av name={cName(r.creator_id)} size={24} />
                        <div className="bg-stone-50 rounded-xl p-3 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-stone-700">{cName(r.creator_id)}</span>
                            <span className="text-xs text-stone-400">{timeAgo(r.created_at)}</span>
                          </div>
                          <p className="text-sm text-stone-700">{r.reply}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        value={replyTexts[q.id] || ""}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                      />
                      <Btn size="sm" onClick={() => postReply(q.id)} disabled={!replyTexts[q.id]?.trim()}><Send size={13} /></Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Md open={modal} onClose={() => setModal(false)} title="Ask a Question">
        <div className="flex flex-col gap-3">
          <TA label="Your question" value={qText} onChange={setQText} rows={4} placeholder="Ask the community..." />
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={postQuestion} disabled={!qText.trim() || posting}>{posting ? "Posting..." : "Post Question"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── UGC Announcements ─────────────────────────────────────────────────────────
function UGCAnnouncementsPage({ profile, announcements, setAnnouncements, sb }: {
  profile: UGCCreatorProfile; announcements: UGCAnnouncement[];
  setAnnouncements: (a: UGCAnnouncement[]) => void; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", pinned: false });
  const [saving, setSaving] = useState(false);

  const pinned = announcements.filter(a => a.pinned);
  const regular = announcements.filter(a => !a.pinned);

  async function create() {
    if (!form.title.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("ugc_announcements").insert({
      title: form.title, body: form.body || null, pinned: form.pinned, created_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { console.error(error); return; }
    setAnnouncements([data as UGCAnnouncement, ...announcements]);
    setModal(false); setForm({ title: "", body: "", pinned: false });
  }

  async function del(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    await sb.from("ugc_announcements").delete().eq("id", id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  }

  async function togglePin(id: string, pinned: boolean) {
    await sb.from("ugc_announcements").update({ pinned }).eq("id", id);
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, pinned } : a));
  }

  const AnnouncementCard = ({ a }: { a: UGCAnnouncement }) => (
    <div className="bg-white border border-stone-200/60 rounded-xl p-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {a.pinned && <span className="text-xs">📌</span>}
            <p className="text-sm font-medium text-stone-800">{a.title}</p>
          </div>
          {a.body && <p className="text-xs text-stone-500">{a.body}</p>}
          <p className="text-xs text-stone-400 mt-1">{fmt(a.created_at)}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => togglePin(a.id, !a.pinned)} className="p-1.5 rounded-lg text-stone-300 hover:text-amber-500 hover:bg-amber-50 transition-all" title={a.pinned ? "Unpin" : "Pin"}>
              <Bell size={12} />
            </button>
            <button onClick={() => del(a.id)} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Announcements</h1>
        {isAdmin && <Btn onClick={() => setModal(true)}><Plus size={14} />New</Btn>}
      </div>

      {pinned.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Pinned</p>
          {pinned.map(a => <AnnouncementCard key={a.id} a={a} />)}
        </div>
      )}

      {regular.length > 0 && (
        <div className="flex flex-col gap-2">
          {pinned.length > 0 && <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Recent</p>}
          {regular.map(a => <AnnouncementCard key={a.id} a={a} />)}
        </div>
      )}

      {announcements.length === 0 && <ES icon={<Bell size={24} />} message="No announcements yet" />}

      <Md open={modal} onClose={() => setModal(false)} title="New Announcement">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
          <TA label="Body (optional)" value={form.body} onChange={v => setForm({ ...form, body: v })} />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
            <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="rounded" />
            Pin this announcement
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={create} disabled={!form.title.trim() || saving}>{saving ? "Saving..." : "Publish"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── UGC Submission History ─────────────────────────────────────────────────────
function UGCSubmissionHistoryPage({ profile, submissions, ugcCreators }: {
  profile: UGCCreatorProfile; submissions: UGCSubmission[]; ugcCreators: UGCCreatorProfile[];
}) {
  const isAdmin = profile.role === "admin";
  const mySubmissions = isAdmin ? submissions : submissions.filter(s => s.creator_id === profile.id);
  const sorted = [...mySubmissions].sort((a, b) => b.week_date.localeCompare(a.week_date));
  const [expanded, setExpanded] = useState<string | null>(null);

  const creatorName = (id: string) => ugcCreators.find(c => c.id === id)?.full_name ?? "Unknown";

  const tierColor = (tier?: string) => {
    if (!tier) return "bg-stone-100 text-stone-500";
    if (tier === "viral") return "bg-purple-100 text-purple-700";
    if (tier === "strong") return "bg-green-100 text-green-700";
    if (tier === "good") return "bg-sky-100 text-sky-700";
    if (tier === "average") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Submission History</h1>
          <p className="text-xs text-stone-400 mt-0.5">{sorted.length} submission{sorted.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {sorted.length === 0 && <ES icon={<FileText size={24} />} message="No submissions yet" />}

      <div className="flex flex-col gap-3">
        {sorted.map(s => (
          <div key={s.id} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-all"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  {isAdmin && <p className="text-xs text-stone-400 mb-0.5">{creatorName(s.creator_id ?? "")}</p>}
                  <p className="text-sm font-semibold text-stone-800">Week of {s.week_date}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{fmtViews(s.total_views)} views</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${tierColor(s.benchmark_tier)}`}>
                  {s.benchmark_tier?.replace("_", " ") ?? "—"}
                </span>
                <ChevronRight size={14} className={`text-stone-400 transition-transform ${expanded === s.id ? "rotate-90" : ""}`} />
              </div>
            </button>

            {expanded === s.id && (
              <div className="border-t border-stone-100 p-4 flex flex-col gap-4">
                {/* Video Metadata */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Video</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {s.hook_text && <div className="col-span-2"><span className="text-stone-400 text-xs">Hook: </span><span className="text-stone-700">"{s.hook_text}"</span></div>}
                    {s.format_type && <div><span className="text-stone-400 text-xs">Format: </span><span className="text-stone-700">{s.format_type}</span></div>}
                    {s.niche && <div><span className="text-stone-400 text-xs">Niche: </span><span className="text-stone-700">{s.niche}</span></div>}
                    {s.video_length_seconds != null && <div><span className="text-stone-400 text-xs">Length: </span><span className="text-stone-700">{s.video_length_seconds}s</span></div>}
                    <div><span className="text-stone-400 text-xs">Trending Sound: </span><span className="text-stone-700">{s.trending_sound ? "Yes" : "No"}</span></div>
                    <div><span className="text-stone-400 text-xs">CTA: </span><span className="text-stone-700">{s.has_cta ? "Yes" : "No"}</span></div>
                  </div>
                </div>

                {/* View Data */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Performance</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-stone-400 text-xs">Total Views: </span><span className="text-stone-700">{fmtViews(s.total_views)}</span></div>
                    {s.avg_watch_time_seconds != null && <div><span className="text-stone-400 text-xs">Avg Watch: </span><span className="text-stone-700">{s.avg_watch_time_seconds}s</span></div>}
                    {s.watch_completion_rate != null && <div><span className="text-stone-400 text-xs">Completion: </span><span className="text-stone-700">{s.watch_completion_rate}%</span></div>}
                    <div><span className="text-stone-400 text-xs">Profile Visits: </span><span className="text-stone-700">{s.profile_visits ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">FYP: </span><span className="text-stone-700">{s.traffic_fyp_pct ?? 0}%</span></div>
                    <div><span className="text-stone-400 text-xs">Following: </span><span className="text-stone-700">{s.traffic_following_pct ?? 0}%</span></div>
                    <div><span className="text-stone-400 text-xs">Search: </span><span className="text-stone-700">{s.traffic_search_pct ?? 0}%</span></div>
                  </div>
                </div>

                {/* Engagement */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Engagement</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-stone-400 text-xs">Likes: </span><span className="text-stone-700">{s.likes ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Comments: </span><span className="text-stone-700">{s.comments ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Shares: </span><span className="text-stone-700">{s.shares ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Saves: </span><span className="text-stone-700">{s.saves ?? 0}</span></div>
                    {s.comment_sentiment && <div className="col-span-2"><span className="text-stone-400 text-xs">Sentiment: </span><span className="text-stone-700 capitalize">{s.comment_sentiment}</span></div>}
                  </div>
                </div>

                {/* Account Health */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Account Health</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-stone-400 text-xs">Followers Gained: </span><span className="text-stone-700">{s.followers_gained ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Followers Lost: </span><span className="text-stone-700">{s.followers_lost ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Net Change: </span><span className={`font-medium ${(s.net_follower_change ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>{(s.net_follower_change ?? 0) >= 0 ? "+" : ""}{s.net_follower_change ?? 0}</span></div>
                    <div><span className="text-stone-400 text-xs">Account Views: </span><span className="text-stone-700">{fmtViews(s.total_account_views ?? 0)}</span></div>
                    <div><span className="text-stone-400 text-xs">Videos Posted: </span><span className="text-stone-700">{s.videos_posted ?? 0}</span></div>
                    {s.best_video_link && (
                      <div className="col-span-2"><span className="text-stone-400 text-xs">Best Video: </span>
                        <a href={s.best_video_link} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline text-xs break-all">{s.best_video_link}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── UGC Resource Library ───────────────────────────────────────────────────────
function UGCResourcesPage({ profile, resources, setResources, sb }: {
  profile: UGCCreatorProfile; resources: UGCResource[];
  setResources: (r: UGCResource[]) => void; sb: any;
}) {
  const isAdmin = profile.role === "admin";
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", file_url: "", link: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const categories = ["all", ...Array.from(new Set(resources.map(r => r.category).filter(Boolean))) as string[]];
  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || r.category === filterCat;
    return matchSearch && matchCat;
  });

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("ugc_resources").insert({
      title: form.title, description: form.description || null,
      category: form.category || null, file_url: form.file_url || null,
      link: form.link || null, created_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { console.error(error); return; }
    setResources([data as UGCResource, ...resources]);
    setModal(false); setForm({ title: "", description: "", category: "", file_url: "", link: "" });
  }

  async function del(id: string) {
    if (!window.confirm("Delete this resource?")) return;
    await sb.from("ugc_resources").delete().eq("id", id);
    setResources(resources.filter(r => r.id !== id));
  }

  const catColors: Record<string, string> = {
    "Strategy": "#dbeafe", "Templates": "#dcfce7", "Education": "#fef9c3",
    "Brand": "#fce7f3", "Tools": "#ede9fe",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">UGC Resources</h1>
          <p className="text-xs text-stone-400 mt-0.5">Guides, templates, and tools for creators</p>
        </div>
        {isAdmin && <Btn onClick={() => setModal(true)}><Plus size={14} />Add Resource</Btn>}
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-stone-300" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${filterCat === c ? "bg-stone-800 text-white border-stone-800" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>{c}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <ES icon={<FolderOpen size={24} />} message="No resources yet" />}

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-start justify-between gap-3 group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-semibold text-stone-800">{r.title}</p>
                {r.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: catColors[r.category] || "#f3f4f6", color: "#374151" }}>{r.category}</span>
                )}
              </div>
              {r.description && <p className="text-xs text-stone-500 mb-2">{r.description}</p>}
              <div className="flex gap-3 flex-wrap">
                {r.link && (
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium">
                    <ExternalLink size={11} />View Resource
                  </a>
                )}
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer" download className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                    <ArrowRight size={11} />Download
                  </a>
                )}
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => del(r.id)} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      <Md open={modal} onClose={() => setModal(false)} title="Add Resource">
        <div className="flex flex-col gap-3">
          <TI label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
          <TA label="Description (optional)" value={form.description} onChange={v => setForm({ ...form, description: v })} rows={2} />
          <TI label="Category (e.g. Strategy, Templates, Education)" value={form.category} onChange={v => setForm({ ...form, category: v })} />
          <TI label="Link URL (optional)" value={form.link} onChange={v => setForm({ ...form, link: v })} placeholder="https://..." />
          <TI label="File URL (optional)" value={form.file_url} onChange={v => setForm({ ...form, file_url: v })} placeholder="https://..." />
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!form.title.trim() || saving}>{saving ? "Saving..." : "Add Resource"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── UGC Creator Management (admin) ────────────────────────────────────────────
function UGCCreatorMgmtPage({ profile, ugcCreators, setUGCCreators, submissions, smartAlerts, sb }: {
  profile: UGCCreatorProfile; ugcCreators: UGCCreatorProfile[];
  setUGCCreators: (c: UGCCreatorProfile[]) => void; submissions: UGCSubmission[]; smartAlerts?: SmartAlert[]; sb: any;
}) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", tiktok_handle: "" });
  const [saving, setSaving] = useState(false);

  const latestTier = (creatorId: string): string | undefined => {
    const subs = submissions.filter(s => s.creator_id === creatorId).sort((a, b) => b.week_date.localeCompare(a.week_date));
    return subs[0]?.benchmark_tier;
  };

  const statusDot = (tier?: string): string => {
    if (!tier) return "#D1D5DB";
    if (["good", "strong", "viral"].includes(tier)) return "#10B981";
    if (tier === "average") return "#F59E0B";
    return "#EF4444";
  };

  async function addCreator() {
    if (!form.full_name.trim() || !form.email.trim()) return;
    setSaving(true);
    const res = await fetch("/api/ugc-create-creator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: form.full_name, email: form.email, tiktok_handle: form.tiktok_handle }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok || json.error) { alert(json.error || "Failed to create creator"); return; }
    setUGCCreators([json.profile as UGCCreatorProfile, ...ugcCreators]);
    setModal(false); setForm({ full_name: "", email: "", tiktok_handle: "" });
  }

  async function archive(id: string) {
    if (!window.confirm("Archive this creator?")) return;
    await sb.from("profiles").update({ active: false, ugc_status: "archived" }).eq("id", id);
    setUGCCreators(ugcCreators.map(c => c.id === id ? { ...c, active: false, ugc_status: "archived" } : c));
  }

  async function unarchive(id: string) {
    await sb.from("profiles").update({ active: true, ugc_status: "active" }).eq("id", id);
    setUGCCreators(ugcCreators.map(c => c.id === id ? { ...c, active: true, ugc_status: "active" } : c));
  }

  const active = ugcCreators.filter(c => c.active !== false);
  const archived = ugcCreators.filter(c => c.active === false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">UGC Creator Management</h1>
        <Btn onClick={() => setModal(true)}><UserPlus size={14} />Add Creator</Btn>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Active Creators ({active.length})</p>
        {active.length === 0 ? <ES icon={<Users size={24} />} message="No active UGC creators yet" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.map(c => {
              const tier = latestTier(c.id);
              return (
                <div key={c.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Av name={c.full_name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-stone-800">{c.full_name}</p>
                          {(smartAlerts || []).some(a => a.creator_id === c.id && a.alert_type === 'missed_submission' && !a.dismissed) && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#fca5a5", color: "#b91c1c" }}>!</span>
                          )}
                        </div>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusDot(tier), display: "inline-block", flexShrink: 0 }} />
                      </div>
                      {c.tiktok_handle && <p className="text-xs text-stone-400">@{c.tiktok_handle}</p>}
                      <p className="text-xs text-stone-400">{c.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Bg v="success">Active</Bg>
                        {tier && <BenchmarkBadge tier={tier} />}
                      </div>
                    </div>
                    <button onClick={() => archive(c.id)} className="text-xs text-stone-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">Archive</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {archived.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Archived ({archived.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archived.map(c => (
              <div key={c.id} className="bg-white border border-stone-100 rounded-xl p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <Av name={c.full_name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700">{c.full_name}</p>
                    {c.tiktok_handle && <p className="text-xs text-stone-400">@{c.tiktok_handle}</p>}
                    <Bg v="default">Archived</Bg>
                  </div>
                  <button onClick={() => unarchive(c.id)} className="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-all">Restore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200/60 rounded-xl p-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Creator Directory</p>
        {active.length === 0 ? <p className="text-xs text-stone-400 italic">No active creators</p> : (
          <div className="flex flex-col gap-2">
            {active.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <Av name={c.full_name} size={24} />
                <span className="text-sm text-stone-700 flex-1">{c.full_name}</span>
                {c.tiktok_handle && <span className="text-xs text-stone-400">@{c.tiktok_handle}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Md open={modal} onClose={() => setModal(false)} title="Add UGC Creator">
        <div className="flex flex-col gap-3">
          <TI label="Full Name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required />
          <TI label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" required />
          <TI label="TikTok Handle" value={form.tiktok_handle} onChange={v => setForm({ ...form, tiktok_handle: v })} placeholder="@username (without @)" />
          <p className="text-xs text-stone-400 bg-stone-50 rounded-lg p-3">The creator will need to sign in via Supabase Auth with this email. Their profile will be created with role=ugc_creator.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={addCreator} disabled={!form.full_name.trim() || !form.email.trim() || saving}>{saving ? "Saving..." : "Add Creator"}</Btn>
          </div>
        </div>
      </Md>
    </div>
  );
}

// ── UGC Pivot Queue (admin) ────────────────────────────────────────────────────
function UGCPivotQueuePage({ profile, pivotQueue, setPivotQueue, ugcCreators, sb }: {
  profile: UGCCreatorProfile; pivotQueue: UGCPivotQueue[];
  setPivotQueue: (q: UGCPivotQueue[]) => void; ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [exampleLinks, setExampleLinks] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function refresh() {
    setRefreshing(true); setFetchError(null);
    const { data, error } = await sb.from("ugc_pivot_queue").select("*").order("created_at", { ascending: false });
    if (error) setFetchError(error.message);
    setPivotQueue((data || []) as UGCPivotQueue[]);
    setRefreshing(false);
  }

  const cName = (id?: string) => ugcCreators.find(c => c.id === id)?.full_name || "Unknown";

  const pending = pivotQueue.filter(q => q.status === "pending");
  const approved = pivotQueue.filter(q => q.status === "approved");
  const rejected = pivotQueue.filter(q => q.status === "rejected");

  async function approve(item: UGCPivotQueue) {
    setProcessing(prev => ({ ...prev, [item.id]: true }));
    const notes = adminNotes[item.id] || item.admin_notes || null;
    const exLink = exampleLinks[item.id] || item.example_video_link || null;

    const { error: pivErr } = await sb.from("ugc_pivots").insert({
      creator_id: item.creator_id,
      queue_id: item.id,
      week_date: item.week_date,
      ai_pivot: item.ai_pivot,
      admin_notes: notes,
      example_video_link: exLink,
      created_at: new Date().toISOString(),
    });

    if (pivErr) { console.error(pivErr); setProcessing(prev => ({ ...prev, [item.id]: false })); return; }

    await sb.from("ugc_pivot_queue").update({ status: "approved", admin_notes: notes, example_video_link: exLink }).eq("id", item.id);
    setPivotQueue(pivotQueue.map(q => q.id === item.id ? { ...q, status: "approved", admin_notes: notes || undefined, example_video_link: exLink || undefined } : q));
    setProcessing(prev => ({ ...prev, [item.id]: false }));
  }

  async function reject(id: string) {
    setProcessing(prev => ({ ...prev, [id]: true }));
    await sb.from("ugc_pivot_queue").update({ status: "rejected" }).eq("id", id);
    setPivotQueue(pivotQueue.map(q => q.id === id ? { ...q, status: "rejected" } : q));
    setProcessing(prev => ({ ...prev, [id]: false }));
  }

  function QueueCard({ item }: { item: UGCPivotQueue }) {
    const snap = item.analytics_snapshot as any;
    const isPending = item.status === "pending";
    return (
      <div className={`bg-white border rounded-xl p-5 ${isPending ? "border-amber-200" : "border-stone-200/60"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Av name={cName(item.creator_id)} size={32} />
            <div>
              <p className="text-sm font-semibold text-stone-800">{cName(item.creator_id)}</p>
              <p className="text-xs text-stone-400">Week {item.week_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {snap?.benchmark_tier && <BenchmarkBadge tier={snap.benchmark_tier} />}
            <Bg v={item.status === "pending" ? "warning" : item.status === "approved" ? "success" : "danger"}>{item.status}</Bg>
          </div>
        </div>

        {snap && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
            {[["Views", snap.total_views], ["Likes", snap.likes], ["Comments", snap.comments], ["Followers+", snap.followers_gained]].map(([l, v]) => (
              <div key={l as string} className="bg-stone-50 rounded-lg p-2">
                <p className="text-xs text-stone-400">{l}</p>
                <p className="text-xs font-semibold text-stone-700">{fmtViews(Number(v) || 0)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">AI Pivot</p>
          <div className="max-h-48 overflow-y-auto bg-stone-50 rounded-lg p-3">
            <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">{item.ai_pivot}</p>
          </div>
        </div>

        {isPending && (
          <>
            <TA label="Admin Notes (optional)" value={adminNotes[item.id] || ""} onChange={v => setAdminNotes(prev => ({ ...prev, [item.id]: v }))} rows={2} />
            <div className="mt-2">
              <TI label="Example Video Link (optional)" value={exampleLinks[item.id] || ""} onChange={v => setExampleLinks(prev => ({ ...prev, [item.id]: v }))} placeholder="https://tiktok.com/..." />
            </div>
            <div className="flex gap-2 mt-3">
              <Btn onClick={() => approve(item)} disabled={processing[item.id]}><CheckCircle2 size={14} />Approve</Btn>
              <Btn variant="danger" onClick={() => reject(item.id)} disabled={processing[item.id]}><X size={14} />Reject</Btn>
            </div>
          </>
        )}

        {item.admin_notes && !isPending && <p className="text-xs text-stone-500 mt-2 italic">Admin note: {item.admin_notes}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-stone-800">Pivot Queue</h1><p className="text-sm text-stone-400 mt-0.5">AI-generated pivot strategies awaiting review.</p></div>
        <div className="flex items-center gap-2">
              {pending.length > 0 && <Bg v="warning">{pending.length} pending</Bg>}
          <Btn variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>{refreshing ? <Loader2 size={13} className="animate-spin"/> : "Refresh"}</Btn>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>Error loading pivot queue:</strong> {fetchError}
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Pending Review ({pending.length})</p>
          {pending.map(item => <QueueCard key={item.id} item={item} />)}
        </div>
      )}

      {pending.length === 0 && approved.length === 0 && rejected.length === 0 && (
        <ES icon={<Inbox size={24} />} message="No pivot submissions yet" />
      )}

      {approved.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Recently Approved ({approved.length})</p>
          {approved.slice(0, 5).map(item => <QueueCard key={item.id} item={item} />)}
        </div>
      )}

      {rejected.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Rejected ({rejected.length})</p>
          {rejected.slice(0, 3).map(item => <QueueCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

// ── UGC Pivot History (admin) ─────────────────────────────────────────────────
function UGCPivotHistoryPage({ profile, pivots, setPivots, ugcCreators, sb }: {
  profile: UGCCreatorProfile; pivots: UGCPivot[]; setPivots: (p: UGCPivot[]) => void;
  ugcCreators: UGCCreatorProfile[]; sb: any;
}) {
  const [edits, setEdits] = useState<Record<string, Partial<UGCPivot>>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const cName = (id?: string) => ugcCreators.find(c => c.id === id)?.full_name || "Unknown";

  const byCreator = useMemo(() => {
    const m: Record<string, UGCPivot[]> = {};
    pivots.forEach(p => {
      const k = p.creator_id || "unknown";
      if (!m[k]) m[k] = [];
      m[k].push(p);
    });
    return m;
  }, [pivots]);

  async function savePivot(p: UGCPivot) {
    const e = edits[p.id] || {};
    setSaving(prev => ({ ...prev, [p.id]: true }));
    const upd = {
      ai_pivot: e.ai_pivot ?? p.ai_pivot,
      admin_notes: e.admin_notes ?? p.admin_notes,
      example_video_link: e.example_video_link ?? p.example_video_link,
    };
    await sb.from("ugc_pivots").update(upd).eq("id", p.id);
    setPivots(pivots.map(x => x.id === p.id ? { ...x, ...upd } : x));
    setEdits(prev => { const n = { ...prev }; delete n[p.id]; return n; });
    setSaving(prev => ({ ...prev, [p.id]: false }));
  }

  const getVal = (p: UGCPivot, field: keyof UGCPivot): string => {
    const e = edits[p.id];
    if (e && field in e) return (e[field] as string) || "";
    return (p[field] as string) || "";
  };

  const setVal = (id: string, field: keyof UGCPivot, value: string) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  if (Object.keys(byCreator).length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-stone-800">Pivot History</h1>
        <ES icon={<FileText size={24} />} message="No approved pivots yet" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">Pivot History</h1>
      {Object.entries(byCreator).map(([creatorId, cPivots]) => (
        <div key={creatorId} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-3">
            <Av name={cName(creatorId)} size={28} />
            <p className="text-sm font-semibold text-stone-800">{cName(creatorId)}</p>
            <span className="text-xs text-stone-400">{cPivots.length} pivots</span>
          </div>
          <div className="divide-y divide-stone-50">
            {[...cPivots].sort((a, b) => b.week_date.localeCompare(a.week_date)).map(p => (
              <div key={p.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500">Week {p.week_date}</span>
                  <Btn size="sm" onClick={() => savePivot(p)} disabled={saving[p.id] || !edits[p.id]}>
                    {saving[p.id] ? "Saving..." : "Save"}
                  </Btn>
                </div>
                <TA label="AI Pivot" value={getVal(p, "ai_pivot")} onChange={v => setVal(p.id, "ai_pivot", v)} rows={5} />
                <TA label="Admin Notes" value={getVal(p, "admin_notes")} onChange={v => setVal(p.id, "admin_notes", v)} rows={2} />
                <TI label="Example Video Link" value={getVal(p, "example_video_link")} onChange={v => setVal(p.id, "example_video_link", v)} placeholder="https://tiktok.com/..." />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── UGC Analytics Overview (admin) ────────────────────────────────────────────
function UGCAnalyticsOverview({ submissions, ugcCreators, pivotQueue, smartAlerts }: {
  submissions: UGCSubmission[]; ugcCreators: UGCCreatorProfile[]; pivotQueue: UGCPivotQueue[]; smartAlerts?: SmartAlert[];
}) {
  const currentWeek = getMondayOfWeek(new Date());
  const thisWeekSubs = submissions.filter(s => s.week_date === currentWeek);
  const avgViews = thisWeekSubs.length > 0 ? Math.round(thisWeekSubs.reduce((s, x) => s + x.total_views, 0) / thisWeekSubs.length) : 0;
  const topPerformer = [...thisWeekSubs].sort((a, b) => b.total_views - a.total_views)[0];
  const topName = topPerformer ? ugcCreators.find(c => c.id === topPerformer.creator_id)?.full_name || "Unknown" : "—";

  const tierCounts = useMemo(() => {
    const m: Record<string, number> = {};
    submissions.forEach(s => { if (s.benchmark_tier) m[s.benchmark_tier] = (m[s.benchmark_tier] || 0) + 1; });
    return m;
  }, [submissions]);

  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");

  const creatorGraphData = (creatorId: string) => {
    const subs = submissions.filter(s => s.creator_id === creatorId)
      .sort((a, b) => a.week_date.localeCompare(b.week_date));
    return { data: subs.map(s => s.total_views), labels: subs.map(s => s.week_date.slice(5)) };
  };

  const g1 = c1 ? creatorGraphData(c1) : null;
  const g2 = c2 ? creatorGraphData(c2) : null;

  const creatorOptions = [
    { value: "", label: "— Select creator —" },
    ...ugcCreators.map(c => ({ value: c.id, label: c.full_name })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">UGC Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SC label="This Week Submissions" value={thisWeekSubs.length} />
        <SC label="Avg Views This Week" value={fmtViews(avgViews)} />
        <SC label="Top Performer" value={topName} />
        <SC label="Pending Pivots" value={pivotQueue.filter(q => q.status === "pending").length} />
      </div>

      <div className="bg-white border border-stone-200/60 rounded-xl p-5">
        <p className="text-sm font-semibold text-stone-700 mb-4">Benchmark Tier Distribution</p>
        <div className="flex flex-wrap gap-2">
          {[["hook_failed", "danger"], ["average", "warning"], ["good", "info"], ["strong", "success"], ["viral", "purple"]].map(([tier, v]) => (
            <div key={tier} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg">
              <BenchmarkBadge tier={tier} />
              <span className="text-sm font-bold text-stone-700">{tierCounts[tier] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200/60 rounded-xl p-5">
        <p className="text-sm font-semibold text-stone-700 mb-4">Creator Comparison</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Sel label="Creator 1" value={c1} onChange={setC1} options={creatorOptions} />
          <Sel label="Creator 2" value={c2} onChange={setC2} options={creatorOptions} />
        </div>
        {g1 && g2 && g1.data.length > 0 && g2.data.length > 0 ? (
          <TwoLineGraph data1={g1.data} data2={g2.data} labels={g1.labels} />
        ) : g1 && g1.data.length > 0 ? (
          <LineGraph data={g1.data} labels={g1.labels} />
        ) : (
          <p className="text-xs text-stone-400 italic">Select creators to compare</p>
        )}
        {c1 && g1 && <div className="flex items-center gap-2 mt-2"><span className="w-3 h-1 bg-stone-800 rounded inline-block"/><span className="text-xs text-stone-500">{ugcCreators.find(c => c.id === c1)?.full_name}</span></div>}
        {c2 && g2 && <div className="flex items-center gap-2 mt-1"><span className="w-3 h-1 bg-violet-600 rounded inline-block"/><span className="text-xs text-stone-500">{ugcCreators.find(c => c.id === c2)?.full_name}</span></div>}
      </div>

      {/* Smart Alert Warnings */}
      {(smartAlerts || []).filter(a => ['no_post', 'declining_performance'].includes(a.alert_type)).map(alert => (
        <div key={alert.id} className="border rounded-xl p-3 flex items-start gap-2" style={{
          borderColor: alert.urgency === 'orange' ? '#fdba74' : '#fde68a',
          backgroundColor: alert.urgency === 'orange' ? '#fff7ed' : '#fffbeb',
        }}>
          <span className="text-sm">{alert.urgency === 'orange' ? '📉' : '⚠️'}</span>
          <p className="text-sm font-medium" style={{ color: alert.urgency === 'orange' ? '#c2410c' : '#92400e' }}>{alert.message}</p>
        </div>
      ))}

      <div className="bg-white border border-stone-200/60 rounded-xl p-5 overflow-x-auto">
        <p className="text-sm font-semibold text-stone-700 mb-4">All Submissions</p>
        {submissions.length === 0 ? <ES message="No submissions yet" /> : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-100">
              <th className="text-left py-2 pr-4 text-stone-400 font-medium">Creator</th>
              <th className="text-left py-2 pr-4 text-stone-400 font-medium">Week</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Views</th>
              <th className="text-center py-2 px-2 text-stone-400 font-medium">Tier</th>
            </tr></thead>
            <tbody>
              {[...submissions].sort((a, b) => b.week_date.localeCompare(a.week_date)).slice(0, 20).map(s => (
                <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-2 pr-4 text-stone-700">{ugcCreators.find(c => c.id === s.creator_id)?.full_name || "—"}</td>
                  <td className="py-2 pr-4 text-stone-500">{s.week_date}</td>
                  <td className="py-2 px-2 text-center font-semibold text-stone-700">{fmtViews(s.total_views)}</td>
                  <td className="py-2 px-2 text-center"><BenchmarkBadge tier={s.benchmark_tier} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── UGC Brief Page (admin) ─────────────────────────────────────────────────────
function UGCBriefPage({ briefs, setBriefs, sb }: {
  briefs: UGCBrief[]; setBriefs: (b: UGCBrief[]) => void; sb: any;
}) {
  const currentWeek = getMondayOfWeek(new Date());
  const [form, setForm] = useState({ week_date: currentWeek, hooks: "", format_recs: "", brand_guidelines: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function publish() {
    if (!form.week_date) return;
    setSaving(true);
    const { data, error } = await sb.from("ugc_briefs").insert({
      week_date: form.week_date,
      hooks: form.hooks || null,
      format_recs: form.format_recs || null,
      brand_guidelines: form.brand_guidelines || null,
      created_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { console.error(error); return; }
    setBriefs([data as UGCBrief, ...briefs]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setForm({ week_date: currentWeek, hooks: "", format_recs: "", brand_guidelines: "" });
  }

  async function deleteBrief(id: string) {
    if (!window.confirm("Delete this brief?")) return;
    await sb.from("ugc_briefs").delete().eq("id", id);
    setBriefs(briefs.filter(b => b.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-800">Weekly Brief</h1>

      <div className="bg-white border border-stone-200/60 rounded-xl p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-stone-700">Publish New Brief</p>
        <TI label="Week Date (Monday)" value={form.week_date} onChange={v => setForm({ ...form, week_date: v })} type="date" />
        <TA label="Hooks" value={form.hooks} onChange={v => setForm({ ...form, hooks: v })} rows={4} placeholder="List of hooks to use this week..." />
        <TA label="Format Recommendations" value={form.format_recs} onChange={v => setForm({ ...form, format_recs: v })} rows={3} placeholder="Video length, style, structure..." />
        <TA label="Brand Guidelines" value={form.brand_guidelines} onChange={v => setForm({ ...form, brand_guidelines: v })} rows={3} placeholder="Colors, tone, key messages..." />
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
          {saved && <span className="text-xs text-emerald-600 font-medium">Published!</span>}
          <Btn onClick={publish} disabled={saving || !form.week_date}>{saving ? "Publishing..." : "Publish Brief"}</Btn>
        </div>
      </div>

      {briefs.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Past Briefs</p>
          {briefs.map(b => (
            <div key={b.id} className="bg-white border border-stone-200/60 rounded-xl p-4 group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-stone-700">Week of {b.week_date}</p>
                <button onClick={() => deleteBrief(b.id)} className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
              {b.hooks && <div className="mb-2"><p className="text-xs text-stone-400 mb-0.5">Hooks</p><p className="text-xs text-stone-600 whitespace-pre-wrap">{b.hooks}</p></div>}
              {b.format_recs && <div className="mb-2"><p className="text-xs text-stone-400 mb-0.5">Format</p><p className="text-xs text-stone-600 whitespace-pre-wrap">{b.format_recs}</p></div>}
              {b.brand_guidelines && <div><p className="text-xs text-stone-400 mb-0.5">Brand Guidelines</p><p className="text-xs text-stone-600 whitespace-pre-wrap">{b.brand_guidelines}</p></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("cc_nav_collapsed") || "{}"); } catch { return {}; }
  });
  function toggleSection(label: string) {
    setCollapsedSections(prev => {
      const next = { ...prev, [label]: !prev[label] };
      try { localStorage.setItem("cc_nav_collapsed", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const [interns, setInterns] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [events, setEvents] = useState<CCEvent[]>([]);
  const [techProjects, setTechProjects] = useState<TechProject[]>([]);
  const [content, setContent] = useState<ContentVideo[]>([]);
  const [settings, setSettings] = useState<AppSettings>({});
  const [ugcSubmissions, setUGCSubmissions] = useState<UGCSubmission[]>([]);
  const [ugcPivotQueue, setUGCPivotQueue] = useState<UGCPivotQueue[]>([]);
  const [ugcPivots, setUGCPivots] = useState<UGCPivot[]>([]);
  const [ugcHooks, setUGCHooks] = useState<UGCHook[]>([]);
  const [ugcBriefs, setUGCBriefs] = useState<UGCBrief[]>([]);
  const [ugcAnnouncements, setUGCAnnouncements] = useState<UGCAnnouncement[]>([]);
  const [ugcQuestions, setUGCQuestions] = useState<UGCQuestion[]>([]);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [ugcCreators, setUGCCreators] = useState<UGCCreatorProfile[]>([]);
  const [ugcResources, setUGCResources] = useState<UGCResource[]>([]);
  const [savedHooks, setSavedHooks] = useState<SavedHook[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!prof) { router.push("/auth"); return; }
      setProfile(prof as Profile);
      if (prof?.id) supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", prof.id).then(() => {});
      if (prof.role === "ugc_creator") setPage("ugc_dashboard");
      const [
        { data: iD }, { data: tD }, { data: oD }, { data: qD },
        { data: rD }, { data: resD }, { data: aD }, { data: actD },
        { data: rtD }, { data: reqD }, { data: evD }, { data: tpD }, { data: ctD },
        { data: stD },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "intern").order("full_name"),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("outreach_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("questions").select("*, question_replies(*)").order("created_at", { ascending: false }),
        supabase.from("weekly_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("pinned", { ascending: false }),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("request_types").select("*").order("created_at"),
        supabase.from("requests").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("date"),
        supabase.from("tech_projects").select("*").order("created_at", { ascending: false }),
        supabase.from("content_videos").select("*").order("created_at", { ascending: false }),
        supabase.from("settings").select("*"),
      ]);
      setInterns((iD || []) as Profile[]);
      setTasks((tD || []) as Task[]);
      setOutreach((oD || []) as Outreach[]);
      setQuestions((qD || []) as Question[]);
      setReports((rD || []) as Report[]);
      setResources((resD || []) as Resource[]);
      setAnnouncements((aD || []) as Announcement[]);
      setActivity((actD || []) as Activity[]);
      setRequestTypes((rtD || []) as RequestType[]);
      setRequests(((reqD || []) as any[]).map(r => ({ ...r, replies: r.replies || [] })) as Request[]);
      setEvents((evD || []) as CCEvent[]);
      setTechProjects((tpD || []) as TechProject[]);
      setContent((ctD || []) as ContentVideo[]);
      try { setSettings(((stD||[]) as any[]).reduce((acc:AppSettings,s:any)=>({...acc,[s.key]:s.value}),{})); } catch(_) {}

      // UGC data
      const isUGCRole = prof.role === "ugc_creator" || prof.role === "admin";
      if (isUGCRole) {
        const [
          { data: ugcCrD }, { data: ugcSubD }, { data: ugcPqD }, { data: ugcPvD },
          { data: ugcHkD }, { data: ugcBrD }, { data: ugcAnD }, { data: ugcQsD },
          { data: ugcResD }, { data: alertsD }, { data: savedHkD },
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("role", "ugc_creator").order("full_name"),
          prof.role === "admin"
            ? supabase.from("ugc_submissions").select("*").order("created_at", { ascending: false })
            : supabase.from("ugc_submissions").select("*").eq("creator_id", prof.id).order("created_at", { ascending: false }),
          prof.role === "admin"
            ? supabase.from("ugc_pivot_queue").select("*").order("created_at", { ascending: false })
            : supabase.from("ugc_pivot_queue").select("*").eq("status", "never_show").limit(0),
          prof.role === "admin"
            ? supabase.from("ugc_pivots").select("*").order("created_at", { ascending: false })
            : supabase.from("ugc_pivots").select("*").eq("creator_id", prof.id).order("created_at", { ascending: false }),
          supabase.from("ugc_hooks").select("*").order("view_count", { ascending: false }),
          supabase.from("ugc_briefs").select("*").order("week_date", { ascending: false }).limit(10),
          supabase.from("ugc_announcements").select("*").order("pinned", { ascending: false }),
          supabase.from("ugc_qa").select("*, ugc_qa_replies(*)").order("created_at", { ascending: false }),
          supabase.from("ugc_resources").select("*").order("created_at", { ascending: false }),
          supabase.from("smart_alerts").select("*").eq("dismissed", false).order("created_at", { ascending: false }),
          prof.role === "admin"
            ? supabase.from("saved_hooks").select("*").order("saved_at", { ascending: false })
            : supabase.from("saved_hooks").select("*").eq("creator_id", prof.id).order("saved_at", { ascending: false }),
        ]);
        setUGCCreators((ugcCrD || []) as UGCCreatorProfile[]);
        setUGCSubmissions((ugcSubD || []) as UGCSubmission[]);
        setUGCPivotQueue((ugcPqD || []) as UGCPivotQueue[]);
        setUGCPivots((ugcPvD || []) as UGCPivot[]);
        setUGCHooks((ugcHkD || []) as UGCHook[]);
        setUGCBriefs((ugcBrD || []) as UGCBrief[]);
        setUGCAnnouncements((ugcAnD || []) as UGCAnnouncement[]);
        setUGCQuestions((ugcQsD || []) as UGCQuestion[]);
        setUGCResources((ugcResD || []) as UGCResource[]);
        setSmartAlerts((alertsD || []) as SmartAlert[]);
        setSavedHooks((savedHkD || []) as SavedHook[]);
      }

      setLoading(false);
    }
    init().catch(err => { console.error("[dashboard init]", err); setLoading(false); });
  }, [supabase, router]);

  // Realtime subscriptions
  useEffect(() => {
    if (loading) return;
    const tasksCh = supabase.channel("tasks-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, p => setTasks(prev => prev.some(t => t.id === p.new.id) ? prev : [p.new as Task, ...prev]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, p => setTasks(prev => prev.map(t => t.id === p.new.id ? p.new as Task : t)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, p => setTasks(prev => prev.filter(t => t.id !== (p.old as any).id)))
      .subscribe();
    const qCh = supabase.channel("questions-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "questions" }, p => setQuestions(prev => prev.some(q => q.id === p.new.id) ? prev : [{ ...(p.new as unknown as Question), question_replies: [] }, ...prev]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "questions" }, p => setQuestions(prev => prev.map(q => q.id === p.new.id ? { ...q, ...p.new } : q)))
      .subscribe();
    const rCh = supabase.channel("replies-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "question_replies" }, p =>
        setQuestions(prev => prev.map(q => q.id === p.new.question_id ? { ...q, question_replies: (q.question_replies||[]).some(r => r.id === p.new.id) ? q.question_replies! : [...(q.question_replies || []), p.new as Reply] } : q))
      ).subscribe();
    const reqCh = supabase.channel("requests-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "requests" }, p => setRequests(prev => prev.some(r => r.id === p.new.id) ? prev : [{ ...(p.new as any), replies: (p.new as any).replies || [] } as Request, ...prev]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests" }, p => setRequests(prev => prev.map(r => r.id === p.new.id ? { ...(p.new as any), replies: (p.new as any).replies || [] } as Request : r)))
      .subscribe();
    return () => { supabase.removeChannel(tasksCh); supabase.removeChannel(qCh); supabase.removeChannel(rCh); supabase.removeChannel(reqCh); };
  }, [loading, supabase]);

  const addActivity = useCallback(async (a: any) => {
    const { data } = await supabase.from("activity_log").insert({ ...a, created_at: new Date().toISOString() }).select().single();
    if (data) setActivity(prev => [data as Activity, ...prev]);
  }, [supabase]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/auth"); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex items-center gap-2 text-stone-400"><Loader2 size={18} className="animate-spin"/><span className="text-sm">Loading...</span></div>
    </div>
  );
  if (!profile) return null;

  const isAdmin = profile.role === "admin";
  const isUGC = profile.role === "ugc_creator";
  const isTech = profile.team === "Tech/AI";
  const isCreator = profile.team === "Content Creation";
  const openQCount = questions.filter(q => q.status === "open").length;
  const activeAlertCount = smartAlerts.filter(a => !a.dismissed).length;

  const NAV = isUGC ? [
    { id: "ugc_dashboard",     icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
    { id: "ugc_submit",        icon: <BarChart3 size={16}/>,       label: "Submit Analytics" },
    { id: "ugc_pivots",        icon: <TrendingUp size={16}/>,      label: "My Pivots" },
    { id: "ugc_hook_generator", icon: <Zap size={16}/>,             label: "Hook Generator" },
    { id: "ugc_hooks",         icon: <Bookmark size={16}/>,        label: "Hook Library" },
    { id: "ugc_leaderboard",   icon: <Trophy size={16}/>,          label: "Leaderboard" },
    { id: "ugc_qa",            icon: <MessageCircle size={16}/>,   label: "Community Q&A" },
    { id: "ugc_history",       icon: <FileText size={16}/>,        label: "Submission History" },
    { id: "ugc_resources",     icon: <FolderOpen size={16}/>,      label: "Resources" },
  ] : [
    { id: "dashboard", icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
    { id: "tasks",     icon: <CheckSquare size={16}/>,     label: isAdmin ? "All Tasks" : "My Tasks" },
    { id: "outreach",  icon: <Mail size={16}/>,            label: "Outreach Log" },
    { id: "requests",  icon: <Inbox size={16}/>,           label: isAdmin ? "Request Inbox" : "Requests" },
    { id: "events",    icon: <CalendarDays size={16}/>,    label: "Events" },
    { id: "questions", icon: <MessageCircle size={16}/>,   label: "Questions", badge: openQCount || null },
    { id: "reports",   icon: <FileText size={16}/>,        label: "Weekly Report" },
    { id: "resources", icon: <FolderOpen size={16}/>,      label: "Resources" },
    ...((isAdmin || isTech) ? [{ id: "tech", icon: <Code2 size={16}/>, label: "Tech Projects" }] : []),
    ...((isAdmin || isCreator) ? [{ id: "content", icon: <Video size={16}/>, label: "Content" }] : []),
  ];
  const pendingPivotCount = ugcPivotQueue.filter(q => q.status === "pending").length;

  const ADMIN_SECTIONS = [
    {
      label: "GENERAL",
      items: [
        { id: "dashboard",     icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
        { id: "settings",      icon: <SettingsIcon size={16}/>,    label: "Settings" },
        { id: "notifications", icon: <Bell size={16}/>,            label: "Push Notifications" },
        { id: "alerts", icon: <AlertTriangle size={16}/>, label: "Alerts Center", badge: activeAlertCount || null },
      ],
    },
    {
      label: "WISCONSIN TEAM",
      items: [
        { id: "tasks",               icon: <CheckSquare size={16}/>,  label: "All Tasks" },
        { id: "outreach_requests",   icon: <Mail size={16}/>,         label: "Outreach & Requests" },
        { id: "events",              icon: <CalendarDays size={16}/>, label: "Events" },
        { id: "questions",           icon: <MessageCircle size={16}/>,label: "Questions", badge: openQCount || null },
        { id: "reports_analytics",   icon: <FileText size={16}/>,     label: "Reports & Analytics" },
        { id: "resources",           icon: <FolderOpen size={16}/>,   label: "Resources" },
        { id: "tech",                icon: <Code2 size={16}/>,        label: "Tech Projects" },
        { id: "content",             icon: <Video size={16}/>,        label: "Content" },
        { id: "interns",             icon: <Users size={16}/>,        label: "Intern Mgmt" },
      ],
    },
    {
      label: "UGC TEAM",
      items: [
        { id: "ugc_creators",            icon: <Users size={16}/>,        label: "UGC Creators" },
        { id: "ugc_analytics",           icon: <BarChart3 size={16}/>,    label: "UGC Analytics" },
        { id: "ugc_pivots_hub",          icon: <Inbox size={16}/>,        label: "Pivots", badge: pendingPivotCount || null },
        { id: "ugc_briefs_announcements",icon: <FileText size={16}/>,     label: "Briefs & Announcements" },
        { id: "ugc_resources",           icon: <FolderOpen size={16}/>,   label: "UGC Resources" },
        { id: "ugc_qa",                  icon: <MessageCircle size={16}/>,label: "Creator Q&A" },
        { id: "ugc_hook_generator",      icon: <Zap size={16}/>,          label: "Hook Generator" },
        { id: "ugc_hooks",               icon: <Bookmark size={16}/>,     label: "Hook Library" },
        { id: "ugc_leaderboard",         icon: <Trophy size={16}/>,       label: "Leaderboard" },
      ],
    },
  ];

  function NavItem({ item }: { item: { id: string; icon: React.ReactNode; label: string; badge?: number | null } }) {
    const active = page === item.id;
    return (
      <button onClick={() => { setPage(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"}`}>
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge != null && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${active ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"}`}>{item.badge}</span>}
      </button>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-100">
        <div className="w-8 h-8 bg-stone-800 rounded-xl flex items-center justify-center"><span className="text-white text-xs font-bold">CC</span></div>
        <div><p className="text-sm font-bold text-stone-800 leading-tight">Cloud Closet</p><p className="text-xs text-stone-400">Content Lab</p></div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {isAdmin ? (
          ADMIN_SECTIONS.map(section => {
            const sectionHasActivePage = section.items.some(i => i.id === page);
            // Default: GENERAL always open, active section open, other section collapsed
            const isCollapsed = collapsedSections[section.label] !== undefined
              ? collapsedSections[section.label]
              : (section.label !== "GENERAL" && !sectionHasActivePage);
            return (
              <div key={section.label} className="mb-1">
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 py-2 mt-1 group"
                >
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">{section.label}</span>
                  <ChevronDown size={12} className={`text-stone-300 group-hover:text-stone-500 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                {!isCollapsed && section.items.map(item => <NavItem key={item.id} item={item} />)}
              </div>
            );
          })
        ) : (
          NAV.map(item => <NavItem key={item.id} item={item} />)
        )}
      </nav>
      <div className="p-3 border-t border-stone-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-stone-50 transition-colors">
          <Av name={profile.full_name} size={32}/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-800 truncate">{profile.full_name}</p>
            <p className="text-xs text-stone-400 capitalize">{isAdmin ? "Admin" : isUGC ? "UGC Creator" : (profile.team || "Intern")}</p>
          </div>
          <button onClick={handleSignOut} className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors" title="Sign out"><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  );

  function renderPage() {
    const p = profile!;
    const common = { profile: p, interns, sb: supabase, addActivity };
    switch (page) {
      case "dashboard": return isAdmin
        ? <AdminDash interns={interns} tasks={tasks} outreach={outreach} questions={questions} activity={activity} announcements={announcements} setAnnouncements={setAnnouncements} ugcPivotQueue={ugcPivotQueue} ugcSubmissions={ugcSubmissions} ugcCreators={ugcCreators} smartAlerts={smartAlerts} sb={supabase}/>
        : <InternDash profile={p} tasks={tasks} outreach={outreach} announcements={announcements} setPage={setPage} requests={requests}/>;
      case "tasks":     return <TasksPg {...common} tasks={tasks} setTasks={setTasks}/>;
      case "outreach":  return <OutPg {...common} outreach={outreach} setOutreach={setOutreach}/>;
      case "requests":  return isAdmin
        ? <AdminRequestInbox requests={requests} setRequests={setRequests} requestTypes={requestTypes} setRequestTypes={setRequestTypes} interns={interns} sb={supabase} settings={settings}/>
        : <InternRequests profile={p} requests={requests.filter(r => r.intern_id === p.id)} setRequests={setRequests} sb={supabase} settings={settings}/>;
      case "outreach_requests": return <OutreachRequestsPage profile={p} interns={interns} outreach={outreach} setOutreach={setOutreach} requests={requests} setRequests={setRequests} requestTypes={requestTypes} setRequestTypes={setRequestTypes} sb={supabase} settings={settings} addActivity={addActivity}/>;
      case "reports_analytics": return <ReportsAnalyticsPage profile={p} interns={interns} tasks={tasks} outreach={outreach} content={content} requests={requests} questions={questions} techProjects={techProjects} reports={reports} setReports={setReports} sb={supabase} settings={settings} addActivity={addActivity}/>;
      case "events":    return <EventsPage profile={p} interns={interns} events={events} setEvents={setEvents} sb={supabase}/>;
      case "tech":      return (isAdmin || isTech) ? <TechProjectsPage profile={p} interns={interns} projects={techProjects} setProjects={setTechProjects} sb={supabase}/> : null;
      case "content":   return (isAdmin || isCreator) ? <ContentPage profile={p} interns={interns} content={content} setContent={setContent} ugcHooks={ugcHooks} setUGCHooks={setUGCHooks} savedHooks={savedHooks} setSavedHooks={setSavedHooks} settings={settings} sb={supabase}/> : null;
      case "questions": return <QPg {...common} questions={questions} setQuestions={setQuestions}/>;
      case "reports":   return <RPg {...common} reports={reports} setReports={setReports} settings={settings}/>;
      case "resources": return <ResPg profile={p} resources={resources} setResources={setResources} sb={supabase}/>;
      case "interns":   return isAdmin ? <IntMgmt interns={interns} setInterns={setInterns} sb={supabase}/> : null;
      case "analytics": return isAdmin ? <AnPg interns={interns} tasks={tasks} outreach={outreach} content={content} requests={requests} questions={questions} techProjects={techProjects}/> : null;
      case "notifications": return isAdmin ? <NotificationPg interns={interns} ugcCreators={ugcCreators}/> : null;
      case "settings":  return isAdmin ? <SettingsPg settings={settings} setSettings={setSettings} sb={supabase}/> : null;
      // UGC Creator pages
      case "ugc_dashboard":     return (isAdmin || isUGC) ? <UGCDashboard profile={p as UGCCreatorProfile} ugcCreators={ugcCreators} submissions={ugcSubmissions} pivots={ugcPivots} briefs={ugcBriefs} announcements={ugcAnnouncements} sb={supabase} setPage={setPage}/> : null;
      case "ugc_submit":        return (isAdmin || isUGC) ? <UGCSubmitPage profile={p as UGCCreatorProfile} submissions={ugcSubmissions} setSubmissions={setUGCSubmissions} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_pivots":        return (isAdmin || isUGC) ? <UGCMyPivotsPage profile={p as UGCCreatorProfile} pivots={ugcPivots} submissions={ugcSubmissions}/> : null;
      case "ugc_hook_generator": return (isAdmin || isUGC) ? <HookGeneratorPage profile={p as UGCCreatorProfile} ugcCreators={ugcCreators} ugcHooks={ugcHooks} setUGCHooks={setUGCHooks} savedHooks={savedHooks} setSavedHooks={setSavedHooks} settings={settings} sb={supabase}/> : null;
      case "ugc_hooks":         return (isAdmin || isUGC) ? <UGCHooksPage profile={p as UGCCreatorProfile} hooks={ugcHooks} setHooks={setUGCHooks} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_leaderboard":   return (isAdmin || isUGC) ? <UGCLeaderboardPage submissions={ugcSubmissions} ugcCreators={ugcCreators}/> : null;
      case "ugc_qa":            return (isAdmin || isUGC) ? <UGCQAPage profile={p as UGCCreatorProfile} questions={ugcQuestions} setQuestions={setUGCQuestions} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_announcements": return isAdmin ? <UGCAnnouncementsPage profile={p as UGCCreatorProfile} announcements={ugcAnnouncements} setAnnouncements={setUGCAnnouncements} sb={supabase}/> : null;
      case "ugc_pivots_hub":            return isAdmin ? <UGCPivotsHubPage profile={p as UGCCreatorProfile} pivotQueue={ugcPivotQueue} setPivotQueue={setUGCPivotQueue} pivots={ugcPivots} setPivots={setUGCPivots} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_briefs_announcements":  return isAdmin ? <UGCBriefsAnnouncementsPage profile={p as UGCCreatorProfile} briefs={ugcBriefs} setBriefs={setUGCBriefs} announcements={ugcAnnouncements} setAnnouncements={setUGCAnnouncements} sb={supabase}/> : null;
      case "ugc_history":       return (isAdmin || isUGC) ? <UGCSubmissionHistoryPage profile={p as UGCCreatorProfile} submissions={ugcSubmissions} ugcCreators={ugcCreators}/> : null;
      case "ugc_resources":     return (isAdmin || isUGC) ? <UGCResourcesPage profile={p as UGCCreatorProfile} resources={ugcResources} setResources={setUGCResources} sb={supabase}/> : null;
      // Admin-only UGC pages
      case "ugc_creators":      return isAdmin ? <UGCCreatorMgmtPage profile={p as UGCCreatorProfile} ugcCreators={ugcCreators} setUGCCreators={setUGCCreators} submissions={ugcSubmissions} smartAlerts={smartAlerts} sb={supabase}/> : null;
      case "ugc_pivot_queue":   return isAdmin ? <UGCPivotQueuePage profile={p as UGCCreatorProfile} pivotQueue={ugcPivotQueue} setPivotQueue={setUGCPivotQueue} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_analytics":     return isAdmin ? <UGCAnalyticsOverview submissions={ugcSubmissions} ugcCreators={ugcCreators} pivotQueue={ugcPivotQueue} smartAlerts={smartAlerts}/> : null;
      case "ugc_pivot_history": return isAdmin ? <UGCPivotHistoryPage profile={p as UGCCreatorProfile} pivots={ugcPivots} setPivots={setUGCPivots} ugcCreators={ugcCreators} sb={supabase}/> : null;
      case "ugc_brief":         return isAdmin ? <UGCBriefPage briefs={ugcBriefs} setBriefs={setUGCBriefs} sb={supabase}/> : null;
      case "alerts": return isAdmin ? <AlertsPage alerts={smartAlerts} setAlerts={setSmartAlerts} sb={supabase}/> : null;
      default:          return null;
    }
  }

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden overflow-x-hidden">
      <PwaSetup userId={profile?.id}/>
      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white shadow-2xl z-50"><SidebarContent/></div>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 bg-white border-r border-stone-100 flex-shrink-0"><SidebarContent/></div>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"><Menu size={18}/></button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-800 rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">CC</span></div>
            <span className="text-sm font-semibold text-stone-800">Cloud Closet</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ paddingBottom: isUGC ? undefined : 'env(safe-area-inset-bottom)' }}>
          <div className={`max-w-4xl mx-auto ${isUGC ? "pb-20 lg:pb-0" : ""}`}>{renderPage()}</div>
        </main>
      </div>
      {/* UGC bottom tab bar — mobile only */}
      {isUGC && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex items-center justify-around px-2 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {[
            { id: "ugc_dashboard", icon: <LayoutDashboard size={20}/>, label: "Home" },
            { id: "ugc_submit", icon: <BarChart3 size={20}/>, label: "Submit" },
            { id: "ugc_pivots", icon: <TrendingUp size={20}/>, label: "Pivots" },
            { id: "ugc_hook_generator", icon: <Zap size={20}/>, label: "Hooks" },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${page === item.id ? "text-stone-800" : "text-stone-400"}`}>
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-stone-400">
            <Menu size={20}/>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      )}
    </div>
  );
}
