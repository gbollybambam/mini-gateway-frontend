"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, Shield, Search, ChevronLeft, ChevronRight, Eye, X, Terminal } from "lucide-react";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  changes: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/audit-logs", { params: { page } });
      const data = res.data.data;
      setLogs(data.data || data);
      setMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (err) {
      setError("Failed to load system audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));
  };

  const formatTargetType = (type: string) => {
    return type.split('\\').pop() || type;
  };

  return (
    <div className="space-y-6">
      
      {/* Back Navigation */}
      <div className="mb-2">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-[#8995a3] mt-1">Immutable security ledger of all administrative actions.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md">
          <Shield className="h-4 w-4 text-purple-400" />
          <span className="font-medium">{meta?.total || 0} Security Events</span>
        </div>
      </header>

      {isLoading && !logs.length ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadLogs} />
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Action</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Target</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Admin ID & IP</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-white/[0.04]">
                    <td className="px-6 py-4 text-[#8995a3]">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-purple-500/10 px-2 py-1 font-bold text-purple-400 border border-purple-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{formatTargetType(log.target_type)}</p>
                      <p className="text-[#68747e] mt-0.5">{log.target_id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#e8edf2]">{log.admin_id.substring(0, 8)}...</p>
                      <p className="text-[#68747e] mt-0.5">{log.ip_address}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#68747e] font-sans text-sm">
                      No administrative actions logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
              <p className="text-xs font-medium text-[#8995a3]">Page <span className="text-white font-bold">{meta.current_page}</span> of {meta.last_page}</p>
              <div className="flex items-center gap-2">
                <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] flex items-center gap-1 mb-1">
                  <Terminal className="h-3 w-3" /> Audit Record Payload
                </p>
                <h2 className="text-lg font-bold text-white break-all">{selectedLog.id}</h2>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-[#8995a3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#05080c] rounded-xl border border-white/10 p-4 shadow-inner">
              <pre className="text-xs font-mono text-[#35d5a4] leading-relaxed break-all whitespace-pre-wrap">
                {JSON.stringify(selectedLog.changes || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 shrink-0">
              <button 
                onClick={() => setSelectedLog(null)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}