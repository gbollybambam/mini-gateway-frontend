"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { User, Shield, Webhook, Copy, Check, Save, RefreshCw, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'webhooks'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const [webhookSecret, setWebhookSecret] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        const res = await api.get('/settings');
        if (isMounted) {
          // Destructure perfectly mapped to the Laravel Controller structure
          const { business, checkout, developer } = res.data.data;

          setGeneralForm({
            brand_name: checkout?.brand_name || business?.business_name || '',
            website_url: business?.website_url || '',
            logo_url: business?.logo_url || '',
            success_url: checkout?.success_url || '',
            cancel_url: checkout?.cancel_url || '',
          });

          setWebhookSecret(developer?.webhook_secret || '');
        }
      } catch (err) {
        toast.error("Failed to load settings from server.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    void fetchSettings();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Send both business_name and brand_name so the Laravel Controller 
      // updates both the core merchant table AND the settings table
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
    try {
      await api.put('/settings/password', {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation
      });
      
      toast.success('Password updated successfully.');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: unknown) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Failed to update password.' : 'System Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotateWebhookSecret = async () => {
    if (!window.confirm('Are you sure you want to rotate your webhook secret? Existing integrations will fail until updated.')) return;
    try {
      setIsSaving(true);
      const res = await api.post('/settings/webhook-secret/rotate');
      setWebhookSecret(res.data.data?.webhook_secret || '');
      toast.success('Webhook secret rotated successfully.');
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Failed to rotate webhook secret.' : 'System Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopied(true);
    toast.success("Webhook secret copied to clipboard!");
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
      
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Configuration</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Merchant Settings</h1>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation Menu */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')} 
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              activeTab === 'general' 
                ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'general' ? 'bg-[#35d5a4]/20 text-[#35d5a4]' : 'bg-white/5 text-[#68747e]'}`}>
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm">General Profile</p>
              <p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">Brand & URLs</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('security')} 
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              activeTab === 'security' 
                ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'security' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-[#68747e]'}`}>
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm">Security</p>
              <p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">Passwords</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('webhooks')} 
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              activeTab === 'webhooks' 
                ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                : 'bg-white/[0.02] border-white/5 text-[#8995a3] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'webhooks' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-[#68747e]'}`}>
              <Webhook className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm">Webhooks</p>
              <p className="text-[10px] uppercase tracking-wider text-[#68747e] mt-0.5">API Secrets</p>
            </div>
          </button>
        </div>

        {/* Right Content Panel */}
        <section className="lg:col-span-3 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative min-h-[500px]">
          
          {/* Tab 1: General Settings */}
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
                    <input
                      type="text"
                      value={generalForm.brand_name}
                      onChange={(e) => setGeneralForm({ ...generalForm, brand_name: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Website URL</label>
                    <input
                      type="url"
                      value={generalForm.website_url}
                      onChange={(e) => setGeneralForm({ ...generalForm, website_url: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Logo URL</label>
                    <input
                      type="url"
                      value={generalForm.logo_url}
                      onChange={(e) => setGeneralForm({ ...generalForm, logo_url: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      placeholder="https://yourwebsite.com/logo.png"
                    />
                  </div>
                  
                  <div className="md:col-span-2 pt-6 border-t border-white/5 mt-2">
                    <h4 className="text-sm font-bold text-white mb-6">Checkout Redirection</h4>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Default Success URL</label>
                    <input
                      type="url"
                      value={generalForm.success_url}
                      onChange={(e) => setGeneralForm({ ...generalForm, success_url: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      placeholder="Redirect after successful payment"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Default Cancel URL</label>
                    <input
                      type="url"
                      value={generalForm.cancel_url}
                      onChange={(e) => setGeneralForm({ ...generalForm, cancel_url: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      placeholder="Redirect if customer cancels"
                    />
                  </div>
                </div>
                <div className="border-t border-white/5 bg-white/[0.01] p-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Spinner /> : <Save className="h-4 w-4" />} 
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <>
              <div className="border-b border-white/5 bg-white/[0.01] p-6 md:px-8">
                <h2 className="text-lg font-bold text-white">Change Password</h2>
                <p className="text-xs text-[#8995a3] mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col">
                <div className="p-6 md:p-8 space-y-6 max-w-lg flex-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
                <div className="border-t border-white/5 bg-white/[0.01] p-6 flex justify-start md:px-8">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:brightness-110 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Spinner /> : <Shield className="h-4 w-4" />} 
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Tab 3: Webhook Secret */}
          {activeTab === 'webhooks' && (
            <>
              <div className="border-b border-white/5 bg-white/[0.01] p-6 md:px-8">
                <h2 className="text-lg font-bold text-white">HMAC Webhook Signing Secret</h2>
                <p className="text-xs text-[#8995a3] mt-1">Used to sign incoming webhook events via the <code className="bg-[#0a0f16] border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#e8edf2] ml-1">x-gateway-signature</code> header.</p>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <div className="max-w-xl">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Current Webhook Secret</label>
                  <div className="flex items-center mb-8 h-12 rounded-xl border border-white/10 bg-[#0a0f16] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-inner overflow-hidden">
                    <input
                      type="text"
                      readOnly
                      value={webhookSecret || 'No secret generated yet'}
                      className="h-full w-full bg-transparent px-4 text-sm font-mono text-[#e8edf2] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex h-full items-center justify-center gap-2 border-l border-white/10 bg-white/5 px-6 text-xs font-bold text-[#e8edf2] hover:bg-white/10 hover:text-white transition-all"
                    >
                      {copied ? <Check className="h-4 w-4 text-[#35d5a4]" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <strong className="text-sm font-bold text-red-400">Danger Zone</strong>
                    </div>
                    <p className="text-xs text-red-300/80 mb-6 leading-relaxed">
                      Rotating your secret will immediately invalidate signatures generated with the old secret. Your server will reject webhooks until you update your backend with the new secret.
                    </p>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleRotateWebhookSecret}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-6 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isSaving ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
                      {isSaving ? 'Rotating...' : 'Rotate Webhook Secret'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </section>
      </div>
    </div>
  );
}