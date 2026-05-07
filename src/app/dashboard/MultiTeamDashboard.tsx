"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LayoutDashboard, CheckSquare, FileText, Users, Bell,
  Plus, X, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, Loader2, Send, Pencil, Trash2,
  ExternalLink, Flag, BookOpen, ArrowUpRight, UserPlus, Eye,
  Check, Copy,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type MTTeamRole = {
  id: string;
  user_id: string;
  team_id: string;
  subteam_id: string | null;
  role: "intern" | "subteam_exec" | "team_exec" | "irm" | "admin";
  created_at: string;
};
export type MTTeam    = { id: string; name: string; color: string };
export type MTSubteam = { id: string; team_id: string; name: string };
export type MTInternNote = {
  id: string;
  intern_id: string;
  created_by: string;
  note: string;
  flag_level: "none" | "watch" | "concern" | "urgent";
  created_at: string;
};

// Re-export shape of Profile used throughout (matches page.tsx Profile type)
type Profile = {
  id: string; full_name: string; email: string; role: string;
  team?: string; active?: boolean; university?: string;
};
type Task = {
  id: string; title: string; description?: string;
  assigned_to?: string; co_assignees?: string[];
  priority?: string; status: string; due_date?: string; created_at: string;
  team_id?: string; subteam_id?: string; created_by?: string;
};
type Report = {
  id: string; intern_id?: string; week_of?: string;
  tasks_completed?: string; wins?: string; challenges?: string;
  ideas?: string; reviewed: boolean; created_at: string;
  content?: Record<string, any>;
};
type Announcement = {
  id: string; title: string; body?: string; pinned?: boolean;
  target_type?: string; team_id?: string | null; subteam_id?: string | null;
  tags?: string[]; created_by?: string | null; created_at: string;
};

