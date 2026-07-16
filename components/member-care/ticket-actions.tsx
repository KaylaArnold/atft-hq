import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import type { SupportTicket } from "@/data/support";

type TicketActionsProps = {
  ticket: SupportTicket;
  canSend: boolean;
  onSend: () => void;
  onResolve: () => void;
};

export default function TicketActions({
  ticket,
  canSend,
  onSend,
  onResolve,
}: TicketActionsProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#e5e9e6] pt-6">
      <button
        type="button"
        disabled={!canSend}
        onClick={onSend}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-emerald-700
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-emerald-800
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <Mail size={15} />
        Send Reply
      </button>

      <button
        type="button"
        onClick={onResolve}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-[#dfe5e1]
          bg-white
          px-5
          py-2.5
          text-sm
          font-medium
          text-[#4f5b54]
          transition
          hover:border-emerald-700/20
          hover:bg-emerald-50
          hover:text-emerald-700
        "
      >
        <CheckCircle2 size={15} />
        Mark Resolved
      </button>

      <Link
        href={`/members/${ticket.memberId}?tab=support`}
        className="
          ml-auto
          flex
          items-center
          gap-2
          rounded-xl
          px-3
          py-2
          text-sm
          font-semibold
          text-emerald-700
          transition
          hover:bg-emerald-50
          hover:text-emerald-800
        "
      >
        Open Member Workspace
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}