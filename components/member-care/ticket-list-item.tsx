import Link from "next/link";
import { UserRound } from "lucide-react";

import type { SupportTicket } from "@/data/support";

type TicketListItemProps = {
  ticket: SupportTicket;
};

export default function TicketListItem({
  ticket,
}: TicketListItemProps) {
  const statusClass =
    ticket.status === "Needs Reply"
      ? "border-amber-500/20 bg-amber-50 text-amber-700"
      : ticket.status === "Waiting on Member"
        ? "border-sky-500/20 bg-sky-50 text-sky-700"
        : "border-emerald-600/20 bg-emerald-50 text-emerald-700";

  return (
    <Link
      href={`/member-care/tickets/${ticket.id}`}
      className="block w-full border-l-2 border-transparent px-4 py-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text)]">
            {ticket.memberName}
          </p>

          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {ticket.program}
          </p>
        </div>

        <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
          {ticket.receivedAt}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-medium text-[var(--text-secondary)]">
        {ticket.subject}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
        {ticket.preview}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusClass}`}
        >
          {ticket.status}
        </span>

        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <UserRound size={12} />
          <span>{ticket.assignedTo ?? "Unassigned"}</span>
        </div>
      </div>
    </Link>
  );
}