import { Search } from "lucide-react";
import type { SupportTicket } from "@/data/support";
import TicketListItem from "./ticket-list-item";

type TicketListProps = {
  tickets: SupportTicket[];
  selectedTicketId: number;
  onSelectTicket: (ticketId: number) => void;
};

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketListProps) {
  return (
    <aside className="border-b border-white/[0.06] xl:border-b-0 xl:border-r">
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
              Tickets
            </p>

            <p className="mt-1 text-sm font-medium">
              {tickets.length} conversations
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606861]"
          />

          <input
            type="search"
            placeholder="Search tickets..."
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 pr-3 text-xs outline-none placeholder:text-[#59615b] focus:border-emerald-400/20"
          />
        </div>
      </div>

      <div className="max-h-[650px] divide-y divide-white/[0.05] overflow-y-auto">
        {tickets.map((ticket) => (
          <TicketListItem
            key={ticket.id}
            ticket={ticket}
            selected={ticket.id === selectedTicketId}
            onSelect={() => onSelectTicket(ticket.id)}
          />
        ))}
      </div>
    </aside>
  );
}