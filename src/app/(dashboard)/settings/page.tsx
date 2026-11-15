"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { User, Shield, Webhook, Save, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "@/components/icons";
import {
  Banner, Field, Modal, PageHeader, SecretModal,
  btnDanger, btnDangerSoft, btnPrimary, btnSecondary, cardCls, inputCls,
} from "@/components/dashboard/kit";

type Tab = "general" | "security" | "webhooks";

const TABS: { id: Tab; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General profile", hint: "Brand & URLs", icon: <User className="h-4 w-4" /> },
  { id: "security", label: "Security", hint: "Password", icon: <Shield className="h-4 w-4" /> },
  { id: "webhooks", label: "Webhooks", hint: "HMAC secret", icon: <Webhook className="h-4 w-4" /> },
];

function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="pm-skeleton h-5 w-48 rounded-full" />
      <div className="pm-skeleton mb-8 h-4 w-72 rounded-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="pm-skeleton h-10 rounded-[10px]" />
        <div className="pm-skeleton h-10 rounded-[10px]" />
        <div className="pm-skeleton h-10 rounded-[10px] md:col-span-2" />
      </div>
    </div>
  );
}

function PanelHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-5 md:px-8">
      <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-[13px] text-[#71717A]">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string[] }>({});
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  const toast = useToast();

  const [generalForm, setGeneralForm] = useState({ brand_name: "", website_url: "", logo_url: "", success_url: "", cancel_url: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });

  const [webhookSecretMasked, setWebhookSecretMasked] = useState("");
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [confirmRotate, setConfirmRotate] = useState(false);

  const passwordsMatch = !!passwordForm.password && !!passwordForm.password_confirmation && passwordForm.password === passwordForm.password_confirmation;
  const passwordsMismatch = passwordForm.password_confirmation.length > 0 && passwordForm.password !== passwordForm.password_confirmation;

  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        const res = await api.get("/settings");
        if (!isMounted) return;
        const { business, checkout, developer } = res.data.data;
        setGeneralForm({
          brand_name: checkout?.brand_name || business?.business_name || "",
          website_url: business?.website_url || "",
          logo_url: business?.logo_url || "",
          success_url: checkout?.success_url || "",
          cancel_url: checkout?.cancel_url || "",
        });
        const secret = developer?.webhook_secret || "";
        setWebhookSecretMasked(secret ? `${secret.substring(0, 10)}**********************` : "");
      } catch {
        toast.error("Failed to load settings from server.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void fetchSettings();
    return () => { isMounted = false; };
  }, [toast]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(tab);
    setPasswordSuccessMessage("");
    setTimeout(() => setIsTabLoading(false), 250);
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/settings", { ...generalForm, business_name: generalForm.brand_name });
      toast.success("General settings updated successfully.");
    } catch (err: unknown) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to update settings." : "System Error");
    } finally { setIsSaving(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    setIsSaving(true);
    setPasswordErrors({});
    setPasswordSuccessMessage("");
    try {
      await api.request({ method: "PUT", url: "/user/password", data: { ...passwordForm } });
      setPasswordSuccessMessage("Password updated successfully! Your new credentials are now active.");
      toast.success("Password updated successfully!");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const data = err.response.data;
        if (data?.errors) { setPasswordErrors(data.errors); toast.error("Validation failed. Check the errors below."); }
        else toast.error(data?.message || "Invalid password data.");
      } else {
        toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to update password." : "System Error");
      }
    } finally { setIsSaving(false); }
  };

  const doRotate = async () => {
    setConfirmRotate(false);
    try {
      setIsSaving(true);
      const res = await api.post("/settings/webhook-secret/rotate");
      const newSecret = res.data.data?.webhook_secret || "";
      setWebhookSecretMasked(`${newSecret.substring(0, 10)}**********************`);
      setRevealedSecret(newSecret);
      toast.success("Webhook secret rotated successfully.");
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to rotate webhook secret." : "System Error");
    } finally { setIsSaving(false); }
  };

  const handleRotateWebhookSecret = () => {
    if (webhookSecretMasked) setConfirmRotate(true);
    else void doRotate();
  };

  const setGeneral = (key: keyof typeof generalForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setGeneralForm((prev) => ({ ...prev, [key]: e.target.value }));

  const pwdInput = (hasError: boolean) =>
    `${inputCls} ${hasError ? "!border-[#FCA5A5] focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`;

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="flex items-center gap-1 text-[12px] text-[#DC2626]"><XCircle className="h-3 w-3" /> {msg}</p> : null;

  if (isLoading) {
    return (
      <div className="space-y-6 bg-white pb-10">
        <div className="pm-skeleton h-9 w-56 rounded" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="pm-skeleton h-16 rounded-[12px] border border-[var(--pm-line)]" />)}</div>
          <div className={`${cardCls} lg:col-span-3`}><SettingsSkeleton /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      <PageHeader eyebrow="Configuration" title="Merchant Settings" description="Manage your brand, security and developer credentials." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Tab nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Settings sections">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-[170px] items-center gap-3 rounded-[12px] border p-3.5 text-left transition-all lg:min-w-0 ${
                  active ? "border-[#D4D4D8] bg-[var(--pm-band)] shadow-sm" : "border-[var(--pm-line)] bg-white hover:border-[#D4D4D8] hover:bg-[var(--pm-band)]"
                }`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] transition-colors ${active ? "bg-[#09090B] text-white" : "bg-[var(--pm-band-hover)] text-[#52525B]"}`}>{t.icon}</span>
                <span>
                  <span className="block text-[13px] font-semibold">{t.label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#71717A]">{t.hint}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <section className={`${cardCls} relative flex min-h-[500px] flex-col overflow-hidden lg:col-span-3`}>
          {isTabLoading ? <SettingsSkeleton /> : (
            <>
              {activeTab === "general" && (
                <>
                  <PanelHead title="Business profile" description="Configure your brand identity and customer redirect flows." />
                  <form onSubmit={handleGeneralSubmit} className="flex flex-1 flex-col">
                    <div className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-2 md:p-8">
                      <Field label="Brand name"><input type="text" value={generalForm.brand_name} onChange={setGeneral("brand_name")} className={inputCls} placeholder="e.g. Acme Corp" /></Field>
                      <Field label="Website URL"><input type="url" value={generalForm.website_url} onChange={setGeneral("website_url")} className={inputCls} placeholder="https://yourwebsite.com" /></Field>
                      <div className="md:col-span-2">
                        <Field label="Logo URL"><input type="url" value={generalForm.logo_url} onChange={setGeneral("logo_url")} className={inputCls} placeholder="https://yourwebsite.com/logo.png" /></Field>
                      </div>
                      <div className="border-t border-[var(--pm-line)] pt-6 md:col-span-2">
                        <h3 className="text-[14px] font-semibold">Checkout redirection</h3>
                        <p className="mt-1 text-[12px] text-[#71717A]">Where customers land after completing or cancelling a payment.</p>
                      </div>
                      <Field label="Default success URL"><input type="url" value={generalForm.success_url} onChange={setGeneral("success_url")} className={inputCls} placeholder="Redirect after successful payment" /></Field>
                      <Field label="Default cancel URL"><input type="url" value={generalForm.cancel_url} onChange={setGeneral("cancel_url")} className={inputCls} placeholder="Redirect if customer cancels" /></Field>
                    </div>
                    <div className="flex justify-end border-t border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-4 md:px-8">
                      <button type="submit" disabled={isSaving} className={btnPrimary}>
                        {isSaving ? <Spinner /> : <Save className="h-4 w-4" />} {isSaving ? "Saving..." : "Save profile"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <PanelHead title="Change password" description="Use a long, random password to keep your account secure." />
                  <form onSubmit={handlePasswordSubmit} className="flex flex-1 flex-col">
                    <div className="max-w-lg flex-1 space-y-6 p-6 md:p-8">
                      {passwordSuccessMessage && <Banner tone="success">{passwordSuccessMessage}</Banner>}

                      <Field label="Current password">
                        <input
                          type="password" required value={passwordForm.current_password}
                          onChange={(e) => { setPasswordForm({ ...passwordForm, current_password: e.target.value }); setPasswordErrors((p) => ({ ...p, current_password: [] })); setPasswordSuccessMessage(""); }}
                          className={pwdInput(!!passwordErrors.current_password?.length)}
                        />
                        <FieldError msg={passwordErrors.current_password?.[0]} />
                      </Field>

                      <Field label="New password" hint="At least 8 characters, with upper & lower case letters, numbers and symbols.">
                        <input
                          type="password" required value={passwordForm.password}
                          onChange={(e) => { setPasswordForm({ ...passwordForm, password: e.target.value }); setPasswordErrors((p) => ({ ...p, password: [] })); setPasswordSuccessMessage(""); }}
                          className={pwdInput(!!passwordErrors.password?.length)}
                        />
                        <FieldError msg={passwordErrors.password?.[0]} />
                      </Field>

                      <Field
                        label="Confirm new password"
                        right={
                          passwordsMatch ? <span className="flex items-center gap-1 text-[12px] font-normal text-[#059669]"><CheckCircle2 className="h-3 w-3" /> Matches</span>
                          : passwordsMismatch ? <span className="flex items-center gap-1 text-[12px] font-normal text-[#DC2626]"><XCircle className="h-3 w-3" /> Doesn&apos;t match</span>
                          : undefined
                        }
                      >
                        <input
                          type="password" required value={passwordForm.password_confirmation}
                          onChange={(e) => { setPasswordForm({ ...passwordForm, password_confirmation: e.target.value }); setPasswordSuccessMessage(""); }}
                          className={pwdInput(passwordsMismatch)}
                        />
                      </Field>
                    </div>
                    <div className="flex justify-start border-t border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-4 md:px-8">
                      <button type="submit" disabled={isSaving || passwordsMismatch} className={btnPrimary}>
                        {isSaving ? <Spinner /> : <Shield className="h-4 w-4" />} {isSaving ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === "webhooks" && (
                <>
                  <PanelHead title="HMAC webhook signing secret" description="Used to sign webhook events sent to your endpoint." />
                  <div className="flex-1 p-6 md:p-8">
                    <div className="max-w-xl space-y-8">
                      <Field
                        label="Current webhook secret"
                        hint={<>Events are signed using the <code className="rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-band-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[#09090B]">x-gateway-signature</code> header.</>}
                      >
                        <input type="text" disabled readOnly value={webhookSecretMasked || "No secret generated yet"} className={`${inputCls} font-mono text-[12px]`} />
                      </Field>

                      <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-5">
                        <div className="mb-2 flex items-center gap-2 text-[#B91C1C]">
                          <AlertTriangle className="h-4 w-4" />
                          <strong className="text-[13px] font-semibold">Danger zone</strong>
                        </div>
                        <p className="mb-4 text-[13px] leading-[1.6] text-[#B91C1C]/90">
                          Rotating your secret immediately invalidates signatures generated with the old one. The full secret is displayed only once after rotation.
                        </p>
                        <button type="button" disabled={isSaving} onClick={handleRotateWebhookSecret} className={`${btnDangerSoft} w-full bg-white sm:w-auto`}>
                          {isSaving ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
                          {isSaving ? "Processing..." : webhookSecretMasked ? "Rotate webhook secret" : "Generate webhook secret"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      <SecretModal
        open={!!revealedSecret}
        onClose={() => setRevealedSecret(null)}
        title="Save your webhook secret"
        subtitle="HMAC signature verification"
        label="New webhook secret"
        value={revealedSecret ?? ""}
        warning="You won't be able to view this secret again after closing this dialog. If you lose it, you'll need to rotate it again."
        confirmLabel="I have securely saved my secret"
      />

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
        <p className="text-[13px] leading-[1.6] text-[#52525B]">Existing integrations will fail to verify events until they&apos;re updated with the new secret.</p>
      </Modal>
    </div>
  );
}