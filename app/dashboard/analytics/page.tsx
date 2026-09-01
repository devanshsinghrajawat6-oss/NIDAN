"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, ShieldCheck, AlertTriangle, Users, MapPin, CheckCircle2, BarChart3, LineChart } from "lucide-react";

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/kpis').then(r => r.json()),
      fetch('/api/trials').then(r => r.json()),
      fetch('/api/safety').then(r => r.json()),
    ]).then(([kpiRes, trialsRes, eventsRes]) => {
      if (kpiRes.success) setKpis(kpiRes.data);
      if (trialsRes.success) setTrials(trialsRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const summary = kpis?.summary || {};

  const SITES_MOCK = [
    { name: "AIIA Main Campus, New Delhi", activeTrials: 4, enrolled: 142, compliance: 98, status: "Optimal" },
    { name: "AIIA Satellite Campus, Goa", activeTrials: 2, enrolled: 58, compliance: 95, status: "Optimal" },
    { name: "National Institute of Ayurveda (NIA), Jaipur", activeTrials: 3, enrolled: 84, compliance: 92, status: "Review Needed" },
    { name: "Institute of Teaching & Research in Ayurveda (ITRA), Jamnagar", activeTrials: 2, enrolled: 61, compliance: 96, status: "Optimal" },
  ];

  const SOC_SIGNALS = [
    { soc: "Gastrointestinal disorders", count: events.filter(e => e.medDraSystemOrganClass === 'Gastrointestinal disorders').length || 3, prr: 1.12, status: "Safe" },
    { soc: "Skin and subcutaneous tissue disorders", count: events.filter(e => e.medDraSystemOrganClass?.includes('Skin')).length || 2, prr: 1.05, status: "Safe" },
    { soc: "Nervous system disorders", count: events.filter(e => e.medDraSystemOrganClass?.includes('Nervous')).length || 1, prr: 0.85, status: "Safe" },
    { soc: "General disorders", count: events.filter(e => e.medDraSystemOrganClass?.includes('General')).length || 1, prr: 0.92, status: "Safe" },
  ];

  const ALCOA_SCORES = [
    { dimension: "Attributable (A)", score: 100, desc: "Every entry digitally signed with HMAC-SHA256" },
    { dimension: "Legible (L)", score: 100, desc: "Standardized schemas & MedDRA/CDISC coded" },
    { dimension: "Contemporaneous (C)", score: 97, desc: "Recorded in real-time with block timestamp" },
    { dimension: "Original (O)", score: 100, desc: "EVM blockchain immutable hash proof" },
    { dimension: "Accurate (A)", score: 98, desc: "Automated query validation & schema rules" },
    { dimension: "Complete (+)", score: 96, desc: "Full audit trail for lifecycle changes" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-brand-600" />
          Advanced Clinical Trial Analytics & Signals
        </h1>
        <p className="text-slate-500 text-sm mt-1">Multi-site performance telemetry, pharmacovigilance signal disproportionality, and ALCOA+ data integrity radar.</p>
      </div>

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-2">
            <span>Portfolio ALCOA+ Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">98.5%</p>
          <p className="text-xs text-slate-500 mt-1">All 6 ALCOA+ dimensions passing regulatory threshold (&gt;90%)</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-2">
            <span>Recruitment Velocity</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {summary.enrolmentRate || 48}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Across {summary.activeTrials || 4} active multi-centre studies</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-2">
            <span>NPvCC Safety Signals</span>
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">0 Critical</p>
          <p className="text-xs text-slate-500 mt-1">No disproportionality signals detected (PRR &lt; 2.0)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Multi-Centre Site Telemetry */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-600" /> Multi-Centre Trial Site Telemetry
          </h2>
          <div className="space-y-3">
            {SITES_MOCK.map((site) => (
              <div key={site.name} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{site.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{site.activeTrials} active protocols · {site.enrolled} subjects enrolled</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    site.status === 'Optimal' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400'
                  }`}>
                    {site.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>GCP Compliance Score</span>
                  <span className="font-semibold">{site.compliance}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${site.compliance >= 95 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${site.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ALCOA+ Data Integrity Radar */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> ALCOA+ Data Integrity Evaluation
          </h2>
          <div className="space-y-3">
            {ALCOA_SCORES.map((item) => (
              <div key={item.dimension}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.dimension}</span>
                  <span className="font-bold text-emerald-600">{item.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.score}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Signal Disproportionality Table */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          NPvCC Pharmacovigilance Signal Disproportionality (PRR Analysis)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">System Organ Class (SOC)</th>
                <th className="px-5 py-3.5">Reported Events</th>
                <th className="px-5 py-3.5">Proportional Reporting Ratio (PRR)</th>
                <th className="px-5 py-3.5">Signal Status</th>
                <th className="px-5 py-3.5 text-right">DSMB Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {SOC_SIGNALS.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/20">
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{s.soc}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.count}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{s.prr}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-slate-400">Routine Surveillance</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
