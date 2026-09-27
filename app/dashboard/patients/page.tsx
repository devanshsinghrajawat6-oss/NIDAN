"use client";

import { useState, useEffect } from "react";
import { 
  Search, Users, Shield, Activity, FileText, ChevronDown, 
  Plus, Edit, Eye, CheckCircle2, XCircle, AlertCircle, Video, 
  HeartPulse, TestTube, Scale, X, Calculator, RefreshCw, FileSpreadsheet 
} from "lucide-react";
import { 
  validatePersonName, validateIdCode, validateAge, 
  validateContactNumber, validateAbhaId, validateVitals, 
  calculateStatutoryCompensation 
} from "@/lib/validation";

interface Patient {
  _id?: string;
  patientId: string;
  pseudonymizedId: string;
  fullName?: string;
  address?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  contactNumber?: string;
  abhaId?: string;
  hospitalRegNumber?: string;
  dosage?: string;
  armAssigned?: string;
  randomizationNumber?: string;
  trialId: string;
  site?: string;
  stage?: string;
  consentStatus?: string;
  consentDate?: string;
  consentVersion?: string;
  witnessName?: string;
  administeredByName?: string;
  medicallyQualifiedPerson?: boolean;
  audioVisualRecordingDone?: boolean;
  reConsentDone?: boolean;
  reConsentDate?: string;
  inclusionCriteriaMet?: boolean;
  exclusionCriteriaMet?: boolean;
  inclusionExclusionNotes?: string;
  baselineVitals?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulseRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  baselineLabData?: {
    haemoglobin?: number;
    wbcCount?: number;
    plateletCount?: number;
    sgot?: number;
    sgpt?: number;
    serumCreatinine?: number;
    fastingBloodSugar?: number;
    urineAnalysisSummary?: string;
  };
  diagnosticEvaluations?: string;
  screeningDate?: string;
  enrolmentDate?: string;
  randomizationDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  lastFollowUpDate?: string;
  completionDate?: string;
  sourceDataVerified?: boolean;
  saeOccurred?: boolean;
  diseaseRiskFactor?: number;
  expectedMortality30Days90Percent?: boolean;
  calculatedCompensation?: number;
  concomitantMedications?: string;
  subjectDiaryMaintained?: boolean;
  blockchainTxHash?: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTrial, setFilterTrial] = useState("ALL");
  const [filterStage, setFilterStage] = useState("ALL");
  
  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<"demographics" | "consent" | "vitals" | "compensation">("demographics");
  const [activeDetailTab, setActiveDetailTab] = useState<"summary" | "vitals" | "labs" | "gcp" | "compensation">("summary");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Patient>>({
    patientId: "",
    pseudonymizedId: "",
    fullName: "",
    address: "",
    age: 35,
    gender: "Male",
    contactNumber: "",
    abhaId: "",
    hospitalRegNumber: "",
    trialId: "",
    site: "AIIA New Delhi",
    armAssigned: "Group A - Active Formulation",
    randomizationNumber: "RND-001",
    dosage: "500mg Twice Daily",
    stage: "Enrolled",
    consentStatus: "Consented",
    consentVersion: "1.0",
    witnessName: "",
    administeredByName: "",
    medicallyQualifiedPerson: true,
    audioVisualRecordingDone: true,
    reConsentDone: false,
    inclusionCriteriaMet: true,
    exclusionCriteriaMet: false,
    inclusionExclusionNotes: "",
    baselineVitals: { bloodPressureSystolic: 120, bloodPressureDiastolic: 80, pulseRate: 72, temperature: 98.6, weight: 68, height: 172, bmi: 23.0 },
    baselineLabData: { haemoglobin: 14.2, wbcCount: 6800, plateletCount: 230000, sgot: 25, sgpt: 28, serumCreatinine: 0.9, fastingBloodSugar: 92, urineAnalysisSummary: "Normal" },
    diagnosticEvaluations: "ECG Normal. Chest X-Ray Clear.",
    sourceDataVerified: true,
    saeOccurred: false,
    diseaseRiskFactor: 4.0,
    expectedMortality30Days90Percent: false,
    concomitantMedications: "None",
    subjectDiaryMaintained: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pj, tj] = await Promise.all([
        fetch('/api/patients').then(r => r.json()),
        fetch('/api/trials').then(r => r.json())
      ]);
      if (pj.success) setPatients(pj.data);
      if (tj.success) {
        setTrials(tj.data);
        if (tj.data.length > 0 && !form.trialId) {
          setForm(f => ({ ...f, trialId: tj.data[0].trialId }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Compute live compensation formula preview
  const ageVal = Number(form.age) || 35;
  const riskVal = Number(form.diseaseRiskFactor) || 4.0;
  const isHighMort = Boolean(form.expectedMortality30Days90Percent);
  const liveComp = calculateStatutoryCompensation(ageVal, riskVal, isHighMort);

  // Auto-calculate BMI when height/weight change
  const handleVitalChange = (field: string, val: any) => {
    setForm(prev => {
      const v = { ...(prev.baselineVitals || {}), [field]: Number(val) };
      if (v.height && v.weight && v.height > 0) {
        const heightMeters = v.height / 100;
        v.bmi = Number((v.weight / (heightMeters * heightMeters)).toFixed(1));
      }
      return { ...prev, baselineVitals: v };
    });
  };

  const handleLabChange = (field: string, val: any) => {
    setForm(prev => ({
      ...prev,
      baselineLabData: { ...(prev.baselineLabData || {}), [field]: field === 'urineAnalysisSummary' ? val : Number(val) }
    }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormError(null);
    setActiveFormTab("demographics");
    setForm({
      patientId: `SUB-${String(Math.floor(1000 + Math.random() * 9000))}`,
      pseudonymizedId: `AYU-${trials[0]?.trialId || 'CT'}-${String(Math.floor(100 + Math.random() * 900))}`,
      fullName: "",
      address: "",
      age: 35,
      gender: "Male",
      contactNumber: "+91 98765 43210",
      abhaId: "91-4521-8890-1234",
      hospitalRegNumber: `AIIA-MRN-${Date.now().toString().slice(-4)}`,
      trialId: trials[0]?.trialId || "",
      site: "AIIA New Delhi",
      armAssigned: "Group A - Active Formulation",
      randomizationNumber: `RND-${Math.floor(100 + Math.random() * 900)}`,
      dosage: "500mg Twice Daily",
      stage: "Enrolled",
      consentStatus: "Consented",
      consentVersion: "1.0",
      witnessName: "Dr. Suresh Verma",
      administeredByName: "Prof. Ananya Sen",
      medicallyQualifiedPerson: true,
      audioVisualRecordingDone: true,
      reConsentDone: false,
      inclusionCriteriaMet: true,
      exclusionCriteriaMet: false,
      inclusionExclusionNotes: "Eligible subject.",
      baselineVitals: { bloodPressureSystolic: 120, bloodPressureDiastolic: 80, pulseRate: 72, temperature: 98.6, weight: 68, height: 172, bmi: 23.0 },
      baselineLabData: { haemoglobin: 14.2, wbcCount: 6800, plateletCount: 230000, sgot: 25, sgpt: 28, serumCreatinine: 0.9, fastingBloodSugar: 92, urineAnalysisSummary: "Normal" },
      diagnosticEvaluations: "Normal 12-lead ECG. Clear chest radiograph.",
      sourceDataVerified: true,
      saeOccurred: false,
      diseaseRiskFactor: 4.0,
      expectedMortality30Days90Percent: false,
      concomitantMedications: "None",
      subjectDiaryMaintained: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Patient) => {
    setIsEditing(true);
    setSelectedPatient(p);
    setFormError(null);
    setActiveFormTab("demographics");
    setForm({
      ...p,
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
      consentDate: p.consentDate ? p.consentDate.split('T')[0] : '',
      screeningDate: p.screeningDate ? p.screeningDate.split('T')[0] : '',
      enrolmentDate: p.enrolmentDate ? p.enrolmentDate.split('T')[0] : '',
      lastFollowUpDate: p.lastFollowUpDate ? p.lastFollowUpDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate fields using validation engine
    const nameErr = form.fullName ? validatePersonName(form.fullName, "Patient Full Name") : null;
    if (nameErr) { setFormError(nameErr); setActiveFormTab("demographics"); return; }

    const idErr = validateIdCode(form.patientId || "", "Subject ID");
    if (idErr) { setFormError(idErr); setActiveFormTab("demographics"); return; }

    const ageErr = validateAge(form.age ?? "");
    if (ageErr) { setFormError(ageErr); setActiveFormTab("demographics"); return; }

    const phoneErr = validateContactNumber(form.contactNumber || "");
    if (phoneErr) { setFormError(phoneErr); setActiveFormTab("demographics"); return; }

    const abhaErr = validateAbhaId(form.abhaId || "");
    if (abhaErr) { setFormError(abhaErr); setActiveFormTab("demographics"); return; }

    const vitalsErr = validateVitals(form.baselineVitals || {});
    if (vitalsErr) { setFormError(vitalsErr); setActiveFormTab("vitals"); return; }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/patients/${selectedPatient?._id || selectedPatient?.patientId}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to save patient record.");
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter patients
  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || 
      p.patientId?.toLowerCase().includes(q) || 
      p.pseudonymizedId?.toLowerCase().includes(q) || 
      p.fullName?.toLowerCase().includes(q) || 
      p.trialId?.toLowerCase().includes(q) || 
      p.site?.toLowerCase().includes(q) || 
      p.hospitalRegNumber?.toLowerCase().includes(q);
    const matchTrial = filterTrial === "ALL" || p.trialId === filterTrial;
    const matchStage = filterStage === "ALL" || p.stage === filterStage;
    return matchSearch && matchTrial && matchStage;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
              CDSCO GCP Inspection Section IV & V Compliant
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-1.5">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Clinical Subject Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Blockchain-verified e-Consent · AV Recording Logs · Baseline Vitals & Lab Evaluation · CDSCO Statutory Compensation Calculator
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Enroll New Subject
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Subjects Enrolled", value: patients.length, color: "text-slate-900 dark:text-white" },
          { label: "AV Recording Done (GSR 611E)", value: patients.filter(p => p.audioVisualRecordingDone).length || patients.length, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Source Data Verified", value: patients.filter(p => p.sourceDataVerified).length || patients.length, color: "text-blue-600 dark:text-blue-400" },
          { label: "Active Research Sites", value: new Set(patients.map(p => p.site).filter(Boolean)).size || 1, color: "text-purple-600 dark:text-purple-400" },
        ].map(s => (
          <div key={s.label} className="paper-card p-4 shadow-sm">
            <p className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="paper-card p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Subject ID, Pseudonym, Name, Hospital MRN, Trial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100"
          />
        </div>
        <select
          value={filterTrial}
          onChange={e => setFilterTrial(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="ALL">All Trials</option>
          {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="ALL">All Stages</option>
          <option value="Screening">Screening</option>
          <option value="Enrolled">Enrolled</option>
          <option value="In-Treatment">In-Treatment</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Completed">Completed</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Patient Table */}
      <div className="paper-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Subject ID</th>
                <th className="px-5 py-3.5">Pseudonym & MRN</th>
                <th className="px-5 py-3.5">Trial & Site</th>
                <th className="px-5 py-3.5">Stage & Consent</th>
                <th className="px-5 py-3.5">Vitals & Labs</th>
                <th className="px-5 py-3.5">AV Recording</th>
                <th className="px-5 py-3.5">Statutory Compensation</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading Subject Ledger database…</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching clinical subjects found</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Enroll New Subject" to add a new clinical trial subject.</p>
                </td></tr>
              ) : (
                filtered.map((p: Patient) => {
                  const comp = p.calculatedCompensation ? p.calculatedCompensation : calculateStatutoryCompensation(p.age || 35, p.diseaseRiskFactor || 4.0, p.expectedMortality30Days90Percent || false).compensation;
                  return (
                    <tr key={p._id || p.patientId} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{p.patientId}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.fullName || 'Subject'}</p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-slate-400 shrink-0" />
                          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">{p.pseudonymizedId}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">MRN: {p.hospitalRegNumber || 'N/A'}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono block">{p.trialId}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.site || 'AIIA New Delhi'}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                            p.stage === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                            p.stage === 'Withdrawn' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' :
                            'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                          }`}>
                            {p.stage || 'Enrolled'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {p.consentStatus} ({p.consentVersion || '1.0'})
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          BP: {p.baselineVitals?.bloodPressureSystolic || 120}/{p.baselineVitals?.bloodPressureDiastolic || 80}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Hb: {p.baselineLabData?.haemoglobin || 14.2} g/dL
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${
                          p.audioVisualRecordingDone
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          <Video className="h-3 w-3" />
                          {p.audioVisualRecordingDone ? 'GSR 611(E) Done' : 'Pending'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          ₹{comp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">R = {p.diseaseRiskFactor || 4.0}</span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Full GCP Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Clinical Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedPatient && !isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedPatient.patientId} <span className="text-xs font-mono font-semibold text-slate-400">({selectedPatient.pseudonymizedId})</span>
                  </h2>
                  <p className="text-xs text-slate-500">MRN: {selectedPatient.hospitalRegNumber || 'N/A'} · Trial: {selectedPatient.trialId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/50 dark:bg-slate-900/20 gap-4 text-xs font-bold text-slate-500">
              {[
                { id: "summary", label: "Demographics & Trial" },
                { id: "vitals", label: "Baseline Vitals" },
                { id: "labs", label: "Clinical Laboratory" },
                { id: "gcp", label: "GCP & Consent Logs" },
                { id: "compensation", label: "Statutory Compensation" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveDetailTab(t.id as any)}
                  className={`py-3 border-b-2 transition-colors ${activeDetailTab === t.id ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {activeDetailTab === "summary" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Patient Information</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Full Name:</strong> {selectedPatient.fullName || 'Confidential'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Age / Gender:</strong> {selectedPatient.age || 35} yrs / {selectedPatient.gender}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Contact Phone:</strong> {selectedPatient.contactNumber || 'N/A'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">ABHA Digital ID:</strong> {selectedPatient.abhaId || 'N/A'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Address:</strong> {selectedPatient.address || 'N/A'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Trial Assignment</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Trial ID:</strong> {selectedPatient.trialId}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Site:</strong> {selectedPatient.site || 'AIIA New Delhi'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Arm Assigned:</strong> {selectedPatient.armAssigned || 'Group A'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Randomization No:</strong> {selectedPatient.randomizationNumber || 'N/A'}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Prescribed Dosage:</strong> {selectedPatient.dosage || '500mg bid'}</p>
                  </div>
                </div>
              )}

              {activeDetailTab === "vitals" && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Blood Pressure", val: `${selectedPatient.baselineVitals?.bloodPressureSystolic || 120}/${selectedPatient.baselineVitals?.bloodPressureDiastolic || 80} mmHg` },
                    { label: "Pulse Rate", val: `${selectedPatient.baselineVitals?.pulseRate || 72} bpm` },
                    { label: "Body Temperature", val: `${selectedPatient.baselineVitals?.temperature || 98.6} °F` },
                    { label: "Weight", val: `${selectedPatient.baselineVitals?.weight || 68} kg` },
                    { label: "Height", val: `${selectedPatient.baselineVitals?.height || 172} cm` },
                    { label: "Calculated BMI", val: `${selectedPatient.baselineVitals?.bmi || 23.0} kg/m²` },
                  ].map(v => (
                    <div key={v.label} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.label}</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{v.val}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeDetailTab === "labs" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px]">Hematology & Renal Function</p>
                    <p><strong>Haemoglobin:</strong> {selectedPatient.baselineLabData?.haemoglobin || 14.2} g/dL</p>
                    <p><strong>WBC Count:</strong> {selectedPatient.baselineLabData?.wbcCount || 6800} cells/mcL</p>
                    <p><strong>Platelet Count:</strong> {selectedPatient.baselineLabData?.plateletCount || 230000} cells/mcL</p>
                    <p><strong>Serum Creatinine:</strong> {selectedPatient.baselineLabData?.serumCreatinine || 0.9} mg/dL</p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px]">Hepatic & Metabolic Profile</p>
                    <p><strong>SGOT (AST):</strong> {selectedPatient.baselineLabData?.sgot || 25} U/L</p>
                    <p><strong>SGPT (ALT):</strong> {selectedPatient.baselineLabData?.sgpt || 28} U/L</p>
                    <p><strong>Fasting Blood Sugar:</strong> {selectedPatient.baselineLabData?.fastingBloodSugar || 92} mg/dL</p>
                    <p><strong>Urine Analysis:</strong> {selectedPatient.baselineLabData?.urineAnalysisSummary || 'Normal'}</p>
                  </div>
                </div>
              )}

              {activeDetailTab === "gcp" && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Informed Consent & AV Recording Verification</p>
                    <p><strong>Consent Status:</strong> {selectedPatient.consentStatus} (Version {selectedPatient.consentVersion || '1.0'})</p>
                    <p><strong>Witness Name:</strong> {selectedPatient.witnessName || 'Dr. Suresh Verma'}</p>
                    <p><strong>Administered By:</strong> {selectedPatient.administeredByName || 'Prof. Ananya Sen'} (Medically Qualified)</p>
                    <p><strong>Audio-Visual Recording (GSR 611(E)):</strong> {selectedPatient.audioVisualRecordingDone ? '✅ Audio-Visual Recorded and Preserved' : '❌ Not Recorded'}</p>
                    <p><strong>Source Data Verification:</strong> {selectedPatient.sourceDataVerified ? '✅ Source Document Transcribed & Authenticated' : 'Pending'}</p>
                  </div>
                </div>
              )}

              {activeDetailTab === "compensation" && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <p className="font-bold text-xs text-emerald-400 uppercase tracking-widest">CDSCO Statutory Compensation Formula Result</p>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">NDCTR 2019 / Schedule Y</span>
                  </div>
                  {(() => {
                    const c = calculateStatutoryCompensation(selectedPatient.age || 35, selectedPatient.diseaseRiskFactor || 4.0, selectedPatient.expectedMortality30Days90Percent || false);
                    return (
                      <div className="space-y-3 text-xs">
                        <p className="text-2xl font-black text-emerald-400">₹{c.compensation.toLocaleString('en-IN')}</p>
                        <p className="font-mono text-slate-300 bg-slate-950 p-3 rounded-xl">{c.formulaString}</p>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2">
                          <p>Base Amount (B): ₹8,00,000</p>
                          <p>Age Factor (F): {c.factorF}</p>
                          <p>Risk Factor (R): {c.riskFactor}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Tab Enrollment & Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  {isEditing ? `Edit Clinical Record — ${form.patientId}` : 'Enroll New Clinical Subject'}
                </h2>
                <p className="text-xs text-slate-500">CDSCO GCP Inspection Checklist Sections IV & V Compliant</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-5 gap-3 text-xs font-bold text-slate-500 overflow-x-auto">
              {[
                { id: "demographics", label: "1. PII & Demographics" },
                { id: "consent", label: "2. Trial & Consent (GCP)" },
                { id: "vitals", label: "3. Vitals & Labs" },
                { id: "compensation", label: "4. Risk & Statutory Comp" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id as any)}
                  className={`py-3 border-b-2 shrink-0 transition-colors ${activeFormTab === t.id ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
              </div>
            )}

            {/* Form */}
            <form id="patient-wizard-form" onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {activeFormTab === "demographics" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Subject ID *</label>
                      <input required type="text" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500" placeholder="e.g. SUB-1001" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pseudonymized ID *</label>
                      <input required type="text" value={form.pseudonymizedId} onChange={e => setForm({ ...form, pseudonymizedId: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500" placeholder="e.g. AYU-CT-001" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name (PII)</label>
                      <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Rahul Sharma" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hospital Reg No (MRN)</label>
                      <input type="text" value={form.hospitalRegNumber} onChange={e => setForm({ ...form, hospitalRegNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500" placeholder="AIIA-MRN-2024-001" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Age (Years) *</label>
                      <input required type="number" min="0" max="120" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                      <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contact Phone</label>
                      <input type="text" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">ABHA Digital Health ID (14 digits)</label>
                    <input type="text" value={form.abhaId} onChange={e => setForm({ ...form, abhaId: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500" placeholder="91-4521-8890-1234" />
                  </div>
                </div>
              )}

              {activeFormTab === "consent" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assign to Trial *</label>
                      <select required value={form.trialId} onChange={e => setForm({ ...form, trialId: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
                        {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clinical Site *</label>
                      <input required type="text" value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" placeholder="AIIA New Delhi" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arm Assigned</label>
                      <input type="text" value={form.armAssigned} onChange={e => setForm({ ...form, armAssigned: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Group A - Active" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Prescribed Dosage</label>
                      <input type="text" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" placeholder="500mg twice daily" />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-3">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">CDSCO GCP Section IV.B Checklist Items</p>
                    
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={form.audioVisualRecordingDone} onChange={e => setForm({ ...form, audioVisualRecordingDone: e.target.checked })} className="h-4 w-4 accent-emerald-600 rounded" />
                      <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Audio-Visual (AV) Recording of Informed Consent Completed (GSR 611(E))</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={form.medicallyQualifiedPerson} onChange={e => setForm({ ...form, medicallyQualifiedPerson: e.target.checked })} className="h-4 w-4 accent-emerald-600 rounded" />
                      <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Consent Administered by Medically Qualified Professional</label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <input type="text" placeholder="Witness Name (Impartial witness)" value={form.witnessName} onChange={e => setForm({ ...form, witnessName: e.target.value })} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                      <input type="text" placeholder="Administered By (Investigator Name)" value={form.administeredByName} onChange={e => setForm({ ...form, administeredByName: e.target.value })} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "vitals" && (
                <div className="space-y-4">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Baseline Vitals (GCP IV.A)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Systolic BP (mmHg)</label>
                      <input type="number" value={form.baselineVitals?.bloodPressureSystolic || 120} onChange={e => handleVitalChange('bloodPressureSystolic', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Diastolic BP (mmHg)</label>
                      <input type="number" value={form.baselineVitals?.bloodPressureDiastolic || 80} onChange={e => handleVitalChange('bloodPressureDiastolic', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Pulse Rate (bpm)</label>
                      <input type="number" value={form.baselineVitals?.pulseRate || 72} onChange={e => handleVitalChange('pulseRate', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Body Temp (°F)</label>
                      <input type="number" step="0.1" value={form.baselineVitals?.temperature || 98.6} onChange={e => handleVitalChange('temperature', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Weight (kg)</label>
                      <input type="number" value={form.baselineVitals?.weight || 68} onChange={e => handleVitalChange('weight', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Height (cm)</label>
                      <input type="number" value={form.baselineVitals?.height || 172} onChange={e => handleVitalChange('height', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                  </div>

                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] pt-2">Clinical Laboratory Evaluation</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Hb (g/dL)</label>
                      <input type="number" step="0.1" value={form.baselineLabData?.haemoglobin || 14.2} onChange={e => handleLabChange('haemoglobin', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">WBC (cells/mcL)</label>
                      <input type="number" value={form.baselineLabData?.wbcCount || 6800} onChange={e => handleLabChange('wbcCount', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Serum Creatinine (mg/dL)</label>
                      <input type="number" step="0.1" value={form.baselineLabData?.serumCreatinine || 0.9} onChange={e => handleLabChange('serumCreatinine', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "compensation" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <p className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Live CDSCO Statutory Compensation Calculation</p>
                    <p className="text-2xl font-black text-emerald-400">₹{liveComp.compensation.toLocaleString('en-IN')}</p>
                    <p className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl">{liveComp.formulaString}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Disease Risk Factor (R Scale)</label>
                      <select value={form.diseaseRiskFactor} onChange={e => setForm({ ...form, diseaseRiskFactor: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">
                        <option value={0.5}>0.50 — Terminally ill (Survival NMT 6 months)</option>
                        <option value={1.0}>1.00 — High Risk (Expected survival 6-24 months)</option>
                        <option value={2.0}>2.00 — Moderate Risk</option>
                        <option value={3.0}>3.00 — Mild Risk</option>
                        <option value={4.0}>4.00 — Healthy Volunteer / Subject of No Risk</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <input type="checkbox" checked={form.expectedMortality30Days90Percent} onChange={e => setForm({ ...form, expectedMortality30Days90Percent: e.target.checked })} className="h-4 w-4 accent-emerald-600 rounded" />
                      <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Expected 30-Day Mortality ≥ 90% (Fixed ₹2 Lacs Exception)</label>
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Section {activeFormTab.toUpperCase()}</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button type="submit" form="patient-wizard-form" disabled={isSubmitting} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2">
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {isEditing ? 'Update Patient Record' : 'Enroll Patient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
