"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Activity, Users, AlertTriangle, Clock, ShieldCheck, 
  TrendingUp, TrendingDown, FileText, BarChart2, Bell, ArrowRight, RefreshCw, CheckCircle2
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip
} from "recharts";

// Sparkline with inline data
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map(v => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip contentStyle={{ display: 'none' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, colorClass, trend, alert, sparkData, sparkColor }: any) {
  return (
    <div className={`relative rounded-2xl p-5 border shadow-sm overflow-hidden card-hover transition-all ${
      alert 
        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20' 
        : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-xl ${
            trend >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                       : trend >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                       : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
          }`}>
            {trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      {sparkData && (
        <div className="mt-3 opacity-60">
          <MiniSparkline data={sparkData} color={sparkColor || '#16a34a'} />
        </div>
      )}
    </div>
  );
}

function AlertBadge({ severity }: { severity: string }) {
  const classes: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800',
    warning:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    info:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };
  const icons: Record<string, string> = { critical: '🔴', warning: '⚠️', info: 'ℹ️' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${classes[severity] || classes.info}`}>
      {icons[severity] || ''} {severity}
    </span>
  );
}

export default function KPIPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    fetch('/api/kpis')
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Computing KPIs…</p>
      </div>
    </div>
  );

  const s = data?.summary || {};
  const alerts = data?.alerts || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-brand-600" /> Portfolio KPIs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time clinical trial performance metrics · Last computed: {data?.computedAt ? new Date(data.computedAt).toLocaleString('en-IN') : '—'}
          </p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Trials"            value={s.activeTrials ?? '—'} icon={Activity}      colorClass="bg-slate-800"  sparkData={[8,9,10,11,12,s.activeTrials||14]} sparkColor="#94a3b8" />
        <KPICard title="Patients Enrolled"        value={s.totalPatients ?? '—'} subtitle={`of ${s.totalTarget ?? '—'} target`} icon={Users}  colorClass="bg-emerald-700" trend={s.enrolmentRate}  sparkData={[800,900,1000,1100,1200,s.totalPatients||1248]} sparkColor="#22c55e" />
        <KPICard title="SAE Reporting Compliance" value={`${s.saeReportingCompliance ?? '—'}%`} icon={ShieldCheck} colorClass="bg-blue-700" trend={s.saeReportingCompliance}  sparkData={[90,92,94,95,96,97,s.saeReportingCompliance||98]} sparkColor="#3b82f6" />
        <KPICard title="Open SAEs"                value={s.openSAEs ?? '—'}       icon={AlertTriangle}  colorClass="bg-red-700"   alert={s.openSAEs > 0} />
        <KPICard title="Visit Compliance"         value={`${s.visitCompliance ?? '—'}%`}  icon={Clock}      colorClass="bg-purple-700" trend={s.visitCompliance} sparkData={[80,82,84,85,86,88,s.visitCompliance||89]} sparkColor="#a855f7" />
        <KPICard title="Protocol Deviations"      value={s.totalDeviations ?? '—'} icon={FileText}    colorClass="bg-orange-700" />
        <KPICard title="Open Data Queries"        value={s.openQueries ?? '—'}     subtitle={`${s.dataQueryRate ?? '—'}% query rate`} icon={TrendingDown} colorClass="bg-yellow-700" />
        <KPICard title="Delayed Milestones"       value={s.delayedMilestones ?? '—'} icon={Clock}    colorClass="bg-slate-700"  alert={s.delayedMilestones > 0} />
      </div>

      {/* Per-Trial Enrolment */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Enrolment Progress by Trial
          </h2>
          <Link href="/dashboard/trials" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.trialKPIs?.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No trials found. Create your first trial.</p>
          </div>
        )}
        <div className="space-y-5">
          {data?.trialKPIs?.map((t: any) => (
            <div key={t.trialId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/trials/${t.trialId}`} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{t.name}</Link>
                  <span className="text-[10px] text-slate-400 font-mono">({t.trialId})</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.enrolmentLag && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-1">
                      ⚠ Lag
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.enrolled} / {t.target}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${t.rate >= 80 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : t.rate >= 50 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' : 'text-red-600 bg-red-50 dark:bg-red-950/30'}`}>{t.rate}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${t.rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : t.rate >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                  style={{ width: `${Math.min(t.rate, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">{t.daysToClose !== null ? `${t.daysToClose} days remaining to close-out` : 'No close-out date set'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Overdue Reports */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" /> Overdue Regulatory Reports
            </h2>
            <Link href="/dashboard/safety" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
              View Safety <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(!alerts.overdueReports || alerts.overdueReports.length === 0) ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All Reports On Time</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">No overdue SAE/AE reports. Excellent compliance!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.overdueReports?.map((r: any) => (
                <div key={r.eventId} className="flex items-start justify-between p-3.5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900">
                  <div>
                    <p className="text-sm font-bold text-red-800 dark:text-red-300">{r.eventId} ({r.eventType})</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{r.hoursOverdue}h overdue · {r.trialId}</p>
                  </div>
                  <AlertBadge severity="critical" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regulatory Alerts */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" /> Regulatory Alerts
            </h2>
            <Link href="/dashboard/milestones" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              View Milestones <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(!alerts.iecAlerts?.length && !alerts.ctriAlerts?.length) ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">No Regulatory Alerts</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">All IEC approvals and CTRI updates are current.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.iecAlerts?.map((a: any) => (
                <div key={a.trialId + '-iec'} className="flex items-start justify-between p-3.5 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-100 dark:border-yellow-900">
                  <div>
                    <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">IEC Expiry: {a.name}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">{a.daysLeft} days remaining</p>
                  </div>
                  <AlertBadge severity={a.critical ? 'critical' : 'warning'} />
                </div>
              ))}
              {alerts.ctriAlerts?.map((a: any) => (
                <div key={a.trialId + '-ctri'} className="flex items-start justify-between p-3.5 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900">
                  <div>
                    <p className="text-sm font-bold text-orange-800 dark:text-orange-300">CTRI Update Due: {a.name}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{a.overdue ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d remaining`}</p>
                  </div>
                  <AlertBadge severity={a.overdue ? 'critical' : 'warning'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
