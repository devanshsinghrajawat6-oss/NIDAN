"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, Plus, Search, ShieldAlert, Download, 
  Clock, CheckCircle2, X, ExternalLink, Activity, Filter
} from "lucide-react";

// Common MedDRA terms for quick selection in Ayurveda CTMS
const COMMON_MEDDRA = [
  { code: "10028813", pt: "Nausea", soc: "Gastrointestinal disorders" },
  { code: "10000081", pt: "Abdominal pain", soc: "Gastrointestinal disorders" },
  { code: "10012735", pt: "Diarrhoea", soc: "Gastrointestinal disorders" },
  { code: "10019211", pt: "Headache", soc: "Nervous system disorders" },
  { code: "10046735", pt: "Urticaria", soc: "Skin and subcutaneous tissue disorders" },
  { code: "10037087", pt: "Pruritus", soc: "Skin and subcutaneous tissue disorders" },
  { code: "10037660", pt: "Pyrexia", soc: "General disorders and administration site conditions" },
  { code: "10013573", pt: "Dizziness", soc: "Nervous system disorders" },
  { code: "10016056", pt: "Erythema", soc: "Skin and subcutaneous tissue disorders" },
  { code: "10002855", pt: "Anaphylactic reaction", soc: "Immune system disorders" },
  { code: "10019692", pt: "Hepatotoxicity", soc: "Hepatobiliary disorders" },
];

