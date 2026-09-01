"use client";

import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Users, TrendingUp, AlertTriangle, Scale, Clock, Download, FileJson, X, CheckCircle2, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageContext";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "Investigator";
  const router = useRouter();
  const { t } = useLanguage();
  
  const [trials, setTrials] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [trialForm, setTrialForm] = useState({ trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, principalInvestigator: "", herbFormulation: "", description: "" });
  const [patientForm, setPatientForm] = useState({ patientId: "", pseudonymizedId: "", fullName: "", address: "", dosage: "", trialId: "", site: "AIIA New Delhi" });

  const fetchData = async () => {
    try {
      const [trialsRes, patientsRes] = await Promise.all([ fetch('/api/trials'), fetch('/api/patients') ]);
      const trialsJson = await trialsRes.json();
      const patientsJson = await patientsRes.json();
      if (trialsJson.success) {
        setTrials(trialsJson.data);
        if (trialsJson.data.length > 0) setPatientForm(prev => ({...prev, trialId: trialsJson.data[0].trialId}));
      }
      if (patientsJson.success) setPatients(patientsJson.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/trials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(trialForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create trial");
      setIsTrialModalOpen(false);
      fetchData(); // Refresh dashboard
      setTrialForm({ trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, principalInvestigator: "", herbFormulation: "", description: "" });
    } catch (err: any) { setFormError(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    const payload = { ...patientForm, pseudonymizedId: patientForm.pseudonymizedId || `PID-${Math.random().toString(36).substring(7).toUpperCase()}` };
    try {
      const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to add patient");
      setIsPatientModalOpen(false);
      fetchData(); // Refresh dashboard
      setPatientForm({ patientId: "", pseudonymizedId: "", fullName: "", address: "", dosage: "", trialId: trials[0]?.trialId || "", site: "AIIA New Delhi" });
    } catch (err: any) { setFormError(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleExportFHIR = () => {
    const fhirBundle = {
      resourceType: "Bundle", type: "collection",
      entry: trials.map(t => ({ resource: { resourceType: "ResearchStudy", id: t.trialId, title: t.name, status: t.status.toLowerCase(), phase: t.phase ? { text: t.phase } : undefined, enrollment: [{ actual: t.enrollmentCurrent, target: t.enrollmentTarget }] } }))
    };
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `fhir_export_${new Date().getTime()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportCDISC = () => {
    const sdtmDataset = { dataset: "TS", description: "Trial Summary", records: trials.map(t => ({ STUDYID: t.trialId, TSPARMCD: "TRT", TSVAL: t.herbFormulation || "N/A" })) };
    const blob = new Blob([JSON.stringify(sdtmDataset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cdisc_sdtm_${new Date().getTime()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  let stats = [
    { title: "Active Studies", value: trials.length || 0, icon: Activity, trend: "+2%", trendColor: "text-white" },
    { title: "Patients Joined", value: patients.length || 0, icon: Users, trend: "+12%", trendColor: "text-white" },
    { title: "Approvals Needed", value: trials.filter(t => t.iecApprovalStatus === 'Pending').length || 0, icon: Clock, trend: "due soon", trendColor: "text-white" },
    { title: "Protocol Deviations", value: trials.reduce((acc, t) => acc + (t.protocolDeviations || 0), 0), icon: AlertTriangle, trend: "Action Req", trendColor: "text-white" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t("Administrator Panel")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("System configuration, user management, and blockchain status.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportFHIR} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
            <FileJson className="h-4 w-4" />
            {t("HL7 FHIR Export")}
          </button>
          <button onClick={handleExportCDISC} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Download className="h-4 w-4" />
            {t("CDISC (SDTM)")}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider">{t("QUICK ACTIONS:")}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsPatientModalOpen(true)} className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Users className="h-4 w-4" />
            {t("Add Patient")}
          </button>
          <button onClick={() => setIsTrialModalOpen(true)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Activity className="h-4 w-4" />
            {t("Create Trial")}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Studies (Dark Blue) */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" /> +2%
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">{t("Active Studies")}</p>
          <p className="text-4xl font-bold">{stats[0].value}</p>
        </div>

        {/* Patients Joined (Dark Green) */}
        <div className="bg-[#0b6034] text-white rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" /> +12%
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">{t("Patients Joined")}</p>
          <p className="text-4xl font-bold">{stats[1].value}</p>
        </div>

        {/* Approvals Needed (Dark Brown/Gold) */}
        <div className="bg-[#4a2b0f] text-white rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {t("due soon")}
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">{t("Approvals Needed")}</p>
          <p className="text-4xl font-bold">{stats[2].value}</p>
        </div>

        {/* Urgent Safety Issues (Dark Red) */}
        <div className="bg-[#a51c1c] text-white rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {t("Action Req")}
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">{t("Protocol Deviations")}</p>
          <p className="text-4xl font-bold">{stats[3].value}</p>
        </div>
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      
      {/* Create Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                Create New Trial
              </h2>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{formError}</div>}
              <form id="trial-form" onSubmit={handleTrialSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trial ID (CTRI Ref)</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="e.g. T-1004" value={trialForm.trialId} onChange={e => setTrialForm({...trialForm, trialId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trial Name / Title</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Study of Ashwagandha..." value={trialForm.name} onChange={e => setTrialForm({...trialForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phase</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={trialForm.phase} onChange={e => setTrialForm({...trialForm, phase: e.target.value})}>
                      <option>Phase 1</option><option>Phase 2</option><option>Phase 3</option><option>Phase 4</option><option>Observational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enrollment Target</label>
                    <input required type="number" min="1" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={trialForm.enrollmentTarget} onChange={e => setTrialForm({...trialForm, enrollmentTarget: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Principal Investigator</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Dr. Name..." value={trialForm.principalInvestigator} onChange={e => setTrialForm({...trialForm, principalInvestigator: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Herb Formulation</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="e.g. AYUSH-64" value={trialForm.herbFormulation} onChange={e => setTrialForm({...trialForm, herbFormulation: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brief Description</label>
                  <textarea rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Primary objectives..." value={trialForm.description} onChange={e => setTrialForm({...trialForm, description: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
              <button onClick={() => setIsTrialModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="trial-form" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? "Registering..." : <><CheckCircle2 className="h-4 w-4" /> Create Trial</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                Add New Patient
              </h2>
              <button onClick={() => setIsPatientModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{formError}</div>}
              <form id="patient-form" onSubmit={handlePatientSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign to Trial</label>
                  <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={patientForm.trialId} onChange={e => setPatientForm({...patientForm, trialId: e.target.value})}>
                    {trials.length === 0 ? <option value="">Loading trials...</option> : null}
                    {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} - {t.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject ID</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="e.g. SUB-001" value={patientForm.patientId} onChange={e => setPatientForm({...patientForm, patientId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinical Site</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={patientForm.site} onChange={e => setPatientForm({...patientForm, site: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name (PII)</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="John Doe" value={patientForm.fullName} onChange={e => setPatientForm({...patientForm, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address (PII)</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="123 Main St" value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prescribed Dosage (Blockchain)</label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-brand-300 dark:border-brand-700 rounded-lg text-sm" placeholder="e.g. 500mg Twice Daily" value={patientForm.dosage} onChange={e => setPatientForm({...patientForm, dosage: e.target.value})} />
                  <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-1">This clinical parameter will be stored immutably on the EVM blockchain.</p>
                </div>

                <div className="bg-brand-50/50 dark:bg-brand-950/20 p-3 rounded-lg border border-brand-100 dark:border-brand-900/50 mt-2">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1" />
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      <strong>Informed Consent Verified</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5">I confirm that written informed consent has been obtained. A cryptographic hash will be stored on the Quorum blockchain.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
              <button onClick={() => setIsPatientModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="patient-form" disabled={isSubmitting || trials.length === 0} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? "Processing..." : <><CheckCircle2 className="h-4 w-4" /> Enroll Patient</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-4">
        
        {/* Compliance Score */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Compliance Score
            </h3>
            <button className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Run Check
            </button>
          </div>
          
          <div className="flex items-center gap-8">
            {/* Progress Ring Mock */}
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                <circle className="text-[#0b6034] stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="7.536" transform="rotate(-90 50 50)"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">97%</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Total Breaches</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">0</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Blockchain Blocks</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">1,847</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-500">Last Check</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">12:20:13 pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Network */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Blockchain Network
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              Active
            </div>
          </div>
          
          <div className="space-y-4 text-sm mt-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-slate-500">Network</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Nidana CTMS Network</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-slate-500">Consensus</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Raft</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-slate-500">State DB</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">CouchDB</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-slate-500">Integrity</span>
              <span className="font-bold text-emerald-600">VERIFIED</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-500">Organizations</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">4</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
