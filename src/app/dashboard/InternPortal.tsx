"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, CheckSquare, Inbox, User, CloudRain,
  Upload, FileText, ExternalLink, ChevronDown, ChevronUp,
  Send, Check, Loader2, Calendar, X,
} from "lucide-react";
import { MTTeamRole, MTTeam, MTSubteam } from "./MultiTeamDashboard";
import { Sprint, SprintAssignment, SprintDeliverable } from "./SprintDashboard";

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile = {
  id: string; full_name: string; email: string; role: string;
  avatar_url?: string;
};
type InternRequest = {
  id: string; intern_id?: string; type_name?: string;
  message: string; status: string; replies: any[]; created_at: string;
};

// ── Shared helpers ────────────────────────────────────────────────────────────
const AV_COLORS = ["#E8D5C4","#C4D4E8","#D4E8C4","#E8C4D4","#D4C4E8","#C4E8D4","#E8E0C4","#C4E8E8"];
function avColor(n:string){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))&0xffff;return AV_COLORS[h%AV_COLORS.length];}
function initials(n:string){return n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();}
function Av({name,size=32,img}:{name:string;size?:number;img?:string}){
  if(img) return <img src={img} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:avColor(name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.35,color:"#44403c",flexShrink:0}}>{initials(name)}</div>;
}
function fmtDate(d?:string|null){if(!d)return "—";return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}

const STATUS_META: Record<string,{label:string;color:string;bg:string}> = {
  pending:    {label:"To Do",    color:"#6b7280",bg:"#f3f4f6"},
  in_progress:{label:"In Progress",color:"#d97706",bg:"#fef3c7"},
  complete:   {label:"Done",    color:"#059669",bg:"#d1fae5"},
};

