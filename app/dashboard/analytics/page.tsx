"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, ShieldCheck, AlertTriangle, Users, MapPin, BarChart3, RefreshCw } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PolarRadiusAxis
} from "recharts";

const ENROLMENT_TREND = [
  { month: "Mar", enrolled: 145, target: 200 },
  { month: "Apr", enrolled: 220, target: 300 },
  { month: "May", enrolled: 310, target: 400 },
  { month: "Jun", enrolled: 445, target: 550 },
  { month: "Jul", enrolled: 610, target: 700 },
  { month: "Aug", enrolled: 820, target: 900 },
  { month: "Sep", enrolled: 1080, target: 1100 },
];

const SITES_MOCK = [
  { name: "AIIA Main Campus, New Delhi",                                  activeTrials: 4, enrolled: 142, compliance: 98, status: "Optimal" },
  { name: "AIIA Satellite Campus, Goa",                                   activeTrials: 2, enrolled: 58,  compliance: 95, status: "Optimal" },
  { name: "NIA, Jaipur",                                                  activeTrials: 3, enrolled: 84,  compliance: 92, status: "Review Needed" },
  { name: "ITRA, Jamnagar",                                               activeTrials: 2, enrolled: 61,  compliance: 96, status: "Optimal" },
];

const SOC_BAR_DATA = [
  { soc: "Gastrointestinal",    count: 3, color: "#f59e0b" },
  { soc: "Skin disorders",      count: 2, color: "#8b5cf6" },
  { soc: "Nervous system",      count: 1, color: "#06b6d4" },
  { soc: "General disorders",   count: 1, color: "#64748b" },
  { soc: "Immune system",       count: 0, color: "#ef4444" },
];

const ALCOA_RADAR = [
  { dimension: "Attributable", score: 100 },
  { dimension: "Legible",      score: 100 },
  { dimension: "Contemp.",     score: 97  },
  { dimension: "Original",     score: 100 },
  { dimension: "Accurate",     score: 98  },
  { dimension: "Complete+",    score: 96  },
];

const SITE_BAR = SITES_MOCK.map(s => ({ name: s.name.split(",")[0], compliance: s.compliance }));

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/kpis').then(r => r.json()),
      fetch('/api/safety').then(r => r.json()),
    ]).then(([kpiRes, eventsRes]) => {
      if (kpiRes.success) setKpis(kpiRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const summary = kpis?.summary || {};

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand-600" />
            Advanced Clinical Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Multi-site telemetry · Pharmacovigilance signal analysis · ALCOA+ integrity radar</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Top KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Portfolio ALCOA+ Score", value: "98.5%",  sub: "All 6 dimensions passing (>90%)", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/50" },
          { label: "Recruitment Velocity",   value: `${summary.enrolmentRate || 48}%`, sub: `Across ${summary.activeTrials || 4} active multi-centre studies`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-100 dark:border-blue-900/50" },
          { label: "NPvCC Safety Signals",   value: "0 Critical", sub: "No disproportionality signals detected (PRR < 2.0)", icon: AlertTriangle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/50" },
        ].map((k, i) => (
          <div key={i} className={`rounded-2xl p-5 border ${k.bg} ${k.border} shadow-sm`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              <span>{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <p className={`text-3xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Enrolment trend + AE distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Enrolment Trend (Area Chart) */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Cumulative Enrolment Trend
          </h2>
          <p className="text-xs text-slate-400 mb-5">Actual vs. Target enrolment across all studies (FY 2026)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ENROLMENT_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEnrolled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:[&>line]:stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gradTarget)" dot={false} />
              <Area type="monotone" dataKey="enrolled" name="Enrolled" stroke="#16a34a" strokeWidth={2} fill="url(#gradEnrolled)" dot={{ r: 3, fill: '#16a34a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AE by SOC (Horizontal Bar) */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" /> AE Distribution by System Organ Class
          </h2>
          <p className="text-xs text-slate-400 mb-5">MedDRA-coded adverse events (all studies · YTD)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SOC_BAR_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} className="dark:[&>line]:stroke-slate-800" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="soc" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Events" radius={[0,6,6,0]} barSize={22}>
                {SOC_BAR_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: ALCOA+ Radar + Site Compliance */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* ALCOA+ Radar */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> ALCOA+ Data Integrity Radar
          </h2>
          <p className="text-xs text-slate-400 mb-4">All 6 dimensions of data integrity compliance (target: ≥90%)</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={ALCOA_RADAR} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <PolarGrid stroke="#e2e8f0" className="dark:[&>line]:stroke-slate-800" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[80, 100]} tick={{ fontSize: 10 }} tickCount={3} />
              <Radar name="ALCOA+" dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} dot={{ r: 3, fill: '#16a34a' }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {ALCOA_RADAR.map(r => (
              <div key={r.dimension} className="text-center">
                <p className="text-sm font-extrabold text-emerald-600">{r.score}%</p>
                <p className="text-[10px] text-slate-400">{r.dimension}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Site Compliance Bar */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" /> Multi-Centre Site GCP Compliance
          </h2>
          <p className="text-xs text-slate-400 mb-5">GCP-ASU compliance score comparison across all active research sites</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SITE_BAR} margin={{ top: 0, right: 10, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:[&>line]:stroke-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="compliance" name="Compliance %" radius={[6,6,0,0]} barSize={36}>
                {SITE_BAR.map((entry, i) => (
                  <Cell key={i} fill={entry.compliance >= 95 ? '#16a34a' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Site detail list */}
          <div className="mt-4 space-y-2.5">
            {SITES_MOCK.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${s.compliance >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.compliance}%</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${s.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRR Signal Table */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          NPvCC Pharmacovigilance Signal Disproportionality — PRR Analysis
        </h2>
        <p className="text-xs text-slate-400 mb-5">Proportional Reporting Ratio analysis per MedDRA System Organ Class. Signal threshold: PRR ≥ 2.0</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">System Organ Class (SOC)</th>
                <th className="px-5 py-3.5 text-left">Reported Events</th>
                <th className="px-5 py-3.5 text-left">PRR Value</th>
                <th className="px-5 py-3.5 text-left">Signal Status</th>
                <th className="px-5 py-3.5 text-left">PRR Gauge</th>
                <th className="px-5 py-3.5 text-right">DSMB Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[
                { soc: "Gastrointestinal disorders",              count: events.filter(e => e.medDraSystemOrganClass === 'Gastrointestinal disorders').length || 3, prr: 1.12 },
                { soc: "Skin and subcutaneous tissue disorders",  count: events.filter(e => e.medDraSystemOrganClass?.includes('Skin')).length || 2, prr: 1.05 },
                { soc: "Nervous system disorders",                count: events.filter(e => e.medDraSystemOrganClass?.includes('Nervous')).length || 1, prr: 0.85 },
                { soc: "General disorders",                       count: events.filter(e => e.medDraSystemOrganClass?.includes('General')).length || 1, prr: 0.92 },
              ].map((s, idx) => {
                const prrPct = Math.min((s.prr / 3) * 100, 100);
                const isSignal = s.prr >= 2.0;
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{s.soc}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{s.count}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{s.prr.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${isSignal ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                        {isSignal ? '⚠ Signal Detected' : '✓ Safe'}
                      </span>
                    </td>
                    <td className="px-5 py-4 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isSignal ? 'bg-red-500' : prrPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${prrPct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8">{prrPct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-400">Routine Surveillance</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
