import { Clock3, Mail, UserRound } from "lucide-react";
import type { SupportTicket } from "@/data/support";

type TicketMessageProps = {
  ticket: SupportTicket;
};

export default function TicketMessage({ ticket }: TicketMessageProps) {
  const statusClass =
    ticket.status === "Needs Reply"
      ? "border-amber-500/20 bg-amber-50 text-amber-700"
      : ticket.status === "Waiting on Member"
        ? "border-sky-500/20 bg-sky-50 text-sky-700"
        : "border-emerald-600/20 bg-emerald-50 text-emerald-700";

  return (
    <>
      <div className="border-b border-[#e5e9e6] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
              Ticket #{ticket.id}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17201a]">
              {ticket.subject}
            </h2>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#667169]">
              <span className="flex items-center gap-2">
                <UserRound size={14} className="text-emerald-700" />
                {ticket.memberName}
              </span>

              <span className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-700" />
                {ticket.email}
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={14} className="text-emerald-700" />
                {ticket.receivedAt}
              </span>
            </div>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass}`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

          <section className="px-5 pt-6 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
              Original Message
            </p>

            <div className="mt-3 rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#4e5b53]">
                {"body" in ticket && ticket.body ? ticket.body : ticket.preview}
              </p>
            </div>
          </section>
    </>
  );
}