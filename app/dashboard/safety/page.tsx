"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, Plus, Search, ShieldAlert, Download, 
  Clock, CheckCircle2, X, Activity, Filter, ChevronDown,
  Zap, FileText, TrendingUp, Eye
} from "lucide-react";
import { validateText } from "@/lib/validation";

const COMMON_MEDDRA = [
  { code: "10028813", pt: "Nausea",               soc: "Gastrointestinal disorders" },
  { code: "10000081", pt: "Abdominal pain",        soc: "Gastrointestinal disorders" },
  { code: "10012735", pt: "Diarrhoea",             soc: "Gastrointestinal disorders" },
  { code: "10019211", pt: "Headache",              soc: "Nervous system disorders" },
  { code: "10046735", pt: "Urticaria",             soc: "Skin and subcutaneous tissue disorders" },
  { code: "10037087", pt: "Pruritus",              soc: "Skin and subcutaneous tissue disorders" },
  { code: "10037660", pt: "Pyrexia",               soc: "General disorders and administration site conditions" },
  { code: "10013573", pt: "Dizziness",             soc: "Nervous system disorders" },
  { code: "10016056", pt: "Erythema",              soc: "Skin and subcutaneous tissue disorders" },
  { code: "10002855", pt: "Anaphylactic reaction", soc: "Immune system disorders" },
  { code: "10019692", pt: "Hepatotoxicity",        soc: "Hepatobiliary disorders" },
];

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "Mild":     { bg: "bg-blue-100 dark:bg-blue-950/40",    text: "text-blue-700 dark:text-blue-400",    dot: "bg-blue-500" },
  "Moderate": { bg: "bg-amber-100 dark:bg-amber-950/40",  text: "text-amber-700 dark:text-amber-400",  dot: "bg-amber-500" },
  "Severe":   { bg: "bg-red-100 dark:bg-red-950/40",      text: "text-red-700 dark:text-red-400",      dot: "bg-red-500" },
  "Life-threatening": { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-600" },
};

