"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Key, Plus, RotateCcw, Trash2, ShieldAlert, AlertTriangle, Terminal, Calendar, Lock, Unlock,
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import {
  Banner, EmptyBlock, Field, Modal, PageHeader, Pill, SecretModal, SectionHead, Tabs,
  btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, selectChevron, tdCls, thCls,
} from "@/components/dashboard/kit";

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

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "Never";

function ApiKeySkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i} className="border-b border-[var(--pm-line)]">
          <td className={tdCls}><div className="pm-skeleton h-4 w-32 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-7 w-48 rounded-[8px]" /></td>
          <td className={tdCls}><div className="pm-skeleton h-5 w-28 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-20 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton h-4 w-20 rounded-full" /></td>
          <td className={tdCls}><div className="pm-skeleton ml-auto h-8 w-16 rounded-[8px]" /></td>
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

  const [revealedKey, setRevealedKey] = useState<{ name: string; key: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "rotate" | "revoke"; id: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadKeys = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data: ApiKey[] }>("/api-keys");
      setKeys(res.data.data);
      setError("");
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load API keys." : "Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void loadKeys(); }, 0);
    return () => clearTimeout(t);
  }, [loadKeys]);

  const toggleScope = (id: string) =>
    setSelectedScopes((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleOpenCreate = () => {
    setCreateError(""); setCreateName(""); setCreateEnv("test");
    setIsFullAccess(true); setSelectedScopes([]); setExpirationDays(null);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await api.post<{ status: string; data: ApiKey & { plain_text_key: string } }>("/api-keys", {
        name: createName,
        environment: createEnv,
        scopes: isFullAccess ? ["*"] : selectedScopes,
        expiration_days: expirationDays,
      });
      setIsCreateOpen(false);
      setRevealedKey({ name: res.data.data.name, key: res.data.data.plain_text_key || "ERROR_NO_KEY_RETURNED" });
      await loadKeys();
    } catch (err: unknown) {
      setCreateError(isAxiosError(err) ? err.response?.data?.message || "Failed to create API key." : "An unexpected error occurred.");
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
        const res = await api.post<{ status: string; data: ApiKey & { plain_text_key: string } }>(`/api-keys/${confirmAction.id}/rotate`);
        setConfirmAction(null);
        setRevealedKey({ name: res.data.data.name, key: res.data.data.plain_text_key || "ERROR_NO_KEY_RETURNED" });
      } else {
        await api.delete(`/api-keys/${confirmAction.id}`);
        setConfirmAction(null);
      }
      await loadKeys();
    } catch (err: unknown) {
      setActionError(isAxiosError(err) ? err.response?.data?.message || "Action failed." : "An unexpected error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredKeys = useMemo(
    () => keys.filter((k) => filter === "all" || k.environment.toLowerCase() === filter),
    [keys, filter]
  );

  const canCreate = createName.trim() && (isFullAccess || selectedScopes.length > 0);

  return (
    <RoleGuard allowedRoles={["admin", "developer"]}>
      <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
        <PageHeader
          eyebrow="Developers"
          title="API Keys"
          description="Authenticate server-to-server requests with granular permissions and expirations."
          action={
            <button type="button" onClick={handleOpenCreate} className={`${btnPrimary} w-fit`}>
              <Plus className="h-4 w-4" /> Generate Secret Key
            </button>
          }
        />

        <Banner tone="warning" title="Security guidelines">
          Secret keys are shown only once, when generated or rotated. Restrict keys to the scopes they need and rotate them regularly.
        </Banner>

        <section className={`${cardCls} overflow-hidden`}>
          <SectionHead
            icon={<Key className="h-4 w-4" />}
            title="Active Credentials"
            subtitle="Manage and rotate merchant API keys"
            right={
              <Tabs
                label="Filter by environment"
                value={filter}
                onChange={setFilter}
                tabs={[{ label: "All", value: "all" }, { label: "Test", value: "test" }, { label: "Live", value: "live" }]}
              />
            }
          />

          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full whitespace-nowrap border-collapse text-left">
              <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Token</th>
                  <th className={thCls}>Permissions</th>
                  <th className={thCls}>Expires</th>
                  <th className={thCls}>Last used</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <ApiKeySkeleton />
                ) : error ? (
                  <tr><td colSpan={6} className="px-6 py-10"><ErrorMessage message={error} retry={loadKeys} /></td></tr>
                ) : filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyBlock
                        icon={<Key className="h-6 w-6" />}
                        title="No API keys found"
                        description="Generate a secret API key to start integrating with the payment gateway API."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((item) => {
                    const isRevoked = Boolean(item.revoked_at);
                    const isExpired = item.expires_at ? new Date(item.expires_at).getTime() < now : false;
                    const isLive = item.environment.toLowerCase() === "live";
                    const hasFullAccess = item.scopes.includes("*");
                    const inactive = isRevoked || isExpired;

                    return (
                      <tr key={item.id} className={`border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band)] ${inactive ? "opacity-60" : ""}`}>
                        <td className={tdCls}>
                          <p className="text-[14px] font-semibold">{item.name}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Pill tone={isLive ? "success" : "warning"}>{isLive ? "Live" : "Test"}</Pill>
                            {isRevoked && <Pill tone="danger">Revoked</Pill>}
                          </div>
                        </td>
                        <td className={tdCls}>
                          <div className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-3 py-1.5 font-mono text-[12px] text-[#52525B]">
                            <Terminal className="h-3.5 w-3.5 text-[#A1A1AA]" />
                            {item.token}
                          </div>
                        </td>
                        <td className={tdCls}>
                          {hasFullAccess ? (
                            <Pill tone="success" dot={false}><Unlock className="h-3 w-3" /> Full access</Pill>
                          ) : (
                            <div className="flex max-w-[280px] flex-wrap gap-1.5 whitespace-normal">
                              {item.scopes.map((id) => (
                                <span key={id} className="rounded-[6px] border border-[var(--pm-line)] bg-[var(--pm-band-hover)] px-2 py-0.5 text-[11px] font-medium text-[#52525B]">
                                  {AVAILABLE_SCOPES.find((s) => s.id === id)?.label || id}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className={`${tdCls} text-[13px] text-[#52525B]`}>
                          {isExpired ? <Pill tone="danger">Expired</Pill> : formatDate(item.expires_at)}
                        </td>
                        <td className={`${tdCls} text-[13px] text-[#52525B]`}>{formatDate(item.last_used_at)}</td>
                        <td className={`${tdCls} text-right`}>
                          {!inactive ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => { setActionError(""); setConfirmAction({ type: "rotate", id: item.id, name: item.name }); }}
                                title="Rotate key"
                                aria-label={`Rotate ${item.name}`}
                                className="grid size-8 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white text-[#71717A] shadow-sm transition-colors hover:bg-[var(--pm-band)] hover:text-[#09090B]"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActionError(""); setConfirmAction({ type: "revoke", id: item.id, name: item.name }); }}
                                title="Revoke key"
                                aria-label={`Revoke ${item.name}`}
                                className="grid size-8 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white text-[#71717A] shadow-sm transition-colors hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <Pill tone="neutral" dot={false}>Inactive</Pill>
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

        {/* Generate key */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Generate Secret Key"
          subtitle="Create credentials for API access"
          icon={<Key className="h-5 w-5" />}
          footer={
            <>
              <button type="button" onClick={() => setIsCreateOpen(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" form="create-key-form" disabled={creating || !canCreate} className={btnPrimary}>
                {creating ? <Spinner /> : "Create key"}
              </button>
            </>
          }
        >
          <form id="create-key-form" onSubmit={handleCreate} className="space-y-5">
            {createError && <Banner tone="danger">{createError}</Banner>}

            <Field label="Key name">
              <input required value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Backend Production Server" className={inputCls} />
            </Field>

            <Field label="Environment">
              <div className="grid grid-cols-2 gap-3">
                {(["test", "live"] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setCreateEnv(env)}
                    className={`h-10 rounded-[10px] border text-[13px] font-medium transition-all ${
                      createEnv === env ? "border-[#09090B] bg-[#09090B] text-white shadow-sm" : "border-[var(--pm-line)] bg-white text-[#52525B] hover:bg-[var(--pm-band)]"
                    }`}
                  >
                    {env === "test" ? "Test mode" : "Live mode"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Expiration" right={<Calendar className="h-3.5 w-3.5 text-[#A1A1AA]" />}>
              <select
                value={expirationDays === null ? "" : expirationDays}
                onChange={(e) => setExpirationDays(e.target.value === "" ? null : Number(e.target.value))}
                style={selectChevron}
                className={`${inputCls} cursor-pointer appearance-none pr-9`}
              >
                <option value="">Never expires</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </Field>

            <Field label="Permissions">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setIsFullAccess(true)} className={`flex h-10 items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium transition-all ${isFullAccess ? "border-[#09090B] bg-[#09090B] text-white shadow-sm" : "border-[var(--pm-line)] bg-white text-[#52525B] hover:bg-[var(--pm-band)]"}`}>
                  <Unlock className="h-3.5 w-3.5" /> Full access
                </button>
                <button type="button" onClick={() => setIsFullAccess(false)} className={`flex h-10 items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium transition-all ${!isFullAccess ? "border-[#09090B] bg-[#09090B] text-white shadow-sm" : "border-[var(--pm-line)] bg-white text-[#52525B] hover:bg-[var(--pm-band)]"}`}>
                  <Lock className="h-3.5 w-3.5" /> Restricted
                </button>
              </div>
              {!isFullAccess && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {AVAILABLE_SCOPES.map((scope) => {
                    const checked = selectedScopes.includes(scope.id);
                    return (
                      <label key={scope.id} className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3 transition-colors ${checked ? "border-[#09090B] bg-[var(--pm-band)]" : "border-[var(--pm-line)] hover:bg-[var(--pm-band)]"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleScope(scope.id)} className="mt-0.5 size-4 shrink-0 rounded border-[#D4D4D8] accent-[#09090B]" />
                        <div>
                          <p className="text-[13px] font-medium">{scope.label}</p>
                          <p className="mt-0.5 text-[12px] leading-[1.5] text-[#71717A]">{scope.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </Field>
          </form>
        </Modal>

        {/* Reveal secret */}
        <SecretModal
          open={!!revealedKey}
          onClose={() => setRevealedKey(null)}
          title="Save your secret key"
          subtitle={revealedKey?.name}
          label="API secret key"
          value={revealedKey?.key ?? ""}
          warning="You won't be able to view this full key again after closing this dialog. If you lose it, you'll need to rotate the key."
          confirmLabel="I have securely saved my key"
        />

        {/* Confirm revoke / rotate */}
        <Modal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction?.type === "revoke" ? "Revoke API key?" : "Rotate API key?"}
          subtitle={confirmAction?.name}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={confirmAction?.type === "revoke" ? "danger" : "warning"}
          footer={
            <>
              <button type="button" onClick={() => setConfirmAction(null)} className={btnSecondary}>Cancel</button>
              <button type="button" disabled={actionLoading} onClick={handleConfirmAction} className={confirmAction?.type === "revoke" ? btnDanger : btnPrimary}>
                {actionLoading ? <Spinner /> : confirmAction?.type === "revoke" ? "Revoke key" : "Rotate key"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {actionError && <Banner tone="danger">{actionError}</Banner>}
            <p className="text-[13px] leading-[1.6] text-[#52525B]">
              {confirmAction?.type === "revoke"
                ? "Any application or server using this key will immediately be blocked from making API requests. This action cannot be undone."
                : "A new key will be generated immediately. Connections using the old key will stop working once it's rotated."}
            </p>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}