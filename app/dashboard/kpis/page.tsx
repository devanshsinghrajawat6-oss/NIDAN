"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Activity, Users, AlertTriangle, Clock, ShieldCheck, 
  TrendingUp, TrendingDown, Minus, FileText, BarChart2, Bell
} from "lucide-react";

function KPICard({ title, value, subtitle, icon: Icon, color, trend, alert }: any) {
  return (
    <div className={`relative rounded-2xl p-5 border shadow-sm overflow-hidden ${alert ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20' : 'bg-white dark:bg-[#111111] border-slate-100 dark:border-slate-800'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : trend >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function AlertBadge({ severity }: { severity: string }) {
  const classes: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${classes[severity] || classes.info}`}>
      {severity}
    </span>
  );
}

export default function KPIPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kpis')
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = data?.summary || {};
  const alerts = data?.alerts || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-brand-600" />
            Portfolio KPIs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time clinical trial performance metrics. Last computed: {data?.computedAt ? new Date(data.computedAt).toLocaleTimeString() : '—'}</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors">
          Refresh KPIs
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Trials" value={s.activeTrials ?? '—'} icon={Activity} color="bg-slate-800" />
        <KPICard title="Patients Enrolled" value={s.totalPatients ?? '—'} subtitle={`of ${s.totalTarget ?? '—'} target`} icon={Users} color="bg-emerald-700" trend={s.enrolmentRate} />
        <KPICard title="SAE Reporting Compliance" value={`${s.saeReportingCompliance ?? '—'}%`} icon={ShieldCheck} color="bg-blue-700" trend={s.saeReportingCompliance} />
        <KPICard title="Open SAEs" value={s.openSAEs ?? '—'} icon={AlertTriangle} color="bg-red-700" alert={s.openSAEs > 0} />
        <KPICard title="Visit Compliance" value={`${s.visitCompliance ?? '—'}%`} icon={Clock} color="bg-purple-700" trend={s.visitCompliance} />
        <KPICard title="Protocol Deviations" value={s.totalDeviations ?? '—'} icon={FileText} color="bg-orange-700" />
        <KPICard title="Open Data Queries" value={s.openQueries ?? '—'} subtitle={`${s.dataQueryRate ?? '—'}% query rate`} icon={TrendingDown} color="bg-yellow-700" />
        <KPICard title="Delayed Milestones" value={s.delayedMilestones ?? '—'} icon={Clock} color="bg-slate-700" alert={s.delayedMilestones > 0} />
      </div>

      {/* Per-Trial Enrolment */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600" /> Enrolment by Trial</h2>
        {data?.trialKPIs?.length === 0 && <p className="text-sm text-slate-400">No trials found.</p>}
        <div className="space-y-4">
          {data?.trialKPIs?.map((t: any) => (
            <div key={t.trialId}>
              <div className="flex items-center justify-between mb-1">
                <Link href={`/dashboard/trials/${t.trialId}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">{t.name} ({t.trialId})</Link>
                <div className="flex items-center gap-2">
                  {t.enrolmentLag && <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-200">ENROLMENT LAG</span>}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.enrolled}/{t.target}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${t.rate >= 80 ? 'bg-emerald-500' : t.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(t.rate, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.rate}% enrolled{t.daysToClose !== null ? ` · ${t.daysToClose}d to close-out` : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Panels */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* SAE Overdue */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-red-600" /> Overdue Regulatory Reports</h2>
          {alerts.overdueReports?.length === 0 && <p className="text-sm text-emerald-600">✓ All reports within deadline</p>}
          <div className="space-y-2">
            {alerts.overdueReports?.map((r: any) => (
              <div key={r.eventId} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">{r.eventId} ({r.eventType})</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{r.hoursOverdue}h overdue · {r.trialId}</p>
                </div>
                <AlertBadge severity="critical" />
              </div>
            ))}
          </div>
        </div>

        {/* IEC / CTRI Alerts */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-yellow-600" /> Regulatory Alerts</h2>
          {alerts.iecAlerts?.length === 0 && alerts.ctriAlerts?.length === 0 && <p className="text-sm text-emerald-600">✓ No regulatory alerts</p>}
          <div className="space-y-2">
            {alerts.iecAlerts?.map((a: any) => (
              <div key={a.trialId + '-iec'} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">IEC Expiry: {a.name}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">{a.daysLeft} days remaining</p>
                </div>
                <AlertBadge severity={a.critical ? 'critical' : 'warning'} />
              </div>
            ))}
            {alerts.ctriAlerts?.map((a: any) => (
              <div key={a.trialId + '-ctri'} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900">
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">CTRI Update Due: {a.name}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">{a.overdue ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d remaining`}</p>
                </div>
                <AlertBadge severity={a.overdue ? 'critical' : 'warning'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
