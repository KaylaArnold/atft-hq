import type { SupportTicket } from "@/data/support";

type TicketListItemProps = {
  ticket: SupportTicket;
  selected: boolean;
  onSelect: () => void;
};

export default function TicketListItem({
  ticket,
  selected,
  onSelect,
}: TicketListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "w-full border-l-2 border-emerald-400 bg-emerald-400/[0.06] px-4 py-4 text-left"
          : "w-full border-l-2 border-transparent px-4 py-4 text-left transition hover:bg-white/[0.025]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#e5e9e6]">
            {ticket.memberName}
          </p>

          <p className="mt-1 truncate text-xs text-[#788079]">
            {ticket.program}
          </p>
        </div>

        <span className="shrink-0 text-[10px] text-[#697169]">
          {ticket.receivedAt}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-medium text-[#cdd3ce]">
        {ticket.subject}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#737b74]">
        {ticket.preview}
      </p>

      <span
        className={
          ticket.status === "Needs Reply"
            ? "mt-3 inline-flex rounded-full border border-amber-400/15 bg-amber-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-300"
            : ticket.status === "Waiting on Member"
              ? "mt-3 inline-flex rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-sky-300"
              : "mt-3 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-300"
        }
      >
        {ticket.status}
      </span>
    </button>
  );
}