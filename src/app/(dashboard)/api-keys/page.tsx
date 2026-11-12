"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Key, Plus, Copy, Check, RotateCcw, Trash2, 
  ShieldAlert, AlertTriangle, X, Terminal, ShieldCheck,
  Calendar, Lock, Unlock
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

interface ApiKey {
  id: string;
  name: string;
  environment: "test" | "live";
  token: string;
  plain_text_key?: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const AVAILABLE_SCOPES = [
  { id: "payments:write", label: "Create Payments", desc: "Initialize new transactions and checkouts" },
  { id: "payments:read", label: "Read Payments", desc: "View transaction history and details" },
  { id: "withdrawals:write", label: "Create Withdrawals", desc: "Request and initialize payouts" },
  { id: "withdrawals:read", label: "Read Withdrawals", desc: "View payout history and bank accounts" },
  { id: "wallets:read", label: "Read Wallets", desc: "View ledger and wallet balances" },
];

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { 
    month: "short", day: "numeric", year: "numeric"
  }).format(new Date(value));
};

function ApiKeySkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-line">
          <td className="px-8 py-5"><div className="h-4 w-32 bg-surface-muted rounded-full" /></td>
          <td className="px-8 py-5"><div className="h-6 w-48 bg-surface-muted rounded-input" /></td>
          <td className="px-8 py-5"><div className="h-5 w-32 bg-surface-muted rounded-full" /></td>
          <td className="px-8 py-5"><div className="h-4 w-24 bg-surface-muted rounded-full" /></td>
          <td className="px-8 py-5"><div className="h-4 w-24 bg-surface-muted rounded-full" /></td>
          <td className="px-8 py-5 flex justify-end gap-2">
            <div className="h-8 w-8 bg-surface-muted rounded-input" />
            <div className="h-8 w-8 bg-danger-tint rounded-input" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ApiKeysPage() {
  const [now] = useState(() => Date.now());
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "test" | "live">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEnv, setCreateEnv] = useState<"test" | "live">("test");
  const [isFullAccess, setIsFullAccess] = useState(true);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<number | null>(null);
  
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [revealedKey, setRevealedKey] = useState<{ name: string; key: string; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{ 
    type: "rotate" | "revoke"; 
    id: string; 
    name: string 
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadKeys = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data: ApiKey[] }>("/api-keys");
      setKeys(res.data.data);
      setError("");
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
    const timer = setTimeout(() => {
      void loadKeys();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadKeys]);

  const toggleScope = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId) ? prev.filter(id => id !== scopeId) : [...prev, scopeId]
    );
  };

  const handleOpenCreate = () => {
    setCreateError("");
    setCreateName("");
    setCreateEnv("test");
    setIsFullAccess(true);
    setSelectedScopes([]);
    setExpirationDays(null);
    setIsCreateOpen(true);
  };

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
        scopes: isFullAccess ? ["*"] : selectedScopes,
        expiration_days: expirationDays,
      });

      setIsCreateOpen(false);
      
      // FIX: Ensure we use the correct plain_text_key field from the backend
      const rawKey = res.data.data.plain_text_key;
      setRevealedKey({ 
        name: res.data.data.name, 
        key: rawKey || "ERROR_NO_KEY_RETURNED",
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
          key: res.data.data.plain_text_key || "ERROR_NO_KEY_RETURNED",
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
    <RoleGuard allowedRoles={["admin", "developer"]}>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Developers</p>
            <h1 className="text-2xl font-bold text-ink drop-shadow-sm mt-1">API Keys</h1>
            <p className="text-xs text-ink-muted mt-1">
              Authenticate server-to-server requests with granular permissions and expirations.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-input bg-brand-500 px-6 py-2.5 text-sm font-bold text-ink transition-all hover:shadow-card hover:brightness-110 border border-line"
          >
            <Plus className="h-4 w-4" /> Generate Secret Key
          </button>
        </header>

        <div className="flex items-start gap-3 rounded-card border border-line bg-amber-500/5 p-4 text-ink-muted text-xs leading-relaxed">
          <ShieldAlert className="h-5 w-5 shrink-0 text-pending mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Security Guidelines</p>
            <p className="mt-0.5 text-amber-200/80">
              For your security, all secret API keys are displayed only once upon generation or rotation. Restrict keys to necessary scopes and rotate them regularly.
            </p>
          </div>
        </div>

        <section className="rounded-card border border-line bg-surface backdrop-blur-xl shadow-card overflow-hidden flex flex-col relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line p-6 bg-surface">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-input bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Active Credentials</h2>
                <p className="text-xs text-ink-muted">Manage and rotate merchant API keys</p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-input bg-surface p-1 border border-line self-start sm:self-auto">
              {(["all", "test", "live"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-input px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f ? "bg-purple-600 text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-line">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Name / Environment</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Secret Key Token</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Permissions</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Expires</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Last Used</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <ApiKeySkeleton />
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-10">
                      <ErrorMessage message={error} retry={loadKeys} />
                    </td>
                  </tr>
                ) : filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-surface-muted border border-line">
                          <Key className="h-6 w-6 text-ink-muted" />
                        </div>
                        <h3 className="text-base font-bold text-ink">No API keys found</h3>
                        <p className="mt-1 text-xs text-ink-muted max-w-sm">
                          Generate a secret API key to start integrating the payment gateway API.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((item) => {
                    const isRevoked = Boolean(item.revoked_at);
                    const isExpired = item.expires_at ? new Date(item.expires_at).getTime() < now : false;
                    const isLive = item.environment.toLowerCase() === "live";
                    const isFullAccess = item.scopes.includes("*");

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-surface">
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-ink">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isLive ? "bg-success-tint text-success border border-line" : "bg-surface-muted text-pending border border-line"
                              }`}>
                                {item.environment}
                              </span>
                              {isRevoked && (
                                <span className="rounded-full bg-danger-tint px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-danger border border-line">
                                  Revoked
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 font-mono text-xs text-ink-muted bg-black/40 px-3 py-1.5 rounded-input border border-line w-fit">
                            <Terminal className="h-3.5 w-3.5 text-purple-400" />
                            <span>{item.token}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {isFullAccess ? (
                            <span className="inline-flex items-center gap-1 text-success bg-success-tint border border-line px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                              <Unlock className="h-3 w-3" /> Full Access
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              {item.scopes.map(scopeId => {
                                const label = AVAILABLE_SCOPES.find(s => s.id === scopeId)?.label || scopeId;
                                return (
                                  <span key={scopeId} className="inline-flex items-center text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {isExpired ? (
                              <span className="text-danger font-bold flex items-center gap-1 bg-danger-tint border border-line px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                                Expired
                              </span>
                            ) : (
                              <span className="text-ink-muted">
                                {formatDate(item.expires_at)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-medium text-ink-muted">
                          {formatDate(item.last_used_at)}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {!isRevoked && !isExpired ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setConfirmAction({ type: "rotate", id: item.id, name: item.name })}
                                title="Rotate Key"
                                className="rounded-input p-2 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: "revoke", id: item.id, name: item.name })}
                                title="Revoke Key"
                                className="rounded-input p-2 text-ink-muted hover:bg-danger-tint hover:text-danger transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-muted italic">Inactive</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal: Generate New Key */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-md rounded-card border border-line bg-surface shadow-card overflow-hidden flex flex-col my-8">
              <div className="flex items-center justify-between border-b border-line bg-surface p-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-input bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Generate Secret Key</h3>
                    <p className="text-xs text-ink-muted">Create credentials for API access</p>
                  </div>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-ink-muted hover:text-ink transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                {createError && (
                  <div className="flex items-center gap-2 rounded-input bg-danger-tint border border-line p-3 text-xs text-danger">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p>{createError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Key Identifier / Name</label>
                  <input
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Backend Production Server"
                    className="w-full h-11 rounded-input border border-line bg-surface px-4 text-sm text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Environment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setCreateEnv("test")} className={`h-11 rounded-input border text-xs font-bold uppercase tracking-wider transition-all ${createEnv === "test" ? "border-amber-500/50 bg-surface-muted text-amber-300" : "border-line bg-surface text-ink-muted hover:bg-surface-muted"}`}>
                      Test Mode
                    </button>
                    <button type="button" onClick={() => setCreateEnv("live")} className={`h-11 rounded-input border text-xs font-bold uppercase tracking-wider transition-all ${createEnv === "live" ? "border-emerald-500/50 bg-success-tint text-emerald-300" : "border-line bg-surface text-ink-muted hover:bg-surface-muted"}`}>
                      Live Mode
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Expiration</label>
                  <select 
                    value={expirationDays === null ? "" : expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full h-11 rounded-input border border-line bg-surface px-4 text-sm text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  >
                    <option value="">Never Expires</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Permissions & Scopes</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setIsFullAccess(true)} className={`h-11 flex items-center justify-center gap-2 rounded-input border text-xs font-bold tracking-wider transition-all ${isFullAccess ? "border-emerald-500/50 bg-success-tint text-emerald-300" : "border-line bg-surface text-ink-muted hover:bg-surface-muted"}`}>
                      <Unlock className="h-3.5 w-3.5" /> Full Access
                    </button>
                    <button type="button" onClick={() => setIsFullAccess(false)} className={`h-11 flex items-center justify-center gap-2 rounded-input border text-xs font-bold tracking-wider transition-all ${!isFullAccess ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-line bg-surface text-ink-muted hover:bg-surface-muted"}`}>
                      <Lock className="h-3.5 w-3.5" /> Restricted
                    </button>
                  </div>

                  {!isFullAccess && (
                    <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 fade-in">
                      {AVAILABLE_SCOPES.map(scope => (
                        <label key={scope.id} className="flex items-start gap-3 p-3 rounded-input border border-line bg-surface-muted cursor-pointer hover:bg-surface-muted transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedScopes.includes(scope.id)}
                            onChange={() => toggleScope(scope.id)}
                            className="mt-0.5 rounded border-line bg-ink/10 text-brand-500 focus:ring-1 focus:ring-brand-500 h-4 w-4 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-ink">{scope.label}</p>
                            <p className="text-[10px] text-ink-muted mt-0.5 leading-relaxed">{scope.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              <div className="p-6 border-t border-line flex gap-3 shrink-0 bg-surface/[0.01]">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="w-1/2 h-11 rounded-input border border-line bg-surface-muted text-xs font-bold text-ink hover:bg-surface-muted transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !createName.trim() || (!isFullAccess && selectedScopes.length === 0)}
                  className="w-1/2 h-11 rounded-input bg-brand-500 text-xs font-bold text-ink hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-card transition-all"
                >
                  {creating ? <Spinner /> : "Create Key"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Secret Key Reveal */}
        {revealedKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-card border border-emerald-500/30 bg-surface shadow-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-line bg-emerald-500/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-input bg-success-tint border border-line text-success">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Save Your Secret Key</h3>
                    <p className="text-xs text-success/80">{revealedKey.name}</p>
                  </div>
                </div>
                <button onClick={() => setRevealedKey(null)} className="rounded-full p-2 text-ink-muted hover:text-ink transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="rounded-input border border-line bg-surface-muted p-4 text-xs text-ink-muted leading-relaxed shadow-inner">
                  <strong className="text-amber-300 block mb-1 text-sm">Please copy your secret key now.</strong>
                  For your security, you will not be able to view this full key again once this dialog is closed. If you lose it, you will need to rotate the key.
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">API Secret Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={revealedKey.key}
                      className="w-full h-12 rounded-input border border-line bg-bg px-4 font-mono text-xs sm:text-sm text-ink selection:bg-success-tint outline-none shadow-inner"
                    />
                    <button
                      onClick={() => copyToClipboard(revealedKey.key)}
                      className="h-12 px-4 rounded-input bg-brand-500 hover:brightness-110 text-ink font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-card"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-line">
                  <button
                    onClick={() => setRevealedKey(null)}
                    className="w-full h-11 rounded-input bg-surface-muted hover:bg-surface-muted text-xs font-bold text-ink transition-colors"
                  >
                    I have securely saved my key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmation Dialog (Revoke / Rotate) */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-card border border-line bg-surface shadow-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-input border ${
                  confirmAction.type === "revoke" ? "bg-danger-tint border-line text-danger" : "bg-surface-muted border-line text-pending"
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {confirmAction.type === "revoke" ? "Revoke API Key?" : "Rotate API Key?"}
                  </h3>
                  <p className="text-xs text-ink-muted">{confirmAction.name}</p>
                </div>
              </div>

              {actionError && (
                <div className="rounded-input bg-danger-tint border border-line p-3 text-xs text-danger">
                  {actionError}
                </div>
              )}

              <p className="text-xs text-ink-muted leading-relaxed">
                {confirmAction.type === "revoke"
                  ? "Any applications or servers using this key will immediately be blocked from making API requests. This action cannot be undone."
                  : "A new key will be generated immediately. Existing connections using the old key will cease functioning once rotated."}
              </p>

              <div className="flex gap-3 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="w-1/2 h-11 rounded-input border border-line bg-surface-muted text-xs font-bold text-ink hover:bg-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmAction}
                  className={`w-1/2 h-11 rounded-input text-xs font-bold text-ink flex items-center justify-center gap-2 transition-colors ${
                    confirmAction.type === "revoke" ? "bg-red-600 hover:bg-red-500" : "bg-pending hover:bg-pending"
                  }`}
                >
                  {actionLoading ? <Spinner /> : confirmAction.type === "revoke" ? "Revoke Key" : "Rotate Key"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}