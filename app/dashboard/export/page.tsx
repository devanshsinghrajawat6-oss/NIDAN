"use client";

import { useEffect, useState } from "react";
import { Download, FileJson, Database, FileText, Shield } from "lucide-react";

const EXPORTS = [
  { id: 'sdtm', label: 'CDISC SDTM', description: 'DM, AE, DS, SV domains — submission-ready', icon: FileText, color: 'bg-blue-600', api: '/api/export/sdtm', ext: 'json' },
  { id: 'adam', label: 'CDISC ADaM', description: 'ADSL & ADAE analysis datasets', icon: Database, color: 'bg-purple-600', api: '/api/export/adam', ext: 'json' },
  { id: 'fhir-study', label: 'FHIR R4 — ResearchStudy', description: 'HL7 FHIR R4 Bundle for EDC / ABDM', icon: FileJson, color: 'bg-emerald-600', api: '/api/fhir/ResearchStudy', ext: 'json' },
  { id: 'fhir-ae', label: 'FHIR R4 — AdverseEvent', description: 'HL7 FHIR R4 AdverseEvent Bundle', icon: Shield, color: 'bg-red-600', api: '/api/fhir/AdverseEvent', ext: 'json' },
  { id: 'fhir-consent', label: 'FHIR R4 — Consent', description: 'HL7 FHIR R4 Consent resources', icon: FileJson, color: 'bg-teal-600', api: '/api/fhir/Consent', ext: 'json' },
  { id: 'csv', label: 'CSV Export', description: 'Raw flat-file tabular patient data for analysis', icon: Database, color: 'bg-orange-600', api: '/api/export/csv', ext: 'csv' },
  { id: 'excel', label: 'Excel (XLS)', description: 'Formatted spreadsheet for quick review', icon: FileText, color: 'bg-emerald-600', api: '/api/export/excel', ext: 'xls' },
];

export default function ExportPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [selectedTrial, setSelectedTrial] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trials').then(r => r.json()).then(json => {
      if (json.success) setTrials(json.data);
    });
  }, []);

  const handleExport = async (exp: typeof EXPORTS[0]) => {
    setExporting(exp.id);
    try {
      const url = selectedTrial ? `${exp.api}?trialId=${selectedTrial}` : exp.api;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${exp.id}_${selectedTrial || 'all'}_${Date.now()}.${exp.ext}`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight flex items-center gap-2">
          <Download className="h-6 w-6 text-brand-600" /> Data Export Centre
        </h1>
        <p className="text-slate-500 text-sm mt-1">Export submission-ready CDISC datasets and HL7 FHIR R4 resources.</p>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter by Trial (optional)</label>
        <select className="w-full max-w-md p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={selectedTrial} onChange={e => setSelectedTrial(e.target.value)}>
          <option value="">All Trials</option>
          {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map(exp => (
          <div key={exp.id} className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 ${exp.color} rounded-xl flex items-center justify-center mb-4`}>
              <exp.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{exp.label}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">{exp.description}</p>
            <button
              onClick={() => handleExport(exp)}
              disabled={exporting === exp.id}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-60"
            >
              {exporting === exp.id ? (
                <><div className="h-4 w-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />Exporting...</>
              ) : (
                <><Download className="h-4 w-4" />Download {exp.ext.toUpperCase()}</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <strong>CDISC Conformance Note:</strong> SDTM and ADaM exports follow CDISC SDTM v3.3 and ADaM v2.1 standards. For SAS Transport (XPT) format, pass the JSON through the Pinnacle 21 validator or your SAS PROC conversion pipeline. Define-XML 2.0 metadata is available at <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/api/export/define-xml</code>.
      </div>
    </div>
  );
}
