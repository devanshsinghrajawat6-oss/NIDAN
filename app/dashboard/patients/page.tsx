"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch('/api/patients');
        const json = await res.json();
        if (json.success) {
          setPatients(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Patients Ledger</h1>
          <p className="text-foreground/70 mt-1">Blockchain-verified patient consent and enrollment records.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search by pseudonymized ID or trial..." 
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-foreground/70 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name (DB)</th>
                <th className="px-6 py-4 font-medium">Dosage</th>
                <th className="px-6 py-4 font-medium">Trial ID</th>
                <th className="px-6 py-4 font-medium">Consent Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading patient records...</p>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-foreground/40" />
                      </div>
                      <p>No patients enrolled yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient: any) => (
                  <tr key={patient._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {patient.fullName} <span className="text-xs text-foreground/50 ml-1">({patient.pseudonymizedId})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{patient.dosage || "-"}</td>
                    <td className="px-6 py-4 text-brand-600 dark:text-brand-400 font-medium">{patient.trialId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                        {patient.consentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(patient.consentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-foreground/50 truncate max-w-[120px]" title={patient.blockchainTxHash}>
                      {patient.blockchainTxHash || "Pending"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
