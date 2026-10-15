"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { User, Shield, Webhook, Copy, Check, Save, RefreshCw, AlertTriangle, ShieldCheck, X, CheckCircle2, XCircle } from "lucide-react";

function SettingsSkeleton() {
  return (
    <div className="animate-pulse p-6 md:p-8 space-y-6">
      <div className="h-6 w-48 bg-white/10 rounded-full mb-2" />
      <div className="h-4 w-72 bg-white/5 rounded-full mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="md:col-span-2 h-12 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'webhooks'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string[] }>({});
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  const toast = useToast();

  const [generalForm, setGeneralForm] = useState({
    brand_name: '',
    website_url: '',
    logo_url: '',
    success_url: '',
    cancel_url: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '', 
    password_confirmation: '', 
  });

  const [webhookSecretMasked, setWebhookSecretMasked] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const passwordsMatch = passwordForm.password && passwordForm.password_confirmation && passwordForm.password === passwordForm.password_confirmation;
  const passwordsMismatch = passwordForm.password_confirmation.length > 0 && passwordForm.password !== passwordForm.password_confirmation;

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        const res = await api.get('/settings');
        if (isMounted) {
          const { business, checkout, developer } = res.data.data;

          setGeneralForm({
            brand_name: checkout?.brand_name || business?.business_name || '',
            website_url: business?.website_url || '',
            logo_url: business?.logo_url || '',
            success_url: checkout?.success_url || '',
            cancel_url: checkout?.cancel_url || '',
          });

          const secret = developer?.webhook_secret || '';
          setWebhookSecretMasked(secret ? `${secret.substring(0, 10)}**********************` : '');
        }
      } catch {
        toast.error("Failed to load settings from server.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    void fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleTabChange = (tab: 'general' | 'security' | 'webhooks') => {
    if (tab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(tab);
    setPasswordSuccessMessage('');
    setTimeout(() => setIsTabLoading(false), 250); 
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings', {
        ...generalForm,
        business_name: generalForm.brand_name
      });
      toast.success('General settings updated successfully.');
    } catch (err: unknown) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Failed to update settings.' : 'System Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setPasswordErrors({}); 
    setPasswordSuccessMessage('');

    if (passwordsMismatch) {
      setIsSaving(false);
      return; 
    }

    try {
      await api.request({
        method: 'PUT',
        url: '/user/password',
        data: {
          current_password: passwordForm.current_password,
          password: passwordForm.password,
          password_confirmation: passwordForm.password_confirmation
        }
      });
      
      // Explicit success feedback state + Toast
      setPasswordSuccessMessage('Password updated successfully! Your new credentials are now active.');
      toast.success('Password updated successfully!');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setPasswordErrors({});
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const responseData = err.response.data;
        if (responseData && responseData.errors) {
          setPasswordErrors(responseData.errors);
          toast.error("Validation failed. Check the errors in red below.");
        } else {
          toast.error(responseData?.message || "Invalid password data.");
        }
      } else {
        toast.error(isAxiosError(err) ? err.response?.data?.message || 'Failed to update password.' : 'System Error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotateWebhookSecret = async () => {
    if (webhookSecretMasked && !window.confirm('Are you sure you want to rotate your webhook secret? Existing integrations will fail until updated.')) return;
    
    try {
      setIsSaving(true);
      const res = await api.post('/settings/webhook-secret/rotate');
      const newSecret = res.data.data?.webhook_secret || '';
      
      setWebhookSecretMasked(`${newSecret.substring(0, 10)}**********************`);
      setRevealedSecret(newSecret);
      toast.success('Webhook secret rotated successfully.');
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Failed to rotate webhook secret.' : 'System Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
          <Spinner /> Synchronizing profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Configuration</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Merchant Settings</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <button onClick={() => handleTabChange('general')} className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'general' ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'general' ? 'bg-[#35d5a4]/20 text-[#35d5a4]' : 'bg-white/5 text-[#68747e]'}`}><User className="h-4 w-4" /></div>
            <div><p className="font-bold text-sm">General Profile</p><p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">Brand & URLs</p></div>
          </button>
          <button onClick={() => handleTabChange('security')} className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'security' ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'security' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-[#68747e]'}`}><Shield className="h-4 w-4" /></div>
            <div><p className="font-bold text-sm">Security</p><p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">Passwords</p></div>
          </button>
          <button onClick={() => handleTabChange('webhooks')} className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'webhooks' ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'webhooks' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-[#68747e]'}`}><Webhook className="h-4 w-4" /></div>
            <div><p className="font-bold text-sm">Webhooks</p><p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">HMAC Secrets</p></div>
          </button>
        </div>

        <section className="lg:col-span-3 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative min-h-[500px]">
          {isTabLoading ? <SettingsSkeleton /> : (
            <>
              {activeTab === 'general' && (
                <>
                  <div className="border-b border-white/5 bg-white/[0.01] p-6 md:px-8">
                    <h2 className="text-lg font-bold text-white">Business Profile</h2>
                    <p className="text-xs text-[#8995a3] mt-1">Configure your brand identity and customer redirect flows.</p>
                  </div>
                  <form onSubmit={handleGeneralSubmit} className="flex-1 flex flex-col">
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Brand Name</label>
                        <input type="text" value={generalForm.brand_name} onChange={(e) => setGeneralForm({ ...generalForm, brand_name: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner" placeholder="e.g. Acme Corp" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Website URL</label>
                        <input type="url" value={generalForm.website_url} onChange={(e) => setGeneralForm({ ...generalForm, website_url: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner" placeholder="https://yourwebsite.com" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Logo URL</label>
                        <input type="url" value={generalForm.logo_url} onChange={(e) => setGeneralForm({ ...generalForm, logo_url: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner" placeholder="https://yourwebsite.com/logo.png" />
                      </div>
                      <div className="md:col-span-2 pt-6 border-t border-white/5 mt-2"><h4 className="text-sm font-bold text-white mb-6">Checkout Redirection</h4></div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Default Success URL</label>
                        <input type="url" value={generalForm.success_url} onChange={(e) => setGeneralForm({ ...generalForm, success_url: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner" placeholder="Redirect after successful payment" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Default Cancel URL</label>
                        <input type="url" value={generalForm.cancel_url} onChange={(e) => setGeneralForm({ ...generalForm, cancel_url: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner" placeholder="Redirect if customer cancels" />
                      </div>
                    </div>
                    <div className="border-t border-white/5 bg-white/[0.01] p-6 flex justify-end">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] border border-white/10 disabled:opacity-50">
                        {isSaving ? <Spinner /> : <Save className="h-4 w-4" />} {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div className="border-b border-white/5 bg-white/[0.01] p-6 md:px-8">
                    <h2 className="text-lg font-bold text-white">Change Password</h2>
                    <p className="text-xs text-[#8995a3] mt-1">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col">
                    <div className="p-6 md:p-8 space-y-6 max-w-lg flex-1">
                      
                      {/* SUCCESS BANNER */}
                      {passwordSuccessMessage && (
                        <div className="rounded-xl border border-[#35d5a4]/30 bg-[#2f9d78]/10 p-4 text-xs font-semibold text-[#35d5a4] flex items-center gap-2 animate-in fade-in duration-200">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{passwordSuccessMessage}</span>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.current_password}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, current_password: e.target.value });
                            setPasswordErrors(prev => ({ ...prev, current_password: [] }));
                            setPasswordSuccessMessage('');
                          }}
                          className={`h-11 w-full rounded-xl border bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:ring-1 transition-all shadow-inner ${
                            passwordErrors.current_password?.length 
                              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50' 
                              : 'border-white/10 focus:border-amber-500/50 focus:ring-amber-500/50'
                          }`}
                          required
                        />
                        {passwordErrors.current_password?.length > 0 && (
                          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> {passwordErrors.current_password[0]}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.password}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, password: e.target.value });
                            setPasswordErrors(prev => ({ ...prev, password: [] }));
                            setPasswordSuccessMessage('');
                          }}
                          className={`h-11 w-full rounded-xl border bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:ring-1 transition-all shadow-inner ${
                            passwordErrors.password?.length 
                              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50' 
                              : 'border-white/10 focus:border-amber-500/50 focus:ring-amber-500/50'
                          }`}
                          required
                        />
                        <p className="text-[#68747e] text-[10px] mt-1.5 uppercase tracking-wide">Must be at least 8 characters with upper, lower, numbers & symbols</p>
                        {passwordErrors.password?.length > 0 && (
                          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> {passwordErrors.password[0]}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 flex justify-between">
                          <span>Confirm New Password</span>
                          {passwordsMatch && <span className="text-[#35d5a4] flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Matches</span>}
                          {passwordsMismatch && <span className="text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3"/> Mismatch</span>}
                        </label>
                        <input
                          type="password"
                          value={passwordForm.password_confirmation}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, password_confirmation: e.target.value });
                            setPasswordSuccessMessage('');
                          }}
                          className={`h-11 w-full rounded-xl border bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:ring-1 transition-all shadow-inner ${
                            passwordsMismatch 
                              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
                              : passwordsMatch 
                                ? 'border-[#35d5a4]/50 focus:border-[#35d5a4]/50 focus:ring-[#35d5a4]/50'
                                : 'border-white/10 focus:border-amber-500/50 focus:ring-amber-500/50'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-white/5 bg-white/[0.01] p-6 flex justify-start md:px-8">
                      <button
                        type="submit"
                        disabled={isSaving || passwordsMismatch}
                        className="flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:brightness-110 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? <Spinner /> : <Shield className="h-4 w-4" />} 
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'webhooks' && (
                <>
                  <div className="border-b border-white/5 bg-white/[0.01] p-6 md:px-8">
                    <h2 className="text-lg font-bold text-white">HMAC Webhook Signing Secret</h2>
                    <p className="text-xs text-[#8995a3] mt-1">Used to sign incoming webhook events via the <code className="bg-[#0a0f16] border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#e8edf2] ml-1">x-gateway-signature</code> header.</p>
                  </div>
                  <div className="p-6 md:p-8 flex-1">
                    <div className="max-w-xl">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Current Webhook Secret</label>
                      <div className="flex items-center mb-8 h-12 rounded-xl border border-white/10 bg-[#0a0f16] shadow-inner overflow-hidden">
                        <input type="text" readOnly value={webhookSecretMasked || 'No secret generated yet'} className="h-full w-full bg-transparent px-4 text-sm font-mono text-[#8995a3] outline-none cursor-not-allowed" />
                      </div>
                      
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <strong className="text-sm font-bold text-red-400">Danger Zone</strong>
                        </div>
                        <p className="text-xs text-red-300/80 mb-6 leading-relaxed">
                          Rotating your secret will immediately invalidate signatures generated with the old secret. For security reasons, the full secret is only displayed once upon rotation.
                        </p>
                        <button type="button" disabled={isSaving} onClick={handleRotateWebhookSecret} className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-6 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
                          {isSaving ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
                          {isSaving ? 'Processing...' : webhookSecretMasked ? 'Rotate Webhook Secret' : 'Generate Webhook Secret'}
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

      {revealedSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/30 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 bg-amber-500/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400"><ShieldCheck className="h-5 w-5" /></div>
                <div><h3 className="text-lg font-bold text-white">Save Your Webhook Secret</h3><p className="text-xs text-amber-400/80">HMAC Signature Verification</p></div>
              </div>
              <button onClick={() => setRevealedSecret(null)} className="rounded-full p-2 text-[#8995a3] hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200/90 leading-relaxed shadow-inner">
                <strong className="text-red-400 block mb-1 text-sm">Please copy your secret key now.</strong>
                For your security, you will not be able to view this secret again once this dialog is closed. If you lose it, you will need to rotate the secret again.
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">New Webhook Secret</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={revealedSecret} className="w-full h-12 rounded-xl border border-white/10 bg-[#070b10] px-4 font-mono text-xs sm:text-sm text-white selection:bg-amber-600 outline-none shadow-inner" />
                  <button onClick={() => handleCopy(revealedSecret)} className="h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <button onClick={() => setRevealedSecret(null)} className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors">I have securely saved my secret</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}