// ── Team Tab ─────────────────────────────────────────────────────────────────
export function InternTeamTab({profile,myTeamRoles,teams,subteams,allTeamRoles,sb}:{
  profile:Profile; myTeamRoles:MTTeamRole[]; teams:MTTeam[]; subteams:MTSubteam[];
  allTeamRoles:MTTeamRole[]; sb:any;
}) {
  const [teamLead, setTeamLead] = useState<{full_name:string;avatar_url?:string}|null>(null);
  const [members, setMembers] = useState<{id:string;full_name:string;avatar_url?:string;subteam_name?:string}[]>([]);

  const firstRole = myTeamRoles[0];
  const myTeam    = firstRole ? teams.find(t=>t.id===firstRole.team_id) : null;
  const mySubteam = firstRole?.subteam_id ? subteams.find(s=>s.id===firstRole.subteam_id) : null;

  useEffect(()=>{
    if(!myTeam) return;
    // Fetch team lead
    const execRole = allTeamRoles.find(r=>r.team_id===myTeam.id&&r.role==="team_exec");
    if(execRole){
      sb.from("profiles").select("full_name,avatar_url").eq("id",execRole.user_id).single()
        .then(({data}:any)=>{ if(data) setTeamLead(data); });
    }
    // Fetch all team members
    const memberRoles = allTeamRoles.filter(r=>r.team_id===myTeam.id&&r.role==="intern");
    if(memberRoles.length){
      const ids = memberRoles.map(r=>r.user_id);
      sb.from("profiles").select("id,full_name,avatar_url").in("id",ids)
        .then(({data}:any)=>{
          if(!data) return;
          setMembers(data.map((p:any)=>{
            const role = memberRoles.find(r=>r.user_id===p.id);
            const sub  = role?.subteam_id ? subteams.find(s=>s.id===role.subteam_id) : null;
            return {...p, subteam_name: sub?.name};
          }));
        });
    }
  },[myTeam?.id, allTeamRoles]);

  if(!myTeam) return (
    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
      <Users size={32} className="mb-3 opacity-40"/>
      <p className="text-sm">You haven't been assigned to a team yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Team header */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div style={{width:12,height:12,borderRadius:"50%",background:myTeam.color,flexShrink:0}}/>
          <div>
            <p className="font-semibold text-stone-800 text-base">{myTeam.name}</p>
            {mySubteam && <p className="text-xs text-stone-400 mt-0.5">{mySubteam.name}</p>}
          </div>
        </div>

        {teamLead && (
          <div className="flex items-center gap-3 py-3 border-t border-stone-100">
            <Av name={teamLead.full_name} size={36} img={teamLead.avatar_url}/>
            <div>
              <p className="text-xs text-stone-400">Team Lead</p>
              <p className="text-sm font-semibold text-stone-800">{teamLead.full_name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Team members */}
      {members.length > 0 && (
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Team Members</p>
          <div className="flex flex-col gap-2">
            {members.map(m=>(
              <div key={m.id} className="flex items-center gap-3 py-1.5">
                <Av name={m.full_name} size={32} img={m.avatar_url}/>
                <div>
                  <p className="text-sm font-medium text-stone-800">{m.full_name}{m.id===profile.id&&<span className="ml-2 text-xs text-stone-400">(you)</span>}</p>
                  {m.subteam_name&&<p className="text-xs text-stone-400">{m.subteam_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
export function InternTasksTab({profile,sprints,sprintAssignments,sprintDeliverables,setSprintDeliverables,sb}:{
  profile:Profile; sprints:Sprint[]; sprintAssignments:SprintAssignment[];
  sprintDeliverables:SprintDeliverable[]; setSprintDeliverables:(d:SprintDeliverable[])=>void; sb:any;
}) {
  const [noteOpen, setNoteOpen] = useState<string|null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"current"|"past">("current");

  // Find this intern's assignments across all sprints
  const myAssignments = sprintAssignments.filter(a=>a.assigned_to===profile.id);
  const myAssignmentIds = myAssignments.map(a=>a.id);
  const myDeliverables = sprintDeliverables.filter(d=>myAssignmentIds.includes(d.sprint_assignment_id));

  // Enrich with sprint name
  function sprintFor(d:SprintDeliverable){
    const a = myAssignments.find(a=>a.id===d.sprint_assignment_id);
    return a ? sprints.find(s=>s.id===a.sprint_id) : null;
  }

  const current = myDeliverables.filter(d=>d.status!=="complete");
  const past    = myDeliverables.filter(d=>d.status==="complete");
  const shown   = tab==="current" ? current : past;

  async function toggleStatus(d:SprintDeliverable){
    const next = d.status==="complete" ? "pending" : "complete";
    const {data} = await sb.from("sprint_deliverables").update({status:next}).eq("id",d.id).select().single();
    if(data) setSprintDeliverables(sprintDeliverables.map(x=>x.id===d.id?data:x));
  }

  async function saveNote(assignmentId:string){
    if(!noteText.trim()) return;
    setSaving(true);
    await sb.from("sprint_assignments").update({tracking_notes:noteText.trim()}).eq("id",assignmentId);
    setSaving(false);
    setNoteOpen(null);
    setNoteText("");
  }

  function openNote(d:SprintDeliverable){
    const a = myAssignments.find(a=>a.id===d.sprint_assignment_id);
    setNoteText(a?.tracking_notes||"");
    setNoteOpen(d.id);
  }

  if(myDeliverables.length===0) return (
    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
      <CheckSquare size={32} className="mb-3 opacity-40"/>
      <p className="text-sm">No tasks assigned yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Tab pills */}
      <div className="flex gap-1.5">
        {([["current",`Current (${current.length})`],["past",`Completed (${past.length})`]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${tab===id?"bg-stone-800 text-white":"bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
            {label}
          </button>
        ))}
      </div>

      {shown.length===0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          {tab==="current" ? "All caught up!" : "No completed tasks yet."}
        </div>
      ) : shown.map(d=>{
        const sprint = sprintFor(d);
        const assignment = myAssignments.find(a=>a.id===d.sprint_assignment_id);
        const meta = STATUS_META[d.status] || STATUS_META.pending;
        return (
          <div key={d.id} className="bg-white border border-stone-200/60 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button onClick={()=>toggleStatus(d)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${d.status==="complete"?"bg-emerald-500 border-emerald-500":"border-stone-300 hover:border-stone-500"}`}>
                {d.status==="complete"&&<Check size={11} strokeWidth={3} color="white"/>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${d.status==="complete"?"line-through text-stone-400":"text-stone-800"}`}>
                  {d.description}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:meta.bg,color:meta.color}}>{meta.label}</span>
                  {sprint&&<span className="text-xs text-stone-400">{sprint.name}</span>}
                  {sprint&&<span className="text-xs text-stone-400">· due {fmtDate(sprint.end_date)}</span>}
                </div>
                {assignment?.tracking_notes&&noteOpen!==d.id&&(
                  <p className="text-xs text-stone-500 mt-2 italic">Note: {assignment.tracking_notes}</p>
                )}
              </div>
              <button onClick={()=>noteOpen===d.id?setNoteOpen(null):openNote(d)}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 flex-shrink-0">
                {noteOpen===d.id?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
                Note
              </button>
            </div>

            {/* Note editor */}
            {noteOpen===d.id&&(
              <div className="mt-3 pt-3 border-t border-stone-100 flex gap-2">
                <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                  placeholder="Add a note about this sprint task…"
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 resize-none"
                  rows={2}/>
                <button onClick={()=>saveNote(d.sprint_assignment_id)} disabled={saving||!noteText.trim()}
                  className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium disabled:opacity-40 flex items-center gap-1">
                  {saving?<Loader2 size={12} className="animate-spin"/>:<Send size={12}/>}Save
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Requests Tab ──────────────────────────────────────────────────────────────
const REQUEST_TYPES = ["Time Off","Resource Request","Schedule Change","General Question","Other"];

export function InternRequestsTab({profile,requests,setRequests,sb}:{
  profile:Profile; requests:InternRequest[]; setRequests:(r:InternRequest[])=>void; sb:any;
}) {
  const [type,setType]       = useState(REQUEST_TYPES[0]);
  const [message,setMessage] = useState("");
  const [sending,setSending] = useState(false);
  const [sent,setSent]       = useState(false);
  const [expanded,setExpanded] = useState<string|null>(null);

  const myRequests = requests.filter(r=>r.intern_id===profile.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));

  const STATUS_STYLE: Record<string,string> = {
    new:      "bg-blue-50 text-blue-600",
    open:     "bg-amber-50 text-amber-600",
    resolved: "bg-emerald-50 text-emerald-600",
  };

  async function submit(){
    if(!message.trim()) return;
    setSending(true);
    const {data,error} = await sb.from("requests").insert({
      intern_id:profile.id, type_name:type, message:message.trim(),
      status:"new", replies:[], created_at:new Date().toISOString(),
    }).select().single();
    setSending(false);
    if(error||!data) return;
    setRequests([data as InternRequest, ...requests]);
    setMessage(""); setSent(true);
    setTimeout(()=>setSent(false),3000);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Submit form */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-sm font-semibold text-stone-800 mb-3">Submit a Request</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {REQUEST_TYPES.map(t=>(
              <button key={t} onClick={()=>setType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${type===t?"bg-stone-800 text-white":"bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
                {t}
              </button>
            ))}
          </div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)}
            placeholder="Describe your request…"
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 resize-none"
            rows={3}/>
          <button onClick={submit} disabled={sending||!message.trim()}
            className="self-start px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-colors">
            {sent?<Check size={14}/>:sending?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>}
            {sent?"Sent!":sending?"Sending…":"Submit Request"}
          </button>
        </div>
      </div>

      {/* Past requests */}
      {myRequests.length>0&&(
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">Your Requests</p>
          {myRequests.map(r=>(
            <div key={r.id} className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
              <button onClick={()=>setExpanded(expanded===r.id?null:r.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{r.type_name}</p>
                  <p className="text-xs text-stone-400 truncate mt-0.5">{r.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLE[r.status]||"bg-stone-100 text-stone-500"}`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-stone-400">{fmtDate(r.created_at)}</span>
                  {expanded===r.id?<ChevronUp size={12} className="text-stone-400"/>:<ChevronDown size={12} className="text-stone-400"/>}
                </div>
              </button>
              {expanded===r.id&&(
                <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                  <p className="text-sm text-stone-700 whitespace-pre-wrap mb-3">{r.message}</p>
                  {(r.replies||[]).length>0&&(
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-stone-500">Replies</p>
                      {r.replies.map((rep:any,i:number)=>(
                        <div key={i} className="bg-stone-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-stone-700 mb-1">{rep.author_name}</p>
                          <p className="text-sm text-stone-600">{rep.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
export function InternProfileTab({profile,onAvatarUpdate,sb}:{
  profile:Profile; onAvatarUpdate:(url:string)=>void; sb:any;
}) {
  const [contract,setContract] = useState<{pdf_url:string|null;signed_at:string|null}|null>(null);
  const [uploading,setUploading] = useState(false);
  const [uploadDone,setUploadDone] = useState(false);
  const [preview,setPreview] = useState<string|null>(profile.avatar_url||null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    sb.from("contracts").select("pdf_url,signed_at").eq("user_id",profile.id).maybeSingle()
      .then(({data}:any)=>{ if(data) setContract(data); });
  },[profile.id]);

  async function handlePhoto(e:React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async(ev)=>{
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      const mime = file.type||"image/jpeg";
      const ext  = mime.includes("png")?"png":"jpg";
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/,"");
      const bytes = Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
      const path  = `${profile.id}/photo.${ext}`;
      await sb.storage.from("headshots").upload(path, bytes, {contentType:mime,upsert:true});
      const {data:urlData} = sb.storage.from("headshots").getPublicUrl(path);
      const url = urlData?.publicUrl;
      if(url){
        await sb.from("profiles").update({avatar_url:url}).eq("id",profile.id);
        onAvatarUpdate(url);
      }
      setUploading(false);
      setUploadDone(true);
      setTimeout(()=>setUploadDone(false),3000);
    };
    reader.readAsDataURL(file);
  }

  function addSprintToCalendar(){
    const title = encodeURIComponent("Cloud Closet Sprint");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${encodeURIComponent("Cloud Closet internship sprint")}`;
    window.open(url,"_blank");
  }

  return (
    <div className="flex flex-col gap-5 max-w-md">
      {/* Profile photo */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">Profile Photo</p>
        <div className="flex items-center gap-4">
          {preview
            ? <img src={preview} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-stone-200"/>
            : <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400"><User size={32}/></div>
          }
          <div className="flex flex-col gap-2">
            <button onClick={()=>fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors">
              {uploading?<Loader2 size={14} className="animate-spin"/>:uploadDone?<Check size={14}/>:<Upload size={14}/>}
              {uploading?"Uploading…":uploadDone?"Updated!":"Change Photo"}
            </button>
            <p className="text-xs text-stone-400">JPG or PNG, max 5MB</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
      </div>

      {/* Contract */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Your Contract</p>
        {contract?.pdf_url ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-stone-500"/>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-800">Signed Internship Agreement</p>
              <p className="text-xs text-stone-400">{contract.signed_at ? `Signed ${fmtDate(contract.signed_at)}` : ""}</p>
            </div>
            <a href={contract.pdf_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors">
              <ExternalLink size={11}/>View PDF
            </a>
          </div>
        ) : (
          <p className="text-sm text-stone-400">No signed contract on file yet.</p>
        )}
      </div>

      {/* Google Calendar */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Google Calendar</p>
        <p className="text-sm text-stone-500 mb-3 leading-relaxed">
          Add your sprint deadlines and Cloud Closet events to your Google Calendar.
        </p>
        <button onClick={addSprintToCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors">
          <Calendar size={14}/>Open Google Calendar
        </button>
      </div>

      {/* Account info */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Account</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-stone-400">Name</p>
            <p className="text-sm text-stone-800 font-medium">{profile.full_name}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-stone-400">Email</p>
            <p className="text-sm text-stone-600">{profile.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
