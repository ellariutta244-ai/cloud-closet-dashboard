'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import SoraaAdminPanel from './SoraaAdminPanel';
import NewCampaignManager from './NewCampaignManager';

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function ExternalUGCPanel() {
  const [campaign, setCampaign] = useState<'soraa' | 'new'>('soraa');
  const [totalViews, setTotalViews] = useState<number>(0);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [loadingViews, setLoadingViews] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoadingViews(true);
    try {
      const res = await fetch('/api/soraa/submissions').then(r => r.json()).catch(() => ({ submissions: [] }));
      const subs: Array<{ views?: number }> = res.submissions || [];
      const total = subs.reduce((acc, s) => acc + (s.views || 0), 0);
      setTotalViews(total);
      setSubmissionCount(subs.length);
    } finally {
      setLoadingViews(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-800">External UGC Campaign</h1>
          <p className="text-sm text-stone-400 mt-0.5">Manage all external creator UGC campaigns</p>
        </div>
        <button
          onClick={fetchOverview}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors mt-1"
        >
          <RefreshCw size={13} className={loadingViews ? 'animate-spin' : ''}/>Refresh
        </button>
      </div>

      {/* Total views overview */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles size={10}/>Total Views to Date
          </p>
          {loadingViews ? (
            <div className="flex items-center gap-2 text-stone-300 mt-1">
              <RefreshCw size={14} className="animate-spin"/>
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <p className="text-4xl font-bold text-white tracking-tight">{fmt(totalViews)}</p>
          )}
          <p className="text-xs text-stone-500 mt-1.5">Across all active campaigns · {submissionCount} submission{submissionCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-shrink-0 opacity-10">
          <Sparkles size={48} className="text-white"/>
        </div>
      </div>

      {/* Campaign tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setCampaign('soraa')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            campaign === 'soraa' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Soraa UGC
        </button>
        <button
          onClick={() => setCampaign('new')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            campaign === 'new' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Campaigns
        </button>
      </div>

      {/* Campaign content */}
      {campaign === 'soraa' && <SoraaAdminPanel onSubmissionsChange={subs => { setTotalViews(subs.reduce((a, s) => a + (s.views || 0), 0)); setSubmissionCount(subs.length); }}/>}
      {campaign === 'new' && <NewCampaignManager/>}
    </div>
  );
}
