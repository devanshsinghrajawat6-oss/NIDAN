"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, FileText, ArrowRight, ShieldCheck, X, CheckCircle2,
  Users, Calendar, Leaf, Activity, MapPin, ExternalLink, LayoutGrid, List, Filter
} from "lucide-react";
import { validatePersonName, validateText, validateIdCode, validatePositiveNumber } from "@/lib/validation";
import { useSession } from "next-auth/react";

const PHASE_COLORS: Record<string, string> = {
  "Phase 1":      "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "Phase 2":      "bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "Phase 3":      "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "Phase 4":      "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Observational":"bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "Active":    { bg: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800", text: "text-emerald-900 dark:text-emerald-300", dot: "bg-emerald-600 dark:bg-emerald-400" },
  "Planned":   { bg: "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800",       text: "text-blue-900 dark:text-blue-300",       dot: "bg-blue-600 dark:bg-blue-400" },
  "Completed": { bg: "bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700",        text: "text-stone-700 dark:text-stone-300",     dot: "bg-stone-400" },
  "Suspended": { bg: "bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800",         text: "text-red-900 dark:text-red-300",         dot: "bg-red-600 dark:bg-red-400" },
};

function TrialCard({ trial }: { trial: any }) {
  const rate = trial.enrollmentTarget > 0 ? Math.round(((trial.enrollmentCurrent || 0) / trial.enrollmentTarget) * 100) : 0;
  const status = STATUS_CONFIG[trial.status] || STATUS_CONFIG["Planned"];
  const phase  = PHASE_COLORS[trial.phase]  || PHASE_COLORS["Observational"];

  return (
    <div className="paper-card p-5 flex flex-col justify-between gap-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${phase}`}>{trial.phase}</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {trial.status}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
            {trial.trialId}
          </span>
        </div>

        <Link href={`/dashboard/trials/${trial.trialId}`} className="font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors text-base leading-snug line-clamp-2">
          {trial.name}
        </Link>
      </div>

      {/* Formulation */}
      <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-md border border-emerald-200 dark:border-emerald-800">
        <Leaf className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span className="truncate">{trial.herbFormulation || "Standard Formulation"}</span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center justify-between">
          <span>Principal Investigator:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">{trial.principalInvestigator || "AIIA PI"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>IEC Status:</span>
          <span className={`font-bold ${trial.iecApprovalStatus === 'Approved' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
            {trial.iecApprovalStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Enrollment Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold mb-1">
          <span className="text-stone-500 dark:text-stone-400">Enrolment Target</span>
          <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{trial.enrollmentCurrent || 0} / {trial.enrollmentTarget} ({rate}%)</span>
        </div>
        <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-700 dark:bg-emerald-500' : rate >= 50 ? 'bg-amber-600 dark:bg-amber-500' : 'bg-blue-600 dark:bg-blue-500'}`} style={{ width: `${Math.min(rate, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function TrialsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "Investigator";

  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [phaseFilter, setPhaseFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    trialId: "", name: "", ctriRegistration: "", phase: "Phase 2",
    herbFormulation: "", principalInvestigator: "", coInvestigators: "",
    siteName: "AIIA New Delhi", enrollmentTarget: 100, startDate: "", description: "",
  });

  const fetchTrials = async () => {
    try {
      const r = await fetch("/api/trials");
      const d = await r.json();
      if (d.success) setTrials(d.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrials(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");

    const idErr = validateIdCode(form.trialId, "Trial ID");
    if (idErr) { setFormError(idErr); setIsSubmitting(false); return; }

    const nameErr = validateText(form.name, "Protocol Title", 3);
    if (nameErr) { setFormError(nameErr); setIsSubmitting(false); return; }

    const piErr = validatePersonName(form.principalInvestigator, "Principal Investigator");
    if (piErr) { setFormError(piErr); setIsSubmitting(false); return; }

    try {
      const res = await fetch("/api/trials", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coInvestigators: form.coInvestigators.split(",").map(s => s.trim()).filter(Boolean) }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to create trial");
      setIsModalOpen(false); fetchTrials();
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const filtered = trials.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !search || t.name?.toLowerCase().includes(q) || t.trialId?.toLowerCase().includes(q) || t.herbFormulation?.toLowerCase().includes(q) || t.principalInvestigator?.toLowerCase().includes(q);
    const matchS = statusFilter === "ALL" || t.status === statusFilter;
    const matchP = phaseFilter === "ALL" || t.phase === phaseFilter;
    return matchQ && matchS && matchP;
  });

  const summaryStats = [
    { label: "Total Protocols", value: trials.length, color: "text-stone-900 dark:text-stone-100" },
    { label: "Active Phase II/III", value: trials.filter(t => t.status === "Active").length, color: "text-emerald-800 dark:text-emerald-400" },
    { label: "Total Target Enrolment", value: trials.reduce((a,b) => a + (b.enrollmentTarget || 0), 0).toLocaleString(), color: "text-blue-800 dark:text-blue-400" },
    { label: "IEC Approved", value: trials.filter(t => t.iecApprovalStatus === "Approved").length, color: "text-purple-800 dark:text-purple-400" },
  ];

  const inputCls = "w-full p-2.5 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded-md text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-800 transition-all";

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-800 dark:text-emerald-400" /> Study Portfolio
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Manage and monitor all AIIA Ayurveda clinical research protocols.</p>
        </div>
        {(userRole === "Investigator" || userRole === "Admin") && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-md transition-colors shadow-2xs">
            <Plus className="h-4 w-4" /> New Trial Protocol
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map(s => (
          <div key={s.label} className="paper-card p-4">
            <p className={`text-2xl font-serif font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="paper-card p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text" placeholder="Search by name, CTRI ID, formulation, PI…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded-md text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-800 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["ALL","Active","Planned","Completed","Suspended"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-emerald-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'}`}>{s}</button>
          ))}
          <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 focus:outline-none">
            <option value="ALL">All Phases</option>
            {["Phase 1","Phase 2","Phase 3","Phase 4","Observational"].map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-md p-1">
            <button onClick={() => setViewMode("cards")} className={`p-1 rounded ${viewMode === "cards" ? "bg-white dark:bg-stone-700 shadow-2xs" : "text-stone-400"}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button onClick={() => setViewMode("table")} className={`p-1 rounded ${viewMode === "table" ? "bg-white dark:bg-stone-700 shadow-2xs" : "text-stone-400"}`}><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="paper-card h-64 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="paper-card text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-3 text-stone-300" />
          <p className="text-stone-500 font-semibold text-xs">No trials match your criteria</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => <TrialCard key={t._id} trial={t} />)}
        </div>
      ) : (
        /* Table view */
        <div className="paper-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-stone-100 dark:bg-[#182434] border-b border-stone-200 dark:border-stone-800 uppercase font-bold text-stone-500 text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Trial ID</th>
                  <th className="px-4 py-3 text-left">Protocol / Formulation</th>
                  <th className="px-4 py-3 text-left">Phase</th>
                  <th className="px-4 py-3 text-left">IEC</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Enrolment</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filtered.map((t: any) => {
                  const rate = t.enrollmentTarget > 0 ? Math.round(((t.enrollmentCurrent || 0) / t.enrollmentTarget) * 100) : 0;
                  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG["Planned"];
                  return (
                    <tr key={t._id} className="hover:bg-stone-50 dark:hover:bg-[#182434]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        <Link href={`/dashboard/trials/${t.trialId}`}>{t.trialId}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-900 dark:text-stone-100 text-xs">{t.name}</p>
                        <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">🌿 {t.herbFormulation || "Standard"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${PHASE_COLORS[t.phase] || PHASE_COLORS["Observational"]}`}>{t.phase}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.iecApprovalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'}`}>{t.iecApprovalStatus || 'Pending'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{t.status}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{t.enrollmentCurrent || 0}/{t.enrollmentTarget}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/dashboard/trials/${t.trialId}`} className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Trial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
                <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">Register New Trial Protocol</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {formError && <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-xs font-bold">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Trial Protocol ID</label><input required type="text" placeholder="e.g. TR-2026-04" className={inputCls} value={form.trialId} onChange={e => setForm({...form, trialId: e.target.value})} /></div>
                <div><label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">CTRI Registration No.</label><input type="text" placeholder="e.g. CTRI/2026/08/045812" className={inputCls} value={form.ctriRegistration} onChange={e => setForm({...form, ctriRegistration: e.target.value})} /></div>
              </div>

              <div><label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Study Title / Protocol Name</label><input required type="text" placeholder="Clinical Evaluation of Ashwagandha Rasayana..." className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Principal Investigator</label><input required type="text" placeholder="Dr. Full Name" className={inputCls} value={form.principalInvestigator} onChange={e => setForm({...form, principalInvestigator: e.target.value})} /></div>
                <div><label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Herb Formulation / Dravya</label><input required type="text" placeholder="e.g. Ashwagandha 500mg" className={inputCls} value={form.herbFormulation} onChange={e => setForm({...form, herbFormulation: e.target.value})} /></div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white dark:bg-[#182434] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white font-bold rounded hover:bg-emerald-900 disabled:opacity-60">{isSubmitting ? "Submitting…" : "Register Protocol"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
