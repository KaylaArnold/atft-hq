import ActivityTimeline from "./activity-timeline";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { SupportTicket } from "@/data/support";
import { members } from "@/data/members";

type MemberSnapshotProps = {
  ticket: SupportTicket;
};

export default function MemberSnapshot({
  ticket,
}: MemberSnapshotProps) {
  const member = members.find(
    (item) => item.id === ticket.memberId
  );

  const initials = ticket.memberName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <aside className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
        Member Snapshot
      </p>

      <div className="mt-5 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300">
          {initials}
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            {ticket.memberName}
          </h3>

          <p className="mt-1 text-xs text-[#737c75]">
            {ticket.program}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-6">
        <SnapshotRow
          icon={ShieldCheck}
          label="Community"
          value={
            member
              ? member.community
                ? "Access Granted"
                : "No Access"
              : "Unknown"
          }
          tone={
            member?.community ? "success" : "warning"
          }
        />

        <SnapshotRow
          icon={WalletCards}
          label="Payments"
          value={member?.payments ?? "Unknown"}
          tone={
            member?.payments === "Current"
              ? "success"
              : "warning"
          }
        />

        <SnapshotRow
          icon={Mail}
          label="Support"
          value={member?.support ?? ticket.status}
          tone={
            ticket.status === "Resolved"
              ? "success"
              : "warning"
          }
        />

        <SnapshotRow
          icon={UserRound}
          label="Program"
          value={ticket.program}
          tone="neutral"
        />
      </div>

      <ActivityTimeline />
      
      <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-6">
        {member?.email && (
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2.5 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            <Mail size={14} />
            Email Member
          </a>
        )}

        {member?.phone && (
          <a
            href={`tel:${member.phone}`}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2.5 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            <Phone size={14} />
            Call Member
          </a>
        )}

        <Link
          href={`/members/${ticket.memberId}?tab=support`}
          className="flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
        >
          Open Full Workspace
          <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

type SnapshotRowProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  tone: "success" | "warning" | "neutral";
};

function SnapshotRow({
  icon: Icon,
  label,
  value,
  tone,
}: SnapshotRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-[#747d76]">
        <Icon size={14} className="text-emerald-300" />
        {label}
      </div>

      <p
        className={
          tone === "success"
            ? "mt-1 text-sm font-medium text-emerald-300"
            : tone === "warning"
              ? "mt-1 text-sm font-medium text-amber-300"
              : "mt-1 text-sm font-medium text-[#d8ddd9]"
        }
      >
        {value}
      </p>
    </div>
  );
}