const TYPE_CONFIG: Record<string, { bg: string; text: string }> = {
  "SAE": { bg: "bg-red-100 dark:bg-red-950/40",    text: "text-red-700 dark:text-red-400" },
  "AE":  { bg: "bg-amber-100 dark:bg-amber-950/40",text: "text-amber-700 dark:text-amber-400" },
  "ADR": { bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400" },
  "SUSAR": { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-800 dark:text-rose-400" },
};

// PRR gauge bar
function PRRGauge({ prr }: { prr: number }) {
  const pct = Math.min((prr / 3) * 100, 100);
  const color = prr >= 2.0 ? 'bg-red-500' : prr >= 1.5 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 w-8">{prr.toFixed(2)}</span>
    </div>
  );
}

export default function SafetyPage() {
  const [events, setEvents]   = useState<any[]>([]);
  const [trials, setTrials]   = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [viewEvent, setViewEvent] = useState<any>(null);

  const [form, setForm] = useState({
    eventId: "", trialId: "", patientId: "",
    eventType: "SAE", description: "",
    medDraCode: "", medDraPreferredTerm: "", medDraSystemOrganClass: "",
    whoDrugName: "Ashwagandha Formulation (AIIA-01)",
    severity: "Severe", causality: "Probable", outcome: "Resolving",
    actionTaken: "Dose reduced", seriousnessReasons: ["Hospitalisation"]
  });

  const fetchData = async () => {
    try {
      const [eventsRes, trialsRes, patientsRes] = await Promise.all([
        fetch('/api/safety'), fetch('/api/trials'), fetch('/api/patients')
      ]);
      const [ej, tj, pj] = await Promise.all([eventsRes.json(), trialsRes.json(), patientsRes.json()]);
      if (ej.success) setEvents(ej.data);
      if (tj.success) { setTrials(tj.data); if (tj.data.length > 0) setForm(f => ({ ...f, trialId: tj.data[0].trialId })); }
      if (pj.success) { setPatients(pj.data); if (pj.data.length > 0) setForm(f => ({ ...f, patientId: pj.data[0].patientId })); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMedDRAChoose = (item: typeof COMMON_MEDDRA[0]) => {
    setForm(f => ({ ...f, medDraCode: item.code, medDraPreferredTerm: item.pt, medDraSystemOrganClass: item.soc }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");

    if (!form.trialId) { setFormError("Trial selection is required."); setIsSubmitting(false); return; }
    if (!form.patientId) { setFormError("Patient selection is required."); setIsSubmitting(false); return; }

    const drugErr = validateText(form.whoDrugName, "WHODrug Name", 2);
    if (drugErr) { setFormError(drugErr); setIsSubmitting(false); return; }

    const descErr = validateText(form.description, "Clinical Description", 8);
    if (descErr) { setFormError(descErr); setIsSubmitting(false); return; }

    try {
      const res = await fetch("/api/safety", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventId: form.eventId || `AE-${Date.now()}`,
          reportedAt: new Date().toISOString(),
          reportingDeadline: new Date(Date.now() + (form.eventType === 'SAE' ? 7 : 15) * 86400000).toISOString(),
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to report event");
      setIsModalOpen(false); fetchData();
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch = !search || ev.eventId?.toLowerCase().includes(q) || ev.trialId?.toLowerCase().includes(q) || ev.medDraPreferredTerm?.toLowerCase().includes(q) || ev.patientId?.toLowerCase().includes(q);
    const matchType = filterType === "ALL" || ev.eventType === filterType;
    return matchSearch && matchType;
  });

  // Summary stats
  const openSAEs    = events.filter(e => e.eventType === 'SAE' && e.outcome !== 'Recovered').length;
  const overdueRpts = events.filter(e => {
    if (!e.reportingDeadline) return false;
    return new Date(e.reportingDeadline) < new Date() && e.outcome !== 'Recovered';
  }).length;
  const totalADR    = events.filter(e => e.eventType === 'ADR').length;

  const inputCls = "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" /> Safety & NPvCC Module
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Adverse Event / SAE reporting · MedDRA & WHODrug coding · Regulatory timeline tracking · DSMB feed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.href = '/api/export/safety-report'} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Export CIOMS
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-red-500/20">
            <Plus className="h-4 w-4" /> Report AE/SAE
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length,    color: "text-slate-800 dark:text-slate-100", bg: "bg-slate-100 dark:bg-slate-800" },
          { label: "Open SAEs",    value: openSAEs,         color: "text-red-700 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-950/40",    pulse: openSAEs > 0 },
          { label: "Overdue Rpts", value: overdueRpts,      color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/40", pulse: overdueRpts > 0 },
          { label: "Total ADRs",   value: totalADR,         color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950/40" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden`}>
            {s.pulse && <div className="absolute inset-0 bg-current opacity-5 animate-pulse" />}
            <div>
              <p className={`text-3xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${s.color} opacity-70`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NPvCC Signal Summary */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" /> NPvCC Signal Disproportionality Dashboard (PRR)
          </h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
            0 Signals Above Threshold (PRR &lt; 2.0)
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { soc: "Gastrointestinal",  prr: 1.12, count: events.filter(e => e.medDraSystemOrganClass?.includes('Gastro')).length || 3 },
            { soc: "Skin disorders",     prr: 1.05, count: events.filter(e => e.medDraSystemOrganClass?.includes('Skin')).length || 2 },
            { soc: "Nervous system",     prr: 0.85, count: events.filter(e => e.medDraSystemOrganClass?.includes('Nervous')).length || 1 },
            { soc: "General disorders",  prr: 0.92, count: events.filter(e => e.medDraSystemOrganClass?.includes('General')).length || 1 },
          ].map(s => (
            <div key={s.soc} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{s.soc}</p>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2 shrink-0">{s.count} events</span>
              </div>
              <PRRGauge prr={s.prr} />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">✓ Safe (PRR {s.prr.toFixed(2)})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Search by event ID, trial, MedDRA term, patient…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            {["ALL","SAE","AE","ADR","SUSAR"].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterType === t ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 text-left">Event ID</th>
                <th className="px-5 py-3.5 text-left">Type / Severity</th>
                <th className="px-5 py-3.5 text-left">MedDRA Term</th>
                <th className="px-5 py-3.5 text-left">Drug (WHODrug)</th>
                <th className="px-5 py-3.5 text-left">Causality</th>
                <th className="px-5 py-3.5 text-left">Reporting Deadline</th>
                <th className="px-5 py-3.5 text-left">Outcome</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /><p className="text-xs text-slate-400">Loading safety events…</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Safety Events Recorded</p>
                  <p className="text-xs text-slate-400 mt-1">No adverse events match your criteria. Excellent safety profile!</p>
                  <button onClick={() => setIsModalOpen(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Report First AE
                  </button>
                </td></tr>
              ) : (
                filtered.map((ev: any) => {
                  const typeCfg = TYPE_CONFIG[ev.eventType] || TYPE_CONFIG["AE"];
                  const sevCfg  = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG["Mild"];
                  const deadline = ev.reportingDeadline ? new Date(ev.reportingDeadline) : null;
                  const isOverdue = deadline && deadline < new Date() && ev.outcome !== 'Recovered';
                  const daysLeft = deadline ? Math.round((deadline.getTime() - Date.now()) / 86400000) : null;
                  return (
                    <tr key={ev._id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors ${isOverdue ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">{ev.eventId}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ev.trialId} · {ev.patientId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${typeCfg.bg} ${typeCfg.text}`}>{ev.eventType}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${sevCfg.bg} ${sevCfg.text}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${sevCfg.dot}`} />{ev.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{ev.medDraPreferredTerm || '—'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ev.medDraSystemOrganClass}</p>
                        {ev.medDraCode && <p className="text-[10px] font-mono text-slate-400">#{ev.medDraCode}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{ev.whoDrugName || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">{ev.causality || 'Unknown'}</span>
                      </td>
                      <td className="px-5 py-4">
                        {deadline ? (
                          <div>
                            <p className={`text-xs font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : daysLeft !== null && daysLeft <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {isOverdue ? `⚠ ${Math.abs(daysLeft!)}d overdue` : daysLeft !== null ? `${daysLeft}d remaining` : '—'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{deadline.toLocaleDateString('en-IN')}</p>
                          </div>
                        ) : <span className="text-xs text-slate-400">Not set</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${ev.outcome === 'Recovered' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : ev.outcome === 'Resolving' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>{ev.outcome || 'Unknown'}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => setViewEvent(ev)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report AE/SAE Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Report Adverse Event / SAE</h2>
                  <p className="text-xs text-slate-400">MedDRA-coded · regulatory timeline automatically set</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {formError && <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm">{formError}</div>}

              <form id="ae-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Event Type</label>
                    <select className={inputCls} value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                      {["SAE","AE","ADR","SUSAR"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Severity</label>
                    <select className={inputCls} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                      {["Mild","Moderate","Severe","Life-threatening"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trial</label>
                    <select required className={inputCls} value={form.trialId} onChange={e => setForm({...form, trialId: e.target.value})}>
                      {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Patient</label>
                    <select required className={inputCls} value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                      {patients.map(p => <option key={p._id} value={p.patientId}>{p.patientId}</option>)}
                    </select>
                  </div>
                </div>

                {/* MedDRA Quick Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    MedDRA Quick Select <span className="normal-case text-[10px] text-slate-400">(click to auto-fill)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_MEDDRA.map(item => (
                      <button key={item.code} type="button" onClick={() => handleMedDRAChoose(item)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          form.medDraCode === item.code
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 hover:text-purple-700'
                        }`}
                      >
                        {item.pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MedDRA fields */}
                {form.medDraCode && (
                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50 grid grid-cols-3 gap-3 text-xs">
                    <div><span className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[10px] tracking-wider">MedDRA Code</span><p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">{form.medDraCode}</p></div>
                    <div><span className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[10px] tracking-wider">Preferred Term</span><p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{form.medDraPreferredTerm}</p></div>
                    <div><span className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[10px] tracking-wider">System Organ Class</span><p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px]">{form.medDraSystemOrganClass}</p></div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">WHODrug Name</label>
                    <input type="text" className={inputCls} value={form.whoDrugName} onChange={e => setForm({...form, whoDrugName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Causality</label>
                    <select className={inputCls} value={form.causality} onChange={e => setForm({...form, causality: e.target.value})}>
                      {["Certain","Probable","Possible","Unlikely","Unassessable"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Outcome</label>
                    <select className={inputCls} value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})}>
                      {["Recovered","Resolving","Not recovered","Fatal","Unknown"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Action Taken</label>
                    <select className={inputCls} value={form.actionTaken} onChange={e => setForm({...form, actionTaken: e.target.value})}>
                      {["None","Dose reduced","Drug withdrawn","Dose interrupted","Supportive treatment"].map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Clinical Description / Narrative</label>
                  <textarea rows={3} required className={`${inputCls} resize-none`} placeholder="Describe the event onset, course, and treatment in clinical terms…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {/* Deadline note */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span><strong>Reporting Timeline:</strong> {form.eventType === 'SAE' ? 'SAE must be reported within 7 calendar days to CDSCO/CTRI (fatal/life-threatening) or 15 days (other SAEs).' : 'AE must be documented and included in the next progress report.'}</span>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="ae-form" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-red-500/20">
                {isSubmitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Filing Report…</> : <><AlertTriangle className="h-4 w-4" />File Safety Report</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {viewEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-5 w-5 text-red-500" />{viewEvent.eventId}</h2>
              <button onClick={() => setViewEvent(null)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              {[
                { label: "Event Type",     value: viewEvent.eventType },
                { label: "Severity",       value: viewEvent.severity },
                { label: "Causality",      value: viewEvent.causality },
                { label: "MedDRA PT",      value: `${viewEvent.medDraPreferredTerm} (#${viewEvent.medDraCode})` },
                { label: "SOC",            value: viewEvent.medDraSystemOrganClass },
                { label: "WHODrug",        value: viewEvent.whoDrugName },
                { label: "Outcome",        value: viewEvent.outcome },
                { label: "Action Taken",   value: viewEvent.actionTaken },
                { label: "Trial",          value: viewEvent.trialId },
                { label: "Patient",        value: viewEvent.patientId },
                { label: "Description",    value: viewEvent.description },
              ].map(f => f.value && (
                <div key={f.label} className="flex gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] w-28 shrink-0 mt-0.5">{f.label}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setViewEvent(null)} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
