"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Webhook, Send, RefreshCw, CheckCircle2, XCircle, 
  Copy, Check, ShieldCheck, Terminal, AlertCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

interface WebhookSettings {
  webhook_url: string | null;
  webhook_secret: string | null;
}

interface WebhookDelivery {
  id: number;
  event: string;
  target_url: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  is_successful: boolean;
  created_at: string;
}

const formatDate = (value: string) => 
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));

export default function WebhooksPage() {
  const [settings, setSettings] = useState<WebhookSettings>({ webhook_url: "", webhook_secret: "" });
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number } | null>(null);
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Selected delivery for payload inspection modal
  const [selectedLog, setSelectedLog] = useState<WebhookDelivery | null>(null);

  const loadData = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError("");
    try {
      const [settingsRes, deliveriesRes] = await Promise.all([
        api.get<{ data: WebhookSettings }>("/webhook-settings"),
        api.get<{ data: { data: WebhookDelivery[]; current_page: number; last_page: number } }>(`/webhook-deliveries?page=${currentPage}`)
      ]);

      setSettings({
        webhook_url: settingsRes.data.data.webhook_url || "",
        webhook_secret: settingsRes.data.data.webhook_secret || "",
      });
      setDeliveries(deliveriesRes.data.data.data);
      setMeta({
        current_page: deliveriesRes.data.data.current_page,
        last_page: deliveriesRes.data.data.last_page,
      });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load webhook configuration.");
      } else {
        setError("Failed to load webhook configuration.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData(page);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData, page]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.put("/webhook-settings", settings);
      setSuccessMsg("Webhook settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save settings.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    setError("");
    try {
      await api.post("/webhook-settings/test");
      setSuccessMsg("Test ping dispatched! Check your logs below.");
      setTimeout(() => setSuccessMsg(""), 4000);
      await loadData(1);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Test ping failed.");
      } else {
        setError("Failed to dispatch test ping.");
      }
    } finally {
      setTesting(false);
    }
  };

  const handleRetry = async (id: number) => {
    try {
      await api.post(`/webhook-deliveries/${id}/retry`);
      await loadData(page);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const copySecret = async () => {
    if (!settings.webhook_secret) return;
    await navigator.clipboard.writeText(settings.webhook_secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Developers</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Webhooks & Endpoints</h1>
          <p className="text-xs text-[#8995a3] mt-1">
            Configure your event notification URL and inspect live delivery logs.
          </p>
        </div>
      </header>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Configuration Card */}
      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Webhook className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Endpoint Configuration</h2>
            <p className="text-xs text-[#8995a3]">Where we send HTTP POST events</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Webhook Destination URL</label>
            <input
              type="url"
              value={settings.webhook_url || ""}
              onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/gateway"
              className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white placeholder:text-[#68747e] outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">HMAC Signature Secret</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={settings.webhook_secret || "Generating..."}
                className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 font-mono text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={copySecret}
                className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 shrink-0 transition-colors"
              >
                {copiedSecret ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedSecret ? "Copied" : "Copy Secret"}
              </button>
            </div>
            <p className="text-[11px] text-[#8995a3] mt-1">
              Verify incoming requests using the <code className="text-purple-400 font-mono">x-gateway-signature</code> (SHA-256 hash).
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={testing || !settings.webhook_url}
              onClick={handleTestPing}
              className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50"
            >
              {testing ? <Spinner /> : <Send className="h-3.5 w-3.5" />} Send Test Ping
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50"
            >
              {saving ? <Spinner /> : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Delivery Logs Section */}
      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Event Delivery History</h2>
              <p className="text-xs text-[#8995a3]">Inspect recent webhook delivery attempts</p>
            </div>
          </div>
          <button
            onClick={() => loadData(page)}
            className="rounded-lg p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Webhook className="h-8 w-8 text-[#68747e] mb-3" />
            <h3 className="text-sm font-bold text-white">No delivery logs yet</h3>
            <p className="text-xs text-[#8995a3] mt-1">Trigger events or send a test ping to view deliveries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/1 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Event</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">HTTP Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Target URL</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deliveries.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedLog(item)}
                    className="transition-colors hover:bg-white/3 cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      {item.is_successful ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                          <XCircle className="h-3 w-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-xs">{item.event}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8995a3]">{item.response_status || "ERR"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8995a3] max-w-xs truncate">{item.target_url}</td>
                    <td className="px-6 py-4 text-xs text-[#8995a3]">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRetry(item.id)}
                          title="Retry webhook"
                          className="rounded-lg px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/1">
            <p className="text-xs text-[#8995a3]">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs text-white disabled:opacity-50"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Inspect Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Webhook Delivery #{selectedLog.id}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{selectedLog.event}</span>
                </h3>
                <p className="text-xs text-[#8995a3] mt-0.5">Target: {selectedLog.target_url}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-full p-2 text-[#8995a3] hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2">Request Payload</p>
                <pre className="rounded-xl bg-[#070b10] border border-white/5 p-4 font-mono text-xs text-purple-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2">Response ({selectedLog.response_status || "Failed"})</p>
                <pre className="rounded-xl bg-[#070b10] border border-white/5 p-4 font-mono text-xs text-[#8995a3] overflow-x-auto">
                  {selectedLog.response_body || "No response body recorded."}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/1 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}