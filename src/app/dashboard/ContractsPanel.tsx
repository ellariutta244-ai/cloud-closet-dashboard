"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Copy, Check, ExternalLink, FileText,
  Clock, CheckCircle2, X, AlertTriangle, Loader2,
} from "lucide-react";

type Contract = {
  id: string;
  intern_name: string | null;
  intern_email: string | null;
  content: string;
  signed_at: string | null;
  pdf_url: string | null;
  token: string;
  token_expires_at: string | null;
  created_at: string;
};

type Props = {
  profile: { id: string; full_name: string; role: string };
  sb: any;
};

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://cloud-closet-dashboard.vercel.app";

export default function ContractsPanel({ profile, sb }: Props) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb
      .from("contracts")
      .select("id, intern_name, intern_email, content, signed_at, pdf_url, token, token_expires_at, created_at")
      .order("created_at", { ascending: false });
    setContracts((data || []) as Contract[]);
    setLoading(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  const unsigned = contracts.filter(c => !c.signed_at);
  const signed   = contracts.filter(c =>  c.signed_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Contracts</h2>
          <p className="text-xs text-stone-400 mt-0.5">Send signing links to interns before they get dashboard access.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
        >
          <Plus size={15} /> New Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Awaiting Signature</p>
          <p className="text-2xl font-bold text-stone-800">{unsigned.length}</p>
        </div>
        <div className="bg-white border border-stone-200/60 rounded-xl p-4">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Signed</p>
          <p className="text-2xl font-bold text-emerald-600">{signed.length}</p>
        </div>
      </div>

      {/* Unsigned contracts */}
      {unsigned.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Awaiting Signature</p>
          <div className="space-y-2">
            {unsigned.map(c => (
              <ContractRow key={c.id} contract={c} onRefresh={load} />
            ))}
          </div>
        </section>
      )}

      {/* Signed contracts */}
      {signed.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Signed</p>
          <div className="space-y-2">
            {signed.map(c => (
              <ContractRow key={c.id} contract={c} onRefresh={load} />
            ))}
          </div>
        </section>
      )}

      {!loading && contracts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">No contracts yet. Create one to get started.</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-stone-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateContractModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => { setContracts(prev => [c, ...prev]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ── Contract row ───────────────────────────────────────────────────────────────
function ContractRow({ contract: c, onRefresh }: { contract: Contract; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false);
  const isSigned = !!c.signed_at;
  const isExpired = !isSigned && c.token_expires_at && new Date(c.token_expires_at) < new Date();
  const signingUrl = `${SITE_URL}/sign/${c.token}`;

  function copyLink() {
    navigator.clipboard.writeText(signingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-center gap-4">
      {/* Status icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSigned ? "bg-emerald-50" : isExpired ? "bg-amber-50" : "bg-stone-100"}`}>
        {isSigned
          ? <CheckCircle2 size={16} className="text-emerald-500" />
          : isExpired
          ? <AlertTriangle size={16} className="text-amber-500" />
          : <Clock size={16} className="text-stone-400" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">
          {c.intern_name || c.intern_email || "Unnamed intern"}
        </p>
        <p className="text-xs text-stone-400 truncate">
          {c.intern_email}
          {isSigned && c.signed_at && ` · Signed ${fmt(c.signed_at)}`}
          {!isSigned && c.token_expires_at && !isExpired && ` · Expires ${fmt(c.token_expires_at)}`}
          {isExpired && " · Expired"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isSigned && c.pdf_url && (
          <a
            href={c.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors"
          >
            <ExternalLink size={12} /> PDF
          </a>
        )}
        {!isSigned && (
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Create contract modal ──────────────────────────────────────────────────────
function CreateContractModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: Contract) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState(DEFAULT_CONTRACT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ signing_url: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!email.trim() || !content.trim()) {
      setError("Email and contract content are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/contracts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intern_name: name, intern_email: email, content }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to create contract.");
      setSaving(false);
      return;
    }

    setResult({ signing_url: json.signing_url, token: json.token });
    setSaving(false);
    // Synthetic contract for optimistic UI
    onCreated({
      id: "",
      intern_name: name || null,
      intern_email: email,
      content,
      signed_at: null,
      pdf_url: null,
      token: json.token,
      token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.signing_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">
            {result ? "Contract Created" : "New Contract"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {result ? (
            /* Success state — show signing link */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800 mb-0.5">Contract ready to send</p>
                <p className="text-xs text-stone-500">Copy the link below and send it to {name || email}.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Signing Link (expires in 7 days)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    readOnly
                    value={result.signing_url}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 font-mono focus:outline-none"
                    onClick={e => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={copyLink}
                    className="px-3 py-2 bg-stone-800 text-white text-xs font-medium rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-stone-400 text-center">
                The intern doesn't need an account — they just open the link.
                After signing, they'll automatically receive a dashboard invite.
              </p>
            </div>
          ) : (
            /* Create form */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Intern Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Email *</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@university.edu"
                    type="email"
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Contract Content *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={14}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none font-mono leading-relaxed"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle size={12} /> {error}
                </p>
              )}

              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {saving ? "Generating link…" : "Create & Get Signing Link"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(dt?: string | null) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const DEFAULT_CONTRACT = `CLOUD CLOSET INTERNSHIP AGREEMENT

This Internship Agreement ("Agreement") is entered into between Cloud Closet ("Company") and the intern named above ("Intern").

TERM
This internship begins upon signing and continues for the duration agreed upon with your team executive.

RESPONSIBILITIES
The Intern agrees to:
• Complete assigned tasks by their due dates
• Attend scheduled team meetings and check-ins
• Communicate proactively about any blockers or conflicts
• Maintain professional conduct in all team interactions
• Keep Company materials and information confidential

EXPECTATIONS
• Minimum [X] hours per week commitment
• Weekly report submission by [day] each week
• Respond to messages within 24 hours on weekdays

INTELLECTUAL PROPERTY
Any work product created during this internship belongs to Cloud Closet.

CONFIDENTIALITY
The Intern agrees not to disclose Company information, strategies, or data to third parties.

ACKNOWLEDGMENT
By signing below, the Intern confirms they have read, understand, and agree to the terms of this agreement.`;