// ── Shared tiny utilities ──────────────────────────────────────────────────────
const AV_COLORS = ["#E8D5C4","#C4D4E8","#D4E8C4","#E8C4D4","#D4C4E8","#C4E8D4","#E8E0C4","#C4E8E8"];
function avColor(n: string) { let h=0; for(const c of n) h=(h*31+c.charCodeAt(0))&0xffff; return AV_COLORS[h%AV_COLORS.length]; }
function initials(n: string) { return n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
function fmt(dt?: string|null) { if(!dt) return "—"; return new Date(dt).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }

const STATUS_COLORS: Record<string,string> = {not_started:"#D1D5DB",in_progress:"#F59E0B",submitted:"#8B5CF6",completed:"#10B981"};
const PRI: Record<string,{bg:string;text:string}> = {
  low:{bg:"#F3F4F6",text:"#6B7280"},medium:{bg:"#FEF3C7",text:"#92400E"},
  high:{bg:"#FEE2E2",text:"#991B1B"},urgent:{bg:"#EDE9FE",text:"#5B21B6"},
};
const FLAG_COLORS: Record<string,{bg:string;text:string;label:string}> = {
  none:    {bg:"#F3F4F6",text:"#6B7280",label:"None"},
  watch:   {bg:"#FEF9C3",text:"#854D0E",label:"Watch"},
  concern: {bg:"#FEE2E2",text:"#991B1B",label:"Concern"},
  urgent:  {bg:"#EDE9FE",text:"#5B21B6",label:"Urgent"},
};

function Av({name,size=32}:{name:string;size?:number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:avColor(name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:600,color:"#3D3229",flexShrink:0}}>{initials(name)}</div>;
}
function SD({status}:{status:string}) {
  return <span style={{width:8,height:8,borderRadius:"50%",background:STATUS_COLORS[status]||"#D1D5DB",display:"inline-block",flexShrink:0}}/>;
}
function PBadge({priority}:{priority?:string}) {
  if (!priority) return null;
  const c = PRI[priority]||PRI.low;
  return <span style={{background:c.bg,color:c.text}} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize">{priority}</span>;
}
function FlagBadge({level}:{level:string}) {
  if (level === "none") return null;
  const c = FLAG_COLORS[level]||FLAG_COLORS.none;
  return <span style={{background:c.bg,color:c.text}} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"><Flag size={10}/>{c.label}</span>;
}
function Spinner() {
  return <div style={{width:22,height:22,borderRadius:"50%",border:"2.5px solid #e7e5e4",borderTopColor:"#57534e",animation:"spin 0.7s linear infinite"}}/>;
}
function ES({message}:{message:string}) {
  return <div className="flex items-center justify-center py-10 text-sm text-stone-400">{message}</div>;
}
function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}/>
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
function StatCard({label,value,sub}:{label:string;value:string|number;sub?:string}) {
  return (
    <div className="bg-white border border-stone-200/60 rounded-xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}
function SectionTitle({children}:{children:React.ReactNode}) {
  return <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{children}</p>;
}

// ── Task Assignment Modal ──────────────────────────────────────────────────────
function TaskAssignModal({
  open, onClose, interns, teamId, subteamId, createdBy, sb, onCreated,
}:{
  open:boolean; onClose:()=>void; interns:Profile[];
  teamId?:string; subteamId?:string|null; createdBy:string;
  sb:any; onCreated:(t:Task)=>void;
}) {
  const [form,setForm] = useState({title:"",description:"",assigned_to:"",priority:"medium",due_date:""});
  const [saving,setSaving] = useState(false);
  async function submit() {
    if (!form.title.trim()||!form.assigned_to) return;
    setSaving(true);
    const { data, error } = await sb.from("tasks").insert({
      title: form.title.trim(), description: form.description||null,
      assigned_to: form.assigned_to, priority: form.priority,
      due_date: form.due_date||null, status: "not_started",
      team_id: teamId||null, subteam_id: subteamId||null, created_by: createdBy,
    }).select().single();
    setSaving(false);
    if (!error && data) { onCreated(data as Task); onClose(); setForm({title:"",description:"",assigned_to:"",priority:"medium",due_date:""}); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Assign Task">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Title *</label>
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title…" className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Assign To *</label>
            <select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400">
              <option value="">— select —</option>
              {interns.map(i=><option key={i.id} value={i.id}>{i.full_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Priority</label>
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400">
              {["low","medium","high","urgent"].map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Due Date</label>
          <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <button onClick={submit} disabled={saving||!form.title.trim()||!form.assigned_to} className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 size={15} className="animate-spin"/> : <CheckSquare size={15}/>}
          {saving ? "Saving…" : "Assign Task"}
        </button>
      </div>
    </Modal>
  );
}

// ── Announcement Post Modal ────────────────────────────────────────────────────
function AnnouncementModal({
  open, onClose, createdBy, teamId, subteamId,
  teamName, subteamName, allowTeamScope, sb, onPosted,
}:{
  open:boolean; onClose:()=>void; createdBy:string;
  teamId?:string; subteamId?:string|null; teamName?:string; subteamName?:string;
  allowTeamScope?:boolean; sb:any; onPosted:(a:Announcement)=>void;
}) {
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [scope,setScope] = useState<"subteam"|"team">("subteam");
  const [saving,setSaving] = useState(false);

  async function post() {
    if (!title.trim()) return;
    setSaving(true);
    const isSubteamScope = scope === "subteam" && !!subteamId;
    const { data, error } = await sb.from("announcements").insert({
      title: title.trim(), body: body.trim()||null,
      target_type: isSubteamScope ? "subteam" : "team",
      team_id: teamId||null,
      subteam_id: isSubteamScope ? subteamId : null,
      created_by: createdBy,
    }).select().single();
    setSaving(false);
    if (!error && data) { onPosted(data as Announcement); onClose(); setTitle(""); setBody(""); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Post Announcement">
      <div className="flex flex-col gap-4">
        {allowTeamScope && subteamId && (
          <div className="flex gap-2">
            {(["subteam","team"] as const).map(s=>(
              <button key={s} onClick={()=>setScope(s)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${scope===s?"bg-stone-800 text-white border-stone-800":"bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}>
                {s==="subteam" ? `${subteamName||"Subteam"} only` : `Entire ${teamName||"Team"}`}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Title *</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title…" className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Body</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Optional details…" className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
        </div>
        <button onClick={post} disabled={saving||!title.trim()} className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
          {saving ? "Posting…" : "Post Announcement"}
        </button>
      </div>
    </Modal>
  );
}

// ── Intern Report Form (multi-team version) ────────────────────────────────────
function MTReportForm({profile,reports,setReports,sb}:{profile:Profile;reports:Report[];setReports:(r:Report[])=>void;sb:any}) {
  const [form,setForm] = useState({week_of:"",tasks_completed:"",wins:"",challenges:"",ideas:""});
  const [saving,setSaving] = useState(false);
  const myReports = reports.filter(r=>r.intern_id===profile.id).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  async function submit() {
    if (!form.week_of) return;
    setSaving(true);
    const { data, error } = await sb.from("weekly_reports").insert({
      intern_id: profile.id, week_of: form.week_of,
      tasks_completed: form.tasks_completed, wins: form.wins,
      challenges: form.challenges, ideas: form.ideas,
      reviewed: false, created_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setReports([data as Report, ...reports]);
      setForm({week_of:"",tasks_completed:"",wins:"",challenges:"",ideas:""});
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Weekly Report</h2>
        <p className="text-xs text-stone-400 mt-0.5">Submit before each Friday 5 pm</p>
      </div>

      {/* Submit form */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-4 flex flex-col gap-4">
        <SectionTitle>New Submission</SectionTitle>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Week of *</label>
          <input type="date" value={form.week_of} onChange={e=>setForm({...form,week_of:e.target.value})} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Tasks Completed</label>
          <textarea value={form.tasks_completed} onChange={e=>setForm({...form,tasks_completed:e.target.value})} rows={2} placeholder="What did you finish this week?" className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([["wins","🏆 Wins","What went well?"],["challenges","⚡ Challenges","What was tough?"],["ideas","💡 Ideas","Any new ideas?"]] as const).map(([k,label,ph])=>(
            <div key={k} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
              <textarea value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} rows={2} placeholder={ph} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
            </div>
          ))}
        </div>
        <button onClick={submit} disabled={saving||!form.week_of} className="self-end px-5 py-2.5 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
          {saving ? "Submitting…" : "Submit Report"}
        </button>
      </div>

      {/* Past reports */}
      {myReports.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionTitle>Previous Reports</SectionTitle>
          {myReports.slice(0,5).map(r=>(
            <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-stone-800">Week of {fmt(r.week_of||r.created_at)}</p>
                {r.reviewed ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Reviewed</span> : <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Pending review</span>}
              </div>
              {r.tasks_completed && <p className="text-xs text-stone-500 line-clamp-2">{r.tasks_completed}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Multi-Team Intern Dashboard ────────────────────────────────────────────────
export function MultiTeamInternDash({profile,myTeamRoles,teams,subteams,tasks,announcements,reports,setReports,sb}:{
  profile:Profile; myTeamRoles:MTTeamRole[]; teams:MTTeam[]; subteams:MTSubteam[];
  tasks:Task[]; announcements:Announcement[]; reports:Report[]; setReports:(r:Report[])=>void; sb:any;
}) {
  const [myContract,setMyContract] = useState<{signed_at:string|null;pdf_url:string|null}|null>(null);
  const [page,setPage] = useState<"home"|"tasks"|"report"|"announcements">("home");

  useEffect(()=>{
    sb.from("contracts").select("signed_at,pdf_url").eq("user_id",profile.id).maybeSingle().then(({data}:any)=>{ if(data) setMyContract(data); });
  },[profile.id,sb]);

  const myTasks = tasks.filter(t=>t.assigned_to===profile.id);
  const activeTasks = myTasks.filter(t=>t.status!=="completed");
  const completedTasks = myTasks.filter(t=>t.status==="completed");

  // Scoped announcements
  const myTeamIds = myTeamRoles.map(r=>r.team_id);
  const mySubteamIds = myTeamRoles.map(r=>r.subteam_id).filter(Boolean) as string[];
  const myAnnouncements = announcements.filter(a=>
    !a.target_type || a.target_type==="global" ||
    (a.target_type==="team" && a.team_id && myTeamIds.includes(a.team_id)) ||
    (a.target_type==="subteam" && a.subteam_id && mySubteamIds.includes(a.subteam_id))
  );

  // Team/subteam labels
  const firstRole = myTeamRoles[0];
  const myTeam = firstRole ? teams.find(t=>t.id===firstRole.team_id) : null;
  const mySubteam = firstRole?.subteam_id ? subteams.find(s=>s.id===firstRole.subteam_id) : null;
  const first = profile.full_name.split(" ")[0];

  const NAV = [
    {id:"home" as const, icon:<LayoutDashboard size={16}/>, label:"Dashboard"},
    {id:"tasks" as const, icon:<CheckSquare size={16}/>, label:`My Tasks (${activeTasks.length})`},
    {id:"report" as const, icon:<FileText size={16}/>, label:"Weekly Report"},
    {id:"announcements" as const, icon:<Bell size={16}/>, label:"Announcements"},
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Mobile nav pills */}
      <div className="flex gap-1 flex-wrap">
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${page===n.id?"bg-stone-800 text-white":"bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
            {n.icon}{n.label}
          </button>
        ))}
      </div>

      {page==="home" && (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-xl font-bold text-stone-800">Hey {first} 👋</h1>
            <p className="text-xs text-stone-400 mt-0.5">{mySubteam?.name||myTeam?.name||"Cloud Closet"} · {profile.email}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Active Tasks" value={activeTasks.length}/>
            <StatCard label="Completed" value={completedTasks.length}/>
            <StatCard label="Reports Submitted" value={reports.filter(r=>r.intern_id===profile.id).length}/>
            <StatCard label="Announcements" value={myAnnouncements.length}/>
          </div>

          {/* Tasks preview */}
          <div className="bg-white border border-stone-200/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Active Tasks</SectionTitle>
              <button onClick={()=>setPage("tasks")} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">View all<ChevronRight size={12}/></button>
            </div>
            {activeTasks.length===0 ? <ES message="No active tasks — nice work!"/> : (
              <div className="flex flex-col gap-2">
                {activeTasks.slice(0,4).map(t=>(
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                    <SD status={t.status}/><div className="flex-1 min-w-0"><p className="text-sm text-stone-700 truncate">{t.title}</p>{t.due_date&&<p className="text-xs text-stone-400">Due {fmt(t.due_date)}</p>}</div><PBadge priority={t.priority}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pinned announcements */}
          {myAnnouncements.filter(a=>a.pinned).slice(0,2).map(a=>(
            <div key={a.id} className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Announcement</p>
              <p className="text-sm font-medium text-amber-800">{a.title}</p>
              {a.body && <p className="text-xs text-amber-700 mt-1">{a.body}</p>}
            </div>
          ))}

          {/* Contract */}
          {myContract?.signed_at && myContract?.pdf_url && (
            <div className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-center justify-between">
              <div><p className="text-sm font-semibold text-stone-700">My Contract</p><p className="text-xs text-stone-400">Signed {fmt(myContract.signed_at)}</p></div>
              <a href={myContract.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors"><ArrowUpRight size={12}/>View PDF</a>
            </div>
          )}
        </div>
      )}

      {page==="tasks" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-stone-800">My Tasks</h2>
          {myTasks.length===0 ? <ES message="No tasks assigned yet"/> : (
            <div className="flex flex-col gap-2">
              {myTasks.map(t=>(
                <div key={t.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <SD status={t.status}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{t.title}</p>
                      {t.description && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{t.description}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <PBadge priority={t.priority}/>
                        {t.due_date && <span className="text-xs text-stone-400">Due {fmt(t.due_date)}</span>}
                        <span className="text-xs text-stone-400 capitalize">{t.status.replace("_"," ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {page==="report" && <MTReportForm profile={profile} reports={reports} setReports={setReports} sb={sb}/>}

      {page==="announcements" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-stone-800">Announcements</h2>
          {myAnnouncements.length===0 ? <ES message="No announcements yet"/> : (
            <div className="flex flex-col gap-3">
              {myAnnouncements.map(a=>(
                <div key={a.id} className={`bg-white border rounded-xl p-4 ${a.pinned?"border-amber-300":"border-stone-200/60"}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.pinned && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pinned</span>}
                    {a.target_type && a.target_type!=="global" && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize">{a.target_type}</span>}
                    <span className="text-xs text-stone-400 ml-auto">{fmt(a.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">{a.title}</p>
                  {a.body && <p className="text-sm text-stone-500 mt-1">{a.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared: Intern Card for exec views ────────────────────────────────────────
function InternCard({intern,tasks,onAssignTask}:{intern:Profile;tasks:Task[];onAssignTask:(internId:string)=>void}) {
  const myTasks = tasks.filter(t=>t.assigned_to===intern.id);
  const done = myTasks.filter(t=>t.status==="completed").length;
  const pct = myTasks.length>0 ? Math.round((done/myTasks.length)*100) : 0;
  const active = myTasks.filter(t=>t.status!=="completed");
  return (
    <div className="bg-white border border-stone-200/60 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <Av name={intern.full_name} size={36}/>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">{intern.full_name}</p>
          <p className="text-xs text-stone-400 truncate">{intern.email}</p>
        </div>
        <button onClick={()=>onAssignTask(intern.id)} className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Assign task"><Plus size={13}/></button>
      </div>
      {/* Task progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-stone-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-emerald-400 transition-all" style={{width:`${pct}%`}}/>
        </div>
        <span className="text-xs text-stone-400 flex-shrink-0">{done}/{myTasks.length}</span>
      </div>
      {active.length>0 && (
        <div className="mt-3 flex flex-col gap-1">
          {active.slice(0,2).map(t=>(
            <div key={t.id} className="flex items-center gap-2 text-xs text-stone-500">
              <SD status={t.status}/><span className="truncate">{t.title}</span>{t.due_date&&<span className="text-stone-300 flex-shrink-0">{fmt(t.due_date)}</span>}
            </div>
          ))}
          {active.length>2 && <p className="text-xs text-stone-400">+{active.length-2} more</p>}
        </div>
      )}
    </div>
  );
}

// ── Subteam Exec Dashboard ────────────────────────────────────────────────────
export function SubteamExecDash({profile,myTeamRoles,teams,subteams,allTeamRoles,interns,tasks,setTasks,reports,announcements,setAnnouncements,sb}:{
  profile:Profile; myTeamRoles:MTTeamRole[]; teams:MTTeam[]; subteams:MTSubteam[];
  allTeamRoles:MTTeamRole[]; interns:Profile[]; tasks:Task[]; setTasks:(t:Task[])=>void;
  reports:Report[]; announcements:Announcement[]; setAnnouncements:(a:Announcement[])=>void; sb:any;
}) {
  const [tab,setTab] = useState<"overview"|"tasks"|"reports"|"announcements">("overview");
  const [showTask,setShowTask] = useState(false);
  const [showAnnouncement,setShowAnnouncement] = useState(false);
  const [preAssign,setPreAssign] = useState<string>("");
  const [expandedReport,setExpandedReport] = useState<string|null>(null);

  // My subteam
  const myRole = myTeamRoles.find(r=>r.role==="subteam_exec");
  const myTeam  = myRole ? teams.find(t=>t.id===myRole.team_id) : null;
  const mySubteam = myRole?.subteam_id ? subteams.find(s=>s.id===myRole.subteam_id) : null;

  // Interns in my subteam
  const subteamMemberIds = allTeamRoles.filter(r=>r.subteam_id===myRole?.subteam_id && r.role==="intern").map(r=>r.user_id);
  const subteamInterns = interns.filter(i=>subteamMemberIds.includes(i.id));

  // Tasks for my interns
  const myTasks = tasks.filter(t=>subteamMemberIds.includes(t.assigned_to||""));

  // Reports from my interns
  const myReports = reports.filter(r=>r.intern_id && subteamMemberIds.includes(r.intern_id)).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  // Announcements scoped to global + my team + my subteam
  const myAnnouncements = announcements.filter(a=>
    !a.target_type||a.target_type==="global" ||
    (a.target_type==="team" && a.team_id===myRole?.team_id) ||
    (a.target_type==="subteam" && a.subteam_id===myRole?.subteam_id)
  );

  const TABS = [
    {id:"overview" as const, label:"Overview"},
    {id:"tasks" as const, label:`Tasks (${myTasks.filter(t=>t.status!=="completed").length})`},
    {id:"reports" as const, label:`Reports (${myReports.length})`},
    {id:"announcements" as const, label:"Announcements"},
  ];

  const iName = (id?:string) => interns.find(i=>i.id===id)?.full_name || "Unknown";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-stone-800">{mySubteam?.name||"My Subteam"}</h1>
          <p className="text-xs text-stone-400 mt-0.5">{myTeam?.name} · Subteam Exec</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowAnnouncement(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-600 text-xs font-medium rounded-xl hover:border-stone-400 transition-colors"><Bell size={13}/>Announce</button>
          <button onClick={()=>{setPreAssign("");setShowTask(true);}} className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 transition-colors"><Plus size={13}/>Assign Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t.id?"bg-white text-stone-800 shadow-sm":"text-stone-500 hover:text-stone-700"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Interns" value={subteamInterns.length}/>
            <StatCard label="Active Tasks" value={myTasks.filter(t=>t.status!=="completed").length}/>
            <StatCard label="Completed" value={myTasks.filter(t=>t.status==="completed").length}/>
            <StatCard label="Reports" value={myReports.length}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subteamInterns.map(i=>(
              <InternCard key={i.id} intern={i} tasks={tasks} onAssignTask={id=>{setPreAssign(id);setShowTask(true);}}/>
            ))}
          </div>
          {subteamInterns.length===0 && <ES message="No interns assigned to this subteam yet."/>}
        </div>
      )}

      {tab==="tasks" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionTitle>All Tasks</SectionTitle>
            <button onClick={()=>{setPreAssign("");setShowTask(true);}} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"><Plus size={12}/>New</button>
          </div>
          {myTasks.length===0 ? <ES message="No tasks assigned yet"/> : (
            <div className="flex flex-col gap-2">
              {myTasks.map(t=>(
                <div key={t.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <SD status={t.status}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-stone-800">{t.title}</p>
                        <PBadge priority={t.priority}/>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{iName(t.assigned_to)} {t.due_date?`· Due ${fmt(t.due_date)}`:""}</p>
                    </div>
                    <select value={t.status} onChange={async e=>{const s=e.target.value;await sb.from("tasks").update({status:s}).eq("id",t.id);setTasks(tasks.map(x=>x.id===t.id?{...x,status:s}:x));}} className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-600 focus:outline-none flex-shrink-0">
                      {["not_started","in_progress","submitted","completed"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="reports" && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Submitted Reports</SectionTitle>
          {myReports.length===0 ? <ES message="No reports submitted yet"/> : (
            <div className="flex flex-col gap-2">
              {myReports.map(r=>(
                <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={()=>setExpandedReport(expandedReport===r.id?null:r.id)}>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{iName(r.intern_id)}</p>
                      <p className="text-xs text-stone-400">Week of {fmt(r.week_of||r.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.reviewed ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Reviewed</span> : (
                        <button onClick={async e=>{e.stopPropagation();await sb.from("weekly_reports").update({reviewed:true}).eq("id",r.id);}} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors">Mark reviewed</button>
                      )}
                      <ChevronDown size={14} className={`text-stone-400 transition-transform ${expandedReport===r.id?"rotate-180":""}`}/>
                    </div>
                  </div>
                  {expandedReport===r.id && (
                    <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                      {r.tasks_completed && <div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Tasks</p><p>{r.tasks_completed}</p></div>}
                      {r.wins && <div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Wins</p><p>{r.wins}</p></div>}
                      {r.challenges && <div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Challenges</p><p>{r.challenges}</p></div>}
                      {r.ideas && <div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Ideas</p><p>{r.ideas}</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="announcements" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionTitle>Announcements</SectionTitle>
            <button onClick={()=>setShowAnnouncement(true)} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"><Plus size={12}/>New</button>
          </div>
          {myAnnouncements.length===0 ? <ES message="No announcements yet"/> : (
            <div className="flex flex-col gap-2">
              {myAnnouncements.map(a=>(
                <div key={a.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pinned</span>}
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize">{a.target_type||"global"}</span>
                    <span className="text-xs text-stone-400 ml-auto">{fmt(a.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">{a.title}</p>
                  {a.body && <p className="text-xs text-stone-500 mt-1">{a.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <TaskAssignModal open={showTask} onClose={()=>setShowTask(false)} interns={subteamInterns.length>0?subteamInterns:[...subteamInterns]}
        teamId={myRole?.team_id} subteamId={myRole?.subteam_id} createdBy={profile.id} sb={sb}
        onCreated={t=>setTasks([t,...tasks])}/>
      <AnnouncementModal open={showAnnouncement} onClose={()=>setShowAnnouncement(false)}
        createdBy={profile.id} teamId={myRole?.team_id} subteamId={myRole?.subteam_id}
        teamName={myTeam?.name} subteamName={mySubteam?.name} allowTeamScope={false} sb={sb}
        onPosted={a=>setAnnouncements([a,...announcements])}/>
    </div>
  );
}

// ── Team Exec Dashboard ────────────────────────────────────────────────────────
export function TeamExecDash({profile,myTeamRoles,teams,subteams,allTeamRoles,interns,tasks,setTasks,reports,announcements,setAnnouncements,sb}:{
  profile:Profile; myTeamRoles:MTTeamRole[]; teams:MTTeam[]; subteams:MTSubteam[];
  allTeamRoles:MTTeamRole[]; interns:Profile[]; tasks:Task[]; setTasks:(t:Task[])=>void;
  reports:Report[]; announcements:Announcement[]; setAnnouncements:(a:Announcement[])=>void; sb:any;
}) {
  // Ella may have multiple team_exec roles → team switcher
  const myExecRoles = myTeamRoles.filter(r=>r.role==="team_exec");
  const [activeTeamId,setActiveTeamId] = useState(myExecRoles[0]?.team_id||"");
  const [tab,setTab] = useState<"overview"|"tasks"|"reports"|"announcements">("overview");
  const [showTask,setShowTask] = useState(false);
  const [showAnnouncement,setShowAnnouncement] = useState(false);
  const [expandedReport,setExpandedReport] = useState<string|null>(null);

  const activeTeam = teams.find(t=>t.id===activeTeamId);
  const mySubteams = subteams.filter(s=>s.team_id===activeTeamId);

  // All interns on this team
  const teamMemberIds = allTeamRoles.filter(r=>r.team_id===activeTeamId&&r.role==="intern").map(r=>r.user_id);
  const teamInterns = interns.filter(i=>teamMemberIds.includes(i.id));

  const teamTasks = tasks.filter(t=>teamMemberIds.includes(t.assigned_to||"")||t.team_id===activeTeamId);
  const teamReports = reports.filter(r=>r.intern_id&&teamMemberIds.includes(r.intern_id)).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  const teamAnnouncements = announcements.filter(a=>
    !a.target_type||a.target_type==="global"||
    (a.target_type==="team"&&a.team_id===activeTeamId)||
    (a.target_type==="subteam"&&mySubteams.some(s=>s.id===a.subteam_id))
  );

  const getSubteamName = (internId:string) => {
    const role = allTeamRoles.find(r=>r.user_id===internId&&r.team_id===activeTeamId);
    return role?.subteam_id ? subteams.find(s=>s.id===role.subteam_id)?.name||"" : "";
  };
  const iName = (id?:string) => interns.find(i=>i.id===id)?.full_name||"Unknown";

  const TABS = [
    {id:"overview" as const,label:"Overview"},
    {id:"tasks" as const,label:`Tasks (${teamTasks.filter(t=>t.status!=="completed").length})`},
    {id:"reports" as const,label:`Reports (${teamReports.length})`},
    {id:"announcements" as const,label:"Announcements"},
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header + team switcher */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-stone-800">{activeTeam?.name||"My Team"}</h1>
          {myExecRoles.length>1 && (
            <div className="flex gap-1 flex-wrap">
              {myExecRoles.map(r=>{const t=teams.find(x=>x.id===r.team_id); return t ? (
                <button key={r.team_id} onClick={()=>setActiveTeamId(r.team_id)} style={activeTeamId===r.team_id?{background:t.color,color:"#1c1917"}:{}} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeTeamId===r.team_id?"border-transparent":"border-stone-200 text-stone-500 hover:border-stone-400"}`}>{t.name}</button>
              ):null;})}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowAnnouncement(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-600 text-xs font-medium rounded-xl hover:border-stone-400 transition-colors"><Bell size={13}/>Announce</button>
          <button onClick={()=>setShowTask(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 transition-colors"><Plus size={13}/>Assign Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t.id?"bg-white text-stone-800 shadow-sm":"text-stone-500 hover:text-stone-700"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Interns" value={teamInterns.length}/>
            <StatCard label="Active Tasks" value={teamTasks.filter(t=>t.status!=="completed").length}/>
            <StatCard label="Completed" value={teamTasks.filter(t=>t.status==="completed").length}/>
            <StatCard label="Reports" value={teamReports.length}/>
          </div>
          {/* Subteam grouping */}
          {mySubteams.length>0 ? mySubteams.map(sub=>{
            const subIds = allTeamRoles.filter(r=>r.subteam_id===sub.id&&r.role==="intern").map(r=>r.user_id);
            const subInterns = teamInterns.filter(i=>subIds.includes(i.id));
            return (
              <div key={sub.id}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">{sub.name}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subInterns.map(i=><InternCard key={i.id} intern={i} tasks={tasks} onAssignTask={()=>setShowTask(true)}/>)}
                  {subInterns.length===0 && <p className="text-xs text-stone-400 col-span-2">No interns in {sub.name} yet</p>}
                </div>
              </div>
            );
          }) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamInterns.map(i=><InternCard key={i.id} intern={i} tasks={tasks} onAssignTask={()=>setShowTask(true)}/>)}
              {teamInterns.length===0 && <ES message="No interns on this team yet."/>}
            </div>
          )}
        </div>
      )}

      {tab==="tasks" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><SectionTitle>Team Tasks</SectionTitle><button onClick={()=>setShowTask(true)} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"><Plus size={12}/>New</button></div>
          {teamTasks.length===0 ? <ES message="No tasks yet"/> : (
            <div className="flex flex-col gap-2">
              {teamTasks.map(t=>(
                <div key={t.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <SD status={t.status}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 flex-wrap items-center"><p className="text-sm font-medium text-stone-800">{t.title}</p><PBadge priority={t.priority}/></div>
                      <p className="text-xs text-stone-400 mt-0.5">{iName(t.assigned_to)}{t.assigned_to&&getSubteamName(t.assigned_to)?` · ${getSubteamName(t.assigned_to)}`:""}{t.due_date?` · Due ${fmt(t.due_date)}`:""}</p>
                    </div>
                    <select value={t.status} onChange={async e=>{const s=e.target.value;await sb.from("tasks").update({status:s}).eq("id",t.id);setTasks(tasks.map(x=>x.id===t.id?{...x,status:s}:x));}} className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-600 focus:outline-none flex-shrink-0">
                      {["not_started","in_progress","submitted","completed"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="reports" && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Team Reports</SectionTitle>
          {teamReports.length===0 ? <ES message="No reports submitted yet"/> : (
            <div className="flex flex-col gap-2">
              {teamReports.map(r=>(
                <div key={r.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={()=>setExpandedReport(expandedReport===r.id?null:r.id)}>
                    <div><p className="text-sm font-semibold text-stone-800">{iName(r.intern_id)}</p><p className="text-xs text-stone-400">Week of {fmt(r.week_of||r.created_at)}</p></div>
                    <div className="flex items-center gap-2">
                      {r.reviewed ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Reviewed</span> : (
                        <button onClick={async e=>{e.stopPropagation();await sb.from("weekly_reports").update({reviewed:true}).eq("id",r.id);}} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors">Mark reviewed</button>
                      )}
                      <ChevronDown size={14} className={`text-stone-400 transition-transform ${expandedReport===r.id?"rotate-180":""}`}/>
                    </div>
                  </div>
                  {expandedReport===r.id && (
                    <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                      {r.tasks_completed&&<div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Tasks</p><p>{r.tasks_completed}</p></div>}
                      {r.wins&&<div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Wins</p><p>{r.wins}</p></div>}
                      {r.challenges&&<div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Challenges</p><p>{r.challenges}</p></div>}
                      {r.ideas&&<div><p className="font-semibold text-stone-400 uppercase tracking-widest mb-1">Ideas</p><p>{r.ideas}</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="announcements" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><SectionTitle>Announcements</SectionTitle><button onClick={()=>setShowAnnouncement(true)} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"><Plus size={12}/>New</button></div>
          {teamAnnouncements.length===0 ? <ES message="No announcements yet"/> : (
            <div className="flex flex-col gap-2">
              {teamAnnouncements.map(a=>(
                <div key={a.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">{a.pinned&&<span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pinned</span>}<span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize">{a.target_type||"global"}</span><span className="text-xs text-stone-400 ml-auto">{fmt(a.created_at)}</span></div>
                  <p className="text-sm font-semibold text-stone-800">{a.title}</p>
                  {a.body&&<p className="text-xs text-stone-500 mt-1">{a.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <TaskAssignModal open={showTask} onClose={()=>setShowTask(false)} interns={teamInterns}
        teamId={activeTeamId} createdBy={profile.id} sb={sb} onCreated={t=>setTasks([t,...tasks])}/>
      <AnnouncementModal open={showAnnouncement} onClose={()=>setShowAnnouncement(false)}
        createdBy={profile.id} teamId={activeTeamId}
        subteamId={myExecRoles.find(r=>r.team_id===activeTeamId)?.subteam_id||null}
        teamName={activeTeam?.name} allowTeamScope={true} sb={sb}
        onPosted={a=>setAnnouncements([a,...announcements])}/>
    </div>
  );
}

// ── IRM Dashboard ──────────────────────────────────────────────────────────────
export function IRMDash({profile,teams,subteams,allTeamRoles,interns,tasks,internNotes,setInternNotes,sb}:{
  profile:Profile; teams:MTTeam[]; subteams:MTSubteam[];
  allTeamRoles:MTTeamRole[]; interns:Profile[]; tasks:Task[];
  internNotes:MTInternNote[]; setInternNotes:(n:MTInternNote[])=>void; sb:any;
}) {
  const [search,setSearch] = useState("");
  const [selectedIntern,setSelectedIntern] = useState<Profile|null>(null);
  const [noteText,setNoteText] = useState("");
  const [flagLevel,setFlagLevel] = useState<"none"|"watch"|"concern"|"urgent">("none");
  const [savingNote,setSavingNote] = useState(false);

  const getTeamLabel = (internId:string) => {
    const roles = allTeamRoles.filter(r=>r.user_id===internId&&r.role==="intern");
    return roles.map(r=>{const t=teams.find(x=>x.id===r.team_id);const s=r.subteam_id?subteams.find(x=>x.id===r.subteam_id):null;return s?s.name:t?.name||"";}).filter(Boolean).join(" · ");
  };
  const getTopNote = (internId:string) => internNotes.filter(n=>n.intern_id===internId).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];

  const filtered = interns.filter(i=>i.full_name.toLowerCase().includes(search.toLowerCase())||i.email.toLowerCase().includes(search.toLowerCase()));

  // Group by team
  const grouped = useMemo(()=>{
    const teamMap: Record<string,Profile[]> = {"Unassigned":[]};
    teams.forEach(t=>{ teamMap[t.name]=[]; });
    filtered.forEach(i=>{
      const role = allTeamRoles.find(r=>r.user_id===i.id&&r.role==="intern");
      const teamName = role?teams.find(t=>t.id===role.team_id)?.name||"Unassigned":"Unassigned";
      if (!teamMap[teamName]) teamMap[teamName]=[];
      teamMap[teamName].push(i);
    });
    return teamMap;
  },[filtered,allTeamRoles,teams]);

  async function addNote() {
    if (!noteText.trim()||!selectedIntern) return;
    setSavingNote(true);
    const { data } = await sb.from("intern_notes").insert({intern_id:selectedIntern.id,created_by:profile.id,note:noteText.trim(),flag_level:flagLevel}).select().single();
    setSavingNote(false);
    if (data) { setInternNotes([data as MTInternNote,...internNotes]); setNoteText(""); setFlagLevel("none"); }
  }

  const selectedNotes = selectedIntern ? internNotes.filter(n=>n.intern_id===selectedIntern.id).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()) : [];
  const selectedTasks = selectedIntern ? tasks.filter(t=>t.assigned_to===selectedIntern.id) : [];
  const selectedDone = selectedTasks.filter(t=>t.status==="completed").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-stone-800">All Interns</h1>
        <p className="text-xs text-stone-400 mt-0.5">IRM view · read-only</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Interns" value={interns.length}/>
        <StatCard label="Flagged" value={interns.filter(i=>{ const n=getTopNote(i.id); return n&&n.flag_level!=="none"; }).length}/>
        <StatCard label="Notes" value={internNotes.length}/>
        <StatCard label="Teams" value={teams.length}/>
      </div>

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search interns by name or email…" className="px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>

      {/* Grouped list */}
      {Object.entries(grouped).map(([teamName,members])=>{
        if (!members.length) return null;
        return (
          <div key={teamName}>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">{teamName} <span className="font-normal text-stone-300">({members.length})</span></p>
            <div className="flex flex-col gap-2">
              {members.map(i=>{
                const topNote = getTopNote(i.id);
                const myTasks = tasks.filter(t=>t.assigned_to===i.id);
                const done = myTasks.filter(t=>t.status==="completed").length;
                const pct = myTasks.length>0?Math.round((done/myTasks.length)*100):0;
                return (
                  <div key={i.id} onClick={()=>setSelectedIntern(i)} className="bg-white border border-stone-200/60 rounded-xl p-4 cursor-pointer hover:border-stone-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <Av name={i.full_name} size={36}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-semibold text-stone-800">{i.full_name}</p>{topNote&&topNote.flag_level!=="none"&&<FlagBadge level={topNote.flag_level}/>}</div>
                        <p className="text-xs text-stone-400 truncate">{getTeamLabel(i.id)||i.email}</p>
                        {i.university && <p className="text-xs text-stone-400">{i.university}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-stone-600">{pct}%</p>
                        <p className="text-[10px] text-stone-400">{done}/{myTasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="bg-stone-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-emerald-400" style={{width:`${pct}%`}}/></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Intern detail modal */}
      {selectedIntern && (
        <Modal open={!!selectedIntern} onClose={()=>setSelectedIntern(null)} title={selectedIntern.full_name}>
          <div className="flex flex-col gap-5">
            {/* Profile info */}
            <div className="flex items-center gap-3">
              <Av name={selectedIntern.full_name} size={44}/>
              <div>
                <p className="text-sm font-semibold text-stone-800">{selectedIntern.full_name}</p>
                <p className="text-xs text-stone-400">{selectedIntern.email}</p>
                <p className="text-xs text-stone-400">{getTeamLabel(selectedIntern.id)}</p>
                {selectedIntern.university && <p className="text-xs text-stone-500 mt-0.5">🎓 {selectedIntern.university}</p>}
              </div>
            </div>

            {/* Task progress */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Tasks ({selectedDone}/{selectedTasks.length})</p>
              <div className="bg-stone-100 rounded-full h-2 mb-3"><div className="h-2 rounded-full bg-emerald-400" style={{width:`${selectedTasks.length>0?Math.round((selectedDone/selectedTasks.length)*100):0}%`}}/></div>
              <div className="flex flex-col gap-1.5">
                {selectedTasks.slice(0,5).map(t=>(
                  <div key={t.id} className="flex items-center gap-2 text-xs text-stone-600"><SD status={t.status}/><span className="flex-1 truncate">{t.title}</span><PBadge priority={t.priority}/></div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Internal Notes (IRM only)</p>
              <div className="flex flex-col gap-2 mb-3">
                {selectedNotes.length===0 ? <p className="text-xs text-stone-400">No notes yet.</p> : selectedNotes.map(n=>(
                  <div key={n.id} className="bg-stone-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1"><FlagBadge level={n.flag_level}/><span className="text-xs text-stone-400 ml-auto">{fmt(n.created_at)}</span></div>
                    <p className="text-xs text-stone-700">{n.note}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
                <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2} placeholder="Add an internal note…" className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"/>
                <div className="flex gap-2">
                  {(["none","watch","concern","urgent"] as const).map(f=>(
                    <button key={f} onClick={()=>setFlagLevel(f)} style={flagLevel===f?{background:FLAG_COLORS[f].bg,color:FLAG_COLORS[f].text}:{}} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${flagLevel===f?"border-transparent":"border-stone-200 text-stone-500 hover:border-stone-300"}`}>{f==="none"?"None":FLAG_COLORS[f].label}</button>
                  ))}
                </div>
                <button onClick={addNote} disabled={savingNote||!noteText.trim()} className="w-full py-2.5 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                  {savingNote?<Loader2 size={13} className="animate-spin"/>:<Send size={13}/>} Add Note
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Admin Schools Tab ──────────────────────────────────────────────────────────
// ── Inline university tag (editable) ─────────────────────────────────────────
function UniTag({intern,onUpdate,sb}:{intern:Profile;onUpdate:(v:string)=>void;sb:any}) {
  const [editing,setEditing] = useState(false);
  const [draft,setDraft] = useState((intern as any).university||"");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(()=>{ if(editing) ref.current?.focus(); },[editing]);
  async function save() {
    const val=draft.trim();
    await sb.from("profiles").update({university:val||null}).eq("id",intern.id);
    onUpdate(val);
    setEditing(false);
  }
  if (editing) return (
    <input ref={ref} value={draft} onChange={e=>setDraft(e.target.value)}
      onBlur={save} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}}
      className="text-xs px-2 py-0.5 bg-white border border-stone-300 rounded-full w-40 focus:outline-none focus:border-stone-500"/>
  );
  const uni=(intern as any).university as string|undefined;
  return (
    <button onClick={()=>{setDraft(uni||"");setEditing(true);}}
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${uni?"bg-blue-50 text-blue-700 hover:bg-blue-100":"bg-stone-100 text-stone-400 hover:bg-stone-200"}`}>
      {uni||"+ school"}
    </button>
  );
}

// ── Intern edit modal ─────────────────────────────────────────────────────────
function InternEditModal({open,onClose,intern,teams,subteams,allTeamRoles,onSaved,sb}:{
  open:boolean; onClose:()=>void; intern:Profile|null;
  teams:MTTeam[]; subteams:MTSubteam[]; allTeamRoles:MTTeamRole[];
  onSaved:(updated:Profile,updatedRoles:MTTeamRole[])=>void; sb:any;
}) {
  const [form,setForm] = useState({full_name:"",university:""});
  const [subteamId,setSubteamId] = useState("");
  const [teamId,setTeamId] = useState("");
  const [originalTeamId,setOriginalTeamId] = useState("");
  const [mtRole,setMtRole] = useState("intern");
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState("");

  useEffect(()=>{
    if(!intern||!open) return;
    setForm({full_name:intern.full_name, university:(intern as any).university||""});
    setErr("");
    const myRoles = allTeamRoles.filter(r=>r.user_id===intern.id);
    const first = myRoles[0];
    setTeamId(first?.team_id||"");
    setOriginalTeamId(first?.team_id||"");
    setSubteamId(first?.subteam_id||"");
    setMtRole(first?.role||"intern");
  },[intern,open,allTeamRoles]);

  const subteamsForTeam = subteams.filter(s=>s.team_id===teamId);

  async function save() {
    if(!intern||!form.full_name.trim()) return;
    setSaving(true); setErr("");
    const {data:updatedProf,error} = await sb.from("profiles")
      .update({full_name:form.full_name.trim(), university:form.university.trim()||null})
      .eq("id",intern.id).select().single();
    if(error){setErr("Failed to save profile.");setSaving(false);return;}
    if(teamId){
      // Delete from the original team, insert into the (possibly new) team
      if(originalTeamId) await sb.from("user_team_roles").delete().eq("user_id",intern.id).eq("team_id",originalTeamId);
      await sb.from("user_team_roles").insert({user_id:intern.id,team_id:teamId,subteam_id:subteamId||null,role:mtRole});
    }
    const {data:freshRoles} = await sb.from("user_team_roles").select("*").eq("user_id",intern.id);
    const updatedRoles=[
      ...allTeamRoles.filter(r=>r.user_id!==intern.id),
      ...((freshRoles||[]) as MTTeamRole[]),
    ];
    setSaving(false);
    onSaved(updatedProf as Profile, updatedRoles);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Intern Profile">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Full Name</label>
          <input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">University</label>
          <input value={form.university} onChange={e=>setForm({...form,university:e.target.value})}
            placeholder="e.g. University of Wisconsin–Madison"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Team</label>
            <select value={teamId} onChange={e=>{setTeamId(e.target.value);setSubteamId("");}}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400">
              <option value="">— None —</option>
              {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Subteam</label>
            <select value={subteamId} onChange={e=>setSubteamId(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400">
              <option value="">— None —</option>
              {subteamsForTeam.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Role</label>
          <select value={mtRole} onChange={e=>setMtRole(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400">
            <option value="intern">Intern</option>
            <option value="subteam_exec">Subteam Exec</option>
            <option value="team_exec">Team Exec</option>
            <option value="irm">IRM</option>
          </select>
        </div>
        {err&&<p className="text-xs text-red-500">{err}</p>}
        <button onClick={save} disabled={saving||!form.full_name.trim()}
          className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving?<Loader2 size={15} className="animate-spin"/>:<CheckCircle2 size={15}/>}
          {saving?"Saving…":"Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

// ── Intern Profile Modal ──────────────────────────────────────────────────────
function InternProfileModal({open,onClose,intern,teams,subteams,allTeamRoles,tasks,sb}:{
  open:boolean; onClose:()=>void; intern:Profile|null;
  teams:MTTeam[]; subteams:MTSubteam[]; allTeamRoles:MTTeamRole[];
  tasks:Task[]; sb:any;
}) {
  const [managers,setManagers] = useState<{name:string;role:string;team:string}[]>([]);
  const [completedOpen,setCompletedOpen] = useState(false);

  useEffect(()=>{
    if(!intern||!open){setManagers([]);return;}
    setCompletedOpen(false);
    const internRoles=allTeamRoles.filter(r=>r.user_id===intern.id&&r.role==="intern");
    if(!internRoles.length){setManagers([]);return;}
    const mgrs:{userId:string;roleLabel:string;team:string}[]=[];
    internRoles.forEach(ir=>{
      const tName=teams.find(t=>t.id===ir.team_id)?.name||"";
      allTeamRoles.filter(r=>r.team_id===ir.team_id&&!r.subteam_id&&r.role==="team_exec")
        .forEach(r=>mgrs.push({userId:r.user_id,roleLabel:"Team Exec",team:tName}));
      if(ir.subteam_id){
        allTeamRoles.filter(r=>r.subteam_id===ir.subteam_id&&r.role==="subteam_exec")
          .forEach(r=>{const sName=subteams.find(s=>s.id===ir.subteam_id)?.name||"";mgrs.push({userId:r.user_id,roleLabel:`${sName} Exec`,team:tName});});
      }
    });
    if(!mgrs.length){setManagers([]);return;}
    const ids=[...new Set(mgrs.map(m=>m.userId))];
    sb.from("profiles").select("id,full_name").in("id",ids).then(({data}:any)=>{
      if(!data) return;
      setManagers(mgrs.map(m=>{
        const p=data.find((x:any)=>x.id===m.userId);
        return p?{name:p.full_name,role:m.roleLabel,team:m.team}:null;
      }).filter(Boolean) as {name:string;role:string;team:string}[]);
    });
  },[intern,open,allTeamRoles,teams,subteams,sb]);

  if(!intern) return null;

  const internRoles=allTeamRoles.filter(r=>r.user_id===intern.id&&r.role==="intern");
  const myTasks=tasks.filter(t=>t.assigned_to===intern.id);
  const activeTasks=myTasks.filter(t=>t.status!=="completed");
  const completedTasks=myTasks.filter(t=>t.status==="completed");

  const getTeamLabel=(ir:MTTeamRole)=>{
    const t=teams.find(x=>x.id===ir.team_id);
    const s=ir.subteam_id?subteams.find(x=>x.id===ir.subteam_id):null;
    return s?`${t?.name||""} › ${s.name}`:t?.name||"";
  };

  return (
    <Modal open={open} onClose={onClose} title={intern.full_name}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Av name={intern.full_name} size={44}/>
          <div>
            <p className="text-sm font-semibold text-stone-800">{intern.full_name}</p>
            <p className="text-xs text-stone-400">{intern.email}</p>
            {(intern as any).university&&<p className="text-xs text-stone-400 mt-0.5">{(intern as any).university}</p>}
          </div>
        </div>

        {/* Teams */}
        {internRoles.length>0&&(
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Teams</p>
            <div className="flex flex-col gap-1.5">
              {internRoles.map((ir,i)=>{
                const t=teams.find(x=>x.id===ir.team_id);
                return (
                  <div key={i} className="flex items-center gap-2">
                    {t&&<div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:t.color}}/>}
                    <span className="text-sm text-stone-700">{getTeamLabel(ir)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Managers */}
        {managers.length>0&&(
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Managed By</p>
            <div className="flex flex-col gap-2">
              {managers.map((m,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <Av name={m.name} size={28}/>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{m.name}</p>
                    <p className="text-xs text-stone-400">{m.role} · {m.team}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active tasks */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Active Tasks ({activeTasks.length})</p>
          {activeTasks.length===0
            ?<p className="text-sm text-stone-400">No active tasks</p>
            :<div className="flex flex-col gap-2">
              {activeTasks.map(t=>(
                <div key={t.id} className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                  <SD status={t.status}/>
                  <span className="text-sm text-stone-700 flex-1 truncate">{t.title}</span>
                  {t.priority&&<PBadge priority={t.priority}/>}
                  {t.due_date&&<span className="text-xs text-stone-400 flex-shrink-0">Due {fmt(t.due_date)}</span>}
                </div>
              ))}
            </div>
          }
        </div>

        {/* Completed tasks (collapsed by default) */}
        <div>
          <button onClick={()=>setCompletedOpen(v=>!v)}
            className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors w-full">
            <ChevronRight size={12} className={`transition-transform ${completedOpen?"rotate-90":""}`}/>
            Completed Tasks ({completedTasks.length})
          </button>
          {completedOpen&&(
            <div className="flex flex-col gap-2 mt-2">
              {completedTasks.length===0
                ?<p className="text-sm text-stone-400">None yet</p>
                :completedTasks.map(t=>(
                  <div key={t.id} className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2 opacity-60">
                    <SD status="completed"/>
                    <span className="text-sm text-stone-600 flex-1 truncate line-through">{t.title}</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Team color presets ────────────────────────────────────────────────────────
const TEAM_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#3b82f6","#ef4444","#14b8a6","#f97316","#84cc16",
  "#64748b","#a16207",
];

// ── Team modal (create + edit) ────────────────────────────────────────────────
function TeamModal({open,onClose,team,sb,onSaved}:{
  open:boolean; onClose:()=>void;
  team:MTTeam|null; // null = create
  sb:any;
  onSaved:(team:MTTeam,roles:MTTeamRole[])=>void;
}) {
  const [name,setName] = useState(team?.name||"");
  const [color,setColor] = useState(team?.color||TEAM_COLORS[0]);
  const [execName,setExecName] = useState("");
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState("");
  const isEdit = !!team;

  // Fetch current exec name when editing
  useEffect(()=>{
    if(!team||!open) return;
    setName(team.name); setColor(team.color); setExecName("");
    // Look up existing team_exec role
    sb.from("user_team_roles").select("user_id").eq("team_id",team.id).eq("role","team_exec").is("subteam_id",null).maybeSingle()
      .then(({data}:any)=>{
        if(!data?.user_id) return;
        sb.from("profiles").select("full_name").eq("id",data.user_id).maybeSingle()
          .then(({data:p}:any)=>{ if(p) setExecName(p.full_name); });
      });
  },[team,open,sb]);

  if(!open) return null;

  async function save(){
    if(!name.trim()){setErr("Team name required");return;}
    setSaving(true); setErr("");
    let savedTeam:MTTeam;
    if(isEdit&&team){
      const {data,error}=await sb.from("teams").update({name:name.trim(),color}).eq("id",team.id).select().single();
      if(error||!data){setErr("Failed to save");setSaving(false);return;}
      savedTeam=data as MTTeam;
    } else {
      const {data,error}=await sb.from("teams").insert({name:name.trim(),color}).select().single();
      if(error||!data){setErr("Failed to create");setSaving(false);return;}
      savedTeam=data as MTTeam;
    }
    // Handle exec assignment
    if(execName.trim()){
      const {data:execProf}=await sb.from("profiles").select("id").ilike("full_name",execName.trim()).maybeSingle();
      if(execProf){
        // Clear old team_exec for this team
        await sb.from("user_team_roles").delete().eq("team_id",savedTeam.id).eq("role","team_exec").is("subteam_id",null);
        await sb.from("user_team_roles").insert({user_id:execProf.id,team_id:savedTeam.id,subteam_id:null,role:"team_exec"});
      }
    }
    const {data:freshRoles}=await sb.from("user_team_roles").select("*");
    onSaved(savedTeam,(freshRoles||[]) as MTTeamRole[]);
    setSaving(false); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit?"Edit Team":"New Team"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Team Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Social Media"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Color</label>
          <div className="flex flex-wrap gap-2">
            {TEAM_COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color===c?"border-stone-800 scale-110":"border-transparent"}`}
                style={{background:c}}/>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Team Exec (optional)</label>
          <input value={execName} onChange={e=>setExecName(e.target.value)} placeholder="Full name of exec"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
          <p className="text-xs text-stone-400">Must already have a Cloud Closet account. Leave blank to keep unchanged.</p>
        </div>
        {err&&<p className="text-xs text-red-500">{err}</p>}
        <button onClick={save} disabled={saving||!name.trim()}
          className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving?<Loader2 size={15} className="animate-spin"/>:null}
          {saving?"Saving…":isEdit?"Save Changes":"Create Team"}
        </button>
      </div>
    </Modal>
  );
}

// ── Subteam modal (create + edit) ─────────────────────────────────────────────
function SubteamModal({open,onClose,subteam,teamId,sb,onSaved}:{
  open:boolean; onClose:()=>void;
  subteam:MTSubteam|null; // null = create
  teamId:string;
  sb:any;
  onSaved:(subteam:MTSubteam,roles:MTTeamRole[])=>void;
}) {
  const [name,setName] = useState(subteam?.name||"");
  const [execName,setExecName] = useState("");
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState("");
  const isEdit = !!subteam;

  useEffect(()=>{
    if(!subteam||!open) return;
    setName(subteam.name); setExecName("");
    sb.from("user_team_roles").select("user_id").eq("subteam_id",subteam.id).eq("role","subteam_exec").maybeSingle()
      .then(({data}:any)=>{
        if(!data?.user_id) return;
        sb.from("profiles").select("full_name").eq("id",data.user_id).maybeSingle()
          .then(({data:p}:any)=>{ if(p) setExecName(p.full_name); });
      });
  },[subteam,open,sb]);

  if(!open) return null;

  async function save(){
    if(!name.trim()){setErr("Subteam name required");return;}
    setSaving(true); setErr("");
    let saved:MTSubteam;
    if(isEdit&&subteam){
      const {data,error}=await sb.from("subteams").update({name:name.trim()}).eq("id",subteam.id).select().single();
      if(error||!data){setErr("Failed to save");setSaving(false);return;}
      saved=data as MTSubteam;
    } else {
      const {data,error}=await sb.from("subteams").insert({name:name.trim(),team_id:teamId}).select().single();
      if(error||!data){setErr("Failed to create");setSaving(false);return;}
      saved=data as MTSubteam;
    }
    if(execName.trim()){
      const {data:execProf}=await sb.from("profiles").select("id").ilike("full_name",execName.trim()).maybeSingle();
      if(execProf){
        await sb.from("user_team_roles").delete().eq("subteam_id",saved.id).eq("role","subteam_exec");
        await sb.from("user_team_roles").insert({user_id:execProf.id,team_id:teamId,subteam_id:saved.id,role:"subteam_exec"});
      }
    }
    const {data:freshRoles}=await sb.from("user_team_roles").select("*");
    onSaved(saved,(freshRoles||[]) as MTTeamRole[]);
    setSaving(false); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit?"Edit Subteam":"New Subteam"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Subteam Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Instagram"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Subteam Lead (optional)</label>
          <input value={execName} onChange={e=>setExecName(e.target.value)} placeholder="Full name of lead"
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
          <p className="text-xs text-stone-400">Must already have a Cloud Closet account. Leave blank to keep unchanged.</p>
        </div>
        {err&&<p className="text-xs text-red-500">{err}</p>}
        <button onClick={save} disabled={saving||!name.trim()}
          className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving?<Loader2 size={15} className="animate-spin"/>:null}
          {saving?"Saving…":isEdit?"Save Changes":"Create Subteam"}
        </button>
      </div>
    </Modal>
  );
}

// ── Admin MT Intern Management ────────────────────────────────────────────────
export function AdminMTInternMgmt({interns,setInterns,tasks,setTasks,allTeamRoles,setAllTeamRoles,teams,setTeams,subteams,setSubteams,profileId,sb}:{
  interns:Profile[]; setInterns:(p:Profile[])=>void;
  tasks:Task[]; setTasks:(t:Task[])=>void;
  allTeamRoles:MTTeamRole[]; setAllTeamRoles:(r:MTTeamRole[])=>void;
  teams:MTTeam[]; setTeams:(t:MTTeam[])=>void;
  subteams:MTSubteam[]; setSubteams:(s:MTSubteam[])=>void;
  profileId:string; sb:any;
}) {
  // nav state
  const [selectedTeam,setSelectedTeam] = useState<MTTeam|null>(null);
  const [selectedSubteam,setSelectedSubteam] = useState<MTSubteam|null>(null); // null = "General" (no subteam)
  const [navView,setNavView] = useState<"teams"|"subteams"|"interns">("teams");

  // team/subteam management modals
  const [showCreateTeam,setShowCreateTeam] = useState(false);
  const [editTeam,setEditTeam] = useState<MTTeam|null>(null);
  const [showCreateSubteam,setShowCreateSubteam] = useState(false);
  const [editSubteam,setEditSubteam] = useState<MTSubteam|null>(null);

  // intern modals
  const [editIntern,setEditIntern] = useState<Profile|null>(null);
  const [viewIntern,setViewIntern] = useState<Profile|null>(null);
  const [showTask,setShowTask] = useState(false);
  const [taskTarget,setTaskTarget] = useState<Profile|null>(null);
  const [showAdd,setShowAdd] = useState(false);
  const [addName,setAddName] = useState("");
  const [addSaving,setAddSaving] = useState(false);
  const [addError,setAddError] = useState("");
  const [execNames,setExecNames] = useState<Record<string,string>>({});

  // fetch exec names for both team_exec and subteam_exec
  useEffect(()=>{
    const execRows = allTeamRoles.filter(r=>r.role==="team_exec"||r.role==="subteam_exec");
    if(!execRows.length) return;
    const ids=[...new Set(execRows.map(r=>r.user_id))];
    sb.from("profiles").select("id,full_name").in("id",ids).then(({data}:any)=>{
      if(!data) return;
      const m:Record<string,string>={};
      execRows.forEach(r=>{
        const p=data.find((x:any)=>x.id===r.user_id);
        if(!p) return;
        const first=p.full_name.split(" ")[0];
        // key = subteam_id for subteam_exec, team_id for team_exec
        const key=r.subteam_id||r.team_id;
        m[key]=m[key]?m[key]+" · "+first:first;
      });
      setExecNames(m);
    });
  },[allTeamRoles,sb]);

  const getInternIds=(teamId:string)=>
    allTeamRoles.filter(r=>r.team_id===teamId&&r.role==="intern").map(r=>r.user_id);

  // subteamId===undefined means "all in team"; null means "no subteam assigned"
  const getSubteamInternIds=(teamId:string,subteamId:string|null)=>{
    const rows=subteamId
      ?allTeamRoles.filter(r=>r.team_id===teamId&&r.subteam_id===subteamId&&r.role==="intern")
      :allTeamRoles.filter(r=>r.team_id===teamId&&!r.subteam_id&&r.role==="intern");
    return rows.map(r=>r.user_id);
  };

  function handleSaved(updated:Profile,updatedRoles:MTTeamRole[]){
    setInterns(interns.map(i=>i.id===updated.id?updated:i));
    setAllTeamRoles(updatedRoles);
    setEditIntern(null);
  }

  function handleUniUpdate(internId:string,val:string){
    setInterns(interns.map(i=>i.id===internId?{...i,university:val} as any:i));
  }

  function goBack(){
    if(navView==="interns"){ setNavView("subteams"); setSelectedSubteam(null); }
    else if(navView==="subteams"){ setNavView("teams"); setSelectedTeam(null); }
  }

  async function addIntern(){
    if(!selectedTeam||!addName.trim()) return;
    setAddSaving(true); setAddError("");
    const {data:prof}=await sb.from("profiles").select("*").ilike("full_name",addName.trim()).maybeSingle();
    if(!prof){
      setAddError("No account found for that name. Use the Contracts panel to invite them first.");
      setAddSaving(false); return;
    }
    const subId=navView==="interns"&&selectedSubteam?selectedSubteam.id:null;
    await sb.from("user_team_roles").delete().eq("user_id",prof.id).eq("team_id",selectedTeam.id);
    await sb.from("user_team_roles").insert({user_id:prof.id,team_id:selectedTeam.id,subteam_id:subId,role:"intern"});
    const {data:fresh}=await sb.from("user_team_roles").select("*");
    if(fresh) setAllTeamRoles(fresh as MTTeamRole[]);
    if(!interns.find(i=>i.id===prof.id)) setInterns([...interns,prof as Profile]);
    setAddSaving(false); setShowAdd(false); setAddName(""); setAddError("");
  }

  function handleTeamSaved(saved:MTTeam,freshRoles:MTTeamRole[]){
    setTeams(teams.find(t=>t.id===saved.id)?teams.map(t=>t.id===saved.id?saved:t):[...teams,saved]);
    setAllTeamRoles(freshRoles);
    setShowCreateTeam(false); setEditTeam(null);
  }

  function handleSubteamSaved(saved:MTSubteam,freshRoles:MTTeamRole[]){
    setSubteams(subteams.find(s=>s.id===saved.id)?subteams.map(s=>s.id===saved.id?saved:s):[...subteams,saved]);
    setAllTeamRoles(freshRoles);
    setShowCreateSubteam(false); setEditSubteam(null);
  }

  // ── Level 1: Team cards ─────────────────────────────────────────────────────
  if(navView==="teams") return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-800">Intern Management</h1>
          <p className="text-sm text-stone-400 mt-0.5">Select a team to view and manage interns</p>
        </div>
        <button onClick={()=>setShowCreateTeam(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors">
          <Plus size={13}/>New Team
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map(team=>{
          const count=getInternIds(team.id).length;
          const exec=execNames[team.id]||"—";
          return (
            <div key={team.id} onClick={()=>{setSelectedTeam(team);setNavView("subteams");}}
              className="bg-white border border-stone-200/60 rounded-2xl p-5 text-left hover:shadow-md hover:border-stone-300 transition-all cursor-pointer group relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:team.color}}/>
                <p className="text-base font-semibold text-stone-800 flex-1">{team.name}</p>
                <button onClick={e=>{e.stopPropagation();setEditTeam(team);}}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-stone-100 text-stone-400 transition-all flex-shrink-0" title="Edit team">
                  <Pencil size={13}/>
                </button>
                <ChevronRight size={16} className="text-stone-300 flex-shrink-0"/>
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-2xl font-bold text-stone-800">{count}</p>
                  <p className="text-xs text-stone-400">Interns</p>
                </div>
                <div className="border-l border-stone-100 pl-5">
                  <p className="text-sm font-semibold text-stone-700">{exec}</p>
                  <p className="text-xs text-stone-400">Team Exec</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TeamModal open={showCreateTeam} onClose={()=>setShowCreateTeam(false)}
        team={null} sb={sb} onSaved={handleTeamSaved}/>
      <TeamModal open={!!editTeam} onClose={()=>setEditTeam(null)}
        team={editTeam} sb={sb} onSaved={handleTeamSaved}/>
    </div>
  );

  // ── Level 2: Subteam cards ──────────────────────────────────────────────────
  if(navView==="subteams"&&selectedTeam) {
    const teamSubteams=subteams.filter(s=>s.team_id===selectedTeam.id);
    const noSubIds=getSubteamInternIds(selectedTeam.id,null);
    return (
      <div className="flex flex-col gap-5">
        {/* Breadcrumb header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={goBack}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors">
            <ChevronRight size={14} className="rotate-180"/>Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:selectedTeam.color}}/>
            <h1 className="text-xl font-bold text-stone-800">{selectedTeam.name}</h1>
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 transition-colors">
            <Plus size={13}/>Add Intern
          </button>
          <button onClick={()=>setShowCreateSubteam(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors">
            <Plus size={13}/>New Subteam
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamSubteams.map(sub=>{
            const ids=getSubteamInternIds(selectedTeam.id,sub.id);
            const count=ids.length;
            const exec=execNames[sub.id]||"—";
            return (
              <div key={sub.id} onClick={()=>{setSelectedSubteam(sub);setNavView("interns");}}
                className="bg-white border border-stone-200/60 rounded-2xl p-5 text-left hover:shadow-md hover:border-stone-300 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:selectedTeam.color}}/>
                  <p className="text-base font-semibold text-stone-800 flex-1">{sub.name}</p>
                  <button onClick={e=>{e.stopPropagation();setEditSubteam(sub);}}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-stone-100 text-stone-400 transition-all flex-shrink-0" title="Edit subteam">
                    <Pencil size={13}/>
                  </button>
                  <ChevronRight size={16} className="text-stone-300 flex-shrink-0"/>
                </div>
                <div className="flex gap-5">
                  <div>
                    <p className="text-2xl font-bold text-stone-800">{count}</p>
                    <p className="text-xs text-stone-400">Interns</p>
                  </div>
                  <div className="border-l border-stone-100 pl-5">
                    <p className="text-sm font-semibold text-stone-700">{exec}</p>
                    <p className="text-xs text-stone-400">Subteam Lead</p>
                  </div>
                </div>
              </div>
            );
          })}
          {/* General card for interns with no subteam */}
          {noSubIds.length>0&&(
            <div onClick={()=>{setSelectedSubteam(null);setNavView("interns");}}
              className="bg-white border border-stone-200/60 rounded-2xl p-5 text-left hover:shadow-md hover:border-stone-300 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-stone-300"/>
                <p className="text-base font-semibold text-stone-800 flex-1">General</p>
                <ChevronRight size={16} className="text-stone-300"/>
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-2xl font-bold text-stone-800">{noSubIds.length}</p>
                  <p className="text-xs text-stone-400">Interns</p>
                </div>
                <div className="border-l border-stone-100 pl-5">
                  <p className="text-sm font-medium text-stone-400 italic">No subteam</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add intern modal (team-level, no subteam pre-selected) */}
        <Modal open={showAdd} onClose={()=>{setShowAdd(false);setAddName("");setAddError("");}}
          title={`Add Intern — ${selectedTeam.name}`}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">Enter the intern's full name exactly as it appears in their profile. They must already have a Cloud Closet account.</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Full Name</label>
              <input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="First Last"
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
            </div>
            {addError&&<p className="text-xs text-red-500">{addError}</p>}
            <button onClick={addIntern} disabled={addSaving||!addName.trim()}
              className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {addSaving?<Loader2 size={15} className="animate-spin"/>:<UserPlus size={15}/>}
              {addSaving?"Adding…":"Add to Team"}
            </button>
          </div>
        </Modal>

        <SubteamModal open={showCreateSubteam} onClose={()=>setShowCreateSubteam(false)}
          subteam={null} teamId={selectedTeam.id} sb={sb} onSaved={handleSubteamSaved}/>
        <SubteamModal open={!!editSubteam} onClose={()=>setEditSubteam(null)}
          subteam={editSubteam} teamId={selectedTeam.id} sb={sb} onSaved={handleSubteamSaved}/>
      </div>
    );
  }

  // ── Level 3: Intern list for selected subteam ───────────────────────────────
  if(navView==="interns"&&selectedTeam) {
    const subteamInternIds=getSubteamInternIds(selectedTeam.id,selectedSubteam?.id||null);
    const subteamInterns=interns.filter(i=>subteamInternIds.includes(i.id));
    const subteamLabel=selectedSubteam?.name||"General";

    return (
      <div className="flex flex-col gap-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={goBack}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors">
            <ChevronRight size={14} className="rotate-180"/>Back
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:selectedTeam.color}}/>
            <span className="text-sm text-stone-400">{selectedTeam.name}</span>
            <ChevronRight size={12} className="text-stone-300 flex-shrink-0"/>
            <h1 className="text-xl font-bold text-stone-800 truncate">{subteamLabel}</h1>
            <span className="text-sm text-stone-400 flex-shrink-0">({subteamInterns.length})</span>
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 transition-colors">
            <Plus size={13}/>Add Intern
          </button>
        </div>

        {subteamInterns.length===0&&<ES message="No interns in this subteam yet — use + Add Intern to assign someone."/>}

        <div className="flex flex-col gap-3">
          {subteamInterns.map(intern=>{
            const myTasks=tasks.filter(t=>t.assigned_to===intern.id);
            const done=myTasks.filter(t=>t.status==="completed").length;
            const activeTasks=myTasks.filter(t=>t.status!=="completed");
            const rate=myTasks.length>0?Math.round((done/myTasks.length)*100):0;
            return (
              <div key={intern.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Av name={intern.full_name} size={36}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-stone-800">{intern.full_name}</p>
                      <UniTag intern={intern} onUpdate={v=>handleUniUpdate(intern.id,v)} sb={sb}/>
                    </div>
                    <p className="text-xs text-stone-400">{intern.email}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-stone-500">{activeTasks.length} active task{activeTasks.length!==1?"s":""}</span>
                      {myTasks.length>0&&<span className="text-xs text-stone-400">{rate}% complete</span>}
                    </div>
                    {myTasks.length>0&&(
                      <div className="mt-1.5 w-full bg-stone-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${rate}%`}}/>
                      </div>
                    )}
                    {activeTasks.length>0&&(
                      <div className="mt-2 flex flex-col gap-1">
                        {activeTasks.slice(0,3).map(t=>(
                          <div key={t.id} className="flex items-center gap-2 text-xs text-stone-500">
                            <SD status={t.status}/><span className="truncate">{t.title}</span>
                          </div>
                        ))}
                        {activeTasks.length>3&&<p className="text-xs text-stone-400">+{activeTasks.length-3} more</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={()=>{setTaskTarget(intern);setShowTask(true);}}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Assign task">
                      <Plus size={13}/>
                    </button>
                    <button onClick={()=>setViewIntern(intern)}
                      className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="View profile">
                      <Eye size={13}/>
                    </button>
                    <button onClick={()=>setEditIntern(intern)}
                      className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Edit profile">
                      <Pencil size={13}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add intern to subteam modal */}
        <Modal open={showAdd} onClose={()=>{setShowAdd(false);setAddName("");setAddError("");}}
          title={`Add Intern — ${subteamLabel}`}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">Enter the intern's full name exactly as it appears in their profile. They must already have a Cloud Closet account.</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Full Name</label>
              <input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="First Last"
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
            </div>
            {addError&&<p className="text-xs text-red-500">{addError}</p>}
            <button onClick={addIntern} disabled={addSaving||!addName.trim()}
              className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {addSaving?<Loader2 size={15} className="animate-spin"/>:<UserPlus size={15}/>}
              {addSaving?"Adding…":"Add to Subteam"}
            </button>
          </div>
        </Modal>

        <TaskAssignModal
          open={showTask&&!!taskTarget}
          onClose={()=>{setShowTask(false);setTaskTarget(null);}}
          interns={taskTarget?[taskTarget]:[]}
          teamId={selectedTeam.id}
          subteamId={selectedSubteam?.id}
          createdBy={profileId}
          sb={sb}
          onCreated={t=>setTasks([t,...tasks])}/>

        <InternProfileModal open={!!viewIntern} onClose={()=>setViewIntern(null)} intern={viewIntern}
          teams={teams} subteams={subteams} allTeamRoles={allTeamRoles} tasks={tasks} sb={sb}/>

        <InternEditModal open={!!editIntern} onClose={()=>setEditIntern(null)} intern={editIntern}
          teams={teams} subteams={subteams} allTeamRoles={allTeamRoles}
          onSaved={handleSaved} sb={sb}/>
      </div>
    );
  }

  return null;
}

// ── Intern Master List ────────────────────────────────────────────────────────
export type InternRosterEntry = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  school?: string;
  start_month?: string;
  end_month?: string;
  team_id?: string | null;
  subteam_ids: string[];
  contract_status: "none" | "generated" | "awaiting_signature" | "complete";
  contract_content?: string;
  contract_token?: string;
  signing_url?: string;
  notes?: string;
  created_at: string;
};

const CONTRACT_META = {
  none:               { label: "No Contract",          bg: "bg-stone-100",   text: "text-stone-500"  },
  generated:          { label: "Contract Generated",   bg: "bg-amber-50",    text: "text-amber-600"  },
  awaiting_signature: { label: "Awaiting Signature",   bg: "bg-blue-50",     text: "text-blue-600"   },
  complete:           { label: "Contract Signed",       bg: "bg-emerald-50",  text: "text-emerald-600"},
};

function buildContractTemplate(entry: Partial<InternRosterEntry>, teamName: string): string {
  const name = `${entry.first_name||""} ${entry.last_name||""}`.trim();
  const period = [entry.start_month, entry.end_month].filter(Boolean).join(" – ") || "TBD";
  return `INTERNSHIP AGREEMENT

This Internship Agreement ("Agreement") is entered into between Cloud Closet ("Company") and ${name||"[Intern Name]"} ("Intern").

POSITION
Team: ${teamName||"[Team]"}
Duration: ${period}

RESPONSIBILITIES
The Intern will support the ${teamName||"[Team]"} team with assigned projects and deliverables as directed by their team lead.

EXPECTATIONS
• Attend weekly check-ins and sprint reviews
• Complete assigned deliverables by agreed-upon deadlines
• Communicate proactively about blockers or schedule conflicts
• Maintain professionalism and confidentiality

COMPENSATION
This internship is unpaid / [compensation details].

CONFIDENTIALITY
The Intern agrees to keep all Company information, strategies, and materials confidential during and after the internship.

ACKNOWLEDGMENT
By signing below, both parties agree to the terms of this Agreement.


________________________          ________________________
Company Representative            Intern Signature

Date: ___________________         Date: ___________________
`.trim();
}

const RosterFieldLabel = ({label,children}:{label:string;children:React.ReactNode})=>(
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);
const rosterInp = "px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400";

function RosterModal({open,onClose,entry,teams,subteams,sb,onSaved}:{
  open:boolean; onClose:()=>void;
  entry:InternRosterEntry|null;
  teams:MTTeam[]; subteams:MTSubteam[];
  sb:any;
  onSaved:(e:InternRosterEntry)=>void;
}) {
  const blank = {first_name:"",last_name:"",email:"",school:"",start_month:"",end_month:"",team_id:"",subteam_ids:[] as string[],notes:""};
  const [form,setForm] = useState(blank);
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState("");

  useEffect(()=>{
    if(!open) return;
    if(entry) setForm({
      first_name: entry.first_name,
      last_name:  entry.last_name,
      email:      entry.email||"",
      school:     entry.school||"",
      start_month:entry.start_month||"",
      end_month:  entry.end_month||"",
      team_id:    entry.team_id||"",
      subteam_ids:entry.subteam_ids||[],
      notes:      entry.notes||"",
    });
    else setForm(blank);
  },[open,entry]);

  if(!open) return null;

  const teamSubteams = form.team_id ? subteams.filter(s=>s.team_id===form.team_id) : [];

  function toggleSub(id:string){
    setForm(f=>({...f, subteam_ids: f.subteam_ids.includes(id)?f.subteam_ids.filter(x=>x!==id):[...f.subteam_ids,id]}));
  }

  function setTeam(id:string){
    setForm(f=>({...f, team_id:id, subteam_ids:[]}));
  }

  async function save(){
    if(!form.first_name.trim()||!form.last_name.trim()){setErr("First and last name required");return;}
    setSaving(true); setErr("");
    const payload = {
      first_name:  form.first_name.trim(),
      last_name:   form.last_name.trim(),
      email:       form.email.trim()||null,
      school:      form.school.trim()||null,
      start_month: form.start_month.trim()||null,
      end_month:   form.end_month.trim()||null,
      team_id:     form.team_id||null,
      subteam_ids: form.subteam_ids,
      notes:       form.notes.trim()||null,
    };
    let saved:InternRosterEntry;
    if(entry){
      const {data,error}=await sb.from("intern_roster").update(payload).eq("id",entry.id).select().single();
      if(error||!data){setErr("Failed to save");setSaving(false);return;}
      saved=data as InternRosterEntry;
    } else {
      const {data,error}=await sb.from("intern_roster").insert(payload).select().single();
      if(error||!data){setErr(error?.message||"Failed to create");setSaving(false);return;}
      saved=data as InternRosterEntry;
    }
    onSaved(saved); setSaving(false); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={entry?"Edit Intern":"Add Intern"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <RosterFieldLabel label="First Name">
            <input value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} placeholder="First" className={rosterInp}/>
          </RosterFieldLabel>
          <RosterFieldLabel label="Last Name">
            <input value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))} placeholder="Last" className={rosterInp}/>
          </RosterFieldLabel>
        </div>
        <RosterFieldLabel label="Email">
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="intern@email.com" className={rosterInp}/>
        </RosterFieldLabel>
        <RosterFieldLabel label="School">
          <input value={form.school} onChange={e=>setForm(f=>({...f,school:e.target.value}))} placeholder="e.g. UW–Madison" className={rosterInp}/>
        </RosterFieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <RosterFieldLabel label="Start Month">
            <input value={form.start_month} onChange={e=>setForm(f=>({...f,start_month:e.target.value}))} placeholder="May 2026" className={rosterInp}/>
          </RosterFieldLabel>
          <RosterFieldLabel label="End Month">
            <input value={form.end_month} onChange={e=>setForm(f=>({...f,end_month:e.target.value}))} placeholder="Aug 2026" className={rosterInp}/>
          </RosterFieldLabel>
        </div>
        <RosterFieldLabel label="Main Team">
          <select value={form.team_id} onChange={e=>setTeam(e.target.value)} className={rosterInp}>
            <option value="">— None —</option>
            {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </RosterFieldLabel>
        {teamSubteams.length>0&&(
          <RosterFieldLabel label="Subteams">
            <div className="flex flex-wrap gap-2 pt-1">
              {teamSubteams.map(s=>(
                <label key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm cursor-pointer transition-colors
                  ${form.subteam_ids.includes(s.id)?"border-stone-800 bg-stone-800 text-white":"border-stone-200 text-stone-600 hover:border-stone-400"}`}>
                  <input type="checkbox" className="sr-only" checked={form.subteam_ids.includes(s.id)} onChange={()=>toggleSub(s.id)}/>
                  {s.name}
                </label>
              ))}
            </div>
          </RosterFieldLabel>
        )}
        <RosterFieldLabel label="Notes (optional)">
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Any extra context…"
            className={`${rosterInp} resize-none`}/>
        </RosterFieldLabel>
        {err&&<p className="text-xs text-red-500">{err}</p>}
        <button onClick={save} disabled={saving||!form.first_name.trim()||!form.last_name.trim()}
          className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving?<Loader2 size={15} className="animate-spin"/>:null}
          {saving?"Saving…":entry?"Save Changes":"Add Intern"}
        </button>
      </div>
    </Modal>
  );
}

function ContractEditorModal({open,onClose,entry,teamName,sb,onSaved}:{
  open:boolean; onClose:()=>void;
  entry:InternRosterEntry;
  teamName:string;
  sb:any;
  onSaved:(updated:InternRosterEntry)=>void;
}) {
  const [content,setContent] = useState("");
  const [saving,setSaving] = useState(false);
  const [sending,setSending] = useState(false);
  const [err,setErr] = useState("");

  useEffect(()=>{
    if(!open) return;
    setContent(entry.contract_content||buildContractTemplate(entry,teamName));
    setErr("");
  },[open,entry,teamName]);

  if(!open) return null;

  const fullName = `${entry.first_name} ${entry.last_name}`.trim();

  async function saveDraft(){
    setSaving(true); setErr("");
    const {data,error}=await sb.from("intern_roster")
      .update({contract_content:content, contract_status:"generated"})
      .eq("id",entry.id).select().single();
    if(error||!data){setErr("Failed to save draft");setSaving(false);return;}
    onSaved(data as InternRosterEntry);
    setSaving(false);
    onClose();
  }

  async function sendContract(){
    if(!entry.email){setErr("No email address on file — edit the intern to add one.");return;}
    setSending(true); setErr("");
    try {
      const res = await fetch("/api/contracts/create",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          intern_name: fullName,
          intern_email: entry.email,
          content,
        }),
      });
      const json = await res.json();
      if(!json.ok) throw new Error(json.error||"API error");

      const {token, signing_url} = json;

      // Update DB
      const {data,error}=await sb.from("intern_roster")
        .update({
          contract_content: content,
          contract_status: "awaiting_signature",
          contract_token: token,
          signing_url,
        })
        .eq("id",entry.id).select().single();
      if(error||!data){setErr("Contract created but DB update failed");setSending(false);return;}

      // Open mailto with signing link pre-filled
      const subject = encodeURIComponent(`Your Cloud Closet Internship Agreement`);
      const body = encodeURIComponent(
        `Hi ${entry.first_name},\n\nPlease review and sign your internship agreement using the link below:\n\n${signing_url}\n\nThis link expires in 7 days. Let us know if you have any questions!\n\nBest,\nCloud Closet`
      );
      window.open(`mailto:${entry.email}?subject=${subject}&body=${body}`,"_self");

      onSaved(data as InternRosterEntry);
      setSending(false);
      onClose();
    } catch(e:any){
      setErr(e.message||"Failed to send");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-800">Internship Agreement</h2>
            <p className="text-xs text-stone-400 mt-0.5">{fullName}{entry.email&&<> · {entry.email}</>}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <textarea
            value={content}
            onChange={e=>setContent(e.target.value)}
            className="w-full h-[400px] text-sm text-stone-700 font-mono leading-relaxed bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-stone-400 resize-none"
            spellCheck={false}
          />
        </div>

        {err&&<p className="px-6 text-xs text-red-500 mb-2">{err}</p>}

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-stone-100">
          <button onClick={saveDraft} disabled={saving||sending}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-200 disabled:opacity-50 transition-colors">
            {saving?<Loader2 size={13} className="animate-spin"/>:null}
            {saving?"Saving…":"Save Draft"}
          </button>
          <button onClick={sendContract} disabled={saving||sending||!entry.email}
            title={!entry.email?"Add an email address to this intern first":undefined}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors ml-auto">
            {sending?<Loader2 size={13} className="animate-spin"/>:<Send size={13}/>}
            {sending?"Sending…":`Send to ${entry.email||"(no email)"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminInternMasterList({roster,setRoster,teams,subteams,sb}:{
  roster:InternRosterEntry[]; setRoster:(r:InternRosterEntry[])=>void;
  teams:MTTeam[]; subteams:MTSubteam[]; sb:any;
}) {
  const [showAdd,setShowAdd] = useState(false);
  const [editEntry,setEditEntry] = useState<InternRosterEntry|null>(null);
  const [contractEntry,setContractEntry] = useState<InternRosterEntry|null>(null);
  const [filterTeam,setFilterTeam] = useState("");
  const [filterContract,setFilterContract] = useState("");
  const [search,setSearch] = useState("");
  const [copiedId,setCopiedId] = useState<string|null>(null);

  const filtered = roster.filter(e=>{
    if(search&&!`${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    if(filterTeam&&e.team_id!==filterTeam) return false;
    if(filterContract&&e.contract_status!==filterContract) return false;
    return true;
  });

  function handleSaved(saved:InternRosterEntry){
    setRoster(roster.find(e=>e.id===saved.id)?roster.map(e=>e.id===saved.id?saved:e):[...roster,saved]);
    setShowAdd(false); setEditEntry(null);
  }

  function handleContractSaved(saved:InternRosterEntry){
    setRoster(roster.map(e=>e.id===saved.id?saved:e));
    setContractEntry(null);
  }

  async function markSigned(entry:InternRosterEntry){
    const {data}=await sb.from("intern_roster").update({contract_status:"complete"}).eq("id",entry.id).select().single();
    if(data) setRoster(roster.map(e=>e.id===entry.id?data as InternRosterEntry:e));
  }

  async function resetContract(entry:InternRosterEntry){
    const {data}=await sb.from("intern_roster")
      .update({contract_status:"none",contract_content:null,contract_token:null,signing_url:null})
      .eq("id",entry.id).select().single();
    if(data) setRoster(roster.map(e=>e.id===entry.id?data as InternRosterEntry:e));
  }

  async function deleteEntry(id:string){
    await sb.from("intern_roster").delete().eq("id",id);
    setRoster(roster.filter(e=>e.id!==id));
  }

  function copyLink(entry:InternRosterEntry){
    if(entry.signing_url) navigator.clipboard.writeText(entry.signing_url);
    setCopiedId(entry.id);
    setTimeout(()=>setCopiedId(null),2000);
  }

  function getTeamName(teamId?:string|null){ return teams.find(t=>t.id===teamId)?.name||""; }
  function getTeamColor(teamId?:string|null){ return teams.find(t=>t.id===teamId)?.color||"#d4d4d4"; }
  function getSubteamNames(ids:string[]){ return ids.map(id=>subteams.find(s=>s.id===id)?.name).filter(Boolean); }

  const stats = {
    total: roster.length,
    none: roster.filter(e=>e.contract_status==="none").length,
    awaiting: roster.filter(e=>e.contract_status==="awaiting_signature").length,
    complete: roster.filter(e=>e.contract_status==="complete").length,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-800">Intern Master List</h1>
          <p className="text-sm text-stone-400 mt-0.5">{roster.length} intern{roster.length!==1?"s":""} · {stats.complete} contract{stats.complete!==1?"s":""} signed</p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 transition-colors">
          <Plus size={13}/>Add Intern
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {([
          ["Total",     stats.total,   "bg-stone-100", "text-stone-600"],
          ["No Contract",stats.none,   "bg-stone-100", "text-stone-500"],
          ["Awaiting",  stats.awaiting,"bg-blue-50",   "text-blue-600" ],
          ["Signed",    stats.complete,"bg-emerald-50","text-emerald-600"],
        ] as const).map(([label,val,bg,text])=>(
          <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${text}`}>{val}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name…"
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-stone-400 flex-1 min-w-32"/>
        <select value={filterTeam} onChange={e=>setFilterTeam(e.target.value)}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none">
          <option value="">All Teams</option>
          {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterContract} onChange={e=>setFilterContract(e.target.value)}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none">
          <option value="">All Statuses</option>
          <option value="none">No Contract</option>
          <option value="generated">Generated</option>
          <option value="awaiting_signature">Awaiting Signature</option>
          <option value="complete">Signed</option>
        </select>
      </div>

      {/* List */}
      {filtered.length===0&&(
        <div className="text-center py-12 text-stone-400 text-sm">
          {roster.length===0?"No interns added yet — click + Add Intern to get started.":"No interns match your filters."}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(entry=>{
          const meta = CONTRACT_META[entry.contract_status];
          const teamColor = getTeamColor(entry.team_id);
          const teamName = getTeamName(entry.team_id);
          const subNames = getSubteamNames(entry.subteam_ids||[]);
          const dateRange = [entry.start_month,entry.end_month].filter(Boolean).join(" – ")||null;

          return (
            <div key={entry.id} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
              {/* Top: info section */}
              <div className="flex items-start gap-3 p-4">
                <Av name={`${entry.first_name} ${entry.last_name}`} size={36}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-stone-800">{entry.first_name} {entry.last_name}</p>
                    {entry.school&&<span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">{entry.school}</span>}
                  </div>
                  {entry.email&&<p className="text-xs text-stone-400 mb-0.5">{entry.email}</p>}
                  {dateRange&&<p className="text-xs text-stone-400 mb-1.5">{dateRange}</p>}
                  {teamName&&(
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{background:teamColor}}>
                        {teamName}
                      </span>
                      {subNames.map(s=>(
                        <span key={s} className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  {entry.notes&&<p className="text-xs text-stone-400 mt-1.5 italic">{entry.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={()=>setEditEntry(entry)}
                    className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Edit">
                    <Pencil size={13}/>
                  </button>
                  <button onClick={()=>{if(confirm(`Remove ${entry.first_name} ${entry.last_name} from the roster?`)) deleteEntry(entry.id);}}
                    className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-stone-100 mx-4"/>

              {/* Bottom: contract section */}
              <div className="flex items-center gap-2 flex-wrap px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                  {meta.label}
                </span>

                {entry.contract_status==="none"&&(
                  <button onClick={()=>setContractEntry(entry)}
                    className="text-xs px-3 py-1 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium">
                    Generate Contract
                  </button>
                )}

                {entry.contract_status==="generated"&&(
                  <button onClick={()=>setContractEntry(entry)}
                    className="text-xs px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium flex items-center gap-1">
                    <FileText size={11}/>Review &amp; Send
                  </button>
                )}

                {entry.contract_status==="awaiting_signature"&&(<>
                  <button onClick={()=>copyLink(entry)}
                    className="text-xs px-3 py-1 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium flex items-center gap-1">
                    {copiedId===entry.id?<Check size={11} className="text-emerald-500"/>:<Copy size={11}/>}
                    {copiedId===entry.id?"Copied!":"Copy Link"}
                  </button>
                  <button onClick={()=>markSigned(entry)}
                    className="text-xs px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium">
                    Mark as Signed
                  </button>
                  <button onClick={()=>setContractEntry(entry)}
                    className="text-xs px-3 py-1 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 transition-colors font-medium flex items-center gap-1">
                    <Send size={11}/>Resend
                  </button>
                </>)}

                {entry.contract_status==="complete"&&(
                  <span className="text-xs text-stone-400">✓ Signed</span>
                )}

                {entry.contract_status!=="none"&&(
                  <button onClick={()=>{if(confirm("Reset contract status? This will clear the contract token and signing link.")) resetContract(entry);}}
                    className="text-xs text-stone-300 hover:text-stone-500 transition-colors ml-auto">
                    reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RosterModal open={showAdd} onClose={()=>setShowAdd(false)}
        entry={null} teams={teams} subteams={subteams} sb={sb} onSaved={handleSaved}/>
      <RosterModal open={!!editEntry} onClose={()=>setEditEntry(null)}
        entry={editEntry} teams={teams} subteams={subteams} sb={sb} onSaved={handleSaved}/>
      {contractEntry&&(
        <ContractEditorModal open={!!contractEntry} onClose={()=>setContractEntry(null)}
          entry={contractEntry} teamName={getTeamName(contractEntry.team_id)}
          sb={sb} onSaved={handleContractSaved}/>
      )}
    </div>
  );
}

export function AdminSchoolsTab({interns,setInterns,tasks,allTeamRoles,setAllTeamRoles,teams,subteams,sb}:{
  interns:Profile[]; setInterns:(p:Profile[])=>void; tasks:Task[];
  allTeamRoles:MTTeamRole[]; setAllTeamRoles:(r:MTTeamRole[])=>void;
  teams:MTTeam[]; subteams:MTSubteam[]; sb:any;
}) {
  const [editIntern,setEditIntern] = useState<Profile|null>(null);

  const getTeamLabel=(internId:string)=>{
    const roles=allTeamRoles.filter(r=>r.user_id===internId);
    return roles.map(r=>{const s=r.subteam_id?subteams.find(x=>x.id===r.subteam_id):null;return s?.name||teams.find(t=>t.id===r.team_id)?.name||"";}).filter(Boolean).join(" · ");
  };

  const bySchool=useMemo(()=>{
    const m:Record<string,Profile[]>={"Untagged":[]};
    interns.forEach(i=>{
      const school=(i as any).university?.trim()||"";
      if(!school){m["Untagged"].push(i);return;}
      if(!m[school]) m[school]=[];
      m[school].push(i);
    });
    return Object.entries(m).filter(([,v])=>v.length>0).sort(([a],[b])=>a==="Untagged"?1:b==="Untagged"?-1:a.localeCompare(b));
  },[interns]);

  function handleSaved(updated:Profile,updatedRoles:MTTeamRole[]){
    setInterns(interns.map(i=>i.id===updated.id?updated:i));
    setAllTeamRoles(updatedRoles);
    setEditIntern(null);
  }

  function handleUniUpdate(internId:string,val:string){
    setInterns(interns.map(i=>i.id===internId?{...i,university:val} as any:i));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Schools" value={bySchool.filter(([k])=>k!=="Untagged").length}/>
        <StatCard label="Tagged" value={interns.filter(i=>(i as any).university).length}/>
        <StatCard label="Untagged" value={interns.filter(i=>!(i as any).university).length}/>
      </div>

      {bySchool.map(([school,members])=>(
        <div key={school}>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            {school} <span className="font-normal text-stone-300">({members.length})</span>
          </p>
          <div className="flex flex-col gap-2">
            {members.map(i=>{
              const myTasks=tasks.filter(t=>t.assigned_to===i.id);
              const done=myTasks.filter(t=>t.status==="completed").length;
              const active=myTasks.filter(t=>t.status!=="completed");
              return (
                <div key={i.id} className="bg-white border border-stone-200/60 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Av name={i.full_name} size={36}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-stone-800">{i.full_name}</p>
                        <UniTag intern={i} onUpdate={v=>handleUniUpdate(i.id,v)} sb={sb}/>
                      </div>
                      <p className="text-xs text-stone-400">{getTeamLabel(i.id)||i.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-stone-400">{done}/{myTasks.length}</span>
                      <button onClick={()=>setEditIntern(i)} className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Edit profile">
                        <Pencil size={13}/>
                      </button>
                    </div>
                  </div>
                  {active.length>0&&(
                    <div className="mt-2 flex flex-col gap-1">
                      {active.slice(0,2).map(t=>(
                        <div key={t.id} className="flex items-center gap-2 text-xs text-stone-500"><SD status={t.status}/><span className="truncate">{t.title}</span></div>
                      ))}
                      {active.length>2&&<p className="text-xs text-stone-400">+{active.length-2} more active</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <InternEditModal open={!!editIntern} onClose={()=>setEditIntern(null)} intern={editIntern}
        teams={teams} subteams={subteams} allTeamRoles={allTeamRoles}
        onSaved={handleSaved} sb={sb}/>
    </div>
  );
}
