"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText, ArrowRight, ShieldCheck, Scale, X, CheckCircle2 } from "lucide-react";

export default function TrialsPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    trialId: "",
    name: "",
    phase: "Phase 2",
    status: "Active",
    enrollmentTarget: 100,
    principalInvestigator: "",
    site: "AIIA New Delhi",
    herbFormulation: "",
    description: "",
    primaryObjective: "",
    studyDesign: "Double-blind, Randomized, Placebo-controlled",
    blindingType: "Double-blind",
    protocolVersion: "1.0",
    ctriRegistration: "",
    iecApprovalNumber: "",
    iecApprovalStatus: "Approved",
    iecApprovalDate: "",
    iecExpiryDate: "",
    nextCTRIUpdateDue: "",
    nextMonitoringVisitDate: ""
  });

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/trials');
      const json = await res.json();
      if (json.success) setTrials(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create trial");
      setIsModalOpen(false);
      fetchTrials();
      setForm({
        trialId: "", name: "", phase: "Phase 2", status: "Active", enrollmentTarget: 100,
        principalInvestigator: "", site: "AIIA New Delhi", herbFormulation: "", description: "",
        primaryObjective: "", studyDesign: "Double-blind, Randomized, Placebo-controlled",
        blindingType: "Double-blind", protocolVersion: "1.0", ctriRegistration: "",
        iecApprovalNumber: "", iecApprovalStatus: "Approved", iecApprovalDate: "", iecExpiryDate: "",
        nextCTRIUpdateDue: "", nextMonitoringVisitDate: ""
      });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = trials.filter(t => {
    const matchesSearch = !search || 
      t.name?.toLowerCase().includes(search.toLowerCase()) || 
      t.trialId?.toLowerCase().includes(search.toLowerCase()) ||
      t.herbFormulation?.toLowerCase().includes(search.toLowerCase()) ||
      t.ctriRegistration?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-600" />
            Study Portfolio
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all active AIIA Ayurveda clinical research trials.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Trial Protocol
        </button>
      </div>

      {/* Summary KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Trials</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{trials.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Studies</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{trials.filter(t => t.status === 'Active').length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">CTRI Registered</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{trials.filter(t => t.ctriRegistration).length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">IEC Approved</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{trials.filter(t => t.iecApprovalStatus === 'Approved').length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, CTRI ID, formulation..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "Active", "Planned", "Completed", "Suspended"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Trial ID / CTRI</th>
                <th className="px-5 py-3.5">Protocol & Herb Formulation</th>
                <th className="px-5 py-3.5">Phase & Design</th>
                <th className="px-5 py-3.5">IEC Status</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Enrolment</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading study portfolio...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                      <p>No trials found matching criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((trial: any) => {
                  const rate = trial.enrollmentTarget > 0 ? Math.round(((trial.enrollmentCurrent || 0) / trial.enrollmentTarget) * 100) : 0;
                  return (
                    <tr key={trial._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/trials/${trial.trialId}`} className="font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline block text-xs">
                          {trial.trialId}
                        </Link>
                        {trial.ctriRegistration && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {trial.ctriRegistration}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{trial.name}</div>
                        <div className="text-xs text-brand-700 dark:text-brand-300 font-medium mt-0.5">🌿 {trial.herbFormulation || "Standard formulation"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{trial.phase}</div>
                        <div className="text-[10px] text-slate-400">{trial.blindingType || "Open-label"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          trial.iecApprovalStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}>
                          {trial.iecApprovalStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          trial.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {trial.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{trial.enrollmentCurrent || 0} / {trial.enrollmentTarget}</span>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-brand-500'}`} 
                            style={{ width: `${Math.min(rate, 100)}%` }} 
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link 
                          href={`/dashboard/trials/${trial.trialId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 transition-colors p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30"
                        >
                          Drill Down <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Trial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                Register New Trial Protocol
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{formError}</div>}
              <form id="trial-protocol-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trial ID (Internal Ref)</label>
                    <input required type="text" placeholder="e.g. AIIA-TR-2026-04" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.trialId} onChange={e => setForm({...form, trialId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CTRI Registration No.</label>
                    <input type="text" placeholder="e.g. CTRI/2026/08/045812" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.ctriRegistration} onChange={e => setForm({...form, ctriRegistration: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Study Title / Protocol Name</label>
                  <input required type="text" placeholder="Clinical Evaluation of Ashwagandha Rasayana in..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Study Phase</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.phase} onChange={e => setForm({...form, phase: e.target.value})}>
                      <option>Phase 1</option><option>Phase 2</option><option>Phase 3</option><option>Phase 4</option><option>Observational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Blinding</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.blindingType} onChange={e => setForm({...form, blindingType: e.target.value})}>
                      <option>Double-blind</option><option>Single-blind</option><option>Open-label</option><option>Triple-blind</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enrolment Target</label>
                    <input required type="number" min="1" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.enrollmentTarget} onChange={e => setForm({...form, enrollmentTarget: parseInt(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ayurvedic Formulation</label>
                    <input required type="text" placeholder="e.g. AYUSH-64 / Guduchi Ghanavati" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.herbFormulation} onChange={e => setForm({...form, herbFormulation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Principal Investigator</label>
                    <input required type="text" placeholder="Prof. / Dr. Name" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.principalInvestigator} onChange={e => setForm({...form, principalInvestigator: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">IEC Approval Number</label>
                    <input type="text" placeholder="AIIA/IEC/2026/041" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.iecApprovalNumber} onChange={e => setForm({...form, iecApprovalNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">IEC Expiry Date</label>
                    <input type="date" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.iecExpiryDate} onChange={e => setForm({...form, iecExpiryDate: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Objective</label>
                  <textarea rows={2} placeholder="To evaluate the efficacy of the test formulation against..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.primaryObjective} onChange={e => setForm({...form, primaryObjective: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="trial-protocol-form" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? "Registering Protocol..." : <><CheckCircle2 className="h-4 w-4" /> Register Protocol</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
