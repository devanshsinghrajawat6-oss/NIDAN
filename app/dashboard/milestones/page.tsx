"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, CheckCircle2, AlertTriangle, X, Calendar, Filter, ChevronDown } from "lucide-react";

const STATUS_CONFIG: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  'Completed':   { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800' },
  'In Progress': { dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-950/50',    border: 'border-blue-200 dark:border-blue-800' },
  'At Risk':     { dot: 'bg-orange-500',  text: 'text-orange-700 dark:text-orange-400',  bg: 'bg-orange-100 dark:bg-orange-950/50',  border: 'border-orange-200 dark:border-orange-800' },
  'Delayed':     { dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-950/50',     border: 'border-red-200 dark:border-red-800' },
  'Not Started': { dot: 'bg-slate-400',   text: 'text-slate-600 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-200 dark:border-slate-700' },
};

const CAT_COLORS: Record<string, string> = {
  Regulatory:   'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  Enrolment:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Safety:       'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  Analysis:     'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  Operational:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

import { validateText, validatePositiveNumber } from "@/lib/validation";

const CATEGORIES = ['All', 'Regulatory', 'Enrolment', 'Safety', 'Analysis', 'Operational'];

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTrial, setFilterTrial] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [formError, setFormError] = useState('');
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
    setFormError('');

    if (!form.trialId) { setFormError("Trial selection is required."); return; }

    const nameErr = validateText(form.name, "Milestone Name", 3);
    if (nameErr) { setFormError(nameErr); return; }

    const threshErr = validatePositiveNumber(form.alertThresholdDays, "Alert Threshold");
    if (threshErr) { setFormError(threshErr); return; }

    const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const json = await res.json();
    if (json.success) { setMilestones(prev => [...prev, json.data]); setIsModalOpen(false); setFormError(''); }
    else { setFormError(json.error || "Failed to add milestone."); }
  };

  const now = new Date();

  // Filter milestones
  const filtered = milestones.filter(m => {
    const catOk = filterCategory === 'All' || m.category === filterCategory;
    const trialOk = filterTrial === 'All' || m.trialId === filterTrial;
    return catOk && trialOk;
  });

  // Sort: overdue first, then by date
  const sorted = [...filtered].sort((a, b) => {
    const da = a.plannedDate ? new Date(a.plannedDate).getTime() : Infinity;
    const db = b.plannedDate ? new Date(b.plannedDate).getTime() : Infinity;
    const aOverdue = da < now.getTime() && a.status !== 'Completed';
    const bOverdue = db < now.getTime() && b.status !== 'Completed';
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return da - db;
  });

  // Group by trial for Gantt view
  const grouped: Record<string, any[]> = {};
  sorted.forEach(m => {
    const trialName = trials.find(t => t.trialId === m.trialId)?.name || m.trialId;
    if (!grouped[trialName]) grouped[trialName] = [];
    grouped[trialName].push(m);
  });

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'Completed').length,
    overdue: milestones.filter(m => {
      const d = m.plannedDate ? new Date(m.plannedDate) : null;
      return d && d < now && m.status !== 'Completed';
    }).length,
    upcoming: milestones.filter(m => {
      const d = m.plannedDate ? new Date(m.plannedDate) : null;
      const days = d ? Math.round((d.getTime() - now.getTime()) / 86400000) : null;
      return days !== null && days >= 0 && days <= 30 && m.status !== 'Completed';
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-brand-600" /> Study Milestones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track CTRI, IEC, enrolment, and analysis milestones across the entire portfolio.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" /> Filter
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/20">
            <Plus className="h-4 w-4" /> Add Milestone
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "text-slate-800 dark:text-slate-200", bg: "bg-slate-100 dark:bg-slate-800" },
          { label: "Completed", value: stats.completed, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/40" },
          { label: "Overdue",   value: stats.overdue,   color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/40" },
          { label: "Due in 30d",value: stats.upcoming,  color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/40" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-bold uppercase tracking-wider ${s.color} opacity-70`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 animate-fade-in-down shadow-sm">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilterCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterCategory === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trial</label>
            <select className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700" value={filterTrial} onChange={e => setFilterTrial(e.target.value)}>
              <option value="All">All Trials</option>
              {trials.map(t => <option key={t.trialId} value={t.trialId}>{t.trialId} — {t.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Gantt-style milestone groups */}
      {!loading && Object.entries(grouped).length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Clock className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No milestones found</p>
          <p className="text-sm text-slate-400 mt-1">Add your first milestone to start tracking study progress</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Milestone
          </button>
        </div>
      ) : null}

      {!loading && Object.entries(grouped).map(([trialName, items]) => {
        const completed = items.filter(m => m.status === 'Completed').length;
        const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
        return (
          <div key={trialName} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Trial header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-200">{trialName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} milestones · {completed} completed</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{pct}%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Complete</p>
                </div>
                <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            {/* Category swim-lanes */}
            <div className="p-6 space-y-6">
              {(['Regulatory', 'Enrolment', 'Safety', 'Analysis', 'Operational'] as const).map(cat => {
                const catItems = items.filter((m: any) => m.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${CAT_COLORS[cat]}`}>{cat}</span>
                      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="relative pl-8">
                      {/* Timeline track */}
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                      <div className="space-y-3">
                        {catItems.map((m: any) => {
                          const planned = m.plannedDate ? new Date(m.plannedDate) : null;
                          const daysLeft = planned ? Math.round((planned.getTime() - now.getTime()) / 86400000) : null;
                          const overdue = daysLeft !== null && daysLeft < 0 && m.status !== 'Completed';
                          const atRisk  = !overdue && daysLeft !== null && daysLeft <= m.alertThresholdDays && m.status !== 'Completed';
                          const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG['Not Started'];
                          
                          return (
                            <div key={m._id} className="relative">
                              {/* Timeline dot */}
                              <div className={`absolute -left-5 top-3.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0d1117] ${cfg.dot} shadow-sm`} />
                              
                              <div className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                                overdue ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' :
                                atRisk  ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20' :
                                m.status === 'Completed' ? 'border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10' :
                                'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20'
                              }`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <p className={`font-semibold text-sm ${m.status === 'Completed' ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{m.name}</p>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{m.status}</span>
                                    </div>
                                    {m.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{m.notes}</p>}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      {planned ? planned.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : 'TBD'}
                                    </p>
                                    {m.actualDate && (
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end mt-0.5">
                                        <CheckCircle2 className="h-3 w-3" /> {new Date(m.actualDate).toLocaleDateString('en-IN')}
                                      </p>
                                    )}
                                    {overdue && (
                                      <p className="text-[10px] text-red-600 dark:text-red-400 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                                        <AlertTriangle className="h-3 w-3" /> {Math.abs(daysLeft!)}d overdue
                                      </p>
                                    )}
                                    {atRisk && !overdue && (
                                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">⚡ {daysLeft}d left</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-modal">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Add Milestone</h2>
                  <p className="text-xs text-slate-400">Set alert thresholds for proactive tracking</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formError && <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trial</label>
                <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={form.trialId} onChange={e => setForm({ ...form, trialId: e.target.value })}>
                  {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Milestone Name</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. IEC Approval Received, First Patient Enrolled" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['Regulatory', 'Enrolment', 'Analysis', 'Safety', 'Operational'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Planned Date</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={form.plannedDate} onChange={e => setForm({ ...form, plannedDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Alert Threshold (days before)</label>
                <input type="number" min="1" max="180" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" value={form.alertThresholdDays} onChange={e => setForm({ ...form, alertThresholdDays: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea rows={2} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="Optional notes…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20">
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
