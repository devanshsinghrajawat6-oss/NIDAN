"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, CheckCircle2, AlertTriangle, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  'Completed': 'bg-emerald-500',
  'In Progress': 'bg-blue-500',
  'At Risk': 'bg-orange-500',
  'Delayed': 'bg-red-500',
  'Not Started': 'bg-slate-300 dark:bg-slate-700',
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ trialId: '', name: '', category: 'Regulatory', plannedDate: '', alertThresholdDays: 30, notes: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/milestones').then(r => r.json()),
      fetch('/api/trials').then(r => r.json()),
    ]).then(([ms, tr]) => {
      if (ms.success) setMilestones(ms.data);
      if (tr.success) {
        setTrials(tr.data);
        if (tr.data.length > 0) setForm(f => ({ ...f, trialId: tr.data[0].trialId }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const json = await res.json();
    if (json.success) {
      setMilestones(prev => [...prev, json.data]);
      setIsModalOpen(false);
    }
  };

  const grouped: Record<string, any[]> = {};
  milestones.forEach(m => {
    const trial = trials.find(t => t.trialId === m.trialId)?.name || m.trialId;
    if (!grouped[trial]) grouped[trial] = [];
    grouped[trial].push(m);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight flex items-center gap-2"><Clock className="h-6 w-6 text-brand-600" />Study Milestones</h1>
          <p className="text-slate-500 text-sm mt-1">Track CTRI, IEC, enrolment, and analysis milestones across the portfolio.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Milestone
        </button>
      </div>

      {loading && <div className="flex items-center justify-center h-40"><div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}

      {!loading && Object.entries(grouped).map(([trialName, items]) => (
        <div key={trialName} className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-700 dark:text-slate-300 text-base mb-4">{trialName}</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-4 pl-10">
              {items.map((m: any) => {
                const now = new Date();
                const planned = m.plannedDate ? new Date(m.plannedDate) : null;
                const daysLeft = planned ? Math.round((planned.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const overdue = daysLeft !== null && daysLeft < 0 && m.status !== 'Completed';
                const atRisk = daysLeft !== null && daysLeft <= m.alertThresholdDays && daysLeft >= 0 && m.status !== 'Completed';

                return (
                  <div key={m._id} className="relative">
                    <div className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#111111] ${STATUS_COLORS[m.status] || 'bg-slate-300'}`} />
                    <div className={`p-4 rounded-xl border ${overdue ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800' : atRisk ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800' : 'border-slate-100 dark:border-slate-800'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{m.name}</p>
                            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{m.category}</span>
                          </div>
                          {m.notes && <p className="text-xs text-slate-500 mt-1">{m.notes}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-slate-500">
                            {planned ? planned.toLocaleDateString() : 'TBD'}
                          </p>
                          {m.actualDate && <p className="text-[10px] text-emerald-600">Done: {new Date(m.actualDate).toLocaleDateString()}</p>}
                          {overdue && <p className="text-[10px] text-red-600 font-bold">⚠ {Math.abs(daysLeft!)}d OVERDUE</p>}
                          {atRisk && !overdue && <p className="text-[10px] text-orange-600 font-bold">⚡ {daysLeft}d remaining</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {!loading && milestones.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No milestones yet. Add your first milestone!</p>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-brand-600" />Add Milestone</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trial</label>
                <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.trialId} onChange={e => setForm({ ...form, trialId: e.target.value })}>
                  {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Milestone Name</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="e.g. IEC Approval, First Patient Enrolled" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['Regulatory', 'Enrolment', 'Analysis', 'Safety', 'Operational'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Planned Date</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.plannedDate} onChange={e => setForm({ ...form, plannedDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alert Threshold (days before)</label>
                <input type="number" min="1" max="180" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.alertThresholdDays} onChange={e => setForm({ ...form, alertThresholdDays: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={2} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                  <CheckCircle2 className="h-4 w-4" /> Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
