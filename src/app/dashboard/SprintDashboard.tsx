"use client";
import React, { useState, useRef } from "react";
import {
  Plus, X, Check, ChevronDown, ChevronUp, Loader2, RotateCcw,
  CheckCircle2, Flag, UserPlus, Calendar,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Sprint = {
  id: string; name: string; start_date: string; end_date: string;
  status: "active" | "archived"; created_by: string; created_at: string;
};
export type SprintAssignment = {
  id: string; sprint_id: string; assigned_to: string; assigned_by: string;
  sprint_focus?: string; tracking_notes?: string; created_at: string;
};
export type SprintDeliverable = {
  id: string; sprint_assignment_id: string; description: string;
  status: "pending" | "in_progress" | "complete";
  is_checkin_item: boolean; rolled_over_from?: string | null; created_at: string;
};
export type SprintCheckin = {
  id: string; sprint_assignment_id: string; submitted_at: string;
  notes?: string; week_number: 1 | 2;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysLeft(d: string) {
  return Math.max(0, Math.ceil((new Date(d + "T23:59:59").getTime() - Date.now()) / 86400000));
}
function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / 86400000);
}

// ── Internal UI pieces ────────────────────────────────────────────────────────
function Av({ name, size = 32, img }: { name: string; size?: number; img?: string }) {
  if (img) return <img src={img} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }}/>;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function RolledBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200 ml-1">
      <RotateCcw size={9}/>rolled over
    </span>
  );
}

function Wk1Badge() {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-200 ml-1">wk1</span>
  );
}

// ── Inline editable text ──────────────────────────────────────────────────────
function InlineEdit({
  value, onSave, placeholder, multiline = false, className = "",
}: {
  value: string; onSave: (v: string) => void;
  placeholder?: string; multiline?: boolean; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function open() { setDraft(value); setEditing(true); setTimeout(() => ref.current?.focus(), 0); }
  function save() { if (draft.trim() !== value) onSave(draft.trim()); setEditing(false); }

  if (!editing) return (
    <button onClick={open}
      className={`text-left w-full hover:bg-stone-50 rounded px-1 -mx-1 transition-colors ${className} ${!value ? "text-stone-400 italic" : ""}`}>
      {value || placeholder || "Click to edit…"}
    </button>
  );
  if (multiline) return (
    <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save} rows={3}
      className={`w-full resize-none px-2 py-1.5 border border-violet-300 rounded-lg text-sm focus:outline-none bg-white ${className}`}/>
  );
  return (
    <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
      onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
      className={`w-full px-2 py-1 border border-violet-300 rounded-lg text-sm focus:outline-none bg-white ${className}`}/>
  );
}

