"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Download } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/audit?limit=200').then(r => r.json()).then(json => {
      if (json.success) setLogs(json.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !filter || l.resource?.toLowerCase().includes(filter.toLowerCase()) ||
    l.action?.toLowerCase().includes(filter.toLowerCase()) ||
    l.userEmail?.toLowerCase().includes(filter.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [['Timestamp', 'Action', 'Resource', 'Resource ID', 'User', 'Role', 'Blockchain Tx']];
    filtered.forEach(l => rows.push([
      new Date(l.timestamp).toISOString(), l.action, l.resource, l.resourceId || '', l.userEmail || '', l.userRole || '', l.blockchainTxHash || ''
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `audit_log_${Date.now()}.csv`; a.click();
  };

  const actionColor: Record<string, string> = {
    CREATE: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200',
    UPDATE: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200',
    DELETE: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200',
    CONSENT_RECORDED: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200',
    AUDIT_LOG: 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" /> Immutable Audit Trail
          </h1>
          <p className="text-slate-500 text-sm mt-1">ALCOA+ compliant audit log. Every entry is blockchain-anchored and tamper-evident.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <input type="text" placeholder="Filter by action, resource, or user..." value={filter} onChange={e => setFilter(e.target.value)}
            className="w-full max-w-md pl-4 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">Resource</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">User</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase">Blockchain Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400"><div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p>Loading audit logs...</p></td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No audit logs found.</td></tr>
              )}
              {filtered.map((log: any) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${actionColor[log.action] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">{log.resource}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.resourceId || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{log.userEmail || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.userRole || '—'}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={log.blockchainTxHash || ''}>
                    {log.blockchainTxHash ? `${log.blockchainTxHash.substring(0, 10)}...` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          Showing {filtered.length} of {logs.length} records
        </div>
      </div>
    </div>
  );
}