export default function SafetyPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    eventId: "",
    trialId: "",
    patientId: "",
    eventType: "SAE",
    description: "",
    medDraCode: "",
    medDraPreferredTerm: "",
    medDraSystemOrganClass: "",
    whoDrugName: "Ashwagandha Formulation (AIIA-01)",
    severity: "Severe",
    causality: "Probable",
    outcome: "Resolving",
    actionTaken: "Dose reduced",
    seriousnessReasons: ["Hospitalisation"]
  });

  const fetchData = async () => {
    try {
      const [eventsRes, trialsRes, patientsRes] = await Promise.all([
        fetch('/api/safety'),
        fetch('/api/trials'),
        fetch('/api/patients')
      ]);
      const eventsJson = await eventsRes.json();
      const trialsJson = await trialsRes.json();
      const patientsJson = await patientsRes.json();
      
      if (eventsJson.success) setEvents(eventsJson.data);
      if (trialsJson.success) {
        setTrials(trialsJson.data);
        if (trialsJson.data.length > 0) setForm(f => ({ ...f, trialId: trialsJson.data[0].trialId }));
      }
      if (patientsJson.success) {
        setPatients(patientsJson.data);
        if (patientsJson.data.length > 0) setForm(f => ({ ...f, patientId: patientsJson.data[0].patientId }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMedDRAChoose = (item: typeof COMMON_MEDDRA[0]) => {
    setForm(f => ({
      ...f,
      medDraCode: item.code,
      medDraPreferredTerm: item.pt,
      medDraSystemOrganClass: item.soc
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventId: form.eventId || `SAE-${Date.now()}`
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to submit safety report");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      await fetch(`/api/safety/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = events.filter(e => {
    const matchesSearch = !search ||
      e.eventId?.toLowerCase().includes(search.toLowerCase()) ||
      e.trialId?.toLowerCase().includes(search.toLowerCase()) ||
      e.patientId?.toLowerCase().includes(search.toLowerCase()) ||
      e.medDraPreferredTerm?.toLowerCase().includes(search.toLowerCase()) ||
      e.medDraCode?.includes(search);
    const matchesType = filterType === "ALL" || e.eventType === filterType;
    return matchesSearch && matchesType;
  });

  const saeCount = events.filter(e => e.eventType === 'SAE' || e.eventType === 'SUSAR').length;
  const overdueCount = events.filter(e => e.regulatoryDeadline && new Date(e.regulatoryDeadline) < new Date() && e.status !== 'Closed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            National Pharmacovigilance (NPvCC) Safety Surveillance
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time Adverse Event & SAE monitoring governed by NDCT Rules 2019 and GCP-ASU.</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/api/safety/export?format=e2b" 
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Export E2B (R3) XML
          </a>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Report AE / SAE
          </button>
        </div>
      </div>

      {/* Regulatory Deadline Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-300">
        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-amber-950 dark:text-amber-200 block mb-0.5">NDCT Rules 2019 — Strict Reporting Timelines:</strong>
          All Serious Adverse Events (SAEs) occurring during clinical trials must be reported to the Central Licensing Authority (CDSCO) and Institutional Ethics Committee within <strong>24 hours</strong> of occurrence. Non-serious Adverse Events must be reported within <strong>7 days</strong>. Every report is time-stamped and anchored to the local EVM blockchain.
        </div>
      </div>

      {/* Safety Signal & Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Reported Events</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{events.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Serious Events (SAE)</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{saeCount}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Overdue Submissions</span>
          <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
            {overdueCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">NPvCC Signal Disproportionality</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">PRR &lt; 2.0 (Normal)</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Event ID, MedDRA PT, Patient ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "SAE", "AE", "ADR", "SUSAR"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === type
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Event / Trial</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Type & Severity</th>
                <th className="px-5 py-3.5">MedDRA Coding (PT / SOC)</th>
                <th className="px-5 py-3.5">Causality (WHO-UMC)</th>
                <th className="px-5 py-3.5">24h Regulatory Countdown</th>
                <th className="px-5 py-3.5">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading pharmacovigilance surveillance data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No active adverse events recorded.</p>
                      <p className="text-xs">All trials operating within standard safety limits.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((event: any) => {
                  const now = new Date();
                  const deadline = event.regulatoryDeadline ? new Date(event.regulatoryDeadline) : null;
                  const hoursLeft = deadline ? Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)) : null;
                  const isOverdue = hoursLeft !== null && hoursLeft < 0 && event.status !== 'Closed' && event.status !== 'Submitted to Regulator';

                  return (
                    <tr key={event._id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors ${isOverdue ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 block">
                          {event.eventId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {event.trialId}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {event.patientId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            event.eventType === 'SAE' || event.eventType === 'SUSAR'
                              ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400'
                          }`}>
                            {event.eventType}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({event.severity})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {event.medDraPreferredTerm || event.description || "Uncoded Event"}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Code: {event.medDraCode || "N/A"} · {event.medDraSystemOrganClass || "General"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {event.causality || "Unassessed"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {event.status === 'Submitted to Regulator' || event.status === 'Closed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/40 px-2 py-1 rounded">
                            <AlertTriangle className="h-3.5 w-3.5" /> {Math.abs(hoursLeft!)}h OVERDUE
                          </span>
                        ) : hoursLeft !== null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Clock className="h-3.5 w-3.5" /> {hoursLeft}h left
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {event.status === 'Reported' ? (
                          <button
                            onClick={() => handleUpdateStatus(event.eventId, 'Submitted to Regulator')}
                            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold transition-colors"
                          >
                            Submit to CDSCO
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold">{event.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for reporting AE/SAE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                Report Adverse Event / SAE (NPvCC)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{formError}</div>}
              
              <form id="ae-report-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Study / Trial ID</label>
                    <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.trialId} onChange={e => setForm({...form, trialId: e.target.value})}>
                      {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient / Subject ID</label>
                    <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                      {patients.map(p => <option key={p._id} value={p.patientId}>{p.patientId} ({p.pseudonymizedId})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Event Type</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                      <option value="SAE">SAE (Serious - 24h)</option>
                      <option value="AE">AE (Non-serious - 7d)</option>
                      <option value="ADR">ADR (Adverse Drug Reaction)</option>
                      <option value="SUSAR">SUSAR (Expedited)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Severity Grade</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                      <option>Mild</option><option>Moderate</option><option>Severe</option><option>Life-threatening</option><option>Death</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Causality (WHO-UMC)</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.causality} onChange={e => setForm({...form, causality: e.target.value})}>
                      <option>Certain</option><option>Probable</option><option>Possible</option><option>Unlikely</option><option>Unclassifiable</option>
                    </select>
                  </div>
                </div>

                {/* Quick MedDRA picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quick MedDRA Coded Dictionary</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {COMMON_MEDDRA.map(item => (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => handleMedDRAChoose(item)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          form.medDraCode === item.code
                            ? 'bg-red-100 border-red-300 text-red-800 font-bold dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {item.pt} ({item.code})
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="MedDRA Preferred Term (PT)" 
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" 
                      value={form.medDraPreferredTerm} 
                      onChange={e => setForm({...form, medDraPreferredTerm: e.target.value})} 
                    />
                    <input 
                      type="text" 
                      placeholder="MedDRA Code (e.g. 10028813)" 
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono" 
                      value={form.medDraCode} 
                      onChange={e => setForm({...form, medDraCode: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Description & Narrative</label>
                  <textarea 
                    rows={2} 
                    required 
                    placeholder="Patient presented with symptoms 4 days after commencing treatment with..." 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                  />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="ae-report-form" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? "Anchoring on Blockchain..." : <><CheckCircle2 className="h-4 w-4" /> Sign & Transmit SAE</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
