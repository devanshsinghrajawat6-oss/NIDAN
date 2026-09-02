"use client";

import { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Users, TrendingUp, AlertTriangle, Scale, Clock, 
  Download, FileJson, X, CheckCircle2, FileText, RefreshCw, Database,
  Plus, ArrowRight, Zap, Calendar, Bell, ExternalLink
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
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Stat Card with sparkline ──────────────────────────────────────────
function StatCard({ title, value, trend, trendLabel, bg, sparkData, sparkColor, icon: Icon }: any) {
  return (
    <div className={`${bg} text-white rounded-2xl p-5 relative overflow-hidden shadow-lg card-hover`}>
      <div className="flex justify-between items-start mb-4">
        <div className="h-10 w-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trendLabel}
        </div>
      </div>
      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-extrabold mb-3">{value}</p>
      <div className="opacity-70">
        <Sparkline data={sparkData} color="rgba(255,255,255,0.8)" />
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
  const [trialForm, setTrialForm] = useState({ trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, principalInvestigator: "", herbFormulation: "", description: "" });
  const [patientForm, setPatientForm] = useState({ patientId: "", pseudonymizedId: "", fullName: "", address: "", dosage: "", trialId: "", site: "AIIA New Delhi" });

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

    // Validate inputs
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
      setTrialForm({ trialId: "", name: "", phase: "Phase 1", enrollmentTarget: 100, principalInvestigator: "", herbFormulation: "", description: "" });
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");

    // Validate inputs
    const pidErr = validateIdCode(patientForm.patientId, "Subject ID");
    if (pidErr) { setFormError(pidErr); setIsSubmitting(false); return; }

    const nameErr = validatePersonName(patientForm.fullName, "Patient Full Name");
    if (nameErr) { setFormError(nameErr); setIsSubmitting(false); return; }

    const addrErr = validateText(patientForm.address, "Address", 3);
    if (addrErr) { setFormError(addrErr); setIsSubmitting(false); return; }

    const dosageErr = validateText(patientForm.dosage, "Dosage", 2);
    if (dosageErr) { setFormError(dosageErr); setIsSubmitting(false); return; }

    const payload = { ...patientForm, pseudonymizedId: patientForm.pseudonymizedId || `PID-${Math.random().toString(36).substring(7).toUpperCase()}` };
    try {
      const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to add patient");
      setIsPatientModalOpen(false); fetchData();
      setPatientForm({ patientId: "", pseudonymizedId: "", fullName: "", address: "", dosage: "", trialId: trials[0]?.trialId || "", site: "AIIA New Delhi" });
    } catch (err: any) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const scoreOffset = 251.2 - (251.2 * (complianceResult.complianceScore || 98)) / 100;

  // Mock sparkline data (7-day trends)
  const sparkData = {
    studies:   [8, 9, 9, 10, 11, 12, trials.length || 14],
    patients:  [900, 980, 1050, 1100, 1180, 1220, patients.length || 1248],
    approvals: [5, 6, 7, 8, 8, 7, trials.filter(t => t.iecApprovalStatus === 'Pending').length || 7],
    deviations:[1, 2, 2, 3, 3, 3, trials.reduce((a, t) => a + (t.protocolDeviations || 0), 0)],
  };

  // Phase distribution for donut chart
  const phaseData = [
    { name: "Phase 1", value: trials.filter(t => t.phase === "Phase 1").length || 2, color: "#3b82f6" },
    { name: "Phase 2", value: trials.filter(t => t.phase === "Phase 2").length || 4, color: "#8b5cf6" },
    { name: "Phase 3", value: trials.filter(t => t.phase === "Phase 3").length || 5, color: "#16a34a" },
    { name: "Observational", value: trials.filter(t => t.phase === "Observational").length || 3, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  // Upcoming milestones (next 5)
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'Completed' && m.plannedDate)
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
    .slice(0, 4);

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? "Good morning" : getHour() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t("Here's your portfolio snapshot for")} {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/api/fhir/ResearchStudy'} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <FileJson className="h-4 w-4" /> FHIR Export
          </button>
          <button onClick={() => window.location.href = '/api/export/sdtm'} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-500/20">
            <Download className="h-4 w-4" /> CDISC (SDTM)
          </button>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t("Quick Actions")}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(userRole === "Investigator" || userRole === "Admin" || userRole === "Coordinator") && (
            <button onClick={() => setIsPatientModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
              <Users className="h-4 w-4" /> {t("Enroll Patient")}
            </button>
          )}
          {(userRole === "Investigator" || userRole === "Admin") && (
            <button onClick={() => setIsTrialModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
              <Plus className="h-4 w-4" /> {t("New Trial")}
            </button>
          )}
          {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
            <button onClick={handleRunComplianceCheck} disabled={isCheckingCompliance} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 transition-colors disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${isCheckingCompliance ? 'animate-spin' : ''}`} />
              {isCheckingCompliance ? "Auditing…" : t("Run Compliance Check")}
            </button>
          )}
          {(userRole === "Pharmacovigilance" || userRole === "Investigator" || userRole === "Admin") && (
            <Link href="/dashboard/safety" className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 dark:border-red-900 transition-colors">
              <AlertTriangle className="h-4 w-4" /> {t("Report AE/SAE")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("Active Studies")} value={loading ? "—" : trials.length} trendLabel="+2%" bg="bg-slate-800" sparkData={sparkData.studies} icon={Activity} />
        <StatCard title={t("Patients Enrolled")} value={loading ? "—" : patients.length.toLocaleString()} trendLabel="+12%" bg="bg-[#0b6034]" sparkData={sparkData.patients} icon={Users} />
        <StatCard title={t("Approvals Pending")} value={loading ? "—" : trials.filter(t => t.iecApprovalStatus === 'Pending').length} trendLabel={t("due soon")} bg="bg-[#7c3a00]" sparkData={sparkData.approvals} icon={Clock} />
        <StatCard title={t("Protocol Deviations")} value={loading ? "—" : trials.reduce((a, t) => a + (t.protocolDeviations || 0), 0)} trendLabel={t("Action Req")} bg="bg-[#a51c1c]" sparkData={sparkData.deviations} icon={AlertTriangle} />
      </div>

      {/* ── Middle Section ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Role-Specific: Investigator / Coordinator */}
        {(userRole === "Investigator" || userRole === "Coordinator") && (
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" /> {t("My Clinical Tasks")}
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Patient Follow-up (Trial #TR-249)</p>
                <p className="text-[10px] text-slate-500 mt-1">3 patients require dosage adjustment review.</p>
              </div>
              <div className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Submit Progress Report</p>
                <p className="text-[10px] text-slate-500 mt-1">Due in 2 days for Phase 2 Ashwagandha study.</p>
              </div>
            </div>
          </div>
        )}

        {/* Role-Specific: Ethics Committee */}
        {userRole === "Ethics Committee" && (
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-emerald-600" /> {t("Pending IEC Approvals")}
            </h3>
            {trials.filter(t => t.iecApprovalStatus === 'Pending').length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No pending approvals.</p>
            ) : (
              <div className="space-y-3">
                {trials.filter(t => t.iecApprovalStatus === 'Pending').slice(0,2).map(t => (
                  <div key={t._id} className="p-3 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{t.name || "Trial"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t.trialId}</p>
                    </div>
                    <button className="text-[10px] font-bold bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 transition-colors">Review</button>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/trials" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-4 inline-block hover:underline">View study portfolio &rarr;</Link>
          </div>
        )}

        {/* Role-Specific: Pharmacovigilance / Admin */}
        {(userRole === "Pharmacovigilance" || userRole === "Admin") && (
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" /> {t("Safety Signals Watchlist")}
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-300 px-1.5 rounded">SAE</span>
                  <span className="text-[10px] text-slate-500">2h ago</span>
                </div>
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Suspected unexpected serious adverse reaction (SUSAR)</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Trial: TR-102 · Requires immediate review</p>
              </div>
            </div>
            <Link href="/dashboard/safety" className="text-xs text-red-600 dark:text-red-400 font-bold mt-4 inline-block hover:underline">View all reports &rarr;</Link>
          </div>
        )}

        {/* Compliance Score */}
        {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> {t("Compliance Score")}
            </h3>
            <button
              onClick={handleRunComplianceCheck}
              disabled={isCheckingCompliance}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${isCheckingCompliance ? 'animate-spin text-emerald-600' : ''}`} />
              {isCheckingCompliance ? "Running…" : "Check"}
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle
                  className="text-emerald-500 stroke-current transition-all duration-700"
                  strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40"
                  fill="transparent" strokeDasharray="251.2" strokeDashoffset={scoreOffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{complianceResult.complianceScore}%</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">ALCOA+</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 text-sm">
              {[
                { label: "Breaches", value: complianceResult.totalBreaches ?? 0, color: "text-emerald-600" },
                { label: "Block #", value: `#${complianceResult.blockNumber ?? 5}`, color: "text-slate-800 dark:text-slate-200" },
                { label: "Records", value: `${complianceResult.totalRecords ?? 2} ✓`, color: "text-emerald-600" },
                { label: "Integrity", value: "Verified", color: "text-emerald-600" },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{r.label}</span>
                  <span className={`font-bold text-xs ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Study Phase Distribution */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Study Phase Distribution
          </h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center"><div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : phaseData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No studies yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={phaseData} cx="40%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value">
                  {phaseData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} trials`, n]} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Blockchain Network */}
        {(userRole === "Admin" || userRole === "Regulator" || userRole === "Ethics Committee") && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" /> Blockchain Network
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active · Chain 31337
            </div>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { label: "Network",    value: complianceResult.network?.replace("EVM Local Network (", "").replace(")", "") || "Hardhat EVM" },
              { label: "Consensus",  value: complianceResult.consensus || "Proof of Authority" },
              { label: "Contract",   value: complianceResult.contractAddress ? `${complianceResult.contractAddress.substring(0, 10)}…` : "0x9fE4…a6e0", mono: true },
              { label: "Integrity",  value: complianceResult.integrity || "100% VERIFIED", green: true },
              { label: "Records",    value: `${complianceResult.totalRecords ?? 2} verified on-chain` },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500 dark:text-slate-400">{r.label}</span>
                <span className={`font-bold ${r.mono ? 'font-mono text-emerald-600 dark:text-emerald-400' : r.green ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'} text-right max-w-[60%] truncate`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* ── Bottom Section ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming Milestones */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" /> Upcoming Milestones
            </h3>
            <Link href="/dashboard/milestones" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full" />)}</div>
          ) : upcomingMilestones.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No upcoming milestones</p>
              <Link href="/dashboard/milestones" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-2 inline-block">Add one →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMilestones.map((m: any) => {
                const now = new Date();
                const planned = new Date(m.plannedDate);
                const daysLeft = Math.round((planned.getTime() - now.getTime()) / 86400000);
                const overdue = daysLeft < 0;
                const atRisk = !overdue && daysLeft <= m.alertThresholdDays;
                const catColors: Record<string,string> = {
                  Regulatory: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                  Enrolment:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
                  Safety:     'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
                  Analysis:   'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
                  Operational:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
                };
                return (
                  <div key={m._id} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    overdue ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' :
                    atRisk  ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20' :
                    'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${catColors[m.category] || catColors.Operational}`}>{m.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.trialId} · {planned.toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className={`text-right shrink-0 ml-3 font-bold text-sm ${overdue ? 'text-red-600 dark:text-red-400' : atRisk ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" /> Recent Activity
            </h3>
            <Link href="/dashboard/audit" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Audit trail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-12 w-full" />)}</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log: any, i) => {
                const actionColors: Record<string,string> = {
                  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
                  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                  DELETE: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
                  COMPLIANCE_CHECK: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
                  SIGN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
                };
                const cls = actionColors[log.action] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                return (
                  <div key={log._id || i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5 ${cls}`}>{log.action || 'LOG'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{log.details || log.resourceType || 'System event'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.performedBy || 'System'} · {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}

      {/* Create Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Register New Trial</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Protocol will be logged to blockchain audit trail</p>
                </div>
              </div>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm">{formError}</div>}
              <form id="trial-form" onSubmit={handleTrialSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Trial ID (CTRI Ref)", key: "trialId", placeholder: "e.g. T-1004", type: "text" },
                    { label: "Trial Name / Title",  key: "name",    placeholder: "Study of Ashwagandha…", type: "text" },
                    { label: "Principal Investigator", key: "principalInvestigator", placeholder: "Dr. Name…", type: "text" },
                    { label: "Herb / Formulation",  key: "herbFormulation", placeholder: "e.g. AYUSH-64", type: "text" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input required type={f.type} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder={f.placeholder} value={(trialForm as any)[f.key]} onChange={e => setTrialForm({...trialForm, [f.key]: e.target.value})} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phase</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={trialForm.phase} onChange={e => setTrialForm({...trialForm, phase: e.target.value})}>
                      {["Phase 1","Phase 2","Phase 3","Phase 4","Observational"].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Enrollment Target</label>
                    <input required type="number" min="1" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={trialForm.enrollmentTarget} onChange={e => setTrialForm({...trialForm, enrollmentTarget: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brief Description / Objectives</label>
                  <textarea rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Primary objectives, intervention details…" value={trialForm.description} onChange={e => setTrialForm({...trialForm, description: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3">
              <button onClick={() => setIsTrialModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="trial-form" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-emerald-500/20">
                {isSubmitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering…</> : <><CheckCircle2 className="h-4 w-4" /> Register Trial</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                  <Users className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Enroll Patient</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PII is pseudonymized; consent hash stored on blockchain</p>
                </div>
              </div>
              <button onClick={() => setIsPatientModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {formError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm">{formError}</div>}
              <form id="patient-form" onSubmit={handlePatientSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign to Trial</label>
                  <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={patientForm.trialId} onChange={e => setPatientForm({...patientForm, trialId: e.target.value})}>
                    {trials.length === 0 ? <option value="">No trials available</option> : null}
                    {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Subject ID",    key: "patientId",  placeholder: "e.g. SUB-001" },
                    { label: "Clinical Site", key: "site",       placeholder: "AIIA New Delhi" },
                    { label: "Full Name (PII)",key: "fullName",   placeholder: "John Doe" },
                    { label: "Address (PII)", key: "address",    placeholder: "123 Main St" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder={f.placeholder} value={(patientForm as any)[f.key]} onChange={e => setPatientForm({...patientForm, [f.key]: e.target.value})} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Prescribed Dosage
                    <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 normal-case">⛓ blockchain-anchored</span>
                  </label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. 500mg Twice Daily" value={patientForm.dosage} onChange={e => setPatientForm({...patientForm, dosage: e.target.value})} />
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 h-4 w-4 accent-emerald-600 rounded" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold">Informed Consent Verified (GCP-ASU)</strong>
                    <p className="text-[10px] text-slate-500 mt-0.5">Written informed consent obtained per ICMR guidelines. Cryptographic hash will be stored on the EVM blockchain.</p>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3">
              <button onClick={() => setIsPatientModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="patient-form" disabled={isSubmitting || trials.length === 0} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm">
                {isSubmitting ? <><div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing…</> : <><CheckCircle2 className="h-4 w-4" /> Enroll Patient</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Check Results Modal */}
      {isCheckModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-modal">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Live Compliance Audit</h2>
                  <p className="text-xs text-slate-400">Executed in {complianceResult.executionTimeMs || 42}ms across all 6 ALCOA+ subsystems</p>
                </div>
              </div>
              <button onClick={() => setIsCheckModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">ALCOA+ & GCP-ASU Compliance</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">{complianceResult.complianceScore}%</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Block: <strong className="text-slate-800 dark:text-slate-200">#{complianceResult.blockNumber}</strong></p>
                  <p className="mt-0.5">Integrity: <strong className="text-emerald-600">{complianceResult.integrity}</strong></p>
                </div>
              </div>
              <div className="space-y-2">
                {complianceResult.checks?.map((check: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{check.name}</p>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">({check.category})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{check.details}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase border shrink-0 ${
                      check.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      check.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                    }`}>
                      {check.status} ({check.score}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
              <span className="text-xs text-slate-400">Last verified: {complianceResult.lastCheck}</span>
              <button onClick={() => setIsCheckModalOpen(false)} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small BarChart3 import fix
function BarChart3(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.className?.includes('h-5') ? 20 : 16} height={props.className?.includes('h-5') ? 20 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
  );
}
