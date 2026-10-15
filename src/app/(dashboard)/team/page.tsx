"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  UserPlus, Trash2, CheckCircle2, 
  AlertTriangle, X, ChevronDown, Mail, ShieldAlert, ShieldBan, ShieldCheck
} from "lucide-react";
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Organization</p>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Team Management</h1>
          </div>
          <button
            onClick={() => { setInviteError(""); setIsInviteOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 shadow-lg"
          >
            <UserPlus className="h-4 w-4" /> Invite New Member
          </button>
        </header>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> <p>{successMsg}</p>
          </div>
        )}

        {/* Main Table Content */}
        <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/1 border-b border-white/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-[#8995a3]">Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-[#8995a3]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-[#8995a3]">Access Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   <tr><td colSpan={4} className="p-8 text-center"><Spinner /></td></tr>
                ) : team.map((member) => (
                  <tr key={member.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{member.name}</span>
                        <span className="text-xs text-[#8995a3]">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {member.status === "pending" && <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">Pending Invite</span>}
                      {member.status === "active" && <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">Active</span>}
                      {member.status === "suspended" && <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">Suspended</span>}
                    </td>
                    <td className="px-8 py-5">
                      {member.role === "owner" ? (
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Owner</span>
                      ) : (
                        <div className="relative inline-block w-40">
                          <select 
                            value={member.role} 
                            onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)} 
                            className="w-full appearance-none bg-[#0a0f16] border border-white/10 text-xs font-bold text-white px-3 py-2 rounded-lg outline-none focus:border-[#2f9d78] cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                            <option value="finance">Finance</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#68747e] pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {member.role !== "owner" && (
                        <div className="flex items-center justify-end gap-2">
                          {member.status === 'pending' && (
                            <>
                              <button onClick={() => handleResend(member.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors">
                                <Mail className="h-3.5 w-3.5" /> Resend Invite
                              </button>
                              <button onClick={() => setMemberToRemove(member)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors">
                                <X className="h-3.5 w-3.5" /> Cancel Invite
                              </button>
                            </>
                          )}
                          {member.status !== 'pending' && (
                            <>
                              <button onClick={() => handleToggleSuspend(member)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${member.is_active ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"}`}>
                                {member.is_active ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                {member.is_active ? 'Suspend Access' : 'Restore Access'}
                              </button>
                              <button onClick={() => setMemberToRemove(member)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors">
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
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col relative scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f9d78]/10 border border-[#2f9d78]/20 text-[#35d5a4]">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
                    <p className="text-xs text-[#8995a3]">Send a secure email invitation</p>
                  </div>
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="rounded-full p-2 text-[#8995a3] hover:text-white transition-colors bg-white/5 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-6 space-y-5">
                {inviteError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p>{inviteError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Full Name</label>
                  <input required value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full h-11 rounded-xl border border-white/10 bg-[#05080c] px-4 text-sm text-white outline-none focus:border-[#2f9d78] shadow-inner" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Email Address</label>
                  <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@company.com" className="w-full h-11 rounded-xl border border-white/10 bg-[#05080c] px-4 text-sm text-white outline-none focus:border-[#2f9d78] shadow-inner" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Access Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)} className="w-full h-11 rounded-xl border border-white/10 bg-[#05080c] px-4 text-sm font-bold text-white outline-none focus:border-[#2f9d78] shadow-inner cursor-pointer">
                    <option value="admin">Admin (Full Access except Owner)</option>
                    <option value="developer">Developer (API Keys & Webhooks)</option>
                    <option value="finance">Finance (Transactions, Ledger & Payouts)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-3">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="w-1/2 h-11 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={inviting || !inviteName.trim() || !inviteEmail.trim()} className="w-1/2 h-11 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(47,157,120,0.3)]">
                    {inviting ? <Spinner /> : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {memberToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl p-6 space-y-5 scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-red-500/10 border-red-500/20 text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {memberToRemove.status === 'pending' ? 'Cancel Invitation?' : 'Remove Team Member?'}
                  </h3>
                  <p className="text-xs text-[#8995a3]">{memberToRemove.name} ({memberToRemove.email})</p>
                </div>
              </div>

              <p className="text-xs text-[#8995a3] leading-relaxed">
                {memberToRemove.status === 'pending' 
                  ? "This will permanently invalidate the invitation link sent to their email. They will not be able to join your organization."
                  : "This user will immediately lose access to your merchant console and all associated privileges. This action cannot be undone."}
              </p>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button onClick={() => setMemberToRemove(null)} className="w-1/2 h-11 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10">
                  Keep User
                </button>
                <button disabled={removing} onClick={handleRemoveMember} className="w-1/2 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center justify-center gap-2">
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