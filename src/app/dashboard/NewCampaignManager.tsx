'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, RefreshCw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface CampaignCreator {
  id: string;
  campaign_id: string;
  creator_name: string;
  email: string;
  tiktok: string;
  ig: string;
  fee: number;
  deliverables: string[];
  created_at: string;
}

interface DeliverableStatus {
  id: string;
  campaign_id: string;
  creator_id: string;
  deliverable: string;
  status: string;
  payment_status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isConnectDel(del: string) {
  return del.toLowerCase().includes('connect');
}

const DEL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-500',
  submitted: 'bg-blue-50 text-blue-600',
  complete: 'bg-emerald-50 text-emerald-600',
};

type PayStatus = 'unpaid' | 'approved' | 'paid';
const PAY_COLORS: Record<PayStatus, string> = {
  unpaid: 'bg-red-50 text-red-600',
  approved: 'bg-amber-50 text-amber-600',
  paid: 'bg-emerald-50 text-emerald-600',
};

const EMPTY_FORM = {
  creator_name: '',
  email: '',
  tiktok: '',
  ig: '',
  fee: 0,
  deliverables: [] as string[],
};

// ── Creator Form ───────────────────────────────────────────────────────────────
function CreatorForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...initial, deliverables: [...initial.deliverables] });
  const [newDel, setNewDel] = useState('');

  function addDel() {
    const t = newDel.trim();
    if (!t || form.deliverables.includes(t)) return;
    setForm(f => ({ ...f, deliverables: [...f.deliverables, t] }));
    setNewDel('');
  }

  return (
    <div className="bg-stone-50 rounded-2xl p-4 flex flex-col gap-3 border border-stone-200">
      <div className="grid grid-cols-2 gap-2">
        {([
          ['creator_name', 'Name', 'Full name'],
          ['email', 'Email', 'email@example.com'],
          ['tiktok', 'TikTok', '@handle'],
          ['ig', 'Instagram', '@handle'],
        ] as [keyof typeof EMPTY_FORM, string, string][]).map(([field, label, placeholder]) => (
          <div key={field}>
            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">{label}</label>
            <input
              value={form[field] as string}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400"
            />
          </div>
        ))}
        <div>
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">Fee ($)</label>
          <input
            type="number"
            value={form.fee}
            onChange={e => setForm(f => ({ ...f, fee: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1.5">Deliverables</label>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
          {form.deliverables.map(del => (
            <span key={del} className="flex items-center gap-1 bg-stone-800 text-white text-[10px] font-medium px-2 py-1 rounded-lg">
              {del}
              <button
                onClick={() => setForm(f => ({ ...f, deliverables: f.deliverables.filter(d => d !== del) }))}
                className="text-stone-400 hover:text-white ml-0.5"
              >
                <X size={9}/>
              </button>
            </span>
          ))}
          {form.deliverables.length === 0 && <span className="text-[10px] text-stone-400">No deliverables yet</span>}
        </div>
        <div className="flex gap-2">
          <input
            value={newDel}
            onChange={e => setNewDel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDel(); } }}
            placeholder="e.g. 1x TikTok, Connect with founder…"
            className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400"
          />
          <button
            onClick={addDel}
            className="px-3 py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-300 transition-colors"
          >
            Add
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1">Deliverables containing &quot;connect&quot; get a Pending/Complete dropdown. All others get Pending/Submitted + payment tracking.</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.creator_name.trim() || !form.email.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          <Check size={12}/>{saving ? 'Saving…' : 'Save Creator'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl hover:bg-stone-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Campaign Detail ────────────────────────────────────────────────────────────
function CampaignDetail({
  campaign,
  onBack,
  onDelete,
  onRename,
}: {
  campaign: Campaign;
  onBack: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [creators, setCreators] = useState<CampaignCreator[]>([]);
  const [statuses, setStatuses] = useState<DeliverableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(campaign.name);
  const [addingCreator, setAddingCreator] = useState(false);
  const [editingCreatorId, setEditingCreatorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteCreator, setConfirmDeleteCreator] = useState<string | null>(null);
  const [confirmDeleteCampaign, setConfirmDeleteCampaign] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [creatorsRes, statusesRes] = await Promise.all([
      fetch(`/api/campaigns/${campaign.id}/creators`).then(r => r.json()).catch(() => ({ creators: [] })),
      fetch(`/api/campaigns/${campaign.id}/status`).then(r => r.json()).catch(() => ({ statuses: [] })),
    ]);
    setCreators(creatorsRes.creators || []);
    setStatuses(statusesRes.statuses || []);
    setLoading(false);
  }, [campaign.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function saveName() {
    if (!nameVal.trim()) { setEditingName(false); return; }
    if (nameVal.trim() === campaign.name) { setEditingName(false); return; }
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal.trim() }),
    });
    onRename(campaign.id, nameVal.trim());
    setEditingName(false);
  }

  async function addCreator(form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/creators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.creator) {
        setCreators(prev => [...prev, data.creator]);
        const newStatuses: DeliverableStatus[] = form.deliverables.map((del, i) => ({
          id: `${data.creator.id}-${i}`,
          campaign_id: campaign.id,
          creator_id: data.creator.id,
          deliverable: del,
          status: 'pending',
          payment_status: 'unpaid',
        }));
        setStatuses(prev => [...prev, ...newStatuses]);
        setAddingCreator(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveCreator(creatorId: string, form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/creators/${creatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.creator) {
        setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, ...data.creator } : c));
        // Re-sync statuses locally (reset to pending for new deliverables)
        const preserved = statuses.filter(s => s.creator_id !== creatorId);
        const fresh: DeliverableStatus[] = form.deliverables.map((del, i) => ({
          id: `${creatorId}-${i}`,
          campaign_id: campaign.id,
          creator_id: creatorId,
          deliverable: del,
          status: 'pending',
          payment_status: 'unpaid',
        }));
        setStatuses([...preserved, ...fresh]);
        setEditingCreatorId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteCreator(creatorId: string) {
    await fetch(`/api/campaigns/${campaign.id}/creators/${creatorId}`, { method: 'DELETE' });
    setCreators(prev => prev.filter(c => c.id !== creatorId));
    setStatuses(prev => prev.filter(s => s.creator_id !== creatorId));
    setConfirmDeleteCreator(null);
  }

  async function updateStatus(creatorId: string, deliverable: string, field: 'status' | 'payment_status', value: string) {
    await fetch(`/api/campaigns/${campaign.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creatorId, deliverable, [field]: value }),
    });
    setStatuses(prev => prev.map(s =>
      s.creator_id === creatorId && s.deliverable === deliverable ? { ...s, [field]: value } : s
    ));
  }

  async function markAllPaid(creator: CampaignCreator, paid: boolean) {
    const contentDels = creator.deliverables.filter(d => !isConnectDel(d));
    await Promise.all(contentDels.map(del =>
      updateStatus(creator.id, del, 'payment_status', paid ? 'paid' : 'unpaid')
    ));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0">
          <ChevronLeft size={14}/>Back
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameVal(campaign.name); } }}
                autoFocus
                className="flex-1 text-base font-bold text-stone-800 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:border-stone-500"
              />
              <button onClick={saveName} className="text-emerald-600 hover:text-emerald-700"><Check size={15}/></button>
              <button onClick={() => { setEditingName(false); setNameVal(campaign.name); }} className="text-stone-400 hover:text-stone-600"><X size={15}/></button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 group min-w-0">
              <h2 className="text-base font-bold text-stone-800 truncate">{campaign.name}</h2>
              <Pencil size={12} className="text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0"/>
            </button>
          )}
        </div>
        {confirmDeleteCampaign ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-red-600 font-medium">Delete this campaign?</span>
            <button onClick={() => onDelete(campaign.id)} className="text-[10px] px-2.5 py-1 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">Delete</button>
            <button onClick={() => setConfirmDeleteCampaign(false)} className="text-[10px] px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200 transition-colors">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDeleteCampaign(true)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={13}/>Delete
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-stone-400 gap-2 text-sm">
          <RefreshCw size={16} className="animate-spin"/>Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {creators.length === 0 && !addingCreator && (
            <div className="text-center py-8 text-stone-400 text-sm">No creators yet — add one below.</div>
          )}

          {creators.map(c => {
            const creatorStatuses = statuses.filter(s => s.creator_id === c.id);
            const contentDels = c.deliverables.filter(d => !isConnectDel(d));
            const allPaid = contentDels.length > 0 && contentDels.every(del =>
              creatorStatuses.find(s => s.deliverable === del)?.payment_status === 'paid'
            );

            return (
              <div key={c.id} className="bg-white border border-stone-200/60 rounded-2xl p-5">
                {editingCreatorId === c.id ? (
                  <CreatorForm
                    initial={{ creator_name: c.creator_name, email: c.email, tiktok: c.tiktok || '', ig: c.ig || '', fee: c.fee, deliverables: [...c.deliverables] }}
                    onSave={form => saveCreator(c.id, form)}
                    onCancel={() => setEditingCreatorId(null)}
                    saving={saving}
                  />
                ) : (
                  <>
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-800">{c.creator_name}</p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {c.tiktok && <span className="text-xs text-stone-500">{c.tiktok}</span>}
                          {c.ig && <span className="text-xs text-stone-400">{c.ig}</span>}
                          <span className="text-xs text-stone-400">{c.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Paid checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allPaid}
                            onChange={e => markAllPaid(c, e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                          />
                          <span className={`text-xs font-medium ${allPaid ? 'text-emerald-600' : 'text-stone-400'}`}>Paid</span>
                        </label>
                        <div className="text-right">
                          <p className="text-base font-bold text-stone-800">${c.fee}</p>
                          <p className="text-[10px] text-stone-400">fee</p>
                        </div>
                        {/* Edit button */}
                        <button
                          onClick={() => { setEditingCreatorId(c.id); setConfirmDeleteCreator(null); }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit creator"
                        >
                          <Pencil size={13}/>
                        </button>
                        {/* Delete button */}
                        {confirmDeleteCreator === c.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteCreator(c.id)} className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">Yes</button>
                            <button onClick={() => setConfirmDeleteCreator(null)} className="text-[10px] px-2 py-1 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200 transition-colors">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteCreator(c.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete creator"
                          >
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Deliverable rows */}
                    {c.deliverables.length > 0 ? (
                      <div className="flex flex-col gap-0 mb-3">
                        {c.deliverables.map(del => {
                          const st = creatorStatuses.find(s => s.deliverable === del);
                          const isConnect = isConnectDel(del);
                          const delStatus = st?.status || 'pending';
                          const payStatus = (st?.payment_status || 'unpaid') as PayStatus;
                          return (
                            <div key={del} className="flex items-center justify-between gap-2 py-2 border-b border-stone-50 last:border-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DEL_STATUS_COLORS[delStatus] || DEL_STATUS_COLORS.pending}`}>
                                  {delStatus}
                                </span>
                                <span className="text-xs text-stone-600 truncate">{del}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isConnect ? (
                                  <select
                                    value={delStatus}
                                    onChange={e => updateStatus(c.id, del, 'status', e.target.value)}
                                    className="text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 text-stone-600 bg-stone-50 focus:outline-none"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="complete">Complete</option>
                                  </select>
                                ) : (
                                  <>
                                    <select
                                      value={delStatus}
                                      onChange={e => updateStatus(c.id, del, 'status', e.target.value)}
                                      className="text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 text-stone-600 bg-stone-50 focus:outline-none"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="submitted">Submitted</option>
                                    </select>
                                    <select
                                      value={payStatus}
                                      onChange={e => updateStatus(c.id, del, 'payment_status', e.target.value)}
                                      className={`text-[10px] border border-stone-200 rounded-lg px-1.5 py-1 focus:outline-none ${PAY_COLORS[payStatus]}`}
                                    >
                                      <option value="unpaid">Unpaid</option>
                                      <option value="approved">Pay Approved</option>
                                      <option value="paid">Paid</option>
                                    </select>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 mb-3 italic">No deliverables — click edit to add some.</p>
                    )}

                    <p className="text-xs text-stone-400">{contentDels.length} content deliverable{contentDels.length !== 1 ? 's' : ''}</p>
                  </>
                )}
              </div>
            );
          })}

          {/* Add creator */}
          {addingCreator ? (
            <CreatorForm
              initial={{ ...EMPTY_FORM }}
              onSave={addCreator}
              onCancel={() => setAddingCreator(false)}
              saving={saving}
            />
          ) : (
            <button
              onClick={() => setAddingCreator(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-200 rounded-2xl text-sm text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors w-full"
            >
              <Plus size={16}/>Add Creator
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Campaign Manager ──────────────────────────────────────────────────────
export default function NewCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/campaigns').then(r => r.json()).catch(() => ({ campaigns: [] }));
    setCampaigns(res.campaigns || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function createCampaign() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.campaign) {
        const newCampaign = data.campaign as Campaign;
        setCampaigns(prev => [...prev, newCampaign]);
        setSelected(newCampaign);
        setCreating(false);
        setNewName('');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteCampaign(id: string) {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    setCampaigns(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmDelete(null);
  }

  function renameCampaign(id: string, name: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, name } : prev);
  }

  if (selected) {
    return (
      <CampaignDetail
        campaign={selected}
        onBack={() => setSelected(null)}
        onDelete={deleteCampaign}
        onRename={renameCampaign}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex items-center justify-center py-12 text-stone-400 gap-2 text-sm">
          <RefreshCw size={16} className="animate-spin"/>Loading…
        </div>
      ) : (
        <>
          {campaigns.length === 0 && !creating && (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm">No campaigns yet.</p>
              <p className="text-xs mt-1">Click the button below to create your first one.</p>
            </div>
          )}

          {campaigns.map(c => (
            <div key={c.id} className="bg-white border border-stone-200/60 rounded-2xl p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-stone-800">{c.name}</p>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(c)}
                  className="text-xs font-medium px-3 py-1.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Manage →
                </button>
                {confirmDelete === c.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => deleteCampaign(c.id)} className="text-[10px] px-2.5 py-1 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(c.id)}
                    className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete campaign"
                  >
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {creating ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-stone-700">New Campaign</p>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') createCampaign();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                }}
                placeholder="Campaign name (e.g. Spring 2026 UGC)…"
                autoFocus
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={createCampaign}
                  disabled={saving || !newName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  <Check size={12}/>{saving ? 'Creating…' : 'Create Campaign'}
                </button>
                <button
                  onClick={() => { setCreating(false); setNewName(''); }}
                  className="px-4 py-2 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-200 rounded-2xl text-sm text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors w-full"
            >
              <Plus size={16}/>Add New Campaign
            </button>
          )}
        </>
      )}
    </div>
  );
}
