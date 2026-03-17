'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus, Trash2, Send, ChevronDown, ChevronUp, MessageSquare,
  Check, X, Pencil, BookOpen, Clock, AlertTriangle,
  Users, ShoppingBag, FileText, CheckSquare,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
type Profile = { id: string; full_name: string; email: string; role: string };
type RushPhase = { id: string; title: string; due_label: string; order_num: number };
type RushRow = { id: string; phase_id: string; week: string; dates: string; action: string; owner: string; status: string; order_num: number };
type RushInfluencer = { id: string; school: string; name: string; tiktok: string; instagram: string; followers: string; avg_views: string; audience_demo: string; deliverables: string; fee: string; status: string; notes: string; order_num: number };
type RushToteItem = { id: string; item: string; purpose: string; cost_low: number | null; cost_high: number | null; quantity: number | null; vendor: string; link?: string; status: string; order_num: number };
type RushToteSettings = { num_chapters: number; bags_per_chapter: number };
type RushStrategySection = { id: string; section_type: string; content: any[] };
type RushActionItem = { id: string; action: string; owner: string; due_date: string; priority: string; status: string; order_num: number };
type RushNote = { id: string; sub_tab: string; author_id: string; author_name: string; content: string; parent_id: string | null; created_at: string; replies?: RushNote[] };
type RushOverview = { north_star_goal: string; opportunities: string[]; extra_sections: { heading: string; body: string }[] };

// ============================================================
// UI Primitives
// ============================================================

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md';

function Btn({
  children, onClick, variant = 'secondary', size = 'md', disabled, type = 'button', className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes: Record<BtnSize, string> = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
  };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-rose-700 text-white hover:bg-rose-800',
    secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
    ghost: 'text-stone-500 hover:text-stone-700 hover:bg-stone-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-stone-100 text-stone-500',
  'Not Started': 'bg-stone-100 text-stone-500',
  in_progress: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  complete: 'bg-emerald-100 text-emerald-700',
  Complete: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  blocked: 'bg-red-100 text-red-600',
  Blocked: 'bg-red-100 text-red-600',
  not_contacted: 'bg-stone-100 text-stone-500',
  outreach_sent: 'bg-sky-100 text-sky-700',
  interested: 'bg-violet-100 text-violet-700',
  negotiating: 'bg-amber-100 text-amber-700',
  contracted: 'bg-emerald-100 text-emerald-700',
  passed: 'bg-red-100 text-red-600',
  design_needed: 'bg-violet-100 text-violet-700',
  source_vendor: 'bg-amber-100 text-amber-700',
  ordered: 'bg-sky-100 text-sky-700',
  received: 'bg-emerald-100 text-emerald-700',
  explore: 'bg-stone-100 text-stone-500',
};

function humanLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-stone-100 text-stone-500';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {humanLabel(status)}
    </span>
  );
}

function InlineEdit({
  value, onSave, disabled, placeholder, multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (disabled) {
    return (
      <span className="px-1 -mx-1 whitespace-pre-wrap">
        {value || <span className="text-stone-300">{placeholder}</span>}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:bg-rose-50 rounded px-1 -mx-1 transition-colors whitespace-pre-wrap"
        onClick={() => setEditing(true)}
      >
        {value || <span className="text-stone-300">{placeholder ?? 'Click to edit'}</span>}
      </span>
    );
  }

  const inputCls = 'border-b border-rose-300 outline-none bg-transparent w-full';

  if (multiline) {
    return (
      <textarea
        ref={ref as any}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
        className={`${inputCls} resize-none min-h-[60px]`}
        rows={3}
      />
    );
  }
  return (
    <input
      ref={ref as any}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { setEditing(false); setDraft(value); }
      }}
      className={inputCls}
      placeholder={placeholder}
    />
  );
}

