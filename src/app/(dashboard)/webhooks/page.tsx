"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Webhook, Send, RefreshCw, CheckCircle2, XCircle, 
  Copy, Check, ShieldCheck, Terminal, AlertCircle, ChevronLeft, ChevronRight,
  RotateCcw, X, Plus
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/dashboard/ui";

interface WebhookSettings {
  webhook_url: string | null;
  webhook_secret: string | null;
}

interface WebhookDelivery {
  id: number;
  event: string;
  target_url: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  is_successful: boolean;
  created_at: string;
}

const formatDate = (value: string) => 
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));

function DeliverySkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-line">
          <td className="px-6 py-5"><div className="h-5 w-16 bg-surface-muted rounded-full" /></td>
          <td className="px-6 py-5"><div className="h-4 w-32 bg-surface-muted rounded-full" /></td>
          <td className="px-6 py-5"><div className="h-4 w-12 bg-surface-muted rounded-full" /></td>
          <td className="px-6 py-5"><div className="h-4 w-40 bg-surface-muted rounded-full" /></td>
          <td className="px-6 py-5"><div className="h-4 w-24 bg-surface-muted rounded-full" /></td>
          <td className="px-6 py-5"><div className="h-8 w-16 bg-surface-muted rounded-input ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function WebhooksPage() {
  const [settings, setSettings] = useState<WebhookSettings>({ webhook_url: "", webhook_secret: "" });
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number } | null>(null);
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookDelivery | null>(null);

  // Added showSpinner toggle for silent background polling
  const loadData = useCallback(async (currentPage: number, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [settingsRes, deliveriesRes] = await Promise.all([
        api.get<{ data: WebhookSettings }>("/webhook-settings"),
        api.get<{ data: { data: WebhookDelivery[]; current_page: number; last_page: number } }>(`/webhook-deliveries?page=${currentPage}`)
      ]);

      setSettings({
        webhook_url: settingsRes.data.data.webhook_url || "",
        webhook_secret: settingsRes.data.data.webhook_secret || null,
      });
      setDeliveries(deliveriesRes.data.data.data);
      setMeta({
        current_page: deliveriesRes.data.data.current_page,
        last_page: deliveriesRes.data.data.last_page,
      });
      setError("");
    } catch (err: unknown) {
      if (showSpinner) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load webhook configuration.");
        } else {
          setError("Failed to load webhook configuration.");
        }
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData(page, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, page]);

  // Silent background polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void loadData(page, false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData, page]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.put("/webhook-settings", { webhook_url: settings.webhook_url });
      setSuccessMsg("Webhook settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData(page, false);
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

  const handleRotateSecret = async () => {
    if (settings.webhook_secret) {
      if (!confirm("Are you sure you want to rotate your webhook secret? Any servers using the old secret will instantly fail to verify new events.")) return;
    }
    
    setRotating(true);
    try {
      const res = await api.post("/settings/webhook-secret/rotate");
      setRevealedSecret(res.data.data.webhook_secret);
      await loadData(page, false);
    } catch {
      setError("Failed to generate secret.");
    } finally {
      setRotating(false);
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    setError("");
    try {
      await api.post("/webhook-settings/test");
      setSuccessMsg("Test ping dispatched! Waiting for response...");
      
      // Auto-poll rapidly to catch the queue worker's result
      setTimeout(() => loadData(page, false), 2000);
      setTimeout(() => loadData(page, false), 4000);
      setTimeout(() => {
        loadData(page, false);
        setSuccessMsg("");
      }, 6000);
      
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
      setSuccessMsg("Event manually queued for retry.");
      
      // Auto-poll to catch the retry result
      setTimeout(() => loadData(page, false), 2000);
      setTimeout(() => {
        loadData(page, false);
        setSuccessMsg("");
      }, 4000);
      
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const copySecret = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Developers</p>
          <h1 className="text-2xl font-bold text-ink drop-shadow-sm mt-1">Webhooks & Endpoints</h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure your event notification URL and inspect live delivery logs.
          </p>
        </div>
      </header>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-input bg-success-tint border border-line p-4 text-xs text-success font-medium animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-input bg-danger-tint border border-line p-4 text-xs text-danger font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section className="rounded-card border border-line bg-surface backdrop-blur-xl shadow-card p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-input bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Webhook className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Endpoint Configuration</h2>
              <p className="text-xs text-ink-muted">Where we send HTTP POST events</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Webhook Destination URL</label>
            <input
              type="url"
              value={settings.webhook_url || ""}
              onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/gateway"
              className="w-full h-11 rounded-input border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-brand-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">HMAC Signature Secret</label>
              <button 
                type="button" 
                onClick={handleRotateSecret}
                disabled={rotating}
                className="text-[10px] font-bold text-pending hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                {rotating ? <Spinner /> : settings.webhook_secret ? <RotateCcw className="h-3 w-3" /> : <Plus className="h-3 w-3" />} 
                {settings.webhook_secret ? "Rotate Secret" : "Generate Secret"}
              </button>
            </div>
            
            {settings.webhook_secret ? (
              <input
                readOnly
                value={settings.webhook_secret}
                className="w-full h-11 rounded-input border border-line bg-surface/50 px-4 font-mono text-xs text-ink-muted outline-none cursor-not-allowed shadow-inner"
              />
            ) : (
              <div className="flex h-11 w-full items-center rounded-input border border-line bg-surface-muted px-4 text-xs italic text-ink-muted shadow-inner">
                No secret generated yet. Click &quot;Generate Secret&quot; to create one.
              </div>
            )}
            <p className="text-[11px] text-ink-muted mt-1">
              Verify incoming requests using the <code className="text-brand-500 font-mono">x-gateway-signature</code> (SHA-256 hash).
            </p>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={testing || !settings.webhook_url}
              onClick={handleTestPing}
              className="flex items-center gap-2 rounded-input bg-surface-muted hover:bg-surface-muted border border-line px-5 py-2.5 text-xs font-bold text-ink transition-all disabled:opacity-50"
            >
              {testing ? <Spinner /> : <Send className="h-3.5 w-3.5" />} Send Test Ping
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-input bg-brand-500 px-6 py-2.5 text-xs font-bold text-ink transition-all hover:brightness-110 shadow-card disabled:opacity-50 border border-line"
            >
              {saving ? <Spinner /> : "Save Configuration"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface backdrop-blur-xl shadow-card overflow-hidden flex flex-col relative">
        {loading && deliveries.length > 0 && (
          <div className="absolute inset-0 bg-bg/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
             <Spinner />
          </div>
        )}
        
        <div className="flex items-center justify-between border-b border-line p-6 bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-input bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Event Delivery History</h2>
              <p className="text-xs text-ink-muted">Inspect recent webhook delivery attempts</p>
            </div>
          </div>
          <button
            onClick={() => { setLoading(true); void loadData(page, true); }}
            className="rounded-input p-2 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Event</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">HTTP Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Target URL</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && !deliveries.length ? (
                <DeliverySkeleton />
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Webhook className="h-8 w-8 text-ink-muted mb-3" />
                      <h3 className="text-sm font-bold text-ink">No delivery logs yet</h3>
                      <p className="text-xs text-ink-muted mt-1">Trigger events or send a test ping to view deliveries.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                deliveries.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedLog(item)}
                    className="transition-colors hover:bg-surface-muted cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      {item.is_successful ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint border border-line px-2.5 py-0.5 text-[10px] font-bold text-brand-500">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-tint border border-line px-2.5 py-0.5 text-[10px] font-bold text-danger">
                          <XCircle className="h-3 w-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-ink text-xs">{item.event}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted">{item.response_status || "ERR"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted max-w-xs truncate">{item.target_url}</td>
                    <td className="px-6 py-4 text-xs text-ink-muted">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {!item.is_successful && (
                          <button
                            onClick={() => handleRetry(item.id)}
                            title="Retry webhook"
                            className="rounded-input px-3 py-1.5 bg-surface-muted hover:bg-surface-muted border border-line text-xs font-bold text-ink transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-line px-6 py-4 bg-surface">
            <p className="text-xs text-ink-muted">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => { setLoading(true); setPage(p => p - 1); }}
                className="px-3 py-1 rounded-input border border-line bg-surface-muted text-xs text-ink disabled:opacity-50 transition-colors hover:bg-surface-muted"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => { setLoading(true); setPage(p => p + 1); }}
                className="px-3 py-1 rounded-input border border-line bg-surface-muted text-xs text-ink disabled:opacity-50 transition-colors hover:bg-surface-muted"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MODAL: ONE-TIME SECRET REVEAL */}
      {revealedSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-card border border-amber-500/30 bg-surface shadow-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-line bg-amber-500/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-input bg-surface-muted border border-line text-pending">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Save Your Webhook Secret</h3>
                  <p className="text-xs text-pending/80">HMAC Signature Verification</p>
                </div>
              </div>
              <button onClick={() => setRevealedSecret(null)} className="rounded-full p-2 text-ink-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-input border border-line bg-danger-tint p-4 text-xs text-red-200/90 leading-relaxed shadow-inner">
                <strong className="text-danger block mb-1 text-sm">Please copy your secret key now.</strong>
                For your security, you will not be able to view this secret again once this dialog is closed. If you lose it, you will need to generate a new one.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">New Webhook Secret</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={revealedSecret}
                    className="w-full h-12 rounded-input border border-line bg-bg px-4 font-mono text-xs sm:text-sm text-ink selection:bg-pending outline-none shadow-inner"
                  />
                  <button
                    onClick={() => copySecret(revealedSecret)}
                    className="h-12 px-4 rounded-input bg-pending hover:bg-pending text-ink font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-card"
                  >
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedSecret ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-line">
                <button
                  onClick={() => setRevealedSecret(null)}
                  className="w-full h-11 rounded-input bg-surface-muted hover:bg-surface-muted text-xs font-bold text-ink transition-colors"
                >
                  I have securely saved my secret
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT PAYLOAD */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-card border border-line bg-surface shadow-card overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-line bg-surface p-6">
              <div>
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  Webhook Delivery #{selectedLog.id}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{selectedLog.event}</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">Target: {selectedLog.target_url}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-full p-2 text-ink-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Request Payload</p>
                <pre className="rounded-input bg-bg border border-line p-4 font-mono text-xs text-ink-muted overflow-x-auto shadow-inner">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Target Response ({selectedLog.response_status || "Failed"})</p>
                <pre className="rounded-input bg-bg border border-line p-4 font-mono text-xs text-ink-muted overflow-x-auto shadow-inner whitespace-pre-wrap break-all">
                  {selectedLog.response_body || "No response body recorded."}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-line bg-surface flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 rounded-input bg-surface-muted hover:bg-surface-muted text-xs font-bold text-ink transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}