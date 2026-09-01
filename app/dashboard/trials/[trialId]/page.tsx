"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, AlertTriangle, Clock, FileText, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200',
    'Completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200',
    'Suspended': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200',
    'Terminated': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200',
    'Planned': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
    'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Delayed': 'bg-red-100 text-red-700 border-red-200',
    'At Risk': 'bg-orange-100 text-orange-700 border-orange-200',
    'Open': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Closed': 'bg-slate-100 text-slate-600 border-slate-200',
    'Major': 'bg-red-100 text-red-700 border-red-200',
    'Minor': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Missed': 'bg-red-100 text-red-700 border-red-200',
    'Scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
    'Consented': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Withdrawn': 'bg-slate-100 text-slate-600 border-slate-200',
    'Reported': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'SAE': 'bg-red-100 text-red-700 border-red-200',
    'AE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

export default function TrialDrillDownPage() {
  const params = useParams();
  const trialId = params.trialId as string;

  const [trial, setTrial] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trialId) return;
    Promise.all([
      fetch(`/api/trials?trialId=${trialId}`).then(r => r.json()),
      fetch(`/api/patients?trialId=${trialId}`).then(r => r.json()),
      fetch(`/api/safety?trialId=${trialId}`).then(r => r.json()),
      fetch(`/api/milestones?trialId=${trialId}`).then(r => r.json()),
      fetch(`/api/deviations?trialId=${trialId}`).then(r => r.json()),
      fetch(`/api/visits?trialId=${trialId}`).then(r => r.json()),
    ]).then(([trialRes, patientsRes, eventsRes, milestonesRes, deviationsRes, visitsRes]) => {
      if (trialRes.success && trialRes.data) setTrial(Array.isArray(trialRes.data) ? trialRes.data[0] : trialRes.data);
      if (patientsRes.success) setPatients(patientsRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (milestonesRes.success) setMilestones(milestonesRes.data);
      if (deviationsRes.success) setDeviations(deviationsRes.data);
      if (visitsRes.success) setVisits(visitsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [trialId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!trial) return <div className="text-center text-slate-500 py-20"><FileText className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Trial not found: {trialId}</p></div>;

  const enrollmentRate = trial.enrollmentTarget > 0 ? Math.round((patients.length / trial.enrollmentTarget) * 100) : 0;
  const screened = patients.filter(p => p.screeningDate).length;
  const enrolled = patients.filter(p => p.enrolmentDate).length;
  const randomized = patients.filter(p => p.randomizationDate).length;
  const completed = patients.filter(p => p.completionDate).length;
  const withdrawn = patients.filter(p => p.withdrawalDate).length;

  const openSAEs = events.filter(e => e.eventType === 'SAE' && e.status !== 'Closed').length;
  const completedVisits = visits.filter(v => v.status === 'Completed').length;
  const missedVisits = visits.filter(v => v.status === 'Missed').length;
  const openDeviations = deviations.filter(d => d.status === 'Open' || d.status === 'Under Review').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/trials" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{trial.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="font-mono text-sm text-brand-600 dark:text-brand-400 font-semibold">{trial.trialId}</span>
              {trial.ctriRegistration && <span className="text-xs text-slate-500">CTRI: {trial.ctriRegistration}</span>}
              <StatusBadge status={trial.status} />
              <span className="text-xs text-slate-500">{trial.phase}</span>
              <span className="text-xs text-slate-500">{trial.studyDesign || 'RCT'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">PI: {trial.principalInvestigator}</p>
            <p className="text-xs text-slate-500 mt-1">IEC: {trial.iecApprovalStatus}</p>
          </div>
        </div>
      </div>

      {/* Enrolment Funnel */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" /> Enrolment Funnel</h2>
        <div className="flex items-end gap-2 flex-wrap">
          {[
            { label: 'Screened', value: screened, color: 'bg-slate-400' },
            { label: 'Enrolled', value: enrolled, color: 'bg-brand-500' },
            { label: 'Randomized', value: randomized, color: 'bg-emerald-500' },
            { label: 'Completed', value: completed, color: 'bg-blue-500' },
            { label: 'Withdrawn', value: withdrawn, color: 'bg-red-400' },
          ].map(step => (
            <div key={step.label} className="flex-1 min-w-[80px] text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{step.value}</div>
              <div className={`h-2 ${step.color} rounded-full mt-1 mx-auto`} style={{ width: `${Math.min((step.value / (trial.enrollmentTarget || 1)) * 100, 100)}%`, minWidth: step.value > 0 ? '8px' : '0' }} />
              <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">{step.label}</div>
            </div>
          ))}
          <div className="flex-1 min-w-[80px] text-center border-l border-dashed border-slate-200 dark:border-slate-700 ml-2 pl-2">
            <div className="text-2xl font-bold text-slate-400">{trial.enrollmentTarget}</div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1" />
            <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Target</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Enrolment Progress</span><span>{enrollmentRate}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${enrollmentRate >= 80 ? 'bg-emerald-500' : enrollmentRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(enrollmentRate, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open SAEs', value: openSAEs, icon: AlertTriangle, color: openSAEs > 0 ? 'text-red-600' : 'text-emerald-600', alert: openSAEs > 0 },
          { label: 'Completed Visits', value: completedVisits, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Missed Visits', value: missedVisits, icon: Clock, color: missedVisits > 0 ? 'text-yellow-600' : 'text-slate-400' },
          { label: 'Open Deviations', value: openDeviations, icon: FileText, color: openDeviations > 0 ? 'text-orange-600' : 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white dark:bg-[#111111] border rounded-xl p-4 shadow-sm ${stat.alert ? 'border-red-200 dark:border-red-800' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-brand-600" /> Study Milestones</h2>
          {milestones.length === 0 && <p className="text-sm text-slate-400 italic">No milestones recorded.</p>}
          <div className="space-y-3">
            {milestones.map((m: any) => (
              <div key={m._id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.plannedDate ? new Date(m.plannedDate).toLocaleDateString() : 'TBD'}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Deviations */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-orange-600" /> Protocol Deviations</h2>
          {deviations.length === 0 && <p className="text-sm text-slate-400 italic">No deviations recorded.</p>}
          <div className="space-y-3">
            {deviations.map((d: any) => (
              <div key={d._id} className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{d.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{d.patientId && `Patient: ${d.patientId} · `}{d.detectedDate ? new Date(d.detectedDate).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={d.deviationType} />
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAE Table */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Adverse Events</h2>
        {events.length === 0 && <p className="text-sm text-slate-400 italic">No adverse events reported for this trial.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="text-left py-2 px-3">Event ID</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">MedDRA PT</th>
                <th className="text-left py-2 px-3">Severity</th>
                <th className="text-left py-2 px-3">Causality</th>
                <th className="text-left py-2 px-3">Deadline</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {events.map((e: any) => {
                const overdue = e.regulatoryDeadline && new Date(e.regulatoryDeadline) < new Date() && e.status !== 'Closed';
                return (
                  <tr key={e._id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors ${overdue ? 'bg-red-50 dark:bg-red-950/10' : ''}`}>
                    <td className="py-3 px-3 font-mono text-xs text-brand-600 dark:text-brand-400">{e.eventId}</td>
                    <td className="py-3 px-3"><StatusBadge status={e.eventType} /></td>
                    <td className="py-3 px-3 text-xs">{e.medDraPreferredTerm || e.medDraCode || '—'}</td>
                    <td className="py-3 px-3"><StatusBadge status={e.severity} /></td>
                    <td className="py-3 px-3 text-xs">{e.causality || '—'}</td>
                    <td className={`py-3 px-3 text-xs font-semibold ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
                      {e.regulatoryDeadline ? new Date(e.regulatoryDeadline).toLocaleString() : '—'}
                      {overdue && ' ⚠'}
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={e.status} /></td>
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
