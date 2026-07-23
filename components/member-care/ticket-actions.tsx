import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  RotateCcw,
} from "lucide-react";

import type { SupportTicket } from "@/data/support";

type TicketActionsProps = {
  ticket: SupportTicket;
  canSend: boolean;
  onSend: () => void;
  onResolve: () => void;
  onReopen: () => void;
};

export default function TicketActions({
  ticket,
  canSend,
  onSend,
  onResolve,
  onReopen,
}: TicketActionsProps) {
  const isResolved = ticket.status === "Resolved";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
      {!isResolved && (
        <button
          type="button"
          disabled={!canSend}
          onClick={onSend}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Mail size={15} />
          Send Reply
        </button>
      )}

      {isResolved ? (
        <button
          type="button"
          onClick={onReopen}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <RotateCcw size={15} />
          Reopen Ticket
        </button>
      ) : (
        <button
          type="button"
          onClick={onResolve}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <CheckCircle2 size={15} />
          Mark Resolved
        </button>
      )}

      <Link
        href={`/members/${ticket.memberId}?tab=support`}
        className="ml-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
      >
        Open Member Workspace
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}