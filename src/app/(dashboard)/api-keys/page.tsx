"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Key, Plus, Copy, Check, RotateCcw, Trash2, 
  ShieldAlert, AlertTriangle, X, Terminal, ShieldCheck, Eye, EyeOff 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

interface ApiKey {
  id: string;
  name: string;
  environment: "test" | "live";
  key: string; // Masked key
  plain_text_key?: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { 
    month: "short", day: "numeric", year: "numeric", 
    hour: "2-digit", minute: "2-digit" 
  }).format(new Date(value));
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "test" | "live">("all");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEnv, setCreateEnv] = useState<"test" | "live">("test");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // One-time / Revealed Secret Key Modal
  const [revealedKey, setRevealedKey] = useState<{ name: string; key: string; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  // Confirm Action Modal
  const [confirmAction, setConfirmAction] = useState<{ 
    type: "rotate" | "revoke"; 
    id: string; 
    name: string 
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ status: string; data: ApiKey[] }>("/api-keys");
      setKeys(res.data.data);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load API keys.");
      } else {
        setError("Failed to load API keys.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadKeys();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await api.post<{ 
        status: string; 
        data: ApiKey & { plain_text_key: string } 
      }>("/api-keys", {
        name: createName,
        environment: createEnv,
      });

      setIsCreateOpen(false);
      setCreateName("");
      
      const rawKey = res.data.data.plain_text_key;
      setRevealedKey({ 
        name: res.data.data.name, 
        key: rawKey,
        isNew: true 
      });
      await loadKeys();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setCreateError(err.response?.data?.message || "Failed to create API key.");
      } else {
        setCreateError("An unexpected error occurred.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    setActionError("");

    try {
      if (confirmAction.type === "rotate") {
        const res = await api.post<{ 
          status: string; 
          data: ApiKey & { plain_text_key: string } 
        }>(`/api-keys/${confirmAction.id}/rotate`);

        setConfirmAction(null);
        setRevealedKey({ 
          name: res.data.data.name, 
          key: res.data.data.plain_text_key,
          isNew: true 
        });
      } else {
        await api.delete(`/api-keys/${confirmAction.id}`);
        setConfirmAction(null);
      }
      await loadKeys();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setActionError(err.response?.data?.message || "Action failed.");
      } else {
        setActionError("An unexpected error occurred.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredKeys = keys.filter(k => {
    if (filter === "all") return true;
    return k.environment.toLowerCase() === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Developers</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">API Keys</h1>
          <p className="text-xs text-[#8995a3] mt-1">
            Authenticate server-to-server requests using your secret API keys.
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError("");
            setCreateName("");
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:brightness-110 border border-white/10"
        >
          <Plus className="h-4 w-4" /> Generate Secret Key
        </button>
      </header>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-200/90 text-xs leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-bold text-amber-300">Security Guidelines</p>
          <p className="mt-0.5 text-amber-200/80">
            Test mode keys can be viewed anytime for developer convenience. Live mode secret keys are displayed only once upon generation.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 p-6 bg-white/1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Active Credentials</h2>
              <p className="text-xs text-[#8995a3]">Manage and rotate merchant API keys</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[#0a0f16] p-1 border border-white/10 self-start sm:self-auto">
            {(["all", "test", "live"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f ? "bg-purple-600 text-white shadow-sm" : "text-[#8995a3] hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-purple-400 bg-purple-500/10 px-6 py-3 rounded-full border border-purple-500/20 font-medium text-sm">
              <Spinner /> Loading API keys...
            </div>
          </div>
        ) : error ? (
          <ErrorMessage message={error} retry={loadKeys} />
        ) : filteredKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <Key className="h-6 w-6 text-[#68747e]" />
            </div>
            <h3 className="text-base font-bold text-white">No API keys found</h3>
            <p className="mt-1 text-xs text-[#8995a3] max-w-sm">
              Generate a secret API key to start integrating the payment gateway API.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/1 border-b border-white/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Secret Key Token</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Environment</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Last Used</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Created</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKeys.map((item) => {
                  const isRevoked = Boolean(item.revoked_at);
                  const isLive = item.environment.toLowerCase() === "live";

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-white/2">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{item.name}</span>
                          {isRevoked && (
                            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400 border border-red-500/20">
                              Revoked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 font-mono text-xs text-[#8995a3] bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                          <Terminal className="h-3.5 w-3.5 text-purple-400" />
                          <span>{item.key}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isLive 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {item.environment}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-[#8995a3]">
                        {formatDate(item.last_used_at)}
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-[#8995a3]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        {!isRevoked ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Test keys can be viewed/revealed anytime for testing convenience */}
                            {!isLive && item.plain_text_key && (
                              <button
                                onClick={() => setRevealedKey({ name: item.name, key: item.plain_text_key!, isNew: false })}
                                title="View Key"
                                className="rounded-lg p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmAction({ type: "rotate", id: item.id, name: item.name })}
                              title="Rotate Key"
                              className="rounded-lg p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: "revoke", id: item.id, name: item.name })}
                              title="Revoke Key"
                              className="rounded-lg p-2 text-[#8995a3] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#68747e] italic">Inactive</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal: Generate New Key */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generate Secret Key</h3>
                  <p className="text-xs text-[#8995a3]">Create credentials for API access</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-[#8995a3] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {createError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p>{createError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Key Identifier / Name</label>
                <input
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Backend Production Server"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateEnv("test")}
                    className={`h-11 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                      createEnv === "test" ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-white/5 bg-[#0a0f16] text-[#8995a3]"
                    }`}
                  >
                    Test Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateEnv("live")}
                    className={`h-11 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                      createEnv === "live" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-white/5 bg-[#0a0f16] text-[#8995a3]"
                    }`}
                  >
                    Live Mode
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-1/2 h-11 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="w-1/2 h-11 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                >
                  {creating ? <Spinner /> : "Create Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Secret Key Reveal (New or Test View) */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {revealedKey.isNew ? "Save Your Secret Key" : "View API Key"}
                  </h3>
                  <p className="text-xs text-emerald-400/80">{revealedKey.name}</p>
                </div>
              </div>
              <button onClick={() => setRevealedKey(null)} className="rounded-full p-2 text-[#8995a3] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {revealedKey.isNew && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5">Please copy your secret key now.</strong>
                  For live keys, you will not be able to view this full key again once closed.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">API Secret Key</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={revealedKey.key}
                    className="w-full h-12 rounded-xl border border-white/10 bg-[#070b10] px-4 font-mono text-xs text-white selection:bg-purple-600 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(revealedKey.key)}
                    className="h-12 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={() => setRevealedKey(null)}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation Dialog (Revoke / Rotate) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                confirmAction.type === "revoke" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {confirmAction.type === "revoke" ? "Revoke API Key?" : "Rotate API Key?"}
                </h3>
                <p className="text-xs text-[#8995a3]">{confirmAction.name}</p>
              </div>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                {actionError}
              </div>
            )}

            <p className="text-xs text-[#8995a3] leading-relaxed">
              {confirmAction.type === "revoke"
                ? "Any applications or servers using this key will immediately be blocked from making API requests. This action cannot be undone."
                : "A new key will be generated immediately. Existing connections using the old key will cease functioning once rotated."}
            </p>

            <div className="flex gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="w-1/2 h-11 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`w-1/2 h-11 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 ${
                  confirmAction.type === "revoke" ? "bg-red-600 hover:bg-red-500" : "bg-amber-600 hover:bg-amber-500"
                }`}
              >
                {actionLoading ? <Spinner /> : confirmAction.type === "revoke" ? "Revoke Key" : "Rotate Key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}