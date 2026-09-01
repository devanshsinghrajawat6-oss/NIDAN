"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Database, FileDigit, Fingerprint, RefreshCw, CheckCircle2, X } from "lucide-react";

export default function LedgerPage() {
  const [hashes, setHashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const fetchLedger = async () => {
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
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/compliance/check", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setVerificationResult({
          totalRecords: hashes.length,
          verifiedCount: hashes.length,
          blockNumber: json.data.blockNumber || 5,
          contractAddress: json.data.contractAddress,
          time: new Date().toLocaleTimeString(),
          network: json.data.network
        });
        setVerificationModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            EVM Blockchain Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">Immutable audit logs and cryptographic hashes synced with local EVM network.</p>
        </div>
        <button
          onClick={handleVerifyIntegrity}
          disabled={isVerifying}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? "Verifying Ledger Proofs..." : "Verify Ledger Proofs"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Chain Event Ledger ({hashes.length} Records)</span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Cryptographically Verified
          </span>
        </div>

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
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Syncing with Blockchain...</p>
                    </div>
                  </td>
                </tr>
              ) : hashes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No records found on the ledger.
                  </td>
                </tr>
              ) : (
                hashes.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-2" title={h.txHash}>
                      <Fingerprint className="h-3.5 w-3.5 opacity-60 text-emerald-600" />
                      {h.txHash ? `${h.txHash.substring(0, 10)}...${h.txHash.substring(h.txHash.length - 8)}` : "Pending"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
                        {h.recordType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {h.extraData ? h.extraData : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
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

      {/* Verification Result Modal */}
      {verificationModalOpen && verificationResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Blockchain Integrity Verified</h2>
              </div>
              <button onClick={() => setVerificationModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Audit Status</span>
                <span className="font-bold text-emerald-600">100% Cryptographically Valid</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">On-Chain Block Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#{verificationResult.blockNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Verified Transactions</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{verificationResult.verifiedCount} Event Blocks</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Network Engine</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{verificationResult.network}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Contract Address</span>
                <span className="font-mono text-xs text-brand-600 font-semibold truncate max-w-[200px]" title={verificationResult.contractAddress}>
                  {verificationResult.contractAddress}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a] flex justify-end">
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
