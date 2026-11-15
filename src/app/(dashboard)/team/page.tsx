"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { UserPlus, Trash2, X, ChevronDown, Mail, ShieldAlert, ShieldBan, ShieldCheck, Users } from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { AnimatedNumber } from "@/components/dashboard/motion";
import {
  Banner, EmptyBlock, Field, Modal, PageHeader, Pill, SectionHead,
  btnDanger, btnDangerSoft, btnPrimary, btnSecondary, cardCls, inputCls, selectChevron, tdCls, thCls,
} from "@/components/dashboard/kit";

type TeamRole = "admin" | "developer" | "finance";
type TeamStatus = "pending" | "active" | "suspended";

const formatCount = (value: number) => new Intl.NumberFormat("en-NG").format(Math.round(value));

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole | "owner";
  status: TeamStatus;
  is_active: boolean;
  created_at: string;
}

const ROLE_OPTIONS: { value: TeamRole; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access except Owner" },
  { value: "developer", label: "Developer", desc: "API Keys & Webhooks" },
  { value: "finance", label: "Finance", desc: "Transactions, Ledger & Payouts" },
];

const smallBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-3 text-[12px] font-medium shadow-sm transition-colors";

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--pm-line)] bg-gradient-to-b from-white to-[var(--pm-band)] text-[13px] font-semibold text-[#52525B]">
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
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
    const t = window.setTimeout(() => { void loadTeam(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadTeam]);

  const counts = useMemo(() => ({
    total: team.length,
    active: team.filter((m) => m.status === "active").length,
    pending: team.filter((m) => m.status === "pending").length,
    suspended: team.filter((m) => m.status === "suspended").length,
  }), [team]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    try {
      await api.post("/team", { name: inviteName, email: inviteEmail, role: inviteRole });
      setIsInviteOpen(false);
      setSuccessMsg(`Secure invitation dispatched to ${inviteEmail}.`);
      setInviteName(""); setInviteEmail(""); setInviteRole("developer");
      setTimeout(() => setSuccessMsg(""), 5000);
      toast.success("Team invitation sent.");
      await loadTeam();
    } catch (err: unknown) {
      setInviteError(isAxiosError(err) ? err.response?.data?.message || "Failed to invite team member." : "An unexpected error occurred.");
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id: string) => {
    try { await api.post(`/team/${id}/resend`); toast.success("Invitation link resent securely."); }
    catch { toast.error("Failed to resend invitation."); }
  };

  const handleRoleChange = async (id: string, newRole: TeamRole) => {
    try { await api.patch(`/team/${id}`, { role: newRole }); toast.success("Access role updated successfully."); await loadTeam(); }
    catch { toast.error("Failed to update role."); }
  };

  const handleToggleSuspend = async (member: TeamMember) => {
    try {
      await api.patch(`/team/${member.id}`, { is_active: !member.is_active });
      toast.success(!member.is_active ? "User access restored." : "User access suspended.");
      await loadTeam();
    } catch { toast.error("Failed to update status."); }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await api.delete(`/team/${memberToRemove.id}`);
      toast.success(memberToRemove.status === "pending" ? "Invitation cancelled permanently." : "User removed from organization.");
      setMemberToRemove(null);
      await loadTeam();
    } catch { toast.error("Failed to execute action."); }
    finally { setRemoving(false); }
  };

  const statusPill = (s: TeamStatus) =>
    s === "active" ? <Pill tone="success">Active</Pill>
    : s === "pending" ? <Pill tone="warning">Pending invite</Pill>
    : <Pill tone="danger">Suspended</Pill>;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
        <PageHeader
          eyebrow="Organization"
          title="Team Management"
          description="Invite teammates and control what each role can access."
          action={
            <button type="button" onClick={() => { setInviteError(""); setIsInviteOpen(true); }} className={`${btnPrimary} w-fit`}>
              <UserPlus className="h-4 w-4" /> Invite New Member
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total members", value: counts.total, hint: "Everyone in your workspace" },
            { label: "Active", value: counts.active, hint: "Currently have access" },
            { label: "Pending", value: counts.pending, hint: "Awaiting acceptance" },
            { label: "Suspended", value: counts.suspended, hint: "Access paused" },
          ].map((s) => (
            <div key={s.label} className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5 transition-all hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]">
              <p className="text-[13px] font-medium text-[#71717A]">{s.label}</p>
              <p className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">
                <AnimatedNumber value={s.value} format={formatCount} />
              </p>
              <p className="mt-3 text-[12px] text-[#A1A1AA]">{s.hint}</p>
            </div>
          ))}
        </div>

        {successMsg && <Banner tone="success">{successMsg}</Banner>}

        <section className={`${cardCls} overflow-hidden`}>
          <SectionHead icon={<Users className="h-4 w-4" />} title="Members" subtitle="Manage roles, access and invitations" />
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full whitespace-nowrap border-collapse text-left">
              <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                <tr>
                  <th className={thCls}>Member</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Access role</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center"><Spinner /></td></tr>
                ) : team.length === 0 ? (
                  <tr><td colSpan={4}><EmptyBlock icon={<Users className="h-6 w-6" />} title="No team members yet" description="Invite your first teammate to share access to this workspace." /></td></tr>
                ) : (
                  team.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band)]">
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold">{member.name}</p>
                            <p className="truncate text-[12px] text-[#71717A]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdCls}>{statusPill(member.status)}</td>
                      <td className={tdCls}>
                        {member.role === "owner" ? (
                          <Pill tone="info" dot={false}>Owner</Pill>
                        ) : (
                          <div className="relative w-40">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                              style={selectChevron}
                              className="h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-[var(--pm-line)] bg-white px-3 pr-8 text-[13px] font-medium shadow-sm outline-none transition-all hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]"
                            >
                              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </div>
                        )}
                      </td>
                      <td className={`${tdCls} text-right`}>
                        {member.role !== "owner" && (
                          <div className="flex items-center justify-end gap-2">
                            {member.status === "pending" ? (
                              <>
                                <button type="button" onClick={() => handleResend(member.id)} className={`${smallBtn} border-[var(--pm-line)] bg-white text-[#09090B] hover:bg-[var(--pm-band)]`}>
                                  <Mail className="h-3.5 w-3.5" /> Resend invite
                                </button>
                                <button type="button" onClick={() => setMemberToRemove(member)} className={`${smallBtn} border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]`}>
                                  <X className="h-3.5 w-3.5" /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuspend(member)}
                                  className={`${smallBtn} ${member.is_active ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]" : "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"}`}
                                >
                                  {member.is_active ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                  {member.is_active ? "Suspend" : "Restore"}
                                </button>
                                <button type="button" onClick={() => setMemberToRemove(member)} className={`${smallBtn} border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]`}>
                                  <Trash2 className="h-3.5 w-3.5" /> Remove
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invite */}
        <Modal
          open={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite team member"
          subtitle="Send a secure email invitation"
          icon={<UserPlus className="h-5 w-5" />}
          footer={
            <>
              <button type="button" onClick={() => setIsInviteOpen(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" form="invite-form" disabled={inviting || !inviteName.trim() || !inviteEmail.trim()} className={btnPrimary}>
                {inviting ? <Spinner /> : "Send invite"}
              </button>
            </>
          }
        >
          <form id="invite-form" onSubmit={handleInvite} className="space-y-5">
            {inviteError && <Banner tone="danger">{inviteError}</Banner>}
            <Field label="Full name">
              <input required value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. Jane Doe" className={inputCls} />
            </Field>
            <Field label="Email address">
              <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@company.com" className={inputCls} />
            </Field>
            <Field label="Access role">
              <div className="space-y-2">
                {ROLE_OPTIONS.map((r) => (
                  <label key={r.value} className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3 transition-colors ${inviteRole === r.value ? "border-[#09090B] bg-[var(--pm-band)]" : "border-[var(--pm-line)] hover:bg-[var(--pm-band)]"}`}>
                    <input type="radio" name="invite-role" checked={inviteRole === r.value} onChange={() => setInviteRole(r.value)} className="mt-0.5 size-4 accent-[#09090B]" />
                    <div>
                      <p className="text-[13px] font-medium">{r.label}</p>
                      <p className="mt-0.5 text-[12px] text-[#71717A]">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
          </form>
        </Modal>

        {/* Remove */}
        <Modal
          open={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          title={memberToRemove?.status === "pending" ? "Cancel invitation?" : "Remove team member?"}
          subtitle={memberToRemove ? `${memberToRemove.name} (${memberToRemove.email})` : undefined}
          icon={<ShieldAlert className="h-5 w-5" />}
          tone="danger"
          footer={
            <>
              <button type="button" onClick={() => setMemberToRemove(null)} className={btnSecondary}>Keep user</button>
              <button type="button" disabled={removing} onClick={handleRemoveMember} className={btnDanger}>
                {removing ? <Spinner /> : memberToRemove?.status === "pending" ? "Cancel invite" : "Remove user"}
              </button>
            </>
          }
        >
          <p className="text-[13px] leading-[1.6] text-[#52525B]">
            {memberToRemove?.status === "pending"
              ? "This permanently invalidates the invitation link sent to their email. They won't be able to join your organization."
              : "This user will immediately lose access to your merchant console and all associated privileges. This action cannot be undone."}
          </p>
        </Modal>
      </div>
    </RoleGuard>
  );
}