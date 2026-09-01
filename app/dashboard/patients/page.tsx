"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield, Link as LinkIcon, Activity, FileText, ChevronDown } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterTrial, setFilterTrial] = useState("ALL");
  const [trials, setTrials]       = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/patients').then(r => r.json()),
      fetch('/api/trials').then(r => r.json()),
    ]).then(([pj, tj]) => {
      if (pj.success) setPatients(pj.data);
      if (tj.success) setTrials(tj.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.patientId?.toLowerCase().includes(q) || p.pseudonymizedId?.toLowerCase().includes(q) || p.trialId?.toLowerCase().includes(q) || p.site?.toLowerCase().includes(q);
    const matchTrial = filterTrial === "ALL" || p.trialId === filterTrial;
    return matchSearch && matchTrial;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" /> Subject Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Blockchain-verified consent records · DPDP Act pseudonymization · GCP-ASU enrollment tracking
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <Shield className="h-4 w-4" />
          <span className="font-bold">DPDP Act 2023 · All PII Pseudonymized</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Subjects",    value: patients.length,                                      color: "text-slate-800 dark:text-slate-100" },
          { label: "Consented (On-chain)",  value: patients.filter(p => p.consentStatus === 'Signed').length || patients.length, color: "text-emerald-700 dark:text-emerald-400" },
          { label: "Active Trials",     value: new Set(patients.map(p => p.trialId)).size,           color: "text-blue-700 dark:text-blue-400" },
          { label: "Sites",             value: new Set(patients.map(p => p.site).filter(Boolean)).size || 1, color: "text-purple-700 dark:text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject ID, pseudonym, trial, site…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <select
          value={filterTrial}
          onChange={e => setFilterTrial(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="ALL">All Trials</option>
          {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 text-left">Subject ID</th>
                <th className="px-5 py-3.5 text-left">Pseudonymized ID</th>
                <th className="px-5 py-3.5 text-left">Trial</th>
                <th className="px-5 py-3.5 text-left">Site</th>
                <th className="px-5 py-3.5 text-left">Dosage</th>
                <th className="px-5 py-3.5 text-left">Consent Status</th>
                <th className="px-5 py-3.5 text-left">Enrolled</th>
                <th className="px-5 py-3.5 text-right">Blockchain Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading subject registry…</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No subjects enrolled yet</p>
                  <p className="text-xs text-slate-400 mt-1">Use the "Enroll Patient" button on the dashboard to add subjects.</p>
                </td></tr>
              ) : (
                filtered.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{p.patientId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-slate-400 shrink-0" />
                        <p className="font-mono text-xs text-slate-600 dark:text-slate-400">{p.pseudonymizedId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{p.trialId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{p.site || 'AIIA New Delhi'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">{p.dosage || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        p.consentStatus === 'Signed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : p.consentStatus === 'Revoked'
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${p.consentStatus === 'Signed' ? 'bg-emerald-500' : p.consentStatus === 'Revoked' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        {p.consentStatus || 'Signed'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.enrolledAt ? new Date(p.enrolledAt).toLocaleDateString('en-IN') : p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.blockchainTxHash ? (
                        <div className="flex items-center justify-end gap-1">
                          <LinkIcon className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            {p.blockchainTxHash.substring(0, 12)}…
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <strong className="text-slate-600 dark:text-slate-300">{filtered.length}</strong> of <strong className="text-slate-600 dark:text-slate-300">{patients.length}</strong> subjects
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Shield className="h-3 w-3" />
              All records pseudonymized per DPDP Act 2023
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
