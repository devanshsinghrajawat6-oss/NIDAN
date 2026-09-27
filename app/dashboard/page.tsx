"use client";

import { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Users, TrendingUp, AlertTriangle, Scale, Clock, 
  Download, FileJson, X, CheckCircle2, FileText, RefreshCw, Database,
  Plus, ArrowRight, Zap, Calendar, Bell, ExternalLink, BookOpen, BarChart3
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageContext";
import { validatePersonName, validateText, validateIdCode, validatePositiveNumber } from "@/lib/validation";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ── Mini Sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg-${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Paper Stat Card ──────────────────────────────────────────────────
function StatCard({ title, value, trendLabel, sparkData, sparkColor, icon: Icon, badgeBg = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" }: any) {
  return (
    <div className="paper-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="h-9 w-9 rounded-md bg-stone-100 dark:bg-[#182434] border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeBg}`}>
            {trendLabel}
          </span>
        </div>
        <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">{value}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <Sparkline data={sparkData} color={sparkColor || "#15803d"} />
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "Investigator";
  const userName = (session?.user as any)?.name || "User";
  const router = useRouter();
  const { t } = useLanguage();
  
  const [trials, setTrials] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>({
    complianceScore: 98, blockNumber: 5, totalBreaches: 0, totalRecords: 2,
    lastCheck: "Just now", network: "EVM Local Network (Hardhat)",
    consensus: "Proof of Authority (EVM Paris)", stateDb: "EVM State Trie + LevelDB",
    integrity: "100% VERIFIED", contractAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", checks: []
  });

  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [trialForm, setTrialForm] = useState({ 
    trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, 
    principalInvestigator: "", herbFormulation: "", description: "",
    ctriRegistration: "CTRI/2026/05/043210", iecApprovalNumber: "IEC/AIIA/2026/889",
    sponsorName: "Ministry of Ayush / CCRAS", site: "All India Institute of Ayurveda (AIIA)",
    parallelSubmissionCDSCO: true
  });
  const [patientForm, setPatientForm] = useState({ 
    patientId: "", pseudonymizedId: "", fullName: "", address: "", age: 35, 
    gender: "Male", contactNumber: "", abhaId: "", hospitalRegNumber: "HOSP-REG-2026-992", 
    dosage: "", trialId: "", site: "AIIA New Delhi", 
    witnessName: "Rajesh Kumar (Impartial Witness)",
    administeredByName: "Dr. Ananya Sharma (MD Ayush)",
    audioVisualRecordingDone: true,
    diseaseRiskFactor: 4.0,
    expectedMortality30Days90Percent: false
  });

  const fetchData = async () => {
    try {
      const [trialsRes, patientsRes, msRes, auditRes] = await Promise.all([
        fetch('/api/trials'), fetch('/api/patients'), 
        fetch('/api/milestones'), fetch('/api/audit')
      ]);
      const [tj, pj, mj, aj] = await Promise.all([trialsRes.json(), patientsRes.json(), msRes.json(), auditRes.json()]);
      if (tj.success) { setTrials(tj.data); if (tj.data.length > 0) setPatientForm(prev => ({...prev, trialId: tj.data[0].trialId})); }
      if (pj.success) setPatients(pj.data);
      if (mj.success) setMilestones(mj.data);
      if (aj.success) setAuditLogs(aj.data?.slice(0, 8) || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRunComplianceCheck = async () => {
    setIsCheckingCompliance(true);
    try {
      const res = await fetch('/api/compliance/check', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) { setComplianceResult(json.data); setIsCheckModalOpen(true); }
    } catch (err) { console.error(err); }
    finally { setIsCheckingCompliance(false); }
  };

  useEffect(() => {
    fetchData();
    fetch('/api/compliance/check', { method: 'POST' }).then(r => r.json()).then(json => { if (json.success && json.data) setComplianceResult(json.data); }).catch(() => {});
  }, []);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");

    const idErr = validateIdCode(trialForm.trialId, "Trial ID");
    if (idErr) { setFormError(idErr); setIsSubmitting(false); return; }

    const nameErr = validateText(trialForm.name, "Trial Name", 3);
    if (nameErr) { setFormError(nameErr); setIsSubmitting(false); return; }

    const piErr = validatePersonName(trialForm.principalInvestigator, "Principal Investigator");
    if (piErr) { setFormError(piErr); setIsSubmitting(false); return; }

    const herbErr = validateText(trialForm.herbFormulation, "Herb / Formulation", 2);
    if (herbErr) { setFormError(herbErr); setIsSubmitting(false); return; }

    const targetErr = validatePositiveNumber(trialForm.enrollmentTarget, "Enrollment Target");
    if (targetErr) { setFormError(targetErr); setIsSubmitting(false); return; }

    try {
      const res = await fetch("/api/trials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(trialForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create trial");
      setIsTrialModalOpen(false); fetchData();
      setTrialForm({ 
        trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, 
        principalInvestigator: "", herbFormulation: "", description: "",
        ctriRegistration: "CTRI/2026/05/043210", iecApprovalNumber: "IEC/AIIA/2026/889",
        sponsorName: "Ministry of Ayush / CCRAS", site: "All India Institute of Ayurveda (AIIA)",
        parallelSubmissionCDSCO: true 
      });
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");

    const pIdErr = validateIdCode(patientForm.patientId, "Patient ID");
    if (pIdErr) { setFormError(pIdErr); setIsSubmitting(false); return; }

    const pNameErr = validatePersonName(patientForm.fullName, "Full Name");
    if (pNameErr) { setFormError(pNameErr); setIsSubmitting(false); return; }

    try {
      const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patientForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to enroll patient");
      setIsPatientModalOpen(false); fetchData();
      setPatientForm({ 
        patientId: "", pseudonymizedId: "", fullName: "", address: "", age: 35, 
        gender: "Male", contactNumber: "", abhaId: "", hospitalRegNumber: "HOSP-REG-2026-992", 
        dosage: "", trialId: trials[0]?.trialId || "", site: "AIIA New Delhi", 
        witnessName: "Rajesh Kumar (Impartial Witness)",
        administeredByName: "Dr. Ananya Sharma (MD Ayush)",
        audioVisualRecordingDone: true,
        diseaseRiskFactor: 4.0,
        expectedMortality30Days90Percent: false 
      });
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  // Sparkline data
  const sparkData = {
    studies: [10, 11, 12, 12, 13, 14, 14],
    patients: [800, 920, 1050, 1100, 1180, 1248],
    approvals: [5, 4, 4, 3, 2, 2],
    deviations: [8, 6, 5, 4, 3, 2],
  };

  // Distribution Data
  const phaseCounts: Record<string, number> = {};
  trials.forEach(t => {
    const p = t.phase || "Phase 1";
    phaseCounts[p] = (phaseCounts[p] || 0) + 1;
  });
  const COLORS = ["#15803d", "#0284c7", "#7c3aed", "#d97706"];
  const phaseData = Object.keys(phaseCounts).map((phase, i) => ({
    name: phase,
    value: phaseCounts[phase],
    color: COLORS[i % COLORS.length]
  }));

  const upcomingMilestones = milestones
    .filter(m => m.status !== 'Completed')
    .sort((a,b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
    .slice(0, 5);

  const scoreOffset = 251.2 * (1 - (complianceResult.complianceScore || 98) / 100);

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? "Good morning" : getHour() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight text-stone-900 dark:text-stone-100">
            {greeting}, {userName.split(" ")[0]}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            {t("Here's your portfolio snapshot for")} {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => window.location.href = '/api/fhir/ResearchStudy'} className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#182434] border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-md hover:bg-stone-50 dark:hover:bg-[#1f2d40] transition-colors shadow-2xs">
            <FileJson className="h-3.5 w-3.5" /> FHIR Bundle
          </button>
          <button onClick={() => window.location.href = '/api/export/sdtm'} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-md transition-colors shadow-2xs">
            <Download className="h-3.5 w-3.5" /> CDISC SDTM v1.7
          </button>
        </div>
      </div>

      {/* ── Quick Actions Paper Strip ───────────────────────────── */}
      <div className="paper-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
          <span className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">{t("Quick Operations")}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(userRole === "Investigator" || userRole === "Admin" || userRole === "Coordinator") && (
            <button onClick={() => setIsPatientModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-md transition-colors shadow-2xs">
              <Users className="h-3.5 w-3.5" /> {t("Enroll Patient")}
            </button>
          )}
          {(userRole === "Investigator" || userRole === "Admin") && (
            <button onClick={() => setIsTrialModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#182434] text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-semibold rounded-md hover:bg-stone-50 dark:hover:bg-[#1f2d40] transition-colors shadow-2xs">
              <Plus className="h-3.5 w-3.5" /> {t("New Trial Protocol")}
            </button>
          )}
          {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
            <button onClick={handleRunComplianceCheck} disabled={isCheckingCompliance} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingCompliance ? 'animate-spin' : ''}`} />
              {isCheckingCompliance ? "Auditing…" : t("Run ALCOA+ Check")}
            </button>
          )}
          {(userRole === "Pharmacovigilance" || userRole === "Investigator" || userRole === "Admin") && (
            <Link href="/dashboard/safety" className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" /> {t("Report AE / SAE")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("Active Studies")} value={loading ? "—" : trials.length} trendLabel="AIIA Portfolio" sparkData={sparkData.studies} icon={Activity} />
        <StatCard title={t("Patients Enrolled")} value={loading ? "—" : patients.length.toLocaleString()} trendLabel="+12% target" sparkData={sparkData.patients} icon={Users} sparkColor="#0284c7" badgeBg="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800" />
        <StatCard title={t("Approvals Pending")} value={loading ? "—" : trials.filter(t => t.iecApprovalStatus === 'Pending').length} trendLabel="IEC Review" sparkData={sparkData.approvals} icon={Clock} sparkColor="#d97706" badgeBg="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800" />
        <StatCard title={t("Protocol Deviations")} value={loading ? "—" : trials.reduce((a, t) => a + (t.protocolDeviations || 0), 0)} trendLabel="Action Required" sparkData={sparkData.deviations} icon={AlertTriangle} sparkColor="#dc2626" badgeBg="bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-300 border-red-200 dark:border-red-800" />
      </div>

      {/* ── Middle Section ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Role-Specific Card */}
        {(userRole === "Investigator" || userRole === "Coordinator") && (
          <div className="paper-card p-6">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2 mb-4">
              <Users className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" /> {t("My Clinical Tasks")}
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 rounded-md">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Patient Follow-up (Trial #TR-249)</p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">3 patients require dosage adjustment review.</p>
              </div>
              <div className="p-3 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434] rounded-md">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Submit Progress Report</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Due in 2 days for Phase 2 Ashwagandha study.</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Score */}
        {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
        <div className="paper-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" /> {t("ALCOA+ Compliance Score")}
            </h3>
            <button
              onClick={handleRunComplianceCheck}
              disabled={isCheckingCompliance}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded hover:bg-stone-200 dark:hover:bg-[#202e42] transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${isCheckingCompliance ? 'animate-spin text-emerald-700 dark:text-emerald-400' : ''}`} />
              {isCheckingCompliance ? "Running…" : "Check"}
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-stone-200 dark:text-stone-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle
                  className="text-emerald-700 dark:text-emerald-400 stroke-current transition-all duration-700"
                  strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40"
                  fill="transparent" strokeDasharray="251.2" strokeDashoffset={scoreOffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">{complianceResult.complianceScore}%</span>
                <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">ALCOA+</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5 text-xs">
              {[
                { label: "Breaches", value: complianceResult.totalBreaches ?? 0, color: "text-emerald-800 dark:text-emerald-400" },
                { label: "Block #", value: `#${complianceResult.blockNumber ?? 5}`, color: "text-stone-800 dark:text-stone-200 font-mono" },
                { label: "Records", value: `${complianceResult.totalRecords ?? 2} ✓`, color: "text-emerald-800 dark:text-emerald-400 font-bold" },
                { label: "Integrity", value: "Verified", color: "text-emerald-800 dark:text-emerald-400 font-bold" },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-1.5 last:border-0">
                  <span className="text-stone-500 dark:text-stone-400 text-xs">{r.label}</span>
                  <span className={`font-semibold text-xs ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Study Phase Distribution */}
        <div className="paper-card p-6">
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2 mb-4">
            <BarChart3 className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" />
            Study Phase Distribution
          </h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center"><div className="h-6 w-6 border-2 border-emerald-800 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : phaseData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-stone-400 text-xs">No active studies</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={phaseData} cx="40%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {phaseData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} trials`, n]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Blockchain Network */}
        {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
        <div className="paper-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" /> Blockchain Network
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Active · Chain 31337
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { label: "Network",    value: complianceResult.network?.replace("EVM Local Network (", "").replace(")", "") || "Hardhat EVM" },
              { label: "Consensus",  value: complianceResult.consensus || "Proof of Authority" },
              { label: "Contract",   value: complianceResult.contractAddress ? `${complianceResult.contractAddress.substring(0, 10)}…` : "0x9fE4…a6e0", mono: true },
              { label: "Integrity",  value: complianceResult.integrity || "100% VERIFIED", green: true },
              { label: "Records",    value: `${complianceResult.totalRecords ?? 2} verified on-chain` },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-1.5 last:border-0">
                <span className="text-stone-500 dark:text-stone-400">{r.label}</span>
                <span className={`font-semibold ${r.mono ? 'font-mono text-emerald-800 dark:text-emerald-400' : r.green ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-stone-800 dark:text-stone-200'} text-right truncate max-w-[60%]`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* ── Bottom Section ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming Milestones */}
        <div className="paper-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" /> Upcoming Milestones
            </h3>
            <Link href="/dashboard/milestones" className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />)}</div>
          ) : upcomingMilestones.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p className="text-xs text-stone-500 dark:text-stone-400">No upcoming milestones</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingMilestones.map((m: any) => {
                const now = new Date();
                const planned = new Date(m.plannedDate);
                const daysLeft = Math.round((planned.getTime() - now.getTime()) / 86400000);
                const overdue = daysLeft < 0;
                const atRisk = !overdue && daysLeft <= m.alertThresholdDays;
                return (
                  <div key={m._id} className={`flex items-center justify-between p-3 rounded-md border ${
                    overdue ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30' :
                    atRisk  ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30' :
                    'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434]'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{m.name}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{m.trialId} · {planned.toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className={`text-right shrink-0 ml-3 font-bold text-xs ${overdue ? 'text-red-700 dark:text-red-400' : atRisk ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'}`}>
                      {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Audit Feed */}
        <div className="paper-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-400" /> Recent Audit Activity
            </h3>
            <Link href="/dashboard/audit" className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Audit trail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />)}</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p className="text-xs text-stone-500 dark:text-stone-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log: any, i) => (
                <div key={log._id || i} className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-stone-50 dark:hover:bg-[#182434] transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 uppercase shrink-0 mt-0.5">
                    {log.action || 'LOG'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{log.details || log.resourceType || 'System event'}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{log.performedBy || 'System'} · {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}

      {/* Register New Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">Register New Protocol</h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Create a clinical study protocol entry</p>
                </div>
              </div>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTrialSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded text-xs font-bold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Trial Protocol ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TR-301"
                    value={trialForm.trialId}
                    onChange={e => setTrialForm({ ...trialForm, trialId: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Trial Phase</label>
                  <select
                    value={trialForm.phase}
                    onChange={e => setTrialForm({ ...trialForm, phase: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  >
                    <option value="Phase 1">Phase 1</option>
                    <option value="Phase 2">Phase 2</option>
                    <option value="Phase 3">Phase 3</option>
                    <option value="Phase 4">Phase 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Study Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full clinical trial title"
                  value={trialForm.name}
                  onChange={e => setTrialForm({ ...trialForm, name: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Principal Investigator</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Full Name"
                    value={trialForm.principalInvestigator}
                    onChange={e => setTrialForm({ ...trialForm, principalInvestigator: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Target Patient Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={trialForm.enrollmentTarget}
                    onChange={e => setTrialForm({ ...trialForm, enrollmentTarget: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Herb Formulation / Dravya</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ashwagandha Ghan Vati 500mg"
                  value={trialForm.herbFormulation}
                  onChange={e => setTrialForm({ ...trialForm, herbFormulation: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              {/* CDSCO & Regulatory Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">CTRI Registration No.</label>
                  <input
                    type="text"
                    placeholder="e.g. CTRI/2026/05/043210"
                    value={trialForm.ctriRegistration}
                    onChange={e => setTrialForm({ ...trialForm, ctriRegistration: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Ethics Committee Approval Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. IEC/AIIA/2026/889"
                    value={trialForm.iecApprovalNumber}
                    onChange={e => setTrialForm({ ...trialForm, iecApprovalNumber: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Sponsor Name & Details (GCP Section I #6)</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Ayush / CCRAS"
                  value={trialForm.sponsorName}
                  onChange={e => setTrialForm({ ...trialForm, sponsorName: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="parallel-sub"
                  checked={trialForm.parallelSubmissionCDSCO}
                  onChange={e => setTrialForm({ ...trialForm, parallelSubmissionCDSCO: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="parallel-sub" className="text-xs text-blue-900 dark:text-blue-300 font-bold cursor-pointer">
                  Enable Parallel Submission to CDSCO & Ethics Committee (Rule 8, NDCTR 2019 Advisory)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-[#182434] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white font-bold rounded hover:bg-emerald-900 disabled:opacity-60"
                >
                  {isSubmitting ? "Creating…" : "Register Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Patient Modal */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">Enroll Patient</h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Record participant entry in trial ledger</p>
                </div>
              </div>
              <button onClick={() => setIsPatientModalOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePatientSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded text-xs font-bold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Patient Subject ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PAT-901"
                    value={patientForm.patientId}
                    onChange={e => setPatientForm({ ...patientForm, patientId: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Target Trial</label>
                  <select
                    value={patientForm.trialId}
                    onChange={e => setPatientForm({ ...patientForm, trialId: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  >
                    {trials.map(t => (
                      <option key={t._id} value={t.trialId}>{t.trialId} - {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Participant Name"
                  value={patientForm.fullName}
                  onChange={e => setPatientForm({ ...patientForm, fullName: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={patientForm.age}
                    onChange={e => setPatientForm({ ...patientForm, age: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Gender</label>
                  <select
                    value={patientForm.gender}
                    onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">ABHA ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="14-digit ABHA"
                    value={patientForm.abhaId}
                    onChange={e => setPatientForm({ ...patientForm, abhaId: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dosage / Administration Plan</label>
                <input
                  type="text"
                  placeholder="e.g. 500mg BD after meals"
                  value={patientForm.dosage}
                  onChange={e => setPatientForm({ ...patientForm, dosage: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              {/* GCP & Statutory Compliance Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Hospital Reg Number (GCP C #4)</label>
                  <input
                    type="text"
                    placeholder="e.g. HOSP-REG-2026-992"
                    value={patientForm.hospitalRegNumber}
                    onChange={e => setPatientForm({ ...patientForm, hospitalRegNumber: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Impartial Witness Name (GCP IV-B #4)</label>
                  <input
                    type="text"
                    placeholder="Impartial witness name"
                    value={patientForm.witnessName}
                    onChange={e => setPatientForm({ ...patientForm, witnessName: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Administered By (GCP IV-B #7-8)</label>
                  <input
                    type="text"
                    placeholder="Medically qualified investigator"
                    value={patientForm.administeredByName}
                    onChange={e => setPatientForm({ ...patientForm, administeredByName: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Statutory Risk Scale (R Factor)</label>
                  <select
                    value={patientForm.diseaseRiskFactor}
                    onChange={e => setPatientForm({ ...patientForm, diseaseRiskFactor: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-[#182434] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:border-emerald-800 focus:outline-none"
                  >
                    <option value={0.5}>R = 0.50 (Terminally ill &le; 6 mo)</option>
                    <option value={1.0}>R = 1.00 (High Risk 6-24 mo)</option>
                    <option value={2.0}>R = 2.00 (Moderate Risk)</option>
                    <option value={3.0}>R = 3.00 (Mild Risk)</option>
                    <option value={4.0}>R = 4.00 (Healthy Volunteer / No Risk)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="av-consent"
                  checked={patientForm.audioVisualRecordingDone}
                  onChange={e => setPatientForm({ ...patientForm, audioVisualRecordingDone: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <label htmlFor="av-consent" className="text-xs text-emerald-900 dark:text-emerald-300 font-bold cursor-pointer">
                  Audio-Visual (AV) Consent Recorded & Preserved Safely (GSR 611(E) Mandate)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-[#182434] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white font-bold rounded hover:bg-emerald-900 disabled:opacity-60"
                >
                  {isSubmitting ? "Enrolling…" : "Enroll Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compliance Modal */}
      {isCheckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">ALCOA+ Compliance Report</h3>
              </div>
              <button onClick={() => setIsCheckModalOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded flex justify-between items-center">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">Audit Score: {complianceResult.complianceScore}%</span>
                <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">Status: {complianceResult.integrity}</span>
              </div>
              <div className="space-y-1.5 text-stone-600 dark:text-stone-400 font-mono">
                <p>Total Records Evaluated: {complianceResult.totalRecords}</p>
                <p>Total Breaches Detected: {complianceResult.totalBreaches}</p>
                <p>EVM Block Number: #{complianceResult.blockNumber}</p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button onClick={() => setIsCheckModalOpen(false)} className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white font-bold text-xs rounded hover:bg-emerald-900">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
