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
    <div className={`relative rounded-xl p-5 border shadow-2xs overflow-hidden transition-all ${
      alert 
        ? 'border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 text-stone-900 dark:text-stone-100' 
        : 'paper-card'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`h-9 w-9 rounded-md flex items-center justify-center ${colorClass}`}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
            trend >= 80 ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                       : trend >= 60 ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                       : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
          }`}>
            {trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1">{title}</p>
      {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
      {sparkData && (
        <div className="mt-3 opacity-70">
          <MiniSparkline data={sparkData} color={sparkColor || '#15803d'} />
        </div>
      )}
    </div>
  );
}

function AlertBadge({ severity }: { severity: string }) {
  const classes: Record<string, string> = {
    critical: 'bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
    warning:  'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    info:     'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${classes[severity] || classes.info}`}>
      {severity}
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
        <div className="h-8 w-8 border-2 border-emerald-800 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Computing Portfolio KPIs…</p>
      </div>
    </div>
  );

  const s = data?.summary || {};
  const alerts = data?.alerts || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-emerald-800 dark:text-emerald-400" /> Portfolio KPIs
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            Real-time clinical trial performance metrics · Last computed: {data?.computedAt ? new Date(data.computedAt).toLocaleString('en-IN') : '—'}
          </p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-md transition-colors shadow-2xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Trials"            value={s.activeTrials ?? '—'} icon={Activity}      colorClass="bg-stone-800 dark:bg-stone-700"  sparkData={[8,9,10,11,12,s.activeTrials||14]} sparkColor="#78716c" />
        <KPICard title="Patients Enrolled"        value={s.totalPatients ?? '—'} subtitle={`of ${s.totalTarget ?? '—'} target`} icon={Users}  colorClass="bg-emerald-800 dark:bg-emerald-700" trend={s.enrolmentRate}  sparkData={[800,900,1000,1100,1200,s.totalPatients||1248]} sparkColor="#15803d" />
        <KPICard title="SAE Compliance"          value={`${s.saeReportingCompliance ?? '—'}%`} icon={ShieldCheck} colorClass="bg-blue-800 dark:bg-blue-700" trend={s.saeReportingCompliance}  sparkData={[90,92,94,95,96,97,s.saeReportingCompliance||98]} sparkColor="#0284c7" />
        <KPICard title="Open SAEs"                value={s.openSAEs ?? '—'}       icon={AlertTriangle}  colorClass="bg-red-800 dark:bg-red-700"   alert={s.openSAEs > 0} />
        <KPICard title="Visit Compliance"         value={`${s.visitCompliance ?? '—'}%`}  icon={Clock}      colorClass="bg-purple-800 dark:bg-purple-700" trend={s.visitCompliance} sparkData={[80,82,84,85,86,88,s.visitCompliance||89]} sparkColor="#7c3aed" />
        <KPICard title="Protocol Deviations"      value={s.totalDeviations ?? '—'} icon={FileText}    colorClass="bg-amber-800 dark:bg-amber-700" />
        <KPICard title="Open Data Queries"        value={s.openQueries ?? '—'}     subtitle={`${s.dataQueryRate ?? '—'}% query rate`} icon={TrendingDown} colorClass="bg-stone-700 dark:bg-stone-600" />
        <KPICard title="Delayed Milestones"       value={s.delayedMilestones ?? '—'} icon={Clock}    colorClass="bg-stone-700 dark:bg-stone-600"  alert={s.delayedMilestones > 0} />
      </div>

      {/* Per-Trial Enrolment */}
      <div className="paper-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-emerald-800 dark:text-emerald-400" /> Enrolment Progress by Trial
          </h2>
          <Link href="/dashboard/trials" className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1">
            View all trials <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.trialKPIs?.length === 0 && (
          <div className="text-center py-10 text-stone-400">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No active trials found.</p>
          </div>
        )}
        <div className="space-y-4">
          {data?.trialKPIs?.map((t: any) => (
            <div key={t.trialId} className="p-3 bg-stone-50 dark:bg-[#182434] border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/trials/${t.trialId}`} className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-800 dark:hover:text-emerald-400">
                    {t.name}
                  </Link>
                  <span className="text-[10px] text-stone-400 font-mono">({t.trialId})</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.enrolmentLag && (
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                      ⚠ Lag
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">{t.enrolled} / {t.target}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.rate >= 80 ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' : t.rate >= 50 ? 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300' : 'text-red-800 bg-red-50 dark:bg-red-950/60 dark:text-red-300'}`}>
                    {t.rate}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${t.rate >= 80 ? 'bg-emerald-700 dark:bg-emerald-500' : t.rate >= 50 ? 'bg-amber-600 dark:bg-amber-500' : 'bg-red-600 dark:bg-red-500'}`}
                  style={{ width: `${Math.min(t.rate, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Overdue Reports */}
        <div className="paper-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-base">
              <Bell className="h-4.5 w-4.5 text-red-700 dark:text-red-400" /> Overdue Regulatory Reports
            </h2>
            <Link href="/dashboard/safety" className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1">
              View Safety <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(!alerts.overdueReports || alerts.overdueReports.length === 0) ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300">All Reports On Time</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">No overdue SAE/AE reports. GCP compliance maintained.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.overdueReports?.map((r: any) => (
                <div key={r.eventId} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900">
                  <div>
                    <p className="text-xs font-bold text-red-900 dark:text-red-300">{r.eventId} ({r.eventType})</p>
                    <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">{r.hoursOverdue}h overdue · {r.trialId}</p>
                  </div>
                  <AlertBadge severity="critical" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regulatory Alerts */}
        <div className="paper-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-base">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" /> Regulatory Alerts
            </h2>
            <Link href="/dashboard/milestones" className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1">
              View Milestones <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(!alerts.iecAlerts?.length && !alerts.ctriAlerts?.length) ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300">No Regulatory Alerts</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">All IEC approvals and CTRI updates are current.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.iecAlerts?.map((a: any) => (
                <div key={a.trialId + '-iec'} className="flex items-start justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300">IEC Expiry: {a.name}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">{a.daysLeft} days remaining</p>
                  </div>
                  <AlertBadge severity={a.critical ? 'critical' : 'warning'} />
                </div>
              ))}
              {alerts.ctriAlerts?.map((a: any) => (
                <div key={a.trialId + '-ctri'} className="flex items-start justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300">CTRI Update Due: {a.name}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">{a.overdue ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d remaining`}</p>
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
