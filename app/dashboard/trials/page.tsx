"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, FileText, ArrowRight, ShieldCheck, X, CheckCircle2,
  Users, Calendar, Leaf, Activity, MapPin, ExternalLink, LayoutGrid, List, Filter
} from "lucide-react";
import { validatePersonName, validateText, validateIdCode, validatePositiveNumber } from "@/lib/validation";

const PHASE_COLORS: Record<string, string> = {
  "Phase 1":      "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Phase 2":      "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Phase 3":      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Phase 4":      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  "Observational":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "Active":    { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Planned":   { bg: "bg-blue-100 dark:bg-blue-950/40",       text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500" },
  "Completed": { bg: "bg-slate-100 dark:bg-slate-800",        text: "text-slate-600 dark:text-slate-400",     dot: "bg-slate-400" },
  "Suspended": { bg: "bg-red-100 dark:bg-red-950/40",         text: "text-red-700 dark:text-red-400",         dot: "bg-red-500" },
};

function TrialCard({ trial }: { trial: any }) {
  const rate = trial.enrollmentTarget > 0 ? Math.round(((trial.enrollmentCurrent || 0) / trial.enrollmentTarget) * 100) : 0;
  const status = STATUS_CONFIG[trial.status] || STATUS_CONFIG["Planned"];
  const phase  = PHASE_COLORS[trial.phase]  || PHASE_COLORS["Observational"];
  const iecApproved = trial.iecApprovalStatus === "Approved";

  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm card-hover group flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${phase}`}>{trial.phase}</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${status.bg} ${status.text}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {trial.status}
            </div>
            {trial.ctriRegistration && (
              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                CTRI ✓
              </span>
            )}
          </div>
          <Link href={`/dashboard/trials/${trial.trialId}`} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm leading-snug line-clamp-2">
            {trial.name}
          </Link>
        </div>
        <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900 shrink-0">
          {trial.trialId}
        </div>
      </div>

      {/* Formulation */}
      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
        <Leaf className="h-3.5 w-3.5 shrink-0" />
        {trial.herbFormulation || "Standard Formulation"}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
        {trial.principalInvestigator && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">{trial.principalInvestigator}</span>
          </div>
        )}
        {trial.site && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{trial.site}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className={`h-3 w-3 shrink-0 ${iecApproved ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className={`font-semibold ${iecApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            IEC: {trial.iecApprovalStatus || 'Pending'}
          </span>
        </div>
        {trial.blindingType && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Activity className="h-3 w-3 shrink-0" />
            <span className="truncate">{trial.blindingType}</span>
          </div>
        )}
      </div>

      {/* Enrolment Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Enrolment</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {trial.enrollmentCurrent || 0} <span className="text-slate-400 font-normal">/ {trial.enrollmentTarget}</span>
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
              rate >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
              'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{rate}% of target enrolled</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {trial.protocolDeviations > 0 && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
              {trial.protocolDeviations} deviation{trial.protocolDeviations > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Link
          href={`/dashboard/trials/${trial.trialId}`}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:gap-2 transition-all opacity-0 group-hover:opacity-100"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/dashboard/trials/${trial.trialId}`}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:hidden"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function TrialsPage() {
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
    trialId: "", name: "", phase: "Phase 2", status: "Active", enrollmentTarget: 100,
    principalInvestigator: "", site: "AIIA New Delhi", herbFormulation: "", description: "",
    primaryObjective: "", studyDesign: "Double-blind, Randomized, Placebo-controlled",
    blindingType: "Double-blind", protocolVersion: "1.0", ctriRegistration: "",
    iecApprovalNumber: "", iecApprovalStatus: "Approved", iecApprovalDate: "", iecExpiryDate: "",
    nextCTRIUpdateDue: "", nextMonitoringVisitDate: ""
  });

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/trials');
      const json = await res.json();
      if (json.success) setTrials(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrials(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFormError("");

    // Validation checks
    const idErr = validateIdCode(form.trialId, "Trial ID");
    if (idErr) { setFormError(idErr); setIsSubmitting(false); return; }

    const nameErr = validateText(form.name, "Study Title", 3);
    if (nameErr) { setFormError(nameErr); setIsSubmitting(false); return; }

    const piErr = validatePersonName(form.principalInvestigator, "Principal Investigator");
    if (piErr) { setFormError(piErr); setIsSubmitting(false); return; }

    const herbErr = validateText(form.herbFormulation, "Ayurvedic Formulation", 2);
    if (herbErr) { setFormError(herbErr); setIsSubmitting(false); return; }

    const targetErr = validatePositiveNumber(form.enrollmentTarget, "Enrolment Target");
    if (targetErr) { setFormError(targetErr); setIsSubmitting(false); return; }

    if (form.ctriRegistration && form.ctriRegistration.trim()) {
      const ctriErr = validateIdCode(form.ctriRegistration, "CTRI Registration No.");
      if (ctriErr) { setFormError(ctriErr); setIsSubmitting(false); return; }
    }

    try {
      const res = await fetch("/api/trials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create trial");
      setIsModalOpen(false); fetchTrials();
      setForm({ trialId: "", name: "", phase: "Phase 2", status: "Active", enrollmentTarget: 100, principalInvestigator: "", site: "AIIA New Delhi", herbFormulation: "", description: "", primaryObjective: "", studyDesign: "Double-blind, Randomized, Placebo-controlled", blindingType: "Double-blind", protocolVersion: "1.0", ctriRegistration: "", iecApprovalNumber: "", iecApprovalStatus: "Approved", iecApprovalDate: "", iecExpiryDate: "", nextCTRIUpdateDue: "", nextMonitoringVisitDate: "" });
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const filtered = trials.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.name?.toLowerCase().includes(q) || t.trialId?.toLowerCase().includes(q) || t.herbFormulation?.toLowerCase().includes(q) || t.principalInvestigator?.toLowerCase().includes(q) || t.ctriRegistration?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPhase  = phaseFilter  === "ALL" || t.phase  === phaseFilter;
    return matchSearch && matchStatus && matchPhase;
  });

  const summaryStats = [
    { label: "Total Trials",   value: trials.length,                                         color: "text-slate-800 dark:text-slate-100" },
    { label: "Active Studies", value: trials.filter(t => t.status === "Active").length,       color: "text-emerald-600 dark:text-emerald-400" },
    { label: "CTRI Registered",value: trials.filter(t => t.ctriRegistration).length,         color: "text-blue-600 dark:text-blue-400" },
    { label: "IEC Approved",   value: trials.filter(t => t.iecApprovalStatus === "Approved").length, color: "text-purple-600 dark:text-purple-400" },
  ];

  const inputCls = "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" /> Study Portfolio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor all AIIA Ayurveda clinical research protocols.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/20">
          <Plus className="h-4 w-4" /> New Trial Protocol
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" placeholder="Search by name, CTRI ID, formulation, PI…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["ALL","Active","Planned","Completed","Suspended"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${statusFilter === s ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{s}</button>
          ))}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none">
            <option value="ALL">All Phases</option>
            {["Phase 1","Phase 2","Phase 3","Phase 4","Observational"].map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setViewMode("cards")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "cards" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <FileText className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No trials match your criteria</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the filters or search term</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => <TrialCard key={t._id} trial={t} />)}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 text-left">Trial ID</th>
                  <th className="px-5 py-3.5 text-left">Protocol / Formulation</th>
                  <th className="px-5 py-3.5 text-left">Phase</th>
                  <th className="px-5 py-3.5 text-left">IEC</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Enrolment</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((t: any) => {
                  const rate = t.enrollmentTarget > 0 ? Math.round(((t.enrollmentCurrent || 0) / t.enrollmentTarget) * 100) : 0;
                  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG["Planned"];
                  return (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/trials/${t.trialId}`} className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-xs">{t.trialId}</Link>
                        {t.ctriRegistration && <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{t.ctriRegistration}</p>}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">{t.name}</p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">🌿 {t.herbFormulation || "Standard"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${PHASE_COLORS[t.phase] || PHASE_COLORS["Observational"]}`}>{t.phase}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${t.iecApprovalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>{t.iecApprovalStatus || 'Pending'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${status.bg} ${status.text}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{t.status}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.enrollmentCurrent || 0}/{t.enrollmentTarget}</p>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(rate, 100)}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link href={`/dashboard/trials/${t.trialId}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                          View <ArrowRight className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Register New Trial Protocol</h2>
                  <p className="text-xs text-slate-400">All fields are audit-logged to the blockchain</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm">{formError}</div>}
              <form id="trial-protocol-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trial ID (Internal Ref)</label><input required type="text" placeholder="e.g. AIIA-TR-2026-04" className={inputCls} value={form.trialId} onChange={e => setForm({...form, trialId: e.target.value})} /></div>
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CTRI Registration No.</label><input type="text" placeholder="e.g. CTRI/2026/08/045812" className={inputCls} value={form.ctriRegistration} onChange={e => setForm({...form, ctriRegistration: e.target.value})} /></div>
                </div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Study Title / Protocol Name</label><input required type="text" placeholder="Clinical Evaluation of Ashwagandha Rasayana in..." className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phase</label>
                    <select className={inputCls} value={form.phase} onChange={e => setForm({...form, phase: e.target.value})}>
                      {["Phase 1","Phase 2","Phase 3","Phase 4","Observational"].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Blinding</label>
                    <select className={inputCls} value={form.blindingType} onChange={e => setForm({...form, blindingType: e.target.value})}>
                      {["Double-blind","Single-blind","Open-label","Triple-blind"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Enrolment Target</label><input required type="number" min="1" className={inputCls} value={form.enrollmentTarget} onChange={e => setForm({...form, enrollmentTarget: parseInt(e.target.value)})} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ayurvedic Formulation</label><input required type="text" placeholder="e.g. AYUSH-64 / Guduchi Ghanavati" className={inputCls} value={form.herbFormulation} onChange={e => setForm({...form, herbFormulation: e.target.value})} /></div>
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Principal Investigator</label><input required type="text" placeholder="Prof. / Dr. Name" className={inputCls} value={form.principalInvestigator} onChange={e => setForm({...form, principalInvestigator: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">IEC Approval Number</label><input type="text" placeholder="AIIA/IEC/2026/041" className={inputCls} value={form.iecApprovalNumber} onChange={e => setForm({...form, iecApprovalNumber: e.target.value})} /></div>
                  <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">IEC Expiry Date</label><input type="date" className={inputCls} value={form.iecExpiryDate} onChange={e => setForm({...form, iecExpiryDate: e.target.value})} /></div>
                </div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Objective</label><textarea rows={2} placeholder="To evaluate the efficacy of the test formulation against..." className={`${inputCls} resize-none`} value={form.primaryObjective} onChange={e => setForm({...form, primaryObjective: e.target.value})} /></div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="trial-protocol-form" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-emerald-500/20">
                {isSubmitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Registering…</> : <><CheckCircle2 className="h-4 w-4" />Register Protocol</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
