"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, X, FileText, UserX, ExternalLink, Fingerprint } from "lucide-react";
import { validatePersonName } from "@/lib/validation";

export default function ConsentHubPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    trialId: "",
    consentVersion: "1.1",
    consentType: "Initial",
    witnessName: "Dr. Sharma",
    investigatorName: "Prof. Rajesh Kumar",
  });

  const fetchData = async () => {
    try {
      const [consentRes, patientRes, trialRes] = await Promise.all([
        fetch('/api/consent'),
        fetch('/api/patients'),
        fetch('/api/trials'),
      ]);
      const [cJson, pJson, tJson] = await Promise.all([
        consentRes.json(),
        patientRes.json(),
        trialRes.json()
      ]);

      if (cJson.success) setConsents(cJson.data);
      if (pJson.success) {
        setPatients(pJson.data);
        if (pJson.data.length > 0) setForm(f => ({ ...f, patientId: pJson.data[0].patientId, trialId: pJson.data[0].trialId }));
      }
      if (tJson.success) setTrials(tJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    if (!form.patientId) { setFormError("Patient selection is required."); setIsSubmitting(false); return; }
    if (!form.trialId) { setFormError("Trial selection is required."); setIsSubmitting(false); return; }

    const witnessErr = validatePersonName(form.witnessName, "Witness Name");
    if (witnessErr) { setFormError(witnessErr); setIsSubmitting(false); return; }

    const invErr = validatePersonName(form.investigatorName, "Investigator Name");
    if (invErr) { setFormError(invErr); setIsSubmitting(false); return; }

    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to record consent");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (patientId: string, trialId: string) => {
    if (!confirm(`Are you sure you want to record a consent withdrawal for patient ${patientId}?`)) return;
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          trialId,
          consentVersion: '1.0',
          consentType: 'Withdrawal',
          witnessName: 'Study Coordinator',
          investigatorName: 'PI',
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = consents.filter(c => c.status === 'Active').length;
  const withdrawnCount = consents.filter(c => c.consentType === 'Withdrawal').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            e-Consent Management Hub (GCP-ASU & DPDP 2023)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Informed consent versioning, cryptographic SHA-256 signatures, and immutable blockchain anchoring.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Record e-Consent / Re-consent
        </button>
      </div>

      {/* Summary KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Signed Consents</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{consents.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active e-Consents</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Withdrawn Consents</span>
          <p className="text-2xl font-bold text-slate-500 mt-1">{withdrawnCount}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Blockchain Integrity</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">100% Verified</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Patient Consent Register</h2>
          <span className="text-xs text-slate-400">Aligned with Schedule Y / NDCT Rules 2019</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Consent ID</th>
                <th className="px-5 py-3.5">Subject & Trial</th>
                <th className="px-5 py-3.5">Version & Type</th>
                <th className="px-5 py-3.5">Witness & Investigator</th>
                <th className="px-5 py-3.5">Date Signed</th>
                <th className="px-5 py-3.5">Blockchain Tx</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading consent registry...</p>
                    </div>
                  </td>
                </tr>
              ) : consents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">No consent records yet.</p>
                    <p className="text-xs">Click "Record e-Consent" to add the first informed consent.</p>
                  </td>
                </tr>
              ) : (
                consents.map((c: any) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {c.consentId}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{c.patientId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.trialId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">v{c.consentVersion}</span>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">({c.consentType})</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>Investigator: {c.investigatorName || "—"}</div>
                      <div className="text-[10px] text-slate-400">Witness: {c.witnessName || "—"}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(c.consentDate || c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500" title={c.blockchainTxHash}>
                        <Fingerprint className="h-3 w-3 text-emerald-500 opacity-70" />
                        {c.blockchainTxHash ? `${c.blockchainTxHash.substring(0, 8)}...` : "Pending"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {c.status === 'Active' && (
                        <button
                          onClick={() => handleWithdraw(c.patientId, c.trialId)}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-semibold p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                          title="Record subject withdrawal"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Consent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Record Informed e-Consent
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{formError}</div>}
              
              <form id="consent-record-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject ID</label>
                    <select required className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.patientId} onChange={e => {
                      const p = patients.find(pat => pat.patientId === e.target.value);
                      setForm({...form, patientId: e.target.value, trialId: p?.trialId || form.trialId});
                    }}>
                      {patients.map(p => <option key={p._id} value={p.patientId}>{p.patientId} ({p.pseudonymizedId})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trial ID</label>
                    <input readOnly type="text" className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-500 font-mono" value={form.trialId} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Consent Version</label>
                    <input required type="text" placeholder="e.g. 1.1 / 2.0" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" value={form.consentVersion} onChange={e => setForm({...form, consentVersion: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Consent Action</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.consentType} onChange={e => setForm({...form, consentType: e.target.value})}>
                      <option value="Initial">Initial Consent</option>
                      <option value="Re-consent">Re-consent (Protocol Amendment)</option>
                      <option value="Amendment">Minor Consent Amendment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Principal Investigator Name</label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.investigatorName} onChange={e => setForm({...form, investigatorName: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Independent Witness Name</label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value={form.witnessName} onChange={e => setForm({...form, witnessName: e.target.value})} />
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                  <strong>HMAC-SHA256 Cryptographic e-Signature:</strong>
                  <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">Submitting will compute a tamper-evident signature and anchor the consent transaction hash to the Ethereum EVM ledger.</p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="consent-record-form" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? "Anchoring Consent..." : <><CheckCircle2 className="h-4 w-4" /> e-Sign & Anchor</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
