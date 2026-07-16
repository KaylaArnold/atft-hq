import { Clock3, Mail, UserRound } from "lucide-react";
import type { SupportTicket } from "@/data/support";

type TicketMessageProps = {
  ticket: SupportTicket;
};

export default function TicketMessage({ ticket }: TicketMessageProps) {
  return (
    <>
      <div className="border-b border-white/[0.06] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
              Ticket #{ticket.id}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              {ticket.subject}
            </h2>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#737c75]">
              <span className="flex items-center gap-2">
                <UserRound size={14} className="text-emerald-300" />
                {ticket.memberName}
              </span>

              <span className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-300" />
                {ticket.email}
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={14} className="text-emerald-300" />
                {ticket.receivedAt}
              </span>
            </div>
          </div>

          <span
            className={
              ticket.status === "Needs Reply"
                ? "w-fit rounded-full border border-amber-400/15 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300"
                : ticket.status === "Waiting on Member"
                  ? "w-fit rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300"
                  : "w-fit rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300"
            }
          >
            {ticket.status}
          </span>
        </div>
      </div>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
          Original Message
        </p>

        <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#a2aaa4]">
            {"body" in ticket && ticket.body ? ticket.body : ticket.preview}
          </p>
        </div>
      </section>
    </>
  );
}