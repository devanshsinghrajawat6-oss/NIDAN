"use client";

import { useState, useEffect } from "react";
import { 
  Leaf, ShieldCheck, AlertOctagon, Search, Database, Plus, 
  RefreshCw, FileText, CheckCircle2, ArrowRight, Building2, 
  Calendar, User, FlaskConical, AlertTriangle, ChevronRight, 
  Sparkles, ExternalLink, Filter, PackageCheck, Layers, Eye
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageContext";

export default function HerbTraceabilityPage() {
  const { t } = useLanguage();

  // Active tab: 'explorer' | 'recall' | 'register'
  const [activeTab, setActiveTab] = useState<'explorer' | 'recall' | 'register'>('explorer');

  // Registration sub-tab: 'batch' | 'dosage' | 'admin'
  const [registerSubTab, setRegisterSubTab] = useState<'batch' | 'dosage' | 'admin'>('batch');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [dosages, setDosages] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Search / Trace States
  const [searchQuery, setSearchQuery] = useState("AYU-ASH-001-A");
  const [traceResult, setTraceResult] = useState<any>(null);
  const [tracing, setTracing] = useState(false);

  // Recall Impact States
  const [recallBatchId, setRecallBatchId] = useState("HB-2025-001");
  const [recallImpactResult, setRecallImpactResult] = useState<any>(null);
  const [recalling, setRecalling] = useState(false);
  const [recallReason, setRecallReason] = useState("Heavy metal trace limit anomaly detected in quality audit.");
  const [showConfirmRecall, setShowConfirmRecall] = useState(false);

  // Form Input States
  // Batch Form
  const [batchForm, setBatchForm] = useState({
    batchId: `HB-2025-${Math.floor(100 + Math.random() * 900)}`,
    supplierId: "SUP-ORG-005",
    supplierName: "Vedic Bio-Extracts Ltd",
    herbName: "Brahmi (Bacopa monnieri) Standardized Extract",
    harvestDate: new Date().toISOString().split('T')[0],
    gmpCertNumber: "GMP-AYUSH-2025-5510",
    purityTestResults: "98.9% Bacosides A&B (HPLC)",
    pesticideScreeningStatus: "Passed",
    heavyMetalScreeningStatus: "Passed",
    certifyingAuthority: "AYUSH Premium Quality Council",
    expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Dosage Form
  const [dosageForm, setDosageForm] = useState({
    dosageId: `DSG-2025-${Math.floor(100 + Math.random() * 900)}`,
    trialId: "TR-2025-AYU-001",
    herbBatchIds: [] as string[],
    formulationName: "Brahmi 250mg Nootropic Capsules",
    quantity: "2,000 Capsules",
    manufacturerDetails: "AIIA Central GMP Formulations Facility"
  });

  // Administration Form
  const [adminForm, setAdminForm] = useState({
    administrationId: `ADM-2025-${Math.floor(100 + Math.random() * 900)}`,
    patientId: "AYU-ASH-001-A",
    dosageId: "",
    trialId: "TR-2025-AYU-001",
    site: "AIIA New Delhi",
    dosageAmount: "500mg twice daily with warm milk",
    notes: "Patient tolerated dose well. No acute hypersensitivity observed."
  });

  // Load Initial Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBatches, resDosages, resAdmins] = await Promise.all([
        fetch('/api/traceability/batches').then(r => r.json()),
        fetch('/api/traceability/dosages').then(r => r.json()),
        fetch('/api/traceability/administrations').then(r => r.json())
      ]);

      if (resBatches.success) setBatches(resBatches.data || []);
      if (resDosages.success) {
        setDosages(resDosages.data || []);
        if (resDosages.data && resDosages.data.length > 0) {
          setDosageForm(prev => ({ ...prev, dosageId: prev.dosageId, herbBatchIds: [resBatches.data?.[0]?.batchId || 'HB-2025-001'] }));
          setAdminForm(prev => ({ ...prev, dosageId: resDosages.data[0].dosageId }));
        }
      }
      if (resAdmins.success) setAdministrations(resAdmins.data || []);
    } catch (err) {
      console.error("Failed to load traceability data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Search / Upstream Trace
  const handleTraceSearch = async (query = searchQuery) => {
    if (!query) return;
    setTracing(true);
    setTraceResult(null);
    try {
      let paramKey = 'patientId';
      if (query.startsWith('HB-')) paramKey = 'batchId';
      else if (query.startsWith('DSG-')) paramKey = 'dosageId';

      const res = await fetch(`/api/traceability/trace?${paramKey}=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (json.success) {
        setTraceResult(json);
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Trace failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to trace lineage' });
    } finally {
      setTracing(false);
    }
  };

  useEffect(() => {
    if (!loading && searchQuery) {
      handleTraceSearch(searchQuery);
    }
  }, [loading]);

  // Handle Recall Impact Query
  const handleRecallImpactSearch = async (batchId = recallBatchId) => {
    if (!batchId) return;
    try {
      const res = await fetch(`/api/traceability/trace?batchId=${encodeURIComponent(batchId.trim())}`);
      const json = await res.json();
      if (json.success) {
        setRecallImpactResult(json);
      }
    } catch (err) {
      console.error("Failed to fetch recall impact:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'recall') {
      handleRecallImpactSearch(recallBatchId);
    }
  }, [activeTab, recallBatchId]);

  // Execute Batch Recall
  const handleExecuteRecall = async () => {
    setRecalling(true);
    try {
      const res = await fetch('/api/traceability/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: recallBatchId, reason: recallReason })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: `BATCH RECALLED: ${json.message}` });
        setShowConfirmRecall(false);
        fetchData();
        handleRecallImpactSearch(recallBatchId);
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Failed to recall batch' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Recall submission failed' });
    } finally {
      setRecalling(false);
    }
  };

  // Submit Register Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      let endpoint = '/api/traceability/batches';
      let payload: any = batchForm;

      if (registerSubTab === 'dosage') {
        endpoint = '/api/traceability/dosages';
        payload = dosageForm;
      } else if (registerSubTab === 'admin') {
        endpoint = '/api/traceability/administrations';
        payload = adminForm;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: `Successfully registered on Ledger & DB!` });
        fetchData();
        // Reset generated IDs
        if (registerSubTab === 'batch') setBatchForm(prev => ({ ...prev, batchId: `HB-2025-${Math.floor(100 + Math.random() * 900)}` }));
        if (registerSubTab === 'dosage') setDosageForm(prev => ({ ...prev, dosageId: `DSG-2025-${Math.floor(100 + Math.random() * 900)}` }));
        if (registerSubTab === 'admin') setAdminForm(prev => ({ ...prev, administrationId: `ADM-2025-${Math.floor(100 + Math.random() * 900)}` }));
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Registration failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Submission error' });
    }
  };

  // Metrics
  const totalBatches = batches.length;
  const certifiedBatches = batches.filter(b => b.status === 'Certified').length;
  const recalledBatches = batches.filter(b => b.status === 'Recalled').length;
  const activeDosages = dosages.filter(d => d.status === 'Active').length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* ── Top Header Banner ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-8 text-white shadow-2xl border border-emerald-800/40">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-1/3 -top-10 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Leaf className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>DPDP & GCP-Ayurveda ALCOA+ Compliant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading text-white">
              Herb-to-Patient Traceability
            </h1>
            <p className="text-emerald-100/70 text-sm max-w-2xl leading-relaxed">
              End-to-end cryptographic verification linking raw supplier botanical batches, lab quality certifications, formulation dosage logs, and pseudonymous patient administration on the immutable ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all backdrop-blur-md"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
            <button 
              onClick={() => { setActiveTab('register'); setRegisterSubTab('batch'); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Batch</span>
            </button>
          </div>
        </div>

        {/* ── KPI Widgets Bar ────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
              <span>Herb Batches</span>
              <PackageCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{totalBatches}</p>
            <p className="text-[10px] text-emerald-200/60 mt-0.5">{certifiedBatches} Certified & Verified</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-teal-300 text-xs font-medium">
              <span>GMP Pass Rate</span>
              <ShieldCheck className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">
              {totalBatches > 0 ? `${Math.round((certifiedBatches / totalBatches) * 100)}%` : '100%'}
            </p>
            <p className="text-[10px] text-teal-200/60 mt-0.5">Heavy Metals & Pesticides Passed</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-cyan-300 text-xs font-medium">
              <span>Active Dosages</span>
              <FlaskConical className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{activeDosages}</p>
            <p className="text-[10px] text-cyan-200/60 mt-0.5">Formulations Active in Trials</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
              <span>Recall Status</span>
              <AlertOctagon className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{recalledBatches}</p>
            <p className="text-[10px] text-amber-200/60 mt-0.5">
              {recalledBatches > 0 ? '⚠️ Active Batch Recall Flagged' : '✓ 0 Recalled Batches'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Banner Action Message Alert ────────────────────────────────────── */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-md transition-all ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>
      )}

      {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'explorer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitCommitIcon className="h-4 w-4" />
            <span>Lineage Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('recall')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recall'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            <span>Recall Impact Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Sourcing Registration</span>
          </button>
        </div>

        {/* Quick presets */}
        {activeTab === 'explorer' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Demo Search:</span>
            {['AYU-ASH-001-A', 'HB-2025-001', 'DSG-2025-001'].map(id => (
              <button
                key={id}
                onClick={() => { setSearchQuery(id); handleTraceSearch(id); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono text-[11px] border border-slate-200 dark:border-slate-700 transition-all"
              >
                {id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TAB 1: LINEAGE EXPLORER (UPSTREAM SEARCH & VISUAL CHAIN) ─────────── */}
      {activeTab === 'explorer' && (
        <div className="space-y-8">
          
          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTraceSearch()}
                  placeholder="Enter Pseudonymized Patient ID (e.g. AYU-ASH-001-A), Batch ID (HB-2025-001), or Dosage ID (DSG-2025-001)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button
                onClick={() => handleTraceSearch()}
                disabled={tracing}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-50"
              >
                {tracing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Trace Lineage</span>
              </button>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero-Knowledge DPDP Guard:</span>
              <span>Patient IDs are pseudonymized on-chain. No raw PII is exposed in the traceability graph.</span>
            </div>
          </div>

          {/* Trace Results Diagram & Cards */}
          {traceResult && traceResult.chain && (
            <div className="space-y-8">
              
              {/* Lineage Overview Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <span>Cryptographic Lineage Chain</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Found {traceResult.summary.totalAdministrations} administration events, {traceResult.summary.totalDosagesUsed} formulation dosages, and {traceResult.summary.totalRawHerbBatches} certified raw herb batches.
                  </p>
                </div>

                {traceResult.summary.hasRecalledBatch && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <span>RECALLED BATCH IN LINEAGE</span>
                  </div>
                )}
              </div>

              {/* Visual Step-by-Step Chain */}
              {traceResult.chain.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
                  <Database className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No Administration Records Found</p>
                  <p className="text-xs mt-1">Try searching for batch <span className="font-mono text-emerald-500">HB-2025-001</span> or patient <span className="font-mono text-emerald-500">AYU-ASH-001-A</span>.</p>
                </div>
              ) : (
                traceResult.chain.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Administration Event ({item.administration.administrationId})
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Administered on {new Date(item.administration.administeredAt).toLocaleString()} at {item.administration.site}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold font-mono">
                          Tx: {item.administration.blockchainTxHash ? `${item.administration.blockchainTxHash.substring(0, 12)}...` : '0xSimulated'}
                        </span>
                      </div>
                    </div>

                    {/* 3 Horizontal Connected Nodes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                      
                      {/* NODE 1: Herb Batch & Certification */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          <Leaf className="h-4 w-4 text-emerald-500" />
                          <span>1. Certified Herb Batch</span>
                        </div>

                        {item.herbBatches && item.herbBatches.length > 0 ? (
                          item.herbBatches.map((batch: any) => (
                            <div key={batch.batchId} className={`rounded-2xl p-4 border transition-all ${
                              batch.status === 'Recalled' 
                                ? 'bg-rose-500/5 border-rose-500/30' 
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{batch.batchId}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  batch.status === 'Certified' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}>
                                  {batch.status}
                                </span>
                              </div>

                              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{batch.herbName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                {batch.supplierName}
                              </p>

                              {/* Cert Badges */}
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                  <span>GMP Cert #:</span>
                                  <span className="font-mono font-bold">{batch.certificationDetails?.gmpCertNumber || 'GMP-AYUSH-2024'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">Purity Status:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{batch.certificationDetails?.purityTestResults || '99.2% Passed'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">
                                    Pesticides: {batch.certificationDetails?.pesticideScreeningStatus || 'Passed'}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-[9px]">
                                    Heavy Metals: {batch.certificationDetails?.heavyMetalScreeningStatus || 'Passed'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs italic">
                            No batch details attached.
                          </div>
                        )}
                      </div>

                      {/* Connector Arrow (LG screens) */}
                      <div className="hidden lg:flex items-center justify-center absolute left-[32%] top-1/2 -translate-y-1/2 z-10 text-emerald-500/40">
                        <ArrowRight className="h-6 w-6" />
                      </div>

                      {/* NODE 2: Formulation & Dosage Record */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                          <FlaskConical className="h-4 w-4 text-teal-500" />
                          <span>2. Dosage Formulation</span>
                        </div>

                        {item.dosage ? (
                          <div className={`rounded-2xl p-4 border transition-all ${
                            item.dosage.status === 'Recalled' 
                              ? 'bg-rose-500/5 border-rose-500/30' 
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{item.dosage.dosageId}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                item.dosage.status === 'Active' 
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' 
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {item.dosage.status}
                              </span>
                            </div>

                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{item.dosage.formulationName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Trial: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.dosage.trialId}</span>
                            </p>

                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1 text-[10px] text-slate-500">
                              <div>Mfg Facility: {item.dosage.manufacturerDetails || 'AIIA GMP Pharmacy'}</div>
                              <div>Quantity Batch: {item.dosage.quantity || '5,000 Units'}</div>
                              <div className="font-mono text-emerald-600 dark:text-emerald-400 truncate mt-1">
                                On-Chain Tx: {item.dosage.blockchainTxHash ? `${item.dosage.blockchainTxHash.substring(0, 16)}...` : '0xSimulated'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs italic">
                            No dosage record found.
                          </div>
                        )}
                      </div>

                      {/* Connector Arrow (LG screens) */}
                      <div className="hidden lg:flex items-center justify-center absolute left-[65%] top-1/2 -translate-y-1/2 z-10 text-teal-500/40">
                        <ArrowRight className="h-6 w-6" />
                      </div>

                      {/* NODE 3: Patient Administration */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                          <User className="h-4 w-4 text-cyan-500" />
                          <span>3. Patient Administration</span>
                        </div>

                        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                              {item.administration.patientId}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                              Pseudonymized
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.administration.dosageAmount}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {item.administration.site}
                          </p>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 space-y-0.5">
                            <div>Administered By: <span className="font-medium text-slate-700 dark:text-slate-300">{item.administration.administeredBy || 'Investigator'}</span></div>
                            <div className="italic text-slate-400 truncate">"{item.administration.notes || 'No adverse reaction reported'}"</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: RECALL IMPACT & AUDIT TOOL ─────────────────────────────────── */}
      {activeTab === 'recall' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-rose-500" />
                  <span>Herb Batch Recall & Regulatory Audit Tool</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Instantly compute downstream impact of a flagged or compromised herb batch across all trials, dosage formulations, and patient administration sites.
                </p>
              </div>

              <button
                onClick={() => setShowConfirmRecall(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all shrink-0"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Initiate Batch Recall</span>
              </button>
            </div>

            {/* Select Batch Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Herb Batch for Recall Impact Audit:</label>
                <select
                  value={recallBatchId}
                  onChange={(e) => { setRecallBatchId(e.target.value); handleRecallImpactSearch(e.target.value); }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  {batches.map(b => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.batchId} — {b.herbName} ({b.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Impact Calculation Results */}
            {recallImpactResult && (
              <div className="space-y-6 pt-4">
                
                {/* Batch Information Box */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">{recallImpactResult.batch.batchId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        recallImpactResult.batch.status === 'Certified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {recallImpactResult.batch.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{recallImpactResult.batch.herbName}</p>
                    <p className="text-[11px] text-slate-500">Supplier: {recallImpactResult.batch.supplierName} (GMP: {recallImpactResult.batch.certificationDetails?.gmpCertNumber})</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-[11px] text-slate-400 font-mono">Ledger Batch Hash:</p>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {recallImpactResult.batch.batchHash || '0xSimulatedHash'}
                    </p>
                  </div>
                </div>

                {/* 4 Impact Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Total Dosages Formulated</p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{recallImpactResult.summary.totalDosagesFormulated}</p>
                    <p className="text-[10px] text-rose-500 mt-0.5">Formulation Lots</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Patient Administrations</p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{recallImpactResult.summary.totalPatientAdministrations}</p>
                    <p className="text-[10px] text-rose-500 mt-0.5">Total Dose Logs</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Impacted Patients</p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{recallImpactResult.summary.totalAffectedPatients}</p>
                    <p className="text-[10px] text-rose-500 mt-0.5">Pseudonymized IDs</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Affected Sites & Trials</p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{recallImpactResult.summary.affectedSitesCount} Sites / {recallImpactResult.summary.affectedTrialsCount} Trials</p>
                    <p className="text-[10px] text-rose-500 mt-0.5">Locations Flagged</p>
                  </div>
                </div>

                {/* List of Affected Pseudonymized Patients for Regulatory Dossier */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Regulatory Dossier: Affected Patient Administrations</span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">DPDP Non-PII Protected</span>
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        <tr>
                          <th className="p-3">Admin ID</th>
                          <th className="p-3">Pseudonymized Patient ID</th>
                          <th className="p-3">Trial ID</th>
                          <th className="p-3">Site Location</th>
                          <th className="p-3">Dosage Formulation</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                        {recallImpactResult.administrations && recallImpactResult.administrations.length > 0 ? (
                          recallImpactResult.administrations.map((adm: any) => (
                            <tr key={adm.administrationId} className="hover:bg-rose-500/5 transition-all">
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{adm.administrationId}</td>
                              <td className="p-3 font-extrabold text-cyan-600 dark:text-cyan-400">{adm.patientId}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{adm.trialId}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{adm.site}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{adm.dosageId}</td>
                              <td className="p-3 text-slate-500">{new Date(adm.administeredAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-slate-400 italic font-sans">
                              No patient administration records found for this batch yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RECALL CONFIRMATION MODAL ───────────────────────────────────────── */}
      {showConfirmRecall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-rose-500/30 shadow-2xl space-y-5">
            
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Confirm Herb Batch Recall</h3>
                <p className="text-slate-500 text-xs">This action will write an immutable recall transaction to the ledger.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <p className="font-bold">⚠️ Warning: Regulatory Alert Dispatch</p>
              <p>Executing recall for batch <span className="font-mono font-bold">{recallBatchId}</span> will automatically flag all downstream dosage records as 'Recalled' and issue critical safety notifications to site PIs, Pharmacovigilance, and CDSCO regulators.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Recall / Safety Finding:</label>
              <textarea
                rows={3}
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmRecall(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRecall}
                disabled={recalling}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {recalling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertOctagon className="h-4 w-4" />}
                <span>Execute Batch Recall</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SOURCING REGISTRATION FORMS ────────────────────────────────── */}
      {activeTab === 'register' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Plus className="h-5 w-5 text-teal-500" />
                <span>Register Sourcing & Formulation Records</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Submit certified raw botanical batches, formulation dosage records, or patient administration logs to the ledger.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setRegisterSubTab('batch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  registerSubTab === 'batch' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                1. Herb Batch
              </button>
              <button
                onClick={() => setRegisterSubTab('dosage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  registerSubTab === 'dosage' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                2. Dosage Formulation
              </button>
              <button
                onClick={() => setRegisterSubTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  registerSubTab === 'admin' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                3. Patient Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* SUBTAB 1: Herb Batch */}
            {registerSubTab === 'batch' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Herb Batch ID (Unique):</label>
                  <input
                    type="text"
                    required
                    value={batchForm.batchId}
                    onChange={e => setBatchForm({ ...batchForm, batchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Supplier Name & Org ID:</label>
                  <input
                    type="text"
                    required
                    value={batchForm.supplierName}
                    onChange={e => setBatchForm({ ...batchForm, supplierName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Herb / Botanical Name:</label>
                  <input
                    type="text"
                    required
                    value={batchForm.herbName}
                    onChange={e => setBatchForm({ ...batchForm, herbName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">GMP Certification Number:</label>
                  <input
                    type="text"
                    required
                    value={batchForm.gmpCertNumber}
                    onChange={e => setBatchForm({ ...batchForm, gmpCertNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Purity Test Results (HPLC/LC-MS):</label>
                  <input
                    type="text"
                    required
                    value={batchForm.purityTestResults}
                    onChange={e => setBatchForm({ ...batchForm, purityTestResults: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pesticide Screening Status:</label>
                  <select
                    value={batchForm.pesticideScreeningStatus}
                    onChange={e => setBatchForm({ ...batchForm, pesticideScreeningStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Passed">Passed (Below MRL limits)</option>
                    <option value="Pending">Pending Lab Results</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Heavy Metal Screening Status:</label>
                  <select
                    value={batchForm.heavyMetalScreeningStatus}
                    onChange={e => setBatchForm({ ...batchForm, heavyMetalScreeningStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Passed">Passed (Pb, As, Cd, Hg within limits)</option>
                    <option value="Pending">Pending Lab Results</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            )}

            {/* SUBTAB 2: Dosage Formulation */}
            {registerSubTab === 'dosage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dosage Record ID:</label>
                  <input
                    type="text"
                    required
                    value={dosageForm.dosageId}
                    onChange={e => setDosageForm({ ...dosageForm, dosageId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trial ID:</label>
                  <input
                    type="text"
                    required
                    value={dosageForm.trialId}
                    onChange={e => setDosageForm({ ...dosageForm, trialId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Certified Herb Batch(es):</label>
                  <select
                    multiple
                    required
                    value={dosageForm.herbBatchIds}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setDosageForm({ ...dosageForm, herbBatchIds: options });
                    }}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white h-24"
                  >
                    {batches.map(b => (
                      <option key={b.batchId} value={b.batchId}>
                        {b.batchId} — {b.herbName} ({b.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Hold Ctrl/Cmd to select multiple certified herb batches used in formulation.</p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Formulation / Medicine Name:</label>
                  <input
                    type="text"
                    required
                    value={dosageForm.formulationName}
                    onChange={e => setDosageForm({ ...dosageForm, formulationName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* SUBTAB 3: Patient Administration */}
            {registerSubTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Administration ID:</label>
                  <input
                    type="text"
                    required
                    value={adminForm.administrationId}
                    onChange={e => setAdminForm({ ...adminForm, administrationId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pseudonymized Patient ID (Non-PII):</label>
                  <input
                    type="text"
                    required
                    value={adminForm.patientId}
                    onChange={e => setAdminForm({ ...adminForm, patientId: e.target.value })}
                    placeholder="e.g. AYU-ASH-001-A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Active Dosage Formulation:</label>
                  <select
                    required
                    value={adminForm.dosageId}
                    onChange={e => setAdminForm({ ...adminForm, dosageId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  >
                    {dosages.map(d => (
                      <option key={d.dosageId} value={d.dosageId}>
                        {d.dosageId} — {d.formulationName} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Site Location:</label>
                  <input
                    type="text"
                    required
                    value={adminForm.site}
                    onChange={e => setAdminForm({ ...adminForm, site: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span>Commit Record to Ledger & DB</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

// Icon helper
function GitCommitIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
}