// ── Deliverable list ──────────────────────────────────────────────────────────
function DeliverableList({
  deliverables, assignmentId, canEdit, canCheck, sb, onChange,
}: {
  deliverables: SprintDeliverable[]; assignmentId: string;
  canEdit: boolean; canCheck: boolean;
  sb: any; onChange: (updated: SprintDeliverable[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [isCheckin, setIsCheckin] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addDel() {
    if (!draft.trim()) return;
    setSaving(true);
    const { data } = await sb.from("sprint_deliverables").insert({
      sprint_assignment_id: assignmentId, description: draft.trim(),
      status: "pending", is_checkin_item: isCheckin,
    }).select().single();
    if (data) onChange([...deliverables, data as SprintDeliverable]);
    setDraft(""); setIsCheckin(false); setAdding(false); setSaving(false);
  }

  async function toggle(del: SprintDeliverable) {
    if (!canCheck) return;
    const newStatus: SprintDeliverable["status"] = del.status === "complete" ? "pending" : "complete";
    await sb.from("sprint_deliverables").update({ status: newStatus }).eq("id", del.id);
    onChange(deliverables.map(d => d.id === del.id ? { ...d, status: newStatus } : d));
  }

  async function deleteDel(id: string) {
    await sb.from("sprint_deliverables").delete().eq("id", id);
    onChange(deliverables.filter(d => d.id !== id));
  }

  if (deliverables.length === 0 && !canEdit) {
    return <p className="text-sm text-stone-400 italic">No deliverables yet.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {deliverables.map(del => (
        <div key={del.id} className="flex items-start gap-2 group">
          <button onClick={() => toggle(del)} disabled={!canCheck}
            className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
              ${del.status === "complete"
                ? "bg-emerald-500 border-emerald-500"
                : "border-stone-300 hover:border-stone-500 bg-white"}`}>
            {del.status === "complete" && <Check size={10} className="text-white" strokeWidth={3}/>}
          </button>
          <div className="flex-1 min-w-0 flex items-start flex-wrap gap-1">
            <span className={`text-sm leading-snug ${del.status === "complete" ? "line-through text-stone-400" : "text-stone-700"}`}>
              {del.description}
            </span>
            {del.is_checkin_item && <Wk1Badge/>}
            {del.rolled_over_from && <RolledBadge/>}
          </div>
          {canEdit && (
            <button onClick={() => deleteDel(del.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-300 hover:text-red-400 transition-all flex-shrink-0 mt-0.5">
              <X size={12}/>
            </button>
          )}
        </div>
      ))}
      {canEdit && (
        adding ? (
          <div className="flex flex-col gap-2 pt-1 border-t border-stone-100 mt-1">
            <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addDel(); if (e.key === "Escape") setAdding(false); }}
              placeholder="Deliverable description…"
              className="w-full px-2.5 py-1.5 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:border-violet-400"/>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                <input type="checkbox" checked={isCheckin} onChange={e => setIsCheckin(e.target.checked)} className="rounded"/>
                Week 1 check-in item
              </label>
              <button onClick={addDel} disabled={saving || !draft.trim()}
                className="ml-auto px-2.5 py-1 text-xs font-semibold bg-stone-800 text-white rounded-lg disabled:opacity-50">
                {saving ? "…" : "Add"}
              </button>
              <button onClick={() => { setAdding(false); setDraft(""); }} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors pt-1">
            <Plus size={11}/>Add deliverable
          </button>
        )
      )}
    </div>
  );
}

// ── Assignment card ───────────────────────────────────────────────────────────
function AssignmentCard({
  assignment, person, myDeliverables, checkin,
  canEdit, canCheck, teamLabel, onUpdateAssignment, onChangeDeliverables, sb,
}: {
  assignment: SprintAssignment;
  person: { id: string; full_name: string; email?: string } | undefined;
  myDeliverables: SprintDeliverable[];
  checkin?: SprintCheckin;
  canEdit: boolean; canCheck: boolean;
  teamLabel?: string;
  onUpdateAssignment: (a: SprintAssignment) => void;
  onChangeDeliverables: (d: SprintDeliverable[]) => void;
  sb: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const done = myDeliverables.filter(d => d.status === "complete").length;
  const total = myDeliverables.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  async function saveFocus(v: string) {
    await sb.from("sprint_assignments").update({ sprint_focus: v || null }).eq("id", assignment.id);
    onUpdateAssignment({ ...assignment, sprint_focus: v || undefined });
  }
  async function saveNotes(v: string) {
    await sb.from("sprint_assignments").update({ tracking_notes: v || null }).eq("id", assignment.id);
    onUpdateAssignment({ ...assignment, tracking_notes: v || undefined });
  }

  const name = person?.full_name || "Unknown";

  return (
    <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <Av name={name} size={36}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-stone-800">{name}</p>
            {teamLabel && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">{teamLabel}</span>
            )}
            {checkin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-0.5">
                <Check size={9} strokeWidth={3}/>check-in done
              </span>
            )}
          </div>
          {assignment.sprint_focus && (
            <p className="text-xs text-stone-400 truncate mt-0.5">{assignment.sprint_focus}</p>
          )}
          {total > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 max-w-28 bg-stone-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}/>
              </div>
              <span className="text-xs text-stone-400">{done}/{total}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-stone-300">
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Sprint Focus</p>
            {canEdit ? (
              <InlineEdit value={assignment.sprint_focus || ""} onSave={saveFocus}
                placeholder="Click to set focus area…" className="text-sm font-medium text-stone-700"/>
            ) : (
              <p className="text-sm font-medium text-stone-700">{assignment.sprint_focus || <span className="text-stone-400 italic">No focus set</span>}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Deliverables</p>
            <DeliverableList
              deliverables={myDeliverables} assignmentId={assignment.id}
              canEdit={canEdit} canCheck={canCheck} sb={sb}
              onChange={onChangeDeliverables}/>
          </div>

          {canEdit && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Tracking Notes</p>
              <InlineEdit value={assignment.tracking_notes || ""} onSave={saveNotes}
                multiline placeholder="Click to add notes…" className="text-sm text-stone-500"/>
            </div>
          )}

          {checkin?.notes && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-600 mb-1">Week 1 Check-in Notes</p>
              <p className="text-sm text-emerald-800">{checkin.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sprint Create Modal ───────────────────────────────────────────────────────
function SprintCreateModal({
  open, onClose, activeSprint, allAssignments, allDeliverables, profileId, sb, onCreated,
}: {
  open: boolean; onClose: () => void;
  activeSprint: Sprint | null;
  allAssignments: SprintAssignment[]; allDeliverables: SprintDeliverable[];
  profileId: string; sb: any;
  onCreated: (sprint: Sprint, assignments: SprintAssignment[], deliverables: SprintDeliverable[]) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const [form, setForm] = useState({ name: "", start_date: today, end_date: twoWeeks });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  async function create() {
    if (!form.name.trim()) { setErr("Sprint name required"); return; }
    setSaving(true); setErr("");

    const { data: newSprint, error } = await sb.from("sprints").insert({
      name: form.name.trim(), start_date: form.start_date, end_date: form.end_date,
      status: "active", created_by: profileId,
    }).select().single();

    if (error || !newSprint) { setErr("Failed to create sprint"); setSaving(false); return; }

    const rolledAssignments: SprintAssignment[] = [];
    const rolledDeliverables: SprintDeliverable[] = [];

    // Archive current sprint + rollover incomplete deliverables
    if (activeSprint) {
      await sb.from("sprints").update({ status: "archived" }).eq("id", activeSprint.id);
      const prevAssignments = allAssignments.filter(a => a.sprint_id === activeSprint.id);
      for (const prev of prevAssignments) {
        const incomplete = allDeliverables.filter(d => d.sprint_assignment_id === prev.id && d.status !== "complete");
        if (!incomplete.length) continue;
        const { data: newA } = await sb.from("sprint_assignments").insert({
          sprint_id: newSprint.id, assigned_to: prev.assigned_to,
          assigned_by: profileId, sprint_focus: prev.sprint_focus,
        }).select().single();
        if (!newA) continue;
        rolledAssignments.push(newA as SprintAssignment);
        for (const del of incomplete) {
          const { data: newD } = await sb.from("sprint_deliverables").insert({
            sprint_assignment_id: newA.id, description: del.description,
            status: "pending", is_checkin_item: del.is_checkin_item, rolled_over_from: del.id,
          }).select().single();
          if (newD) rolledDeliverables.push(newD as SprintDeliverable);
        }
      }
    }

    onCreated(newSprint as Sprint, rolledAssignments, rolledDeliverables);
    setForm({ name: "", start_date: today, end_date: twoWeeks });
    setSaving(false); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Create New Sprint</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"><X size={16}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {activeSprint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm font-medium text-amber-700">"{activeSprint.name}" will be archived.</p>
              <p className="text-xs text-amber-600 mt-0.5">Incomplete deliverables roll over automatically.</p>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Sprint Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sprint 3 · May 2026"
              className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Start</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400"/>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">End</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400"/>
            </div>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button onClick={create} disabled={saving || !form.name.trim()}
            className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin"/> : <Plus size={15}/>}
            {saving ? "Creating…" : "Create Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assign Person Modal ───────────────────────────────────────────────────────
function AssignPersonModal({
  open, onClose, sprint, existingAssignments, people, profileId, sb, onAssigned,
}: {
  open: boolean; onClose: () => void; sprint: Sprint;
  existingAssignments: SprintAssignment[];
  people: { id: string; full_name: string }[];
  profileId: string; sb: any;
  onAssigned: (a: SprintAssignment) => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [focus, setFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;
  const existingIds = new Set(existingAssignments.map(a => a.assigned_to));
  const available = people.filter(p => !existingIds.has(p.id));

  async function assign() {
    if (!selectedId) { setErr("Select a person"); return; }
    setSaving(true); setErr("");
    const { data, error } = await sb.from("sprint_assignments").insert({
      sprint_id: sprint.id, assigned_to: selectedId, assigned_by: profileId,
      sprint_focus: focus.trim() || null,
    }).select().single();
    if (error || !data) { setErr("Failed to assign"); setSaving(false); return; }
    onAssigned(data as SprintAssignment);
    setSelectedId(""); setFocus(""); setSaving(false); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Assign to Sprint</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"><X size={16}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Person</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400">
              <option value="">— Select —</option>
              {available.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Sprint Focus (optional)</label>
            <input value={focus} onChange={e => setFocus(e.target.value)} placeholder="High-level focus area…"
              className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400"/>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button onClick={assign} disabled={saving || !selectedId}
            className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin"/> : <UserPlus size={15}/>}
            {saving ? "Assigning…" : "Add to Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Check-in Modal ────────────────────────────────────────────────────────────
function CheckinModal({
  open, onClose, assignment, deliverables, sb, onSubmitted,
}: {
  open: boolean; onClose: () => void;
  assignment: SprintAssignment; deliverables: SprintDeliverable[];
  sb: any; onSubmitted: (checkin: SprintCheckin) => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const checkinItems = deliverables.filter(d => d.is_checkin_item);
  const done = checkinItems.filter(d => d.status === "complete").length;

  async function submit() {
    setSaving(true);
    const { data } = await sb.from("sprint_checkins").insert({
      sprint_assignment_id: assignment.id, notes: notes.trim() || null, week_number: 1,
    }).select().single();
    if (data) onSubmitted(data as SprintCheckin);
    setSaving(false); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Week 1 Check-in</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"><X size={16}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
            <p className="text-sm font-medium text-violet-800">
              {checkinItems.length > 0
                ? `${done} of ${checkinItems.length} week 1 items complete`
                : "Check off completed deliverables before submitting."}
            </p>
            <p className="text-xs text-violet-500 mt-0.5">Mark items complete in your sprint view first.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="Updates, blockers, or context for your exec…"
              className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-violet-400 resize-none"/>
          </div>
          <button onClick={submit} disabled={saving}
            className="w-full py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin"/> : <CheckCircle2 size={15}/>}
            {saving ? "Submitting…" : "Submit Check-in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN SPRINT VIEW ─────────────────────────────────────────────────────────
export function AdminSprintView({
  sprints, setSprints,
  sprintAssignments, setSprintAssignments,
  sprintDeliverables, setSprintDeliverables,
  sprintCheckins,
  allPeople, allTeamRoles, teams, profile, sb,
}: {
  sprints: Sprint[]; setSprints: (s: Sprint[]) => void;
  sprintAssignments: SprintAssignment[]; setSprintAssignments: (a: SprintAssignment[]) => void;
  sprintDeliverables: SprintDeliverable[]; setSprintDeliverables: (d: SprintDeliverable[]) => void;
  sprintCheckins: SprintCheckin[];
  allPeople: { id: string; full_name: string; email?: string }[];
  allTeamRoles: any[]; teams: any[];
  profile: { id: string; full_name: string };
  sb: any;
}) {
  const [tab, setTab] = useState<"active" | "archive">("active");
  const [teamFilter, setTeamFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [archivedTab, setArchivedTab] = useState<string | null>(null);

  const activeSprint = sprints.find(s => s.status === "active") || null;
  const archivedSprints = sprints.filter(s => s.status === "archived")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const viewSprint = tab === "active"
    ? activeSprint
    : (archivedSprints.find(s => s.id === (archivedTab || archivedSprints[0]?.id)) || null);

  const viewAssignments = viewSprint
    ? sprintAssignments.filter(a => a.sprint_id === viewSprint.id)
    : [];

  const filteredAssignments = teamFilter === "all" ? viewAssignments : viewAssignments.filter(a => {
    return allTeamRoles.some((r: any) => r.user_id === a.assigned_to && r.team_id === teamFilter);
  });

  function getTeamLabel(userId: string) {
    const teamIds = [...new Set(
      allTeamRoles.filter((r: any) => r.user_id === userId).map((r: any) => r.team_id as string)
    )];
    return teamIds.map(tid => teams.find((t: any) => t.id === tid)?.name).filter(Boolean).join(", ");
  }

  function handleCreated(sprint: Sprint, assignments: SprintAssignment[], deliverables: SprintDeliverable[]) {
    setSprints([sprint, ...sprints.map(s => s.status === "active" ? { ...s, status: "archived" as const } : s)]);
    setSprintAssignments([...assignments, ...sprintAssignments]);
    setSprintDeliverables([...deliverables, ...sprintDeliverables]);
    setTab("active");
  }

  function handleAssigned(a: SprintAssignment) {
    setSprintAssignments([...sprintAssignments, a]);
  }

  function handleUpdateAssignment(updated: SprintAssignment) {
    setSprintAssignments(sprintAssignments.map(a => a.id === updated.id ? updated : a));
  }

  function handleChangeDeliverables(assignmentId: string, updated: SprintDeliverable[]) {
    setSprintDeliverables([
      ...sprintDeliverables.filter(d => d.sprint_assignment_id !== assignmentId),
      ...updated,
    ]);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-800">Sprints</h1>
          {activeSprint && (
            <p className="text-sm text-stone-400 mt-0.5">
              <span className="font-medium text-stone-600">{activeSprint.name}</span>
              {" · "}{fmt(activeSprint.start_date)} – {fmt(activeSprint.end_date)}
              {" · "}<span className="text-violet-500">{daysLeft(activeSprint.end_date)}d left</span>
            </p>
          )}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 transition-colors">
          <Plus size={13}/>{activeSprint ? "New Sprint" : "Create Sprint"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-stone-100 gap-1">
        {(["active", "archive"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 transition-colors
              ${tab === t ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"}`}>
            {t === "active" ? "Active Sprint" : `Archive${archivedSprints.length > 0 ? ` (${archivedSprints.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Archive sprint selector */}
      {tab === "archive" && archivedSprints.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {archivedSprints.map(s => (
            <button key={s.id} onClick={() => setArchivedTab(s.id)}
              className={`px-3 py-1.5 text-sm rounded-xl border transition-colors
                ${(archivedTab || archivedSprints[0]?.id) === s.id
                  ? "bg-stone-800 text-white border-stone-800"
                  : "border-stone-200 text-stone-600 hover:border-stone-400"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!viewSprint && tab === "active" && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-10 text-center">
          <Calendar size={28} className="text-violet-300 mx-auto mb-2"/>
          <p className="text-violet-700 font-medium">No active sprint</p>
          <p className="text-sm text-violet-500 mt-1">Create your first sprint to get started.</p>
        </div>
      )}
      {tab === "archive" && archivedSprints.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-8">No archived sprints yet.</p>
      )}

      {/* Sprint content */}
      {viewSprint && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none">
              <option value="all">All Teams</option>
              {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {tab === "active" && (
              <button onClick={() => setShowAssign(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors">
                <Plus size={14}/>Assign Person
              </button>
            )}
          </div>

          {filteredAssignments.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-8">
              {teamFilter !== "all" ? "No assignments for this team." : "No one assigned to this sprint yet."}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {filteredAssignments.map(assign => {
              const person = allPeople.find(p => p.id === assign.assigned_to);
              const myDeliverables = sprintDeliverables.filter(d => d.sprint_assignment_id === assign.id);
              const checkin = sprintCheckins.find(c => c.sprint_assignment_id === assign.id && c.week_number === 1);
              return (
                <AssignmentCard key={assign.id}
                  assignment={assign} person={person}
                  myDeliverables={myDeliverables} checkin={checkin}
                  canEdit={true} canCheck={true}
                  teamLabel={getTeamLabel(assign.assigned_to)}
                  onUpdateAssignment={handleUpdateAssignment}
                  onChangeDeliverables={d => handleChangeDeliverables(assign.id, d)}
                  sb={sb}/>
              );
            })}
          </div>
        </>
      )}

      <SprintCreateModal
        open={showCreate} onClose={() => setShowCreate(false)}
        activeSprint={activeSprint}
        allAssignments={sprintAssignments} allDeliverables={sprintDeliverables}
        profileId={profile.id} sb={sb} onCreated={handleCreated}/>

      {viewSprint && (
        <AssignPersonModal
          open={showAssign} onClose={() => setShowAssign(false)}
          sprint={viewSprint}
          existingAssignments={viewAssignments}
          people={allPeople}
          profileId={profile.id} sb={sb} onAssigned={handleAssigned}/>
      )}
    </div>
  );
}

// ── EXEC SPRINT VIEW ──────────────────────────────────────────────────────────
export function ExecSprintView({
  sprints, sprintAssignments, setSprintAssignments,
  sprintDeliverables, setSprintDeliverables, sprintCheckins,
  profile, myTeamRoles, allPeople, allTeamRoles, sb,
}: {
  sprints: Sprint[];
  sprintAssignments: SprintAssignment[]; setSprintAssignments: (a: SprintAssignment[]) => void;
  sprintDeliverables: SprintDeliverable[]; setSprintDeliverables: (d: SprintDeliverable[]) => void;
  sprintCheckins: SprintCheckin[];
  profile: { id: string; full_name: string };
  myTeamRoles: any[]; allPeople: { id: string; full_name: string }[];
  allTeamRoles: any[]; sb: any;
}) {
  const [showAssign, setShowAssign] = useState(false);

  const activeSprint = sprints.find(s => s.status === "active") || null;

  // Who this exec manages
  const managedIds = new Set(
    allTeamRoles.filter((r: any) => {
      if (r.role !== "intern") return false;
      return myTeamRoles.some((mr: any) =>
        (mr.role === "team_exec" && mr.team_id === r.team_id) ||
        (mr.role === "subteam_exec" && mr.subteam_id && mr.subteam_id === r.subteam_id)
      );
    }).map((r: any) => r.user_id as string)
  );

  const activeAssignments = activeSprint
    ? sprintAssignments.filter(a => a.sprint_id === activeSprint.id && (managedIds.has(a.assigned_to) || a.assigned_to === profile.id))
    : [];

  const myAssignment = activeAssignments.find(a => a.assigned_to === profile.id);
  const teamAssignments = activeAssignments.filter(a => a.assigned_to !== profile.id);

  function handleUpdate(updated: SprintAssignment) {
    setSprintAssignments(sprintAssignments.map(a => a.id === updated.id ? updated : a));
  }
  function handleDelChange(assignmentId: string, updated: SprintDeliverable[]) {
    setSprintDeliverables([
      ...sprintDeliverables.filter(d => d.sprint_assignment_id !== assignmentId),
      ...updated,
    ]);
  }
  function handleAssigned(a: SprintAssignment) {
    setSprintAssignments([...sprintAssignments, a]);
  }

  if (!activeSprint) return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-stone-800">Sprints</h1>
      <div className="bg-stone-50 rounded-2xl p-10 text-center text-stone-400 text-sm">No active sprint yet.</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Sprints</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          <span className="font-medium text-stone-600">{activeSprint.name}</span>
          {" · "}{fmt(activeSprint.start_date)} – {fmt(activeSprint.end_date)}
          {" · "}<span className="text-violet-500">{daysLeft(activeSprint.end_date)}d left</span>
        </p>
      </div>

      {/* Check-in status summary */}
      {teamAssignments.length > 0 && (
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Check-in Status</p>
          <div className="flex flex-col gap-1.5">
            {teamAssignments.map(a => {
              const person = allPeople.find(p => p.id === a.assigned_to);
              const submitted = sprintCheckins.some(c => c.sprint_assignment_id === a.id && c.week_number === 1);
              return (
                <div key={a.id} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${submitted ? "bg-emerald-500" : "bg-stone-300"}`}/>
                  <span className="text-sm text-stone-700 flex-1">{person?.full_name || "Unknown"}</span>
                  <span className={`text-xs ${submitted ? "text-emerald-500" : "text-stone-400"}`}>
                    {submitted ? "submitted" : "not submitted"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My own assignment */}
      {myAssignment && (
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">My Assignment</p>
          <AssignmentCard
            assignment={myAssignment}
            person={{ id: profile.id, full_name: profile.full_name }}
            myDeliverables={sprintDeliverables.filter(d => d.sprint_assignment_id === myAssignment.id)}
            canEdit={true} canCheck={true}
            onUpdateAssignment={handleUpdate}
            onChangeDeliverables={d => handleDelChange(myAssignment.id, d)}
            sb={sb}/>
        </div>
      )}

      {/* Team */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest flex-1">My Team</p>
          <button onClick={() => setShowAssign(true)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-2 py-1 transition-colors">
            <Plus size={11}/>Assign
          </button>
        </div>
        {teamAssignments.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-6">No interns assigned yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {teamAssignments.map(assign => {
            const person = allPeople.find(p => p.id === assign.assigned_to);
            const myDeliverables = sprintDeliverables.filter(d => d.sprint_assignment_id === assign.id);
            const checkin = sprintCheckins.find(c => c.sprint_assignment_id === assign.id && c.week_number === 1);
            return (
              <AssignmentCard key={assign.id}
                assignment={assign} person={person}
                myDeliverables={myDeliverables} checkin={checkin}
                canEdit={true} canCheck={true}
                onUpdateAssignment={handleUpdate}
                onChangeDeliverables={d => handleDelChange(assign.id, d)}
                sb={sb}/>
            );
          })}
        </div>
      </div>

      <AssignPersonModal
        open={showAssign} onClose={() => setShowAssign(false)}
        sprint={activeSprint}
        existingAssignments={sprintAssignments.filter(a => a.sprint_id === activeSprint.id)}
        people={allPeople.filter(p => managedIds.has(p.id))}
        profileId={profile.id} sb={sb} onAssigned={handleAssigned}/>
    </div>
  );
}

// ── INTERN SPRINT VIEW ────────────────────────────────────────────────────────
export function InternSprintView({
  sprints, sprintAssignments, sprintDeliverables, setSprintDeliverables,
  sprintCheckins, setSprintCheckins, profile, sb,
}: {
  sprints: Sprint[];
  sprintAssignments: SprintAssignment[];
  sprintDeliverables: SprintDeliverable[]; setSprintDeliverables: (d: SprintDeliverable[]) => void;
  sprintCheckins: SprintCheckin[]; setSprintCheckins: (c: SprintCheckin[]) => void;
  profile: { id: string; full_name: string };
  sb: any;
}) {
  const [showCheckin, setShowCheckin] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const activeSprint = sprints.find(s => s.status === "active") || null;
  const archivedSprints = sprints.filter(s => s.status === "archived")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const myAssignment = activeSprint
    ? sprintAssignments.find(a => a.sprint_id === activeSprint.id && a.assigned_to === profile.id)
    : null;

  const myDeliverables = myAssignment
    ? sprintDeliverables.filter(d => d.sprint_assignment_id === myAssignment.id)
    : [];

  const week1Checkin = myAssignment
    ? sprintCheckins.find(c => c.sprint_assignment_id === myAssignment.id && c.week_number === 1)
    : null;

  const sinceStart = activeSprint ? daysSince(activeSprint.start_date) : 0;
  const showCheckinBanner = sinceStart >= 5 && !!myAssignment && !week1Checkin;
  const checkinOverdue = sinceStart >= 7 && !!myAssignment && !week1Checkin;

  const done = myDeliverables.filter(d => d.status === "complete").length;
  const total = myDeliverables.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function handleDelChange(updated: SprintDeliverable[]) {
    if (!myAssignment) return;
    setSprintDeliverables([
      ...sprintDeliverables.filter(d => d.sprint_assignment_id !== myAssignment.id),
      ...updated,
    ]);
  }

  if (!activeSprint || !myAssignment) return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-stone-800">My Sprint</h1>
      <div className="bg-stone-50 rounded-2xl p-10 text-center">
        <p className="text-stone-500 font-medium">No active sprint assignment</p>
        <p className="text-sm text-stone-400 mt-1">Your exec will assign you to the next sprint.</p>
      </div>
      {archivedSprints.length > 0 && (
        <button onClick={() => setArchiveOpen(o => !o)}
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          {archiveOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          Past Sprints ({archivedSprints.length})
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Check-in banner */}
      {showCheckinBanner && (
        <div className={`border rounded-2xl p-4 flex items-center gap-3 ${checkinOverdue ? "bg-red-50 border-red-200" : "bg-violet-50 border-violet-200"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${checkinOverdue ? "bg-red-100" : "bg-violet-100"}`}>
            <Flag size={15} className={checkinOverdue ? "text-red-500" : "text-violet-600"}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${checkinOverdue ? "text-red-700" : "text-violet-800"}`}>
              {checkinOverdue ? "Check-in Overdue" : "Week 1 Check-in Due"}
            </p>
            <p className={`text-xs mt-0.5 ${checkinOverdue ? "text-red-500" : "text-violet-500"}`}>
              Let your exec know how you're tracking this sprint.
            </p>
          </div>
          <button onClick={() => setShowCheckin(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex-shrink-0 ${checkinOverdue ? "bg-red-500 text-white hover:bg-red-400" : "bg-violet-600 text-white hover:bg-violet-500"}`}>
            Submit
          </button>
        </div>
      )}

      {/* Sprint card */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-violet-500 uppercase tracking-widest">Active Sprint</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200">
            Week {sinceStart < 7 ? 1 : 2}
          </span>
        </div>
        <h1 className="text-lg font-bold text-stone-800">{activeSprint.name}</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          {fmt(activeSprint.start_date)} – {fmt(activeSprint.end_date)} · {daysLeft(activeSprint.end_date)}d left
        </p>
        {myAssignment.sprint_focus && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">My Focus</p>
            <p className="text-sm font-medium text-stone-700">{myAssignment.sprint_focus}</p>
          </div>
        )}
        {total > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Progress</p>
              <span className="text-xs text-stone-400">{done}/{total} complete</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}/>
            </div>
          </div>
        )}
      </div>

      {/* Deliverables */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Deliverables</p>
        <DeliverableList
          deliverables={myDeliverables} assignmentId={myAssignment.id}
          canEdit={false} canCheck={true} sb={sb}
          onChange={handleDelChange}/>
        {week1Checkin && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0"/>
            <span className="text-xs text-emerald-600 font-medium">Week 1 check-in submitted</span>
          </div>
        )}
      </div>

      {/* Past sprints */}
      {archivedSprints.length > 0 && (
        <div>
          <button onClick={() => setArchiveOpen(o => !o)}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
            {archiveOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            Past Sprints ({archivedSprints.length})
          </button>
          {archiveOpen && (
            <div className="mt-3 flex flex-col gap-3">
              {archivedSprints.map(sprint => {
                const pastA = sprintAssignments.find(a => a.sprint_id === sprint.id && a.assigned_to === profile.id);
                if (!pastA) return null;
                const pastDels = sprintDeliverables.filter(d => d.sprint_assignment_id === pastA.id);
                const pastDone = pastDels.filter(d => d.status === "complete").length;
                return (
                  <div key={sprint.id} className="bg-stone-50 border border-stone-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-sm font-semibold text-stone-600">{sprint.name}</p>
                      <span className="text-xs text-stone-400">{fmt(sprint.start_date)} – {fmt(sprint.end_date)}</span>
                      <span className="ml-auto text-xs text-stone-400">{pastDone}/{pastDels.length} complete</span>
                    </div>
                    {pastA.sprint_focus && (
                      <p className="text-xs text-stone-500 mb-2">Focus: {pastA.sprint_focus}</p>
                    )}
                    <div className="flex flex-col gap-1">
                      {pastDels.map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === "complete" ? "bg-emerald-500" : "bg-stone-300"}`}/>
                          <span className={d.status === "complete" ? "line-through text-stone-400" : "text-stone-600"}>{d.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CheckinModal
        open={showCheckin} onClose={() => setShowCheckin(false)}
        assignment={myAssignment} deliverables={myDeliverables}
        sb={sb} onSubmitted={c => setSprintCheckins([...sprintCheckins, c])}/>
    </div>
  );
}
