"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  UserPlus, Trash2, CheckCircle2, 
  AlertTriangle, X, ChevronDown, Mail, ShieldAlert, ShieldBan, ShieldCheck
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

type TeamRole = "admin" | "developer" | "finance";
type TeamStatus = "pending" | "active" | "suspended";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole | "owner";
  status: TeamStatus;
  is_active: boolean;
  created_at: string;
}

export default function TeamPage() {
  const toast = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("developer");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadTeam = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data: TeamMember[] }>("/team");
      setTeam(res.data.data);
    } catch {
      toast.error("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTeam();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      await api.post("/team", { name: inviteName, email: inviteEmail, role: inviteRole });

      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("developer");

      setSuccessMsg(`Secure invitation dispatched to ${inviteEmail}.`);
      setTimeout(() => setSuccessMsg(""), 5000);
      toast.success("Team invitation sent.");
      await loadTeam();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setInviteError(err.response?.data?.message || "Failed to invite team member.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      await api.post(`/team/${id}/resend`);
      toast.success("Invitation link resent securely.");
    } catch {
      toast.error("Failed to resend invitation.");
    }
  };

  const handleRoleChange = async (id: string, newRole: TeamRole) => {
    try {
      await api.patch(`/team/${id}`, { role: newRole });
      toast.success("Access role updated successfully.");
      await loadTeam();
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleToggleSuspend = async (member: TeamMember) => {
    try {
      await api.patch(`/team/${member.id}`, { is_active: !member.is_active });
      toast.success(!member.is_active ? "User access restored." : "User access suspended.");
      await loadTeam();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await api.delete(`/team/${memberToRemove.id}`);
      toast.success(memberToRemove.status === 'pending' ? "Invitation cancelled permanently." : "User removed from organization.");
      setMemberToRemove(null);
      await loadTeam();
    } catch {
      toast.error("Failed to execute action.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    // Admin ONLY allowed
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8 animate-in fade-in duration-300 relative">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Organization</p>
            <h1 className="text-2xl font-bold text-ink drop-shadow-sm mt-1">Team Management</h1>
          </div>
          <button
            onClick={() => { setInviteError(""); setIsInviteOpen(true); }}
            className="flex items-center gap-2 rounded-input bg-gradient-to-r from-brand-500 to-brand-800 px-6 py-2.5 text-sm font-bold text-ink hover:brightness-110 shadow-lg"
          >
            <UserPlus className="h-4 w-4" /> Invite New Member
          </button>
        </header>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-input bg-success-tint border border-line p-4 text-xs text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> <p>{successMsg}</p>
          </div>
        )}

        {/* Main Table Content */}
        <section className="rounded-card border border-line bg-surface backdrop-blur-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-line">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-ink-muted">Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-ink-muted">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-ink-muted">Access Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-ink-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   <tr><td colSpan={4} className="p-8 text-center"><Spinner /></td></tr>
                ) : team.map((member) => (
                  <tr key={member.id} className="hover:bg-surface transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-ink text-sm">{member.name}</span>
                        <span className="text-xs text-ink-muted">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {member.status === "pending" && <span className="text-[10px] uppercase font-bold tracking-wider text-pending bg-surface-muted border border-line px-2.5 py-1 rounded-md">Pending Invite</span>}
                      {member.status === "active" && <span className="text-[10px] uppercase font-bold tracking-wider text-success bg-success-tint border border-line px-2.5 py-1 rounded-md">Active</span>}
                      {member.status === "suspended" && <span className="text-[10px] uppercase font-bold tracking-wider text-danger bg-danger-tint border border-line px-2.5 py-1 rounded-md">Suspended</span>}
                    </td>
                    <td className="px-8 py-5">
                      {member.role === "owner" ? (
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Owner</span>
                      ) : (
                        <div className="relative inline-block w-40">
                          <select 
                            value={member.role} 
                            onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)} 
                            className="w-full appearance-none bg-surface border border-line text-xs font-bold text-ink px-3 py-2 rounded-input outline-none focus:border-brand-500 cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                            <option value="finance">Finance</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {member.role !== "owner" && (
                        <div className="flex items-center justify-end gap-2">
                          {member.status === 'pending' && (
                            <>
                              <button onClick={() => handleResend(member.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-input bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors">
                                <Mail className="h-3.5 w-3.5" /> Resend Invite
                              </button>
                              <button onClick={() => setMemberToRemove(member)} className="flex items-center gap-1.5 px-3 py-2 rounded-input bg-danger-tint border border-line text-danger hover:bg-danger-tint text-xs font-bold transition-colors">
                                <X className="h-3.5 w-3.5" /> Cancel Invite
                              </button>
                            </>
                          )}
                          {member.status !== 'pending' && (
                            <>
                              <button onClick={() => handleToggleSuspend(member)} className={`flex items-center gap-1.5 px-3 py-2 rounded-input border text-xs font-bold transition-colors ${member.is_active ? "bg-surface-muted border-line text-pending hover:bg-pending/20" : "bg-success-tint border-line text-success hover:bg-success-tint"}`}>
                                {member.is_active ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                {member.is_active ? 'Suspend Access' : 'Restore Access'}
                              </button>
                              <button onClick={() => setMemberToRemove(member)} className="flex items-center gap-1.5 px-3 py-2 rounded-input bg-danger-tint border border-line text-danger hover:bg-danger-tint text-xs font-bold transition-colors">
                                <Trash2 className="h-3.5 w-3.5" /> Remove User
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-card border border-line bg-surface shadow-card overflow-hidden flex flex-col relative scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-line bg-surface p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-input bg-success-tint border border-line text-brand-500">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Invite Team Member</h3>
                    <p className="text-xs text-ink-muted">Send a secure email invitation</p>
                  </div>
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="rounded-full p-2 text-ink-muted hover:text-ink transition-colors bg-surface-muted hover:bg-surface-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-6 space-y-5">
                {inviteError && (
                  <div className="flex items-center gap-2 rounded-input bg-danger-tint border border-line p-3 text-xs text-danger leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p>{inviteError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Full Name</label>
                  <input required value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full h-11 rounded-input border border-line bg-bg px-4 text-sm text-ink outline-none focus:border-brand-500 shadow-inner" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Email Address</label>
                  <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@company.com" className="w-full h-11 rounded-input border border-line bg-bg px-4 text-sm text-ink outline-none focus:border-brand-500 shadow-inner" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Access Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)} className="w-full h-11 rounded-input border border-line bg-bg px-4 text-sm font-bold text-ink outline-none focus:border-brand-500 shadow-inner cursor-pointer">
                    <option value="admin">Admin (Full Access except Owner)</option>
                    <option value="developer">Developer (API Keys & Webhooks)</option>
                    <option value="finance">Finance (Transactions, Ledger & Payouts)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-line flex gap-3">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="w-1/2 h-11 rounded-input border border-line bg-surface-muted text-xs font-bold text-ink hover:bg-surface-muted">
                    Cancel
                  </button>
                  <button type="submit" disabled={inviting || !inviteName.trim() || !inviteEmail.trim()} className="w-1/2 h-11 rounded-input bg-gradient-to-r from-brand-500 to-brand-800 text-xs font-bold text-ink hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-card">
                    {inviting ? <Spinner /> : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {memberToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-card border border-line bg-surface shadow-card p-6 space-y-5 scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-input border bg-danger-tint border-line text-danger">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {memberToRemove.status === 'pending' ? 'Cancel Invitation?' : 'Remove Team Member?'}
                  </h3>
                  <p className="text-xs text-ink-muted">{memberToRemove.name} ({memberToRemove.email})</p>
                </div>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                {memberToRemove.status === 'pending' 
                  ? "This will permanently invalidate the invitation link sent to their email. They will not be able to join your organization."
                  : "This user will immediately lose access to your merchant console and all associated privileges. This action cannot be undone."}
              </p>

              <div className="flex gap-3 pt-2 border-t border-line">
                <button onClick={() => setMemberToRemove(null)} className="w-1/2 h-11 rounded-input border border-line bg-surface-muted text-xs font-bold text-ink hover:bg-surface-muted">
                  Keep User
                </button>
                <button disabled={removing} onClick={handleRemoveMember} className="w-1/2 h-11 rounded-input bg-red-600 hover:bg-red-500 text-xs font-bold text-ink flex items-center justify-center gap-2">
                  {removing ? <Spinner /> : (memberToRemove.status === 'pending' ? 'Cancel Invite' : 'Remove User')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}