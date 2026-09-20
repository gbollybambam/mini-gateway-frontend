"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { ArrowLeft, Server, Activity, Power, Settings, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { Spinner, ErrorMessage, useToast } from "@/components/dashboard/ui";

interface PaymentProvider {
  id: string;
  name: string;
  is_active: boolean;
  configuration: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();

  // Configuration Modal State
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [configJson, setConfigJson] = useState("");
  const [configError, setConfigError] = useState("");

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/providers");
      setProviders(res.data.data);
    } catch (err) {
      setError("Failed to load payment providers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const toggleProvider = async (provider: PaymentProvider) => {
    if (isProcessing) return;
    setIsProcessing(provider.id);
    try {
      const res = await api.patch(`/admin/providers/${provider.id}`, {
        is_active: !provider.is_active,
      });
      
      // FIX: Reload all providers from the database to instantly sync 
      // the backend's "Single Active Provider" rule to the UI.
      await loadProviders();
      
      toast.success(`${provider.name} routing has been ${!provider.is_active ? 'enabled' : 'disabled'}.`);
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
    setIsProcessing('config');
    setConfigError("");

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(configJson);
    } catch (err) {
      setConfigError("Invalid JSON format. Please check your syntax.");
      setIsProcessing(null);
      return;
    }

    try {
      const res = await api.patch(`/admin/providers/${selectedProvider.id}`, {
        configuration: parsedConfig,
      });
      setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, configuration: res.data.data.configuration } : p));
      toast.success(`${selectedProvider.name} configuration updated.`);
      setSelectedProvider(null);
    } catch (err) {
      setConfigError(isAxiosError(err) ? err.response?.data?.message : "Failed to save configuration.");
    } finally {
      setIsProcessing(null);
    }
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Provider Management</h1>
          <p className="text-sm text-[#8995a3] mt-1">Configure integrations, routing, and monitor provider health.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md">
          <Server className="h-4 w-4 text-blue-400" />
          <span className="font-medium">{providers.length} Active Nodes</span>
        </div>
      </header>

      {isLoading && !providers.length ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadProviders} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden flex flex-col h-full group">
              
              {/* Status Indicator Halo */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-colors duration-500
                ${provider.is_active ? 'bg-[#35d5a4]' : 'bg-red-500'}`} />

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white capitalize">{provider.name}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`h-2 w-2 rounded-full ${provider.is_active ? 'bg-[#35d5a4] animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">
                        {provider.is_active ? 'Routing Enabled' : 'Routing Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Metrics (Simulated/Static for MVP) */}
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> API Latency
                  </p>
                  <p className="text-sm font-bold text-white">~120ms</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Uptime
                  </p>
                  <p className="text-sm font-bold text-[#35d5a4]">99.99%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
                <button 
                  onClick={() => toggleProvider(provider)}
                  disabled={isProcessing === provider.id}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer
                    ${provider.is_active 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                      : 'bg-[#2f9d78]/10 text-[#35d5a4] border-[#2f9d78]/20 hover:bg-[#2f9d78]/20'} 
                    disabled:opacity-50`}
                >
                  <Power className="h-4 w-4" /> {provider.is_active ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => openConfigModal(provider)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" /> Configure
                </button>
              </div>
            </div>
          ))}
          
          {providers.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#68747e] bg-white/[0.02] border border-white/5 rounded-3xl">
              No payment providers found in the database.
            </div>
          )}
        </div>
      )}

      {/* JSON Configuration Editor Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white capitalize">{selectedProvider.name} Configuration</h2>
                <p className="text-xs text-[#8995a3] mt-1">Modify API keys, webhooks, and routing rules.</p>
              </div>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-[#8995a3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {configError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2 text-red-400 shrink-0">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">{configError}</p>
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Provider Settings (JSON)</label>
              <textarea 
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="w-full flex-1 rounded-xl border border-white/10 bg-[#05080c] p-4 text-sm font-mono text-[#35d5a4] outline-none focus:border-blue-500/50 resize-none shadow-inner"
                spellCheck="false"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5 shrink-0 mt-4">
              <button 
                onClick={() => setSelectedProvider(null)} 
                className="flex-1 py-3 text-sm font-bold text-[#8995a3] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={saveConfiguration} 
                disabled={isProcessing === 'config'} 
                className="flex-1 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProcessing === 'config' ? "Saving..." : "Save Configuration"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}