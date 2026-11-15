"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Activity, AlertTriangle, Power, Server, Settings, ShieldCheck, X } from "@/components/icons";
import { Spinner, ErrorMessage, useToast } from "@/components/dashboard/ui";
import { btnPrimary, btnSecondary, PageHeader } from "@/components/dashboard/kit";

interface PaymentProvider {
  id: string;
  name: string;
  is_active: boolean;
  configuration: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const LINE = "border-[#E5E7EB]";
const BAND = "bg-[#F8F8F6]";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [configJson, setConfigJson] = useState("");
  const [configError, setConfigError] = useState("");

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get<{ data: PaymentProvider[] }>("/admin/providers");
      setProviders(res.data.data);
    } catch {
      setError("Failed to load payment providers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchIt = async () => {
      await loadProviders();
    };
    void fetchIt();
  }, [loadProviders]);

  const toggleProvider = async (provider: PaymentProvider) => {
    if (isProcessing) return;
    setIsProcessing(provider.id);
    try {
      await api.patch(`/admin/providers/${provider.id}`, {
        is_active: !provider.is_active,
      });

      await loadProviders();
      toast.success(`${provider.name} routing has been ${!provider.is_active ? "enabled" : "disabled"}.`);
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message : "Failed to toggle provider.");
    } finally {
      setIsProcessing(null);
    }
  };

  const openConfigModal = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setConfigJson(JSON.stringify(provider.configuration || {}, null, 2));
    setConfigError("");
  };

  const saveConfiguration = async () => {
    if (!selectedProvider) return;
    setIsProcessing("config");
    setConfigError("");

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(configJson);
    } catch {
      setConfigError("Invalid JSON format. Please check your syntax.");
      setIsProcessing(null);
      return;
    }

    try {
      const res = await api.patch<{ data: PaymentProvider }>(`/admin/providers/${selectedProvider.id}`, {
        configuration: parsedConfig,
      });
      setProviders((prev) =>
        prev.map((p) => (p.id === selectedProvider.id ? { ...p, configuration: res.data.data.configuration } : p))
      );
      toast.success(`${selectedProvider.name} configuration updated.`);
      setSelectedProvider(null);
    } catch (err) {
      setConfigError(isAxiosError(err) ? err.response?.data?.message : "Failed to save configuration.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="System"
        title="Provider management"
        description="Configure integrations, routing, and monitor provider health."
        action={
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] shadow-sm">
            <Server size={14} className="text-[#71717A]" aria-hidden="true" />
            {providers.length} nodes
          </span>
        }
      />

      {isLoading && !providers.length ? (
        <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadProviders} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`flex h-full flex-col overflow-hidden rounded-[12px] border ${LINE} bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-[0_10px_24px_-16px_rgba(9,9,11,0.25)]`}
            >
              <div className={`flex items-start justify-between gap-3 border-b ${LINE} ${BAND} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-[9px] border ${LINE} bg-white text-[#52525B] shadow-sm`}>
                    <Server size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold capitalize tracking-tight text-[#09090B]">
                      {provider.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          provider.is_active ? "bg-[#10B981]" : "bg-[#A1A1AA]"
                        }`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                        {provider.is_active ? "Routing enabled" : "Routing disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    provider.is_active
                      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]"
                      : "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]"
                  }`}
                >
                  {provider.is_active ? "Live" : "Off"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <div className={`rounded-[9px] border ${LINE} ${BAND} px-3 py-2.5`}>
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                    <Activity size={11} aria-hidden="true" /> Latency
                  </p>
                  <p className="text-[13px] font-semibold text-[#09090B]">~120ms</p>
                </div>
                <div className={`rounded-[9px] border ${LINE} ${BAND} px-3 py-2.5`}>
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                    <ShieldCheck size={11} aria-hidden="true" /> Uptime
                  </p>
                  <p className="text-[13px] font-semibold text-[#047857]">99.99%</p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-[#E5E7EB] px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleProvider(provider)}
                  disabled={isProcessing === provider.id}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border text-[12px] font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    provider.is_active
                      ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                      : "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]"
                  }`}
                >
                  {isProcessing === provider.id ? (
                    <Spinner />
                  ) : (
                    <>
                      <Power size={14} aria-hidden="true" />
                      {provider.is_active ? "Disable" : "Enable"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openConfigModal(provider)}
                  className={`${btnSecondary} h-9 text-[12px]`}
                >
                  <Settings size={14} aria-hidden="true" /> Configure
                </button>
              </div>
            </div>
          ))}

          {providers.length === 0 && (
            <div className={`col-span-full rounded-[12px] border ${LINE} bg-white py-14 text-center text-[13px] text-[#71717A] shadow-sm`}>
              No payment providers found in the database.
            </div>
          )}
        </div>
      )}

      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Provider settings</p>
                <h2 className="mt-0.5 text-[16px] font-semibold capitalize tracking-tight text-[#09090B]">
                  {selectedProvider.name} configuration
                </h2>
                <p className="mt-0.5 text-[12px] text-[#71717A]">Modify API keys, webhooks and routing rules.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                aria-label="Close"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#ECECE9] hover:text-[#09090B]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-[280px] flex-1 flex-col overflow-hidden p-5">
              {configError && (
                <div className="mb-4 flex shrink-0 items-start gap-2 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#DC2626]">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-[12px] font-medium leading-relaxed">{configError}</p>
                </div>
              )}

              <label className="mb-2 block shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                Configuration JSON
              </label>
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="custom-scrollbar w-full flex-1 resize-none rounded-[10px] border border-[#27272A] bg-[#0B0B0E] p-4 font-mono text-[12px] leading-[1.7] text-[#E4E4E7] shadow-inner outline-none transition-colors focus:border-[#3F3F46]"
                spellCheck="false"
              />
            </div>

            <div className="flex shrink-0 gap-2.5 border-t border-[#E5E7EB] px-5 py-4">
              <button type="button" onClick={() => setSelectedProvider(null)} className={`${btnSecondary} flex-1`}>
                Cancel
              </button>
              <button
                type="button"
                onClick={saveConfiguration}
                disabled={isProcessing === "config"}
                className={`${btnPrimary} flex-1`}
              >
                {isProcessing === "config" ? <Spinner /> : "Save configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
