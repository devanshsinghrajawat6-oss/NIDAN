"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Database, FileDigit, Fingerprint } from "lucide-react";

export default function LedgerPage() {
  const [hashes, setHashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      try {
        const res = await fetch("/api/ledger");
        const json = await res.json();
        if (json.success) {
          setHashes(json.data);
        }
      } catch (error) {
        console.error("Error fetching ledger:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          Blockchain Ledger
        </h1>
        <p className="text-slate-500 text-sm mt-1">Immutable audit logs and cryptographic hashes synced with local EVM network.</p>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold">Transaction Hash</th>
                <th className="px-6 py-4 font-bold">Event Type</th>
                <th className="px-6 py-4 font-bold">Clinical Data (Immutable)</th>
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Syncing with Blockchain...
                  </td>
                </tr>
              ) : hashes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No records found on the ledger.
                  </td>
                </tr>
              ) : (
                hashes.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-2" title={h.txHash}>
                      <Fingerprint className="h-3 w-3 opacity-50" />
                      {h.txHash.substring(0, 10)}...{h.txHash.substring(h.txHash.length - 8)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {h.recordType}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {h.extraData ? h.extraData : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(h.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        {h.status}
                      </span>
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