function StatusSelect({
  value, options, onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-stone-200 rounded-lg text-xs px-2 py-1 bg-white"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ============================================================
// NotesSidebar
// ============================================================

function NotesSidebar({
  subtab, notes, profile, sb, canAddNotes, onNotesChange,
}: {
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  sb: any;
  canAddNotes: boolean;
  onNotesChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabNotes = useMemo(() => {
    const top = notes.filter(n => n.sub_tab === subtab && n.parent_id === null);
    return top.map(n => ({
      ...n,
      replies: notes.filter(r => r.parent_id === n.id),
    }));
  }, [notes, subtab]);

  async function submitNote() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await sb.from('rush_notes').insert({
      sub_tab: subtab,
      author_id: profile.id,
      author_name: profile.full_name,
      content: text.trim(),
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('note insert', error);
    else { setText(''); onNotesChange(); }
    setSubmitting(false);
  }

  async function submitReply(parentId: string) {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await sb.from('rush_notes').insert({
      sub_tab: subtab,
      author_id: profile.id,
      author_name: profile.full_name,
      content: replyText.trim(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('reply insert', error);
    else { setReplyTo(null); setReplyText(''); onNotesChange(); }
    setSubmitting(false);
  }

  async function deleteNote(id: string) {
    const { error } = await sb.from('rush_notes').delete().eq('id', id);
    if (error) console.error('note delete', error);
    else onNotesChange();
  }

  function canDelete(note: RushNote) {
    return profile.role === 'admin' || note.author_id === profile.id;
  }

  function fmtDate(s: string) {
    try {
      return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return s; }
  }

  return (
    <div className={`flex-shrink-0 ${open ? 'w-64' : 'w-10'} transition-all duration-200`}>
      <div className="bg-white border border-rose-100 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-rose-100">
          {open && <span className="text-xs font-semibold text-stone-600">Notes</span>}
          <button
            onClick={() => setOpen(p => !p)}
            className="ml-auto text-stone-400 hover:text-stone-600 p-0.5 rounded"
          >
            {open ? <X size={14} /> : <MessageSquare size={14} />}
          </button>
        </div>

        {open && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
            {tabNotes.length === 0 && (
              <p className="text-xs text-stone-400 italic">No notes yet.</p>
            )}
            {tabNotes.map(note => (
              <div key={note.id} className="flex flex-col gap-1">
                <div className="bg-stone-50 rounded-lg p-2.5 text-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-stone-700">{note.author_name}</span>
                    {canDelete(note) && (
                      <button onClick={() => deleteNote(note.id)} className="text-stone-300 hover:text-red-400">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <p className="text-stone-600 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-stone-400">{fmtDate(note.created_at)}</span>
                    {canAddNotes && (
                      <button
                        onClick={() => setReplyTo(replyTo === note.id ? null : note.id)}
                        className="text-rose-400 hover:text-rose-600 text-[10px]"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {note.replies && note.replies.length > 0 && (
                  <div className="pl-3 flex flex-col gap-1 border-l-2 border-rose-100">
                    {note.replies.map(reply => (
                      <div key={reply.id} className="bg-rose-50/50 rounded-lg p-2 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-stone-700">{reply.author_name}</span>
                          {canDelete(reply) && (
                            <button onClick={() => deleteNote(reply.id)} className="text-stone-300 hover:text-red-400">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                        <p className="text-stone-600 whitespace-pre-wrap">{reply.content}</p>
                        <span className="text-stone-400 text-[10px]">{fmtDate(reply.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {replyTo === note.id && canAddNotes && (
                  <div className="pl-3 flex gap-1.5">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="flex-1 text-xs border border-rose-200 rounded-lg px-2 py-1.5 outline-none focus:border-rose-400 resize-none"
                    />
                    <button
                      onClick={() => submitReply(note.id)}
                      disabled={!replyText.trim() || submitting}
                      className="text-rose-600 hover:text-rose-800 disabled:opacity-40"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {open && canAddNotes && (
          <div className="p-3 border-t border-rose-100 flex gap-1.5">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="flex-1 text-xs border border-rose-200 rounded-lg px-2 py-1.5 outline-none focus:border-rose-400 resize-none"
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submitNote(); }}
            />
            <button
              onClick={submitNote}
              disabled={!text.trim() || submitting}
              className="text-rose-600 hover:text-rose-800 disabled:opacity-40 self-end pb-1"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OverviewTab
// ============================================================

function OverviewTab({
  overview, onSave, canEdit, subtab, notes, profile, sb, onNotesChange,
}: {
  overview: RushOverview;
  onSave: (o: RushOverview) => void;
  canEdit: boolean;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  sb: any;
  onNotesChange: () => void;
}) {
  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* North Star Goal */}
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">North Star Goal</h3>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p className="text-rose-900/80 text-sm leading-relaxed">
              <InlineEdit
                value={overview.north_star_goal}
                onSave={v => onSave({ ...overview, north_star_goal: v })}
                disabled={!canEdit}
                placeholder="Enter north star goal..."
                multiline
              />
            </p>
          </div>
        </div>

        {/* Key Opportunity Windows */}
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">Key Opportunity Windows</h3>
          <div className="flex flex-col gap-2">
            {overview.opportunities.map((opp, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <span className="text-rose-400 mt-1 flex-shrink-0">•</span>
                <div className="flex-1 text-sm text-stone-700">
                  <InlineEdit
                    value={opp}
                    onSave={v => {
                      const next = [...overview.opportunities];
                      next[i] = v;
                      onSave({ ...overview, opportunities: next });
                    }}
                    disabled={!canEdit}
                    placeholder="Opportunity..."
                  />
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      const next = overview.opportunities.filter((_, idx) => idx !== i);
                      onSave({ ...overview, opportunities: next });
                    }}
                    className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && (
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => onSave({ ...overview, opportunities: [...overview.opportunities, ''] })}
              >
                <Plus size={13} /> Add Opportunity
              </Btn>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        {overview.extra_sections.length > 0 && (
          <div className="flex flex-col gap-4">
            {overview.extra_sections.map((sec, i) => (
              <div key={i} className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h4 className="font-semibold text-stone-700 text-sm">
                    <InlineEdit
                      value={sec.heading}
                      onSave={v => {
                        const next = [...overview.extra_sections];
                        next[i] = { ...next[i], heading: v };
                        onSave({ ...overview, extra_sections: next });
                      }}
                      disabled={!canEdit}
                      placeholder="Section heading..."
                    />
                  </h4>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const next = overview.extra_sections.filter((_, idx) => idx !== i);
                        onSave({ ...overview, extra_sections: next });
                      }}
                      className="text-stone-300 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="text-sm text-stone-600">
                  <InlineEdit
                    value={sec.body}
                    onSave={v => {
                      const next = [...overview.extra_sections];
                      next[i] = { ...next[i], body: v };
                      onSave({ ...overview, extra_sections: next });
                    }}
                    disabled={!canEdit}
                    placeholder="Section content..."
                    multiline
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {canEdit && (
          <Btn
            size="sm"
            variant="secondary"
            onClick={() => onSave({ ...overview, extra_sections: [...overview.extra_sections, { heading: 'New Section', body: '' }] })}
          >
            <Plus size={13} /> Add Section
          </Btn>
        )}
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// TimelineTab
// ============================================================

const ROW_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
];

function TimelineTab({
  phases, rows, canEdit, sb, onPhaseChange, subtab, notes, profile, onNotesChange,
}: {
  phases: RushPhase[];
  rows: RushRow[];
  canEdit: boolean;
  sb: any;
  onPhaseChange: () => void;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  onNotesChange: () => void;
}) {
  async function updatePhaseField(id: string, field: 'title' | 'due_label', value: string) {
    const { error } = await sb.from('rush_timeline_phases').update({ [field]: value }).eq('id', id);
    if (error) console.error('phase update', error);
    else onPhaseChange();
  }

  async function updateRowField(id: string, field: string, value: string) {
    const { error } = await sb.from('rush_timeline_rows').update({ [field]: value }).eq('id', id);
    if (error) console.error('row update', error);
    else onPhaseChange();
  }

  async function deleteRow(id: string) {
    const { error } = await sb.from('rush_timeline_rows').delete().eq('id', id);
    if (error) console.error('row delete', error);
    else onPhaseChange();
  }

  async function addRow(phaseId: string, orderNum: number) {
    const { error } = await sb.from('rush_timeline_rows').insert({
      id: crypto.randomUUID(),
      phase_id: phaseId,
      week: '',
      dates: '',
      action: '',
      owner: '',
      status: 'not_started',
      order_num: orderNum,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('row insert', error);
    else onPhaseChange();
  }

  async function addPhase() {
    const newOrder = phases.length;
    const { error } = await sb.from('rush_timeline_phases').insert({
      id: crypto.randomUUID(),
      title: 'New Phase',
      due_label: '',
      order_num: newOrder,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('phase insert', error);
    else onPhaseChange();
  }

  async function deletePhase(id: string) {
    const { error } = await sb.from('rush_timeline_phases').delete().eq('id', id);
    if (error) console.error('phase delete', error);
    else onPhaseChange();
  }

  const sortedPhases = [...phases].sort((a, b) => a.order_num - b.order_num);

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        {sortedPhases.map(phase => {
          const phaseRows = rows.filter(r => r.phase_id === phase.id).sort((a, b) => a.order_num - b.order_num);
          const isTote = phase.order_num === 2 || phase.title.toLowerCase().includes('tote');
          const col1 = isTote ? 'Milestone' : 'Week';
          const col2 = isTote ? 'Target Date' : 'Dates';

          return (
            <div key={phase.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-rose-700 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    <InlineEdit
                      value={phase.title}
                      onSave={v => updatePhaseField(phase.id, 'title', v)}
                      disabled={!canEdit}
                      placeholder="Phase title..."
                    />
                  </h3>
                  <p className="text-rose-200 text-xs mt-0.5">
                    <InlineEdit
                      value={phase.due_label}
                      onSave={v => updatePhaseField(phase.id, 'due_label', v)}
                      disabled={!canEdit}
                      placeholder="Due label..."
                    />
                  </p>
                </div>
                {canEdit && (
                  <button onClick={() => deletePhase(phase.id)} className="text-rose-200 hover:text-white">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-rose-50 text-xs text-stone-500 border-b border-stone-100">
                      <th className="text-left px-3 py-2 font-medium w-24">{col1}</th>
                      <th className="text-left px-3 py-2 font-medium w-28">{col2}</th>
                      <th className="text-left px-3 py-2 font-medium">Action</th>
                      <th className="text-left px-3 py-2 font-medium w-28">Owner</th>
                      <th className="text-left px-3 py-2 font-medium w-32">Status</th>
                      {canEdit && <th className="w-8" />}
                    </tr>
                  </thead>
                  <tbody>
                    {phaseRows.map((row, idx) => (
                      <tr key={row.id} className={`border-b border-stone-100 ${idx % 2 === 1 ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-3 py-2 text-stone-700 align-top">
                          <InlineEdit value={row.week} onSave={v => updateRowField(row.id, 'week', v)} disabled={!canEdit} placeholder="—" />
                        </td>
                        <td className="px-3 py-2 text-stone-600 align-top">
                          <InlineEdit value={row.dates} onSave={v => updateRowField(row.id, 'dates', v)} disabled={!canEdit} placeholder="—" />
                        </td>
                        <td className="px-3 py-2 text-stone-700 align-top">
                          <InlineEdit value={row.action} onSave={v => updateRowField(row.id, 'action', v)} disabled={!canEdit} placeholder="—" multiline />
                        </td>
                        <td className="px-3 py-2 text-stone-600 align-top">
                          <InlineEdit value={row.owner} onSave={v => updateRowField(row.id, 'owner', v)} disabled={!canEdit} placeholder="—" />
                        </td>
                        <td className="px-3 py-2 align-top">
                          {canEdit ? (
                            <StatusSelect
                              value={row.status}
                              options={ROW_STATUS_OPTIONS}
                              onChange={v => updateRowField(row.id, 'status', v)}
                            />
                          ) : (
                            <StatusPill status={row.status} />
                          )}
                        </td>
                        {canEdit && (
                          <td className="px-2 py-2 align-top">
                            <button onClick={() => deleteRow(row.id)} className="text-stone-300 hover:text-red-400">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {canEdit && (
                <div className="px-4 py-2 border-t border-stone-100">
                  <Btn size="sm" variant="ghost" onClick={() => addRow(phase.id, phaseRows.length)}>
                    <Plus size={12} /> Add Row
                  </Btn>
                </div>
              )}
            </div>
          );
        })}

        {canEdit && (
          <Btn variant="secondary" size="sm" onClick={addPhase}>
            <Plus size={13} /> Add New Phase
          </Btn>
        )}
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// InfluencerTab
// ============================================================

const INFLUENCER_STATUSES = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'outreach_sent', label: 'Outreach Sent' },
  { value: 'interested', label: 'Interested' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'passed', label: 'Passed' },
];

const DEFAULT_SCHOOLS = [
  'University of Texas Austin',
  'University of Alabama',
  'Ole Miss',
  'University of Arizona',
  'University of Miami',
  'TBD / Additional Schools',
];

function InfluencerTab({
  influencers, canEdit, sb, onChange, subtab, notes, profile, onNotesChange,
}: {
  influencers: RushInfluencer[];
  canEdit: boolean;
  sb: any;
  onChange: () => void;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  onNotesChange: () => void;
}) {
  const [filter, setFilter] = useState('all');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const schoolOrder = useMemo(() => {
    const fromData = influencers.map(i => i.school).filter(Boolean);
    const all = [...DEFAULT_SCHOOLS, ...fromData];
    const seen = new Set<string>();
    return all.filter(s => { if (seen.has(s)) return false; seen.add(s); return true; });
  }, [influencers]);

  const filtered = filter === 'all' ? influencers : influencers.filter(i => i.status === filter);

  async function updateField(id: string, field: string, value: string) {
    const { error } = await sb.from('rush_influencers').update({ [field]: value }).eq('id', id);
    if (error) console.error('influencer update', error);
    else onChange();
  }

  async function deleteInfluencer(id: string) {
    const { error } = await sb.from('rush_influencers').delete().eq('id', id);
    if (error) console.error('influencer delete', error);
    else onChange();
  }

  async function addInfluencer(school: string) {
    const { error } = await sb.from('rush_influencers').insert({
      id: crypto.randomUUID(),
      school,
      name: '',
      tiktok: '',
      instagram: '',
      followers: '',
      avg_views: '',
      audience_demo: '',
      deliverables: '',
      fee: '',
      status: 'not_contacted',
      notes: '',
      order_num: influencers.filter(i => i.school === school).length,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('influencer insert', error);
    else onChange();
  }

  async function addSchool() {
    const name = window.prompt('Enter school name:');
    if (!name?.trim()) return;
    await addInfluencer(name.trim());
  }

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {['all', ...INFLUENCER_STATUSES.map(s => s.value)].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === s ? 'bg-rose-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {s === 'all' ? 'All' : humanLabel(s)}
            </button>
          ))}
        </div>

        {schoolOrder.map(school => {
          const schoolInfluencers = filtered.filter(i => i.school === school);
          const hasAny = influencers.some(i => i.school === school);
          if (!hasAny && filter !== 'all') return null;
          return (
            <div key={school}>
              <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <Users size={14} className="text-rose-400" />
                {school}
              </h3>
              {schoolInfluencers.length === 0 && (
                <p className="text-xs text-stone-400 italic mb-2">No influencers{filter !== 'all' ? ' matching this filter' : ''} yet.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {schoolInfluencers.map(inf => (
                  <div key={inf.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2 hover:border-rose-200 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-stone-800 text-sm flex-1">
                        <InlineEdit value={inf.name} onSave={v => updateField(inf.id, 'name', v)} disabled={!canEdit} placeholder="Name" />
                      </div>
                      {canEdit && (
                        <button onClick={() => deleteInfluencer(inf.id)} className="text-stone-300 hover:text-red-400 flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600">
                      <div>
                        <span className="text-stone-400 block">TikTok</span>
                        <InlineEdit value={inf.tiktok} onSave={v => updateField(inf.id, 'tiktok', v)} disabled={!canEdit} placeholder="@handle" />
                      </div>
                      <div>
                        <span className="text-stone-400 block">Instagram</span>
                        <InlineEdit value={inf.instagram} onSave={v => updateField(inf.id, 'instagram', v)} disabled={!canEdit} placeholder="@handle" />
                      </div>
                      <div>
                        <span className="text-stone-400 block">Followers</span>
                        <InlineEdit value={inf.followers} onSave={v => updateField(inf.id, 'followers', v)} disabled={!canEdit} placeholder="—" />
                      </div>
                      <div>
                        <span className="text-stone-400 block">Avg Views</span>
                        <InlineEdit value={inf.avg_views} onSave={v => updateField(inf.id, 'avg_views', v)} disabled={!canEdit} placeholder="—" />
                      </div>
                      <div className="col-span-2">
                        <span className="text-stone-400 block">Audience</span>
                        <InlineEdit value={inf.audience_demo} onSave={v => updateField(inf.id, 'audience_demo', v)} disabled={!canEdit} placeholder="—" />
                      </div>
                      <div>
                        <span className="text-stone-400 block">Deliverables</span>
                        <InlineEdit value={inf.deliverables} onSave={v => updateField(inf.id, 'deliverables', v)} disabled={!canEdit} placeholder="—" />
                      </div>
                      <div>
                        <span className="text-stone-400 block">Fee</span>
                        <InlineEdit value={inf.fee} onSave={v => updateField(inf.id, 'fee', v)} disabled={!canEdit} placeholder="—" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingStatus === inf.id ? (
                        <StatusSelect
                          value={inf.status}
                          options={INFLUENCER_STATUSES}
                          onChange={v => { updateField(inf.id, 'status', v); setEditingStatus(null); }}
                        />
                      ) : (
                        <button onClick={() => canEdit && setEditingStatus(inf.id)} className={canEdit ? 'cursor-pointer' : 'cursor-default'}>
                          <StatusPill status={inf.status} />
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-stone-600">
                      <span className="text-stone-400 block">Notes</span>
                      <InlineEdit value={inf.notes} onSave={v => updateField(inf.id, 'notes', v)} disabled={!canEdit} placeholder="—" multiline />
                    </div>
                  </div>
                ))}
              </div>

              {canEdit && (
                <div className="mt-2">
                  <Btn size="sm" variant="ghost" onClick={() => addInfluencer(school)}>
                    <Plus size={12} /> Add Influencer
                  </Btn>
                </div>
              )}
            </div>
          );
        })}

        {canEdit && (
          <div className="pt-2">
            <Btn size="sm" variant="secondary" onClick={addSchool}>
              <Plus size={13} /> Add New School
            </Btn>
          </div>
        )}
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// ToteBagTab
// ============================================================

const TOTE_STATUS_OPTIONS = [
  { value: 'design_needed', label: 'Design Needed' },
  { value: 'source_vendor', label: 'Source Vendor' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'explore', label: 'Explore' },
];

function ToteBagTab({
  items, settings, canEdit, sb, onItemChange, onSettingsChange, subtab, notes, profile, onNotesChange,
}: {
  items: RushToteItem[];
  settings: RushToteSettings;
  canEdit: boolean;
  sb: any;
  onItemChange: () => void;
  onSettingsChange: (s: RushToteSettings) => void;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  onNotesChange: () => void;
}) {
  const sortedItems = [...items].sort((a, b) => a.order_num - b.order_num);

  async function updateItemField(id: string, field: string, value: any) {
    const { error } = await sb.from('rush_tote_items').update({ [field]: value }).eq('id', id);
    if (error) console.error('tote item update', error);
    else onItemChange();
  }

  async function deleteItem(id: string) {
    const { error } = await sb.from('rush_tote_items').delete().eq('id', id);
    if (error) console.error('tote item delete', error);
    else onItemChange();
  }

  async function addItem() {
    const { error } = await sb.from('rush_tote_items').insert({
      id: crypto.randomUUID(),
      item: '',
      purpose: '',
      cost_low: null,
      cost_high: null,
      quantity: 1,
      vendor: '',
      link: '',
      status: 'explore',
      order_num: items.length,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('tote item insert', error);
    else onItemChange();
  }

  async function saveSettings(next: RushToteSettings) {
    const { error } = await sb.from('rush_tote_settings').upsert({
      id: '00000000-0000-0000-0000-000000000002',
      ...next,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('tote settings save', error);
    else onSettingsChange(next);
  }

  const totalBags = settings.num_chapters * settings.bags_per_chapter;
  const costPerBagLow = items.reduce((sum, i) => sum + (i.cost_low ?? 0), 0);
  const costPerBagHigh = items.reduce((sum, i) => sum + (i.cost_high ?? 0), 0);
  const totalLow = items.reduce((sum, i) => sum + (i.cost_low ?? 0) * (i.quantity ?? 1), 0) * settings.num_chapters;
  const totalHigh = items.reduce((sum, i) => sum + (i.cost_high ?? 0) * (i.quantity ?? 1), 0) * settings.num_chapters;

  function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }); }

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {/* Budget Summary */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-stone-500 mb-0.5">Total Items</p>
            <p className="text-lg font-semibold text-stone-800">{items.length}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-0.5">Est. Cost / Bag</p>
            <p className="text-lg font-semibold text-stone-800">{fmt(costPerBagLow)}–{fmt(costPerBagHigh)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Number of Chapters</p>
            {canEdit ? (
              <input
                type="number"
                value={settings.num_chapters}
                onChange={e => saveSettings({ ...settings, num_chapters: Number(e.target.value) })}
                className="border border-rose-200 rounded-lg px-2 py-1 text-sm bg-white w-24 outline-none focus:border-rose-400"
                min={0}
              />
            ) : (
              <p className="text-lg font-semibold text-stone-800">{settings.num_chapters}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Bags / Chapter</p>
            {canEdit ? (
              <input
                type="number"
                value={settings.bags_per_chapter}
                onChange={e => saveSettings({ ...settings, bags_per_chapter: Number(e.target.value) })}
                className="border border-rose-200 rounded-lg px-2 py-1 text-sm bg-white w-24 outline-none focus:border-rose-400"
                min={0}
              />
            ) : (
              <p className="text-lg font-semibold text-stone-800">{settings.bags_per_chapter}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-0.5">Total Bags</p>
            <p className="text-lg font-semibold text-stone-800">{totalBags.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-0.5">Total Est. Budget</p>
            <p className="text-lg font-semibold text-rose-700">{fmt(totalLow)}–{fmt(totalHigh)}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-700 text-white text-xs">
                  <th className="text-left px-3 py-2 font-medium">Item</th>
                  <th className="text-left px-3 py-2 font-medium">Purpose</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Cost/Unit</th>
                  <th className="text-left px-3 py-2 font-medium w-16">Qty</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Total Est.</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Vendor</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Link</th>
                  <th className="text-left px-3 py-2 font-medium w-32">Status</th>
                  {canEdit && <th className="w-8" />}
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, idx) => {
                  const totalEst = ((item.cost_low ?? 0) + (item.cost_high ?? 0)) / 2 * (item.quantity ?? 1);
                  return (
                    <tr key={item.id} className={`border-b border-stone-100 ${idx % 2 === 1 ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-3 py-2 font-medium text-stone-800 align-top">
                        <InlineEdit value={item.item} onSave={v => updateItemField(item.id, 'item', v)} disabled={!canEdit} placeholder="Item name" />
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        <InlineEdit value={item.purpose} onSave={v => updateItemField(item.id, 'purpose', v)} disabled={!canEdit} placeholder="—" multiline />
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        {canEdit ? (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-stone-400">$</span>
                            <input
                              type="number"
                              value={item.cost_low ?? ''}
                              onChange={e => updateItemField(item.id, 'cost_low', e.target.value === '' ? null : Number(e.target.value))}
                              className="w-12 border-b border-stone-200 outline-none bg-transparent text-center"
                              step="0.25"
                              min={0}
                            />
                            <span className="text-stone-400">–$</span>
                            <input
                              type="number"
                              value={item.cost_high ?? ''}
                              onChange={e => updateItemField(item.id, 'cost_high', e.target.value === '' ? null : Number(e.target.value))}
                              className="w-12 border-b border-stone-200 outline-none bg-transparent text-center"
                              step="0.25"
                              min={0}
                            />
                          </div>
                        ) : (
                          <span>{item.cost_low != null ? `$${item.cost_low}–$${item.cost_high}` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        {canEdit ? (
                          <input
                            type="number"
                            value={item.quantity ?? ''}
                            onChange={e => updateItemField(item.id, 'quantity', e.target.value === '' ? null : Number(e.target.value))}
                            className="w-12 border-b border-stone-200 outline-none bg-transparent text-center text-xs"
                            min={0}
                          />
                        ) : (
                          <span>{item.quantity ?? '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top text-xs">
                        {totalEst > 0 ? fmt(totalEst) : '—'}
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        <InlineEdit value={item.vendor} onSave={v => updateItemField(item.id, 'vendor', v)} disabled={!canEdit} placeholder="TBD" />
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        {canEdit ? (
                          <InlineEdit value={item.link ?? ''} onSave={v => updateItemField(item.id, 'link', v)} disabled={false} placeholder="https://..." />
                        ) : item.link ? (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline text-xs truncate block max-w-[120px]">Link</a>
                        ) : <span className="text-stone-300">—</span>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {canEdit ? (
                          <StatusSelect
                            value={item.status}
                            options={TOTE_STATUS_OPTIONS}
                            onChange={v => updateItemField(item.id, 'status', v)}
                          />
                        ) : (
                          <StatusPill status={item.status} />
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-2 py-2 align-top">
                          <button onClick={() => deleteItem(item.id)} className="text-stone-300 hover:text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canEdit && (
            <div className="px-4 py-2 border-t border-stone-100">
              <Btn size="sm" variant="ghost" onClick={addItem}>
                <Plus size={12} /> Add Item
              </Btn>
            </div>
          )}
        </div>
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// DownloadCardTab
// ============================================================

function DownloadCardTab({
  sections, canEdit, sb, onChange, subtab, notes, profile, onNotesChange,
}: {
  sections: RushStrategySection[];
  canEdit: boolean;
  sb: any;
  onChange: () => void;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  onNotesChange: () => void;
}) {
  const SECTION_META: Record<string, { title: string }> = {
    specs: { title: 'Card Specs' },
    hook_copy: { title: 'Hook Copy Ideas' },
    tracking: { title: 'Chapter Tracking Plan' },
    followup: { title: 'Post-Rush Follow Up' },
    schools: { title: 'Target Schools' },
    distribution: { title: 'Getting Cards into PNM Bags' },
  };

  const SCHOOL_STATUS_OPTIONS = [
    { value: 'not_contacted', label: 'Not Contacted' },
    { value: 'outreach_sent', label: 'Outreach Sent' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cards_sent', label: 'Cards Sent' },
  ];
  const SCHOOL_STATUS_STYLES: Record<string, string> = {
    not_contacted: 'bg-stone-100 text-stone-500',
    outreach_sent: 'bg-sky-100 text-sky-700',
    confirmed: 'bg-violet-100 text-violet-700',
    cards_sent: 'bg-emerald-100 text-emerald-700',
  };

  async function updateSectionContent(sectionId: string, content: any[]) {
    const { error } = await sb.from('rush_strategy_sections').update({ content, updated_at: new Date().toISOString() }).eq('id', sectionId);
    if (error) console.error('strategy section update', error);
    else onChange();
  }

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {['specs', 'hook_copy', 'tracking', 'followup'].map(type => {
          const section = sections.find(s => s.section_type === type);
          if (!section) return null;
          const meta = SECTION_META[type];
          const content = section.content ?? [];

          return (
            <div key={type} className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-stone-800 text-sm">{meta.title}</h3>

              {type === 'specs' && (
                <div className="flex flex-col gap-2">
                  {(content as { label: string; value: string }[]).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 group">
                      <div className="flex-1 text-xs">
                        <div className="font-medium text-stone-700">
                          <InlineEdit
                            value={item.label}
                            onSave={v => {
                              const next = [...content] as { label: string; value: string }[];
                              next[i] = { ...next[i], label: v };
                              updateSectionContent(section.id, next);
                            }}
                            disabled={!canEdit}
                            placeholder="Label"
                          />
                        </div>
                        <div className="text-stone-500">
                          <InlineEdit
                            value={item.value}
                            onSave={v => {
                              const next = [...content] as { label: string; value: string }[];
                              next[i] = { ...next[i], value: v };
                              updateSectionContent(section.id, next);
                            }}
                            disabled={!canEdit}
                            placeholder="Value"
                            multiline
                          />
                        </div>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))}
                          className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, { label: '', value: '' }])}>
                      <Plus size={11} /> Add Item
                    </Btn>
                  )}
                </div>
              )}

              {type === 'hook_copy' && (
                <div className="flex flex-col gap-2">
                  {(content as string[]).map((line, i) => (
                    <div key={i} className="group flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3">
                      <span className="text-rose-300 text-sm mt-0.5">"</span>
                      <div className="flex-1 text-sm text-stone-700 italic">
                        <InlineEdit
                          value={line}
                          onSave={v => {
                            const next = [...content] as string[];
                            next[i] = v;
                            updateSectionContent(section.id, next);
                          }}
                          disabled={!canEdit}
                          placeholder="Hook line..."
                        />
                      </div>
                      <span className="text-rose-300 text-sm mt-0.5">"</span>
                      {canEdit && (
                        <button
                          onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))}
                          className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, ''])}>
                      <Plus size={11} /> Add Copy Idea
                    </Btn>
                  )}
                </div>
              )}

              {type === 'tracking' && (
                <div className="flex flex-col gap-2">
                  {(content as string[]).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 group">
                      <span className="text-rose-400 mt-1 flex-shrink-0">•</span>
                      <div className="flex-1 text-sm text-stone-700">
                        <InlineEdit
                          value={line}
                          onSave={v => {
                            const next = [...content] as string[];
                            next[i] = v;
                            updateSectionContent(section.id, next);
                          }}
                          disabled={!canEdit}
                          placeholder="Bullet point..."
                        />
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))}
                          className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, ''])}>
                      <Plus size={11} /> Add Item
                    </Btn>
                  )}
                </div>
              )}

              {type === 'followup' && (
                <div className="flex flex-col gap-2">
                  {(content as { text: string; checked: boolean }[]).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <button
                        onClick={async () => {
                          const next = [...content] as { text: string; checked: boolean }[];
                          next[i] = { ...next[i], checked: !next[i].checked };
                          await updateSectionContent(section.id, next);
                        }}
                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-rose-400'}`}
                      >
                        {item.checked && <Check size={10} className="text-white" />}
                      </button>
                      <div className={`flex-1 text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                        <InlineEdit
                          value={item.text}
                          onSave={v => {
                            const next = [...content] as { text: string; checked: boolean }[];
                            next[i] = { ...next[i], text: v };
                            updateSectionContent(section.id, next);
                          }}
                          disabled={!canEdit}
                          placeholder="Follow-up item..."
                        />
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))}
                          className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, { text: '', checked: false }])}>
                      <Plus size={11} /> Add Item
                    </Btn>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>

        {/* Target Schools — full width */}
        {(() => {
          const section = sections.find(s => s.section_type === 'schools');
          if (!section) return null;
          const content = (section.content ?? []) as { name: string; contact: string; email: string; status: string; notes: string }[];
          return (
            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-stone-800 text-sm">Target Schools</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-rose-700 text-white text-xs">
                      <th className="text-left px-3 py-2 font-medium">School</th>
                      <th className="text-left px-3 py-2 font-medium">Panhellenic Contact</th>
                      <th className="text-left px-3 py-2 font-medium">Email</th>
                      <th className="text-left px-3 py-2 font-medium w-36">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Notes</th>
                      {canEdit && <th className="w-8" />}
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((row, i) => (
                      <tr key={i} className={`border-b border-stone-100 ${i % 2 === 1 ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-3 py-2 font-medium text-stone-800 align-top">
                          <InlineEdit value={row.name} onSave={v => { const next = [...content]; next[i] = { ...next[i], name: v }; updateSectionContent(section.id, next); }} disabled={!canEdit} placeholder="School name" />
                        </td>
                        <td className="px-3 py-2 text-stone-600 align-top">
                          <InlineEdit value={row.contact} onSave={v => { const next = [...content]; next[i] = { ...next[i], contact: v }; updateSectionContent(section.id, next); }} disabled={!canEdit} placeholder="Name" />
                        </td>
                        <td className="px-3 py-2 text-stone-600 align-top">
                          <InlineEdit value={row.email} onSave={v => { const next = [...content]; next[i] = { ...next[i], email: v }; updateSectionContent(section.id, next); }} disabled={!canEdit} placeholder="email@school.edu" />
                        </td>
                        <td className="px-3 py-2 align-top">
                          {canEdit ? (
                            <select
                              value={row.status}
                              onChange={e => { const next = [...content]; next[i] = { ...next[i], status: e.target.value }; updateSectionContent(section.id, next); }}
                              className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-rose-400"
                            >
                              {[{ value: 'not_contacted', label: 'Not Contacted' }, { value: 'outreach_sent', label: 'Outreach Sent' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cards_sent', label: 'Cards Sent' }].map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SCHOOL_STATUS_STYLES[row.status] ?? 'bg-stone-100 text-stone-500'}`}>
                              {SCHOOL_STATUS_OPTIONS.find(o => o.value === row.status)?.label ?? row.status}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-stone-600 align-top">
                          <InlineEdit value={row.notes} onSave={v => { const next = [...content]; next[i] = { ...next[i], notes: v }; updateSectionContent(section.id, next); }} disabled={!canEdit} placeholder="—" multiline />
                        </td>
                        {canEdit && (
                          <td className="px-2 py-2 align-top">
                            <button onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-400">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {canEdit && (
                <div>
                  <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, { name: '', contact: '', email: '', status: 'not_contacted', notes: '' }])}>
                    <Plus size={12} /> Add School
                  </Btn>
                </div>
              )}
            </div>
          );
        })()}

        {/* Distribution Steps — full width */}
        {(() => {
          const section = sections.find(s => s.section_type === 'distribution');
          if (!section) return null;
          const content = (section.content ?? []) as { text: string; checked: boolean }[];
          return (
            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3">
              <div>
                <h3 className="font-semibold text-stone-800 text-sm">Getting Cards into PNM Bags</h3>
                <p className="text-xs text-stone-400 mt-0.5">Step-by-step process for coordinating with each school's panhellenic</p>
              </div>
              <div className="flex flex-col gap-2">
                {content.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <button
                      onClick={async () => {
                        const next = [...content];
                        next[i] = { ...next[i], checked: !next[i].checked };
                        await updateSectionContent(section.id, next);
                      }}
                      className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-rose-400'}`}
                    >
                      {item.checked && <Check size={10} className="text-white" />}
                    </button>
                    <div className={`flex-1 text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                      <InlineEdit
                        value={item.text}
                        onSave={v => { const next = [...content]; next[i] = { ...next[i], text: v }; updateSectionContent(section.id, next); }}
                        disabled={!canEdit}
                        placeholder="Step description..."
                      />
                    </div>
                    {canEdit && (
                      <button onClick={() => updateSectionContent(section.id, content.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canEdit && (
                <Btn size="sm" variant="ghost" onClick={() => updateSectionContent(section.id, [...content, { text: '', checked: false }])}>
                  <Plus size={11} /> Add Step
                </Btn>
              )}
            </div>
          );
        })()}
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// ActionItemsTab
// ============================================================

const ACTION_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
];

const ACTION_PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-stone-100 text-stone-500',
};

function ActionItemsTab({
  items, canEdit, sb, onChange, subtab, notes, profile, onNotesChange,
}: {
  items: RushActionItem[];
  canEdit: boolean;
  sb: any;
  onChange: () => void;
  subtab: string;
  notes: RushNote[];
  profile: Profile;
  onNotesChange: () => void;
}) {
  const [sortBy, setSortBy] = useState<'due_date' | 'owner' | 'priority'>('due_date');
  const today = new Date().toISOString().split('T')[0];

  async function updateField(id: string, field: string, value: string) {
    const { error } = await sb.from('rush_action_items').update({ [field]: value }).eq('id', id);
    if (error) console.error('action item update', error);
    else onChange();
  }

  async function deleteItem(id: string) {
    const { error } = await sb.from('rush_action_items').delete().eq('id', id);
    if (error) console.error('action item delete', error);
    else onChange();
  }

  async function addItem() {
    const { error } = await sb.from('rush_action_items').insert({
      id: crypto.randomUUID(),
      action: '',
      owner: '',
      due_date: '',
      priority: 'medium',
      status: 'not_started',
      order_num: items.length,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('action item insert', error);
    else onChange();
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'due_date') return (a.due_date ?? '').localeCompare(b.due_date ?? '');
      if (sortBy === 'owner') return (a.owner ?? '').localeCompare(b.owner ?? '');
      if (sortBy === 'priority') {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      return 0;
    });
  }, [items, sortBy]);

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Sort by:</span>
          {(['due_date', 'owner', 'priority'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${sortBy === s ? 'bg-rose-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {humanLabel(s)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-700 text-white text-xs">
                  <th className="text-left px-3 py-2 font-medium">Action</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Owner</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Due Date</th>
                  <th className="text-left px-3 py-2 font-medium w-24">Priority</th>
                  <th className="text-left px-3 py-2 font-medium w-32">Status</th>
                  {canEdit && <th className="w-8" />}
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, idx) => {
                  const isOverdue = item.due_date && item.due_date < today && item.status !== 'complete';
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-stone-100 ${isOverdue ? 'bg-red-50 border-l-2 border-l-red-400' : idx % 2 === 1 ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="px-3 py-2 text-stone-800 align-top">
                        <div className="flex items-center gap-1.5">
                          {isOverdue && <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />}
                          <InlineEdit value={item.action} onSave={v => updateField(item.id, 'action', v)} disabled={!canEdit} placeholder="Action item..." multiline />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        <InlineEdit value={item.owner} onSave={v => updateField(item.id, 'owner', v)} disabled={!canEdit} placeholder="—" />
                      </td>
                      <td className="px-3 py-2 text-stone-600 align-top">
                        {canEdit ? (
                          <input
                            type="date"
                            value={item.due_date ?? ''}
                            onChange={e => updateField(item.id, 'due_date', e.target.value)}
                            className="border-b border-stone-200 outline-none bg-transparent text-xs"
                          />
                        ) : (
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{item.due_date || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {canEdit ? (
                          <StatusSelect
                            value={item.priority}
                            options={ACTION_PRIORITY_OPTIONS}
                            onChange={v => updateField(item.id, 'priority', v)}
                          />
                        ) : (
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[item.priority] ?? 'bg-stone-100 text-stone-500'}`}>
                            {humanLabel(item.priority)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {canEdit ? (
                          <StatusSelect
                            value={item.status}
                            options={ACTION_STATUS_OPTIONS}
                            onChange={v => updateField(item.id, 'status', v)}
                          />
                        ) : (
                          <StatusPill status={item.status} />
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-2 py-2 align-top">
                          <button onClick={() => deleteItem(item.id)} className="text-stone-300 hover:text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canEdit && (
            <div className="px-4 py-2 border-t border-stone-100">
              <Btn size="sm" variant="ghost" onClick={addItem}>
                <Plus size={12} /> Add Action Item
              </Btn>
            </div>
          )}
        </div>
      </div>
      <NotesSidebar subtab={subtab} notes={notes} profile={profile} sb={sb} canAddNotes={profile.role === 'admin' || profile.role === 'director'} onNotesChange={onNotesChange} />
    </div>
  );
}

// ============================================================
// NotesTab (standalone)
// ============================================================

const SUBTAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  influencers: 'Influencers',
  tote: 'Tote Bag',
  download: 'Download Card',
  actions: 'Open Items',
};

function NotesTab({
  notes, profile, sb, onNotesChange,
}: {
  notes: RushNote[];
  profile: Profile;
  sb: any;
  onNotesChange: () => void;
}) {
  const [filter, setFilter] = useState<string>('all');
  const [text, setText] = useState('');
  const [selectedSubtab, setSelectedSubtab] = useState('overview');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtabs = useMemo(() => {
    const found = Array.from(new Set(notes.map(n => n.sub_tab)));
    return found;
  }, [notes]);

  const topLevel = useMemo(() => {
    let filtered = notes.filter(n => n.parent_id === null);
    if (filter !== 'all') filtered = filtered.filter(n => n.sub_tab === filter);
    return filtered
      .map(n => ({ ...n, replies: notes.filter(r => r.parent_id === n.id) }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notes, filter]);

  const canAddNotes = profile.role === 'admin' || profile.role === 'director';

  async function submitNote() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await sb.from('rush_notes').insert({
      sub_tab: selectedSubtab,
      author_id: profile.id,
      author_name: profile.full_name,
      content: text.trim(),
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('note insert', error);
    else { setText(''); onNotesChange(); }
    setSubmitting(false);
  }

  async function submitReply(parentId: string, parentSubtab: string) {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await sb.from('rush_notes').insert({
      sub_tab: parentSubtab,
      author_id: profile.id,
      author_name: profile.full_name,
      content: replyText.trim(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('reply insert', error);
    else { setReplyTo(null); setReplyText(''); onNotesChange(); }
    setSubmitting(false);
  }

  async function deleteNote(id: string) {
    const { error } = await sb.from('rush_notes').delete().eq('id', id);
    if (error) console.error('note delete', error);
    else onNotesChange();
  }

  function canDelete(note: RushNote) {
    return profile.role === 'admin' || note.author_id === profile.id;
  }

  function fmtDate(s: string) {
    try {
      return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return s; }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {['all', ...subtabs].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === s ? 'bg-rose-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {s === 'all' ? 'All' : (SUBTAB_LABELS[s] ?? humanLabel(s))}
          </button>
        ))}
      </div>

      {/* Note feed */}
      <div className="flex flex-col gap-3">
        {topLevel.length === 0 && (
          <p className="text-sm text-stone-400 italic">No notes yet.</p>
        )}
        {topLevel.map(note => (
          <div key={note.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800 text-sm">{note.author_name}</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES['explore']}`}>
                  {SUBTAB_LABELS[note.sub_tab] ?? humanLabel(note.sub_tab)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{fmtDate(note.created_at)}</span>
                {canDelete(note) && (
                  <button onClick={() => deleteNote(note.id)} className="text-stone-300 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-stone-700 text-sm whitespace-pre-wrap">{note.content}</p>

            {note.replies && note.replies.length > 0 && (
              <div className="pl-4 flex flex-col gap-2 border-l-2 border-rose-100 mt-1">
                {note.replies.map(reply => (
                  <div key={reply.id} className="flex items-start gap-2">
                    <div className="flex-1 bg-rose-50/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-700 text-xs">{reply.author_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">{fmtDate(reply.created_at)}</span>
                          {canDelete(reply) && (
                            <button onClick={() => deleteNote(reply.id)} className="text-stone-300 hover:text-red-400">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canAddNotes && (
              <div>
                {replyTo === note.id ? (
                  <div className="flex gap-2 mt-1">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="flex-1 text-sm border border-rose-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400 resize-none"
                    />
                    <div className="flex flex-col gap-1">
                      <Btn size="sm" variant="primary" onClick={() => submitReply(note.id, note.sub_tab)} disabled={!replyText.trim() || submitting}>
                        <Send size={12} /> Send
                      </Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setReplyTo(null); setReplyText(''); }}>
                        Cancel
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyTo(note.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 mt-1"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New note form */}
      {canAddNotes && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-700">Add Note to:</span>
            <select
              value={selectedSubtab}
              onChange={e => setSelectedSubtab(e.target.value)}
              className="border border-stone-200 rounded-lg text-sm px-2 py-1 bg-white outline-none"
            >
              {Object.entries(SUBTAB_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="flex-1 text-sm border border-rose-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400 resize-none"
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submitNote(); }}
            />
            <Btn variant="primary" size="sm" onClick={submitNote} disabled={!text.trim() || submitting}>
              <Send size={13} /> Post
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Seed data
// ============================================================

const DEFAULT_OVERVIEW: RushOverview = {
  north_star_goal: 'Every UT Austin sorority uses Cloud Closet to coordinate work week themes, send outfit inspo, and plan rush looks by Fall 2026 recruitment season.',
  opportunities: [
    'Work Week (Bid Day Prep): Chapters need a centralized way to share themes and outfit inspo with 100+ members',
    'Rush Season (August–September): New members are style-conscious and app-hungry — highest conversion window of the year',
    'Formals & Events: Year-round use case for coordinating looks',
    'Influencer Amplification: Sorority women with large followings become organic brand ambassadors',
  ],
  extra_sections: [],
};

function seedPhases() {
  const p1Id = crypto.randomUUID();
  const p2Id = crypto.randomUUID();
  const p3Id = crypto.randomUUID();
  const now = new Date().toISOString();

  const phases = [
    { id: p1Id, title: 'Phase 1: UT Austin Chapter Outreach', due_label: 'Due: End of March 2026', order_num: 0, created_at: now },
    { id: p2Id, title: 'Phase 2: National Sorority Influencer Outreach', due_label: 'Due: May 2026', order_num: 1, created_at: now },
    { id: p3Id, title: 'Phase 3: Rush Tote Bag Order & Distribution', due_label: 'Order Deadline: August 2026', order_num: 2, created_at: now },
  ];

  const rows = [
    // Phase 1
    { id: crypto.randomUUID(), phase_id: p1Id, week: 'Week 1', dates: 'Mar 17–21', action: 'Finalize full sorority contact list; draft outreach email template', owner: 'Danica + Ella', status: 'in_progress', order_num: 0, created_at: now },
    { id: crypto.randomUUID(), phase_id: p1Id, week: 'Week 2', dates: 'Mar 24–28', action: 'Send Wave 1 emails (top-priority chapters); begin tracking responses', owner: 'Danica', status: 'not_started', order_num: 1, created_at: now },
    { id: crypto.randomUUID(), phase_id: p1Id, week: 'Week 3', dates: 'Mar 31–Apr 4', action: 'Follow up with non-responders; schedule calls with interested chapters', owner: 'Danica', status: 'not_started', order_num: 2, created_at: now },
    { id: crypto.randomUUID(), phase_id: p1Id, week: 'Week 4', dates: 'Apr 7–11', action: 'Conduct calls; confirm partnership commitments; send onboarding info', owner: 'Danica + Ella', status: 'not_started', order_num: 3, created_at: now },
    { id: crypto.randomUUID(), phase_id: p1Id, week: 'Buffer', dates: 'Apr 14–18', action: 'Catch-up week; finalize all UT Austin chapter relationships', owner: 'Danica', status: 'not_started', order_num: 4, created_at: now },
    // Phase 2
    { id: crypto.randomUUID(), phase_id: p2Id, week: 'Week 1–2', dates: 'Apr 14–25', action: 'Research and compile sorority influencer lists per school; vet by following, views, audience demo', owner: 'Ella', status: 'not_started', order_num: 0, created_at: now },
    { id: crypto.randomUUID(), phase_id: p2Id, week: 'Week 3', dates: 'Apr 28–May 2', action: 'Send outreach DMs/emails to shortlisted creators; gauge interest and rates', owner: 'Ella + Danica', status: 'not_started', order_num: 1, created_at: now },
    { id: crypto.randomUUID(), phase_id: p2Id, week: 'Week 4', dates: 'May 5–9', action: 'Negotiate deliverables and fees; finalize contracts', owner: 'Danica', status: 'not_started', order_num: 2, created_at: now },
    { id: crypto.randomUUID(), phase_id: p2Id, week: 'Week 5', dates: 'May 12–16', action: 'Brief creators; confirm posting schedule for summer/fall', owner: 'Ella', status: 'not_started', order_num: 3, created_at: now },
    // Phase 3
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Finalize tote bag contents', dates: 'May 30', action: 'Lock in all items; get final quotes from vendors', owner: '', status: 'not_started', order_num: 0, created_at: now },
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Design download cards + QR codes', dates: 'June 13', action: 'Design + print-ready files to vendor', owner: '', status: 'not_started', order_num: 1, created_at: now },
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Place all orders', dates: 'July 11', action: 'Allow 4–6 weeks lead time for custom items', owner: '', status: 'not_started', order_num: 2, created_at: now },
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Receive + quality check', dates: 'Aug 1', action: 'Inspect all items; reorder if needed', owner: '', status: 'not_started', order_num: 3, created_at: now },
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Ship to chapters', dates: 'Aug 15', action: 'Deliver before rush week begins', owner: '', status: 'not_started', order_num: 4, created_at: now },
    { id: crypto.randomUUID(), phase_id: p3Id, week: 'Rush season begins', dates: 'Late Aug', action: 'Chapters distribute bags to PNMs', owner: '', status: 'not_started', order_num: 5, created_at: now },
  ];

  return { phases, rows };
}

function seedToteItems() {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), item: 'Cloud Closet Download Card', purpose: 'Primary CTA — QR code to app store', cost_low: 0.50, cost_high: 1.00, quantity: 1, vendor: 'TBD', status: 'design_needed', order_num: 0, created_at: now },
    { id: crypto.randomUUID(), item: 'Compact Mirror', purpose: 'High-keep item; daily use', cost_low: 2, cost_high: 4, quantity: 1, vendor: 'TBD', status: 'source_vendor', order_num: 1, created_at: now },
    { id: crypto.randomUUID(), item: 'Mini Sewing Kit', purpose: 'Practical rush essential; goodwill item', cost_low: 1, cost_high: 2, quantity: 1, vendor: 'TBD', status: 'source_vendor', order_num: 2, created_at: now },
    { id: crypto.randomUUID(), item: 'Scrunchie (branded)', purpose: 'Wearable; style-aligned', cost_low: 2, cost_high: 3, quantity: 1, vendor: 'TBD', status: 'design_needed', order_num: 3, created_at: now },
    { id: crypto.randomUUID(), item: 'Sticker Pack', purpose: 'Laptop/water bottle; brand visibility', cost_low: 1, cost_high: 2, quantity: 1, vendor: 'TBD', status: 'design_needed', order_num: 4, created_at: now },
    { id: crypto.randomUUID(), item: 'Safety pins / fashion tape', purpose: 'Work week emergency kit', cost_low: 0.50, cost_high: 1, quantity: 1, vendor: 'TBD', status: 'explore', order_num: 5, created_at: now },
    { id: crypto.randomUUID(), item: 'Lip balm / mini blot paper', purpose: 'Grooming essential for rush day', cost_low: 1, cost_high: 2, quantity: 1, vendor: 'TBD', status: 'explore', order_num: 6, created_at: now },
  ];
}

function seedStrategySections() {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      section_type: 'specs',
      content: [
        { label: 'Size options', value: 'Credit card size (fits in wallet) vs. Postcard size (more visual real estate)' },
        { label: 'QR code destination', value: 'App Store / Google Play (direct link)' },
        { label: 'Tracking', value: 'Unique QR code or promo code per chapter for download attribution' },
      ],
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      section_type: 'hook_copy',
      content: [
        'Stop texting your group chat. Plan your outfits here.',
        'Work week is coming. Are you ready?',
        'The app every sorority girl needs for rush.',
      ],
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      section_type: 'tracking',
      content: [
        'Assign unique QR/promo code per chapter',
        'Track downloads per code post-rush',
        'Report back to chapters with their stats to build loyalty',
      ],
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      section_type: 'followup',
      content: [
        { text: 'Send thank-you email to all chapter contacts', checked: false },
        { text: 'Share download data per chapter', checked: false },
        { text: 'Begin conversation about spring semester partnership', checked: false },
        { text: 'Evaluate which chapters drove highest downloads', checked: false },
      ],
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      section_type: 'schools',
      content: [],
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      section_type: 'distribution',
      content: [
        { text: 'Compile list of target schools and find panhellenic director contact for each', checked: false },
        { text: 'Send initial outreach email to panhellenic directors introducing Cloud Closet', checked: false },
        { text: 'Follow up with non-responders (1 week after first email)', checked: false },
        { text: 'Get confirmed shipping address from each participating chapter', checked: false },
        { text: 'Confirm quantity of PNM bags per chapter so we know how many cards to send', checked: false },
        { text: 'Ship download cards to panhellenic contacts (allow 1–2 week lead time before rush)', checked: false },
        { text: 'Confirm cards received by each chapter contact', checked: false },
        { text: 'Send reminder to chapter contacts the week before rush to include cards in bags', checked: false },
        { text: 'Check in post-rush to confirm cards were distributed', checked: false },
        { text: 'Request post-rush download data by chapter (pull from unique QR codes)', checked: false },
      ],
      updated_at: now,
    },
  ];
}

function seedActionItems() {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), action: 'Finalize UT Austin sorority contact list', owner: 'Danica', due_date: '2026-03-21', priority: 'high', status: 'in_progress', order_num: 0, created_at: now },
    { id: crypto.randomUUID(), action: 'Draft and send Wave 1 outreach emails', owner: 'Danica', due_date: '2026-03-28', priority: 'high', status: 'not_started', order_num: 1, created_at: now },
    { id: crypto.randomUUID(), action: 'Build sorority influencer shortlist (all target schools)', owner: 'Ella', due_date: '2026-04-25', priority: 'high', status: 'not_started', order_num: 2, created_at: now },
    { id: crypto.randomUUID(), action: 'Send influencer outreach DMs/emails', owner: 'Ella + Danica', due_date: '2026-05-02', priority: 'medium', status: 'not_started', order_num: 3, created_at: now },
    { id: crypto.randomUUID(), action: 'Finalize tote bag contents + get vendor quotes', owner: 'Danica + Ella', due_date: '2026-05-30', priority: 'medium', status: 'not_started', order_num: 4, created_at: now },
    { id: crypto.randomUUID(), action: 'Design download cards', owner: 'Design team', due_date: '2026-06-13', priority: 'medium', status: 'not_started', order_num: 5, created_at: now },
    { id: crypto.randomUUID(), action: 'Place all tote bag orders', owner: 'Danica', due_date: '2026-07-11', priority: 'high', status: 'not_started', order_num: 6, created_at: now },
    { id: crypto.randomUUID(), action: 'Ship tote bags to chapter contacts', owner: 'Danica', due_date: '2026-08-15', priority: 'high', status: 'not_started', order_num: 7, created_at: now },
  ];
}

// ============================================================
// Main Component
// ============================================================

const TABS = [
  { id: 'overview', label: 'Overview & Vision', icon: BookOpen },
  { id: 'timeline', label: 'Outreach Timeline', icon: Clock },
  { id: 'influencers', label: 'Influencer Tracker', icon: Users },
  { id: 'tote', label: 'Tote Bag & Budget', icon: ShoppingBag },
  { id: 'download', label: 'Download Card Strategy', icon: FileText },
  { id: 'actions', label: 'Open Items', icon: CheckSquare },
  { id: 'notes', label: 'Notes & Comments', icon: MessageSquare },
];

export default function SororityRushPlan({ profile, sb }: { profile: Profile; sb: any }) {
  const [tab, setTab] = useState('overview');
  const [phases, setPhases] = useState<RushPhase[]>([]);
  const [rows, setRows] = useState<RushRow[]>([]);
  const [influencers, setInfluencers] = useState<RushInfluencer[]>([]);
  const [toteItems, setToteItems] = useState<RushToteItem[]>([]);
  const [toteSettings, setToteSettings] = useState<RushToteSettings>({ num_chapters: 0, bags_per_chapter: 0 });
  const [strategySections, setStrategySections] = useState<RushStrategySection[]>([]);
  const [actionItems, setActionItems] = useState<RushActionItem[]>([]);
  const [notes, setNotes] = useState<RushNote[]>([]);
  const [overview, setOverview] = useState<RushOverview>(DEFAULT_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [overviewId, setOverviewId] = useState<string | null>(null);

  const canEdit = profile.role === 'admin';
  const canAddNotes = profile.role === 'admin' || profile.role === 'director';

  async function loadNotes() {
    const { data, error } = await sb.from('rush_notes').select('*').order('created_at', { ascending: true });
    if (error) { console.error('load notes', error); return; }
    setNotes(data ?? []);
  }

  async function loadData() {
    setLoading(true);
    try {
      // Overview
      const { data: ovData } = await sb.from('rush_overview').select('*').limit(1);
      if (ovData && ovData.length > 0) {
        const ov = ovData[0];
        setOverviewId(ov.id);
        setOverview({
          north_star_goal: ov.north_star_goal ?? DEFAULT_OVERVIEW.north_star_goal,
          opportunities: ov.opportunities ?? DEFAULT_OVERVIEW.opportunities,
          extra_sections: ov.extra_sections ?? [],
        });
      } else {
        // Seed overview
        const newId = crypto.randomUUID();
        const { error } = await sb.from('rush_overview').insert({
          id: newId,
          north_star_goal: DEFAULT_OVERVIEW.north_star_goal,
          opportunities: DEFAULT_OVERVIEW.opportunities,
          extra_sections: [],
          updated_at: new Date().toISOString(),
        });
        if (!error) setOverviewId(newId);
      }

      // Phases + rows
      const { data: phaseData } = await sb.from('rush_timeline_phases').select('*').order('order_num');
      const { data: rowData } = await sb.from('rush_timeline_rows').select('*').order('order_num');
      if (!phaseData || phaseData.length === 0) {
        const { phases: seedP, rows: seedR } = seedPhases();
        await sb.from('rush_timeline_phases').insert(seedP);
        await sb.from('rush_timeline_rows').insert(seedR);
        setPhases(seedP);
        setRows(seedR);
      } else {
        setPhases(phaseData);
        setRows(rowData ?? []);
      }

      // Influencers
      const { data: infData } = await sb.from('rush_influencers').select('*').order('order_num');
      setInfluencers(infData ?? []);

      // Tote items
      const { data: toteData } = await sb.from('rush_tote_items').select('*').order('order_num');
      if (!toteData || toteData.length === 0) {
        const seedItems = seedToteItems();
        await sb.from('rush_tote_items').insert(seedItems);
        setToteItems(seedItems);
      } else {
        setToteItems(toteData);
      }

      // Tote settings
      const { data: settingsData } = await sb.from('rush_tote_settings').select('*').eq('id', '00000000-0000-0000-0000-000000000002').limit(1);
      if (!settingsData || settingsData.length === 0) {
        await sb.from('rush_tote_settings').insert({
          id: '00000000-0000-0000-0000-000000000002',
          num_chapters: 0,
          bags_per_chapter: 0,
          updated_at: new Date().toISOString(),
        });
      } else {
        setToteSettings({ num_chapters: settingsData[0].num_chapters ?? 0, bags_per_chapter: settingsData[0].bags_per_chapter ?? 0 });
      }

      // Strategy sections — insert any missing section types
      const { data: sectionData } = await sb.from('rush_strategy_sections').select('*');
      const existingTypes = new Set((sectionData ?? []).map((s: any) => s.section_type));
      const missingSeeds = seedStrategySections().filter(s => !existingTypes.has(s.section_type));
      if (missingSeeds.length > 0) {
        await sb.from('rush_strategy_sections').insert(missingSeeds);
      }
      const { data: freshSections } = await sb.from('rush_strategy_sections').select('*');
      setStrategySections(freshSections ?? []);

      // Action items
      const { data: actionData } = await sb.from('rush_action_items').select('*').order('order_num');
      if (!actionData || actionData.length === 0) {
        const seedA = seedActionItems();
        await sb.from('rush_action_items').insert(seedA);
        setActionItems(seedA);
      } else {
        setActionItems(actionData);
      }

      // Notes
      await loadNotes();
    } catch (err) {
      console.error('loadData error', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    // Real-time subscription for notes
    const channel = sb
      .channel('rush-notes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rush_notes' }, () => {
        loadNotes();
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, []);

  async function saveOverview(next: RushOverview) {
    setOverview(next);
    if (overviewId) {
      const { error } = await sb.from('rush_overview').update({
        north_star_goal: next.north_star_goal,
        opportunities: next.opportunities,
        extra_sections: next.extra_sections,
        updated_at: new Date().toISOString(),
      }).eq('id', overviewId);
      if (error) console.error('overview save', error);
    }
  }

  async function reloadPhases() {
    const { data: phaseData } = await sb.from('rush_timeline_phases').select('*').order('order_num');
    const { data: rowData } = await sb.from('rush_timeline_rows').select('*').order('order_num');
    setPhases(phaseData ?? []);
    setRows(rowData ?? []);
  }

  async function reloadInfluencers() {
    const { data } = await sb.from('rush_influencers').select('*').order('order_num');
    setInfluencers(data ?? []);
  }

  async function reloadToteItems() {
    const { data } = await sb.from('rush_tote_items').select('*').order('order_num');
    setToteItems(data ?? []);
  }

  async function reloadStrategySections() {
    const { data } = await sb.from('rush_strategy_sections').select('*');
    setStrategySections(data ?? []);
  }

  async function reloadActionItems() {
    const { data } = await sb.from('rush_action_items').select('*').order('order_num');
    setActionItems(data ?? []);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading rush plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/20">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Sorority Rush Plan</h1>
            <p className="text-stone-500 text-sm mt-0.5">UT Austin Greek Life Expansion • Fall 2026</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                <Pencil size={11} /> Admin — Can Edit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                View Only
              </span>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-b border-stone-200 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    active
                      ? 'border-rose-700 text-rose-700'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {tab === 'overview' && (
            <OverviewTab
              overview={overview}
              onSave={saveOverview}
              canEdit={canEdit}
              subtab="overview"
              notes={notes}
              profile={profile}
              sb={sb}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'timeline' && (
            <TimelineTab
              phases={phases}
              rows={rows}
              canEdit={canEdit}
              sb={sb}
              onPhaseChange={reloadPhases}
              subtab="timeline"
              notes={notes}
              profile={profile}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'influencers' && (
            <InfluencerTab
              influencers={influencers}
              canEdit={canEdit}
              sb={sb}
              onChange={reloadInfluencers}
              subtab="influencers"
              notes={notes}
              profile={profile}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'tote' && (
            <ToteBagTab
              items={toteItems}
              settings={toteSettings}
              canEdit={canEdit}
              sb={sb}
              onItemChange={reloadToteItems}
              onSettingsChange={setToteSettings}
              subtab="tote"
              notes={notes}
              profile={profile}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'download' && (
            <DownloadCardTab
              sections={strategySections}
              canEdit={canEdit}
              sb={sb}
              onChange={reloadStrategySections}
              subtab="download"
              notes={notes}
              profile={profile}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'actions' && (
            <ActionItemsTab
              items={actionItems}
              canEdit={canEdit}
              sb={sb}
              onChange={reloadActionItems}
              subtab="actions"
              notes={notes}
              profile={profile}
              onNotesChange={loadNotes}
            />
          )}
          {tab === 'notes' && (
            <NotesTab
              notes={notes}
              profile={profile}
              sb={sb}
              onNotesChange={loadNotes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
