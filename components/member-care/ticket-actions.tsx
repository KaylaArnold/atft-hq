import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import type { SupportTicket } from "@/data/support";

type TicketActionsProps = {
  ticket: SupportTicket;
  canSend: boolean;
};

export default function TicketActions({
  ticket,
  canSend,
}: TicketActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-5">
      <button
        type="button"
        disabled={!canSend}
        className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-[#06110a] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Mail size={14} />
        Send Reply
      </button>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2.5 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
      >
        <CheckCircle2 size={14} />
        Mark Resolved
      </button>

      <Link
        href={`/members/${ticket.memberId}?tab=support`}
        className="ml-auto flex items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
      >
        Open Member Workspace
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}