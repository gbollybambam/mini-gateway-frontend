"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Webhook, Send, RefreshCw, CheckCircle2, XCircle, Terminal, ChevronLeft, ChevronRight,
  RotateCcw, Plus, AlertTriangle,
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/dashboard/ui";
import {
  Banner, EmptyBlock, Field, Modal, PageHeader, Pill, SecretModal, SectionHead,
  btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, tdCls, thCls,
} from "@/components/dashboard/kit";

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
        <tr key={i} className="border-b border-[var(--pm-line)]">
          <td className={tdCls}><div className="pm-skeleton h-5 w-20 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-32 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-12 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-40 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-24 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton ml-auto h-8 w-16 rounded-[8px]" /></td>
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
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookDelivery | null>(null);

  const loadData = useCallback(async (currentPage: number, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [settingsRes, deliveriesRes] = await Promise.all([
        api.get<{ data: WebhookSettings }>("/webhook-settings"),
        api.get<{ data: { data: WebhookDelivery[]; current_page: number; last_page: number } }>(`/webhook-deliveries?page=${currentPage}`),
      ]);
      // Don't clobber the URL the user is typing during silent background refreshes
      setSettings((prev) => ({
        webhook_url: showSpinner ? settingsRes.data.data.webhook_url || "" : prev.webhook_url,
        webhook_secret: settingsRes.data.data.webhook_secret || null,
      }));
      setDeliveries(deliveriesRes.data.data.data);
      setMeta({ current_page: deliveriesRes.data.data.current_page, last_page: deliveriesRes.data.data.last_page });
      if (showSpinner) setError("");
    } catch (err: unknown) {
      if (showSpinner) setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load webhook configuration." : "Failed to load webhook configuration.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void loadData(page, true); }, 0);
    return () => clearTimeout(t);
  }, [loadData, page]);

  useEffect(() => {
    const id = setInterval(() => { void loadData(page, false); }, 10000);
    return () => clearInterval(id);
  }, [loadData, page]);

  const flash = (msg: string, ms = 4000) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), ms); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccessMsg("");
    try {
      await api.put("/webhook-settings", { webhook_url: settings.webhook_url });
      flash("Webhook settings updated successfully.", 3000);
      await loadData(page, false);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to save settings." : "An unexpected error occurred.");
    } finally { setSaving(false); }
  };

  const doRotate = async () => {
    setConfirmRotate(false);
    setRotating(true);
    try {
      const res = await api.post("/settings/webhook-secret/rotate");
      setRevealedSecret(res.data.data.webhook_secret);
      await loadData(page, false);
    } catch { setError("Failed to generate secret."); }
    finally { setRotating(false); }
  };

  const handleRotateSecret = () => {
    if (settings.webhook_secret) setConfirmRotate(true);
    else void doRotate();
  };

  const handleTestPing = async () => {
    setTesting(true); setError("");
    try {
      await api.post("/webhook-settings/test");
      flash("Test ping dispatched! Waiting for response...", 6000);
      setTimeout(() => loadData(page, false), 2000);
      setTimeout(() => loadData(page, false), 4000);
      setTimeout(() => loadData(page, false), 6000);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Test ping failed." : "Failed to dispatch test ping.");
    } finally { setTesting(false); }
  };

  const handleRetry = async (id: number) => {
    try {
      await api.post(`/webhook-deliveries/${id}/retry`);
      flash("Event manually queued for retry.", 4000);
      setTimeout(() => loadData(page, false), 2000);
      setTimeout(() => loadData(page, false), 4000);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to retry delivery." : "Failed to retry delivery.");
    }
  };

  return (
    <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      <PageHeader
        eyebrow="Developers"
        title="Webhooks & Endpoints"
        description="Configure your event notification URL and inspect live delivery logs."
      />

      {successMsg && <Banner tone="success">{successMsg}</Banner>}
      {error && <Banner tone="danger">{error}</Banner>}

      {/* Endpoint config */}
      <section className={`${cardCls} overflow-hidden`}>
        <SectionHead icon={<Webhook className="h-4 w-4" />} title="Endpoint Configuration" subtitle="Where we send HTTP POST events" />
        <form onSubmit={handleSave} className="space-y-6 p-5 sm:p-6">
          <Field label="Webhook destination URL">
            <input
              type="url"
              value={settings.webhook_url || ""}
              onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/gateway"
              className={inputCls}
            />
          </Field>

          <Field
            label="HMAC signature secret"
            right={
              <button type="button" onClick={handleRotateSecret} disabled={rotating} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#52525B] transition-colors hover:text-[#09090B] disabled:opacity-50">
                {rotating ? <Spinner /> : settings.webhook_secret ? <RotateCcw className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {settings.webhook_secret ? "Rotate secret" : "Generate secret"}
              </button>
            }
            hint={<>Verify incoming requests using the <code className="rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-band-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[#09090B]">x-gateway-signature</code> header (SHA-256 HMAC).</>}
          >
            {settings.webhook_secret ? (
              <input readOnly value={settings.webhook_secret} className={`${inputCls} font-mono text-[12px]`} disabled />
            ) : (
              <div className="flex h-10 w-full items-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-[var(--pm-band)] px-3.5 text-[13px] text-[#71717A]">
                No secret generated yet. Click &quot;Generate secret&quot; to create one.
              </div>
            )}
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--pm-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" disabled={testing || !settings.webhook_url} onClick={handleTestPing} className={btnSecondary}>
              {testing ? <Spinner /> : <Send className="h-4 w-4" />} Send test ping
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? <Spinner /> : "Save configuration"}
            </button>
          </div>
        </form>
      </section>

      {/* Deliveries */}
      <section className={`${cardCls} relative overflow-hidden`}>
        {loading && deliveries.length > 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[1px]"><Spinner /></div>
        )}
        <SectionHead
          icon={<Terminal className="h-4 w-4" />}
          title="Event Delivery History"
          subtitle="Inspect recent webhook delivery attempts · auto-refreshes"
          right={
            <button type="button" onClick={() => void loadData(page, true)} title="Refresh logs" aria-label="Refresh logs" className="grid size-9 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white text-[#71717A] shadow-sm transition-colors hover:bg-[var(--pm-band)] hover:text-[#09090B]">
              <RefreshCw className="h-4 w-4" />
            </button>
          }
        />

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full whitespace-nowrap border-collapse text-left">
            <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
              <tr>
                <th className={thCls}>Status</th>
                <th className={thCls}>Event</th>
                <th className={thCls}>HTTP</th>
                <th className={`${thCls} hidden md:table-cell`}>Target URL</th>
                <th className={`${thCls} hidden sm:table-cell`}>Timestamp</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading && !deliveries.length ? (
                <DeliverySkeleton />
              ) : deliveries.length === 0 ? (
                <tr><td colSpan={6}><EmptyBlock icon={<Webhook className="h-6 w-6" />} title="No delivery logs yet" description="Trigger events or send a test ping to see deliveries here." /></td></tr>
              ) : (
                deliveries.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedLog(item)} className="cursor-pointer border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band)]">
                    <td className={tdCls}>
                      {item.is_successful
                        ? <Pill tone="success" dot={false}><CheckCircle2 className="h-3 w-3" /> Success</Pill>
                        : <Pill tone="danger" dot={false}><XCircle className="h-3 w-3" /> Failed</Pill>}
                    </td>
                    <td className={`${tdCls} font-mono text-[12.5px] font-medium`}>{item.event}</td>
                    <td className={`${tdCls} font-mono text-[12.5px] ${item.is_successful ? "text-[#52525B]" : "text-[#DC2626]"}`}>{item.response_status || "ERR"}</td>
                    <td className={`${tdCls} hidden max-w-xs truncate font-mono text-[12px] text-[#71717A] md:table-cell`}>{item.target_url}</td>
                    <td className={`${tdCls} hidden text-[13px] text-[#52525B] sm:table-cell`}>{formatDate(item.created_at)}</td>
                    <td className={`${tdCls} text-right`} onClick={(e) => e.stopPropagation()}>
                      {!item.is_successful ? (
                        <button type="button" onClick={() => handleRetry(item.id)} className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[var(--pm-line)] bg-white px-3 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band)]">
                          <RotateCcw className="h-3.5 w-3.5" /> Retry
                        </button>
                      ) : (
                        <button type="button" onClick={() => setSelectedLog(item)} className="inline-flex h-8 items-center rounded-[8px] px-3 text-[12px] font-medium text-[#52525B] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]">Inspect</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--pm-line)] bg-white px-4 py-3.5 sm:px-6">
            <p className="text-[12px] font-medium text-[#71717A]">
              Page <span className="font-bold text-[#09090B]">{meta.current_page}</span> of <span className="font-bold text-[#09090B]">{meta.last_page}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={meta.current_page === 1} onClick={() => { setLoading(true); setPage((p) => p - 1); }} aria-label="Previous page" className="grid size-8 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white shadow-sm transition-colors hover:bg-[var(--pm-band)] disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={meta.current_page === meta.last_page} onClick={() => { setLoading(true); setPage((p) => p + 1); }} aria-label="Next page" className="grid size-8 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white shadow-sm transition-colors hover:bg-[var(--pm-band)] disabled:cursor-not-allowed disabled:opacity-50"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        )}
      </section>

      {/* Secret reveal */}
      <SecretModal
        open={!!revealedSecret}
        onClose={() => setRevealedSecret(null)}
        title="Save your webhook secret"
        subtitle="HMAC signature verification"
        label="New webhook secret"
        value={revealedSecret ?? ""}
        warning="You won't be able to view this secret again after closing this dialog. If you lose it, you'll need to generate a new one."
        confirmLabel="I have securely saved my secret"
      />

      {/* Rotate confirm */}
      <Modal
        open={confirmRotate}
        onClose={() => setConfirmRotate(false)}
        title="Rotate webhook secret?"
        icon={<AlertTriangle className="h-5 w-5" />}
        tone="danger"
        footer={
          <>
            <button type="button" onClick={() => setConfirmRotate(false)} className={btnSecondary}>Cancel</button>
            <button type="button" onClick={doRotate} className={btnDanger}>Rotate secret</button>
          </>
        }
      >
        <p className="text-[13px] leading-[1.6] text-[#52525B]">
          Any server using the old secret will immediately fail to verify new events until you update it.
        </p>
      </Modal>

      {/* Inspector */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Delivery #${selectedLog.id}` : ""}
        subtitle={selectedLog ? `${selectedLog.event} → ${selectedLog.target_url}` : undefined}
        icon={<Terminal className="h-5 w-5" />}
        size="xl"
        footer={<button type="button" onClick={() => setSelectedLog(null)} className={btnSecondary}>Close inspector</button>}
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {selectedLog.is_successful ? <Pill tone="success">Success</Pill> : <Pill tone="danger">Failed</Pill>}
              <Pill tone="neutral" dot={false}>HTTP {selectedLog.response_status || "ERR"}</Pill>
              <span className="text-[12px] text-[#71717A]">{formatDate(selectedLog.created_at)}</span>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Request payload</p>
              <pre className="custom-scrollbar max-h-64 overflow-auto rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-4 font-mono text-[12px] leading-[1.6] text-[#52525B]">{JSON.stringify(selectedLog.payload, null, 2)}</pre>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Target response ({selectedLog.response_status || "Failed"})</p>
              <pre className="custom-scrollbar max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-4 font-mono text-[12px] leading-[1.6] text-[#52525B]">{selectedLog.response_body || "No response body recorded."}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}