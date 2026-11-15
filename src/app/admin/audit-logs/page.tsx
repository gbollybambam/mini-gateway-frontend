"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Eye, Shield, Terminal, X } from "@/components/icons";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";
import { PageHeader } from "@/components/dashboard/kit";
import {
  Pagination,
  TABLE,
  TABLE_SHELL,
  TBODY,
  TD,
  TH,
  THEAD,
  TR,
} from "@/components/admin/AdminUI";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  changes: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface ApiResponse {
  data: {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogsData = useCallback(async (pageNum: number) => {
    const res = await api.get<ApiResponse>("/admin/audit-logs", { params: { page: pageNum } });
    return res.data.data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      setIsLoading(true);

      try {
        const data = await fetchLogsData(page);
        if (isMounted) {
          setLogs(data.data || []);
          setMeta({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            total: data.total || 0,
          });
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load system audit logs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadLogs();

    return () => {
      isMounted = false;
    };
  }, [page, retryCount, fetchLogsData]);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));

  const formatTargetType = (type: string) => type.split("\\").pop() || type;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="System"
        title="System audit logs"
        description="Immutable security ledger of all administrative actions."
        action={
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] shadow-sm">
            <Shield size={14} className="text-[#71717A]" aria-hidden="true" />
            {meta?.total || 0} security events
          </span>
        }
      />

      {isLoading && !logs.length ? (
        <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMessage
          message={error}
          retry={() => {
            setPage(1);
            setRetryCount((c) => c + 1);
          }}
        />
      ) : (
        <div className={TABLE_SHELL}>
          <div className="overflow-x-auto">
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th className={TH}>Timestamp</th>
                  <th className={TH}>Action</th>
                  <th className={TH}>Target</th>
                  <th className={TH}>Admin ID & IP</th>
                  <th className={`${TH} text-right`}>Payload</th>
                </tr>
              </thead>
              <tbody className={`${TBODY} font-mono`}>
                {logs.map((log) => (
                  <tr key={log.id} className={TR}>
                    <td className={`${TD} text-[12px] text-[#71717A]`}>{formatDate(log.created_at)}</td>
                    <td className={TD}>
                      <span className="inline-flex items-center rounded-[6px] border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6D28D9]">
                        {log.action}
                      </span>
                    </td>
                    <td className={TD}>
                      <p className="text-[12px] font-semibold text-[#09090B]">{formatTargetType(log.target_type)}</p>
                      <p className="mt-0.5 text-[11px] text-[#A1A1AA]">{log.target_id.substring(0, 8)}…</p>
                    </td>
                    <td className={TD}>
                      <p className="text-[12px] text-[#52525B]">{log.admin_id.substring(0, 8)}…</p>
                      <p className="mt-0.5 text-[11px] text-[#A1A1AA]">{log.ip_address}</p>
                    </td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[7px] border border-[#E5E7EB] bg-white px-3 font-sans text-[11px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F1F1EE]"
                      >
                        <Eye size={13} aria-hidden="true" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center font-sans text-[13px] text-[#71717A]">
                      No administrative actions logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      {/* Raw payload inspection modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4">
              <div className="min-w-0">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                  <Terminal size={12} aria-hidden="true" /> Audit record payload
                </p>
                <h2 className="truncate font-mono text-[13px] font-semibold text-[#09090B]">{selectedLog.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#ECECE9] hover:text-[#09090B]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <div className="custom-scrollbar overflow-auto rounded-[10px] border border-[#27272A] bg-[#0B0B0E] p-4 shadow-inner">
                <pre className="break-all whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-[#E4E4E7]">
                  {JSON.stringify(selectedLog.changes || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#E5E7EB] px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="inline-flex h-10 w-full items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F1F1EE]"
              >
                Close trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
