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
  const statusClass =
    ticket.status === "Needs Reply"
      ? "border-amber-500/20 bg-amber-50 text-amber-700"
      : ticket.status === "Waiting on Member"
        ? "border-sky-500/20 bg-sky-50 text-sky-700"
        : "border-emerald-600/20 bg-emerald-50 text-emerald-700";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "w-full border-l-2 border-emerald-700 bg-emerald-50/80 px-4 py-4 text-left transition"
          : "w-full border-l-2 border-transparent px-4 py-4 text-left transition hover:bg-[#f7f9f8]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#17201a]">
            {ticket.memberName}
          </p>

          <p className="mt-1 truncate text-xs text-[#6f7a72]">
            {ticket.program}
          </p>
        </div>

        <span className="shrink-0 text-[10px] text-[#879089]">
          {ticket.receivedAt}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-medium text-[#2d3730]">
        {ticket.subject}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#667169]">
        {ticket.preview}
      </p>

      <span
        className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusClass}`}
      >
        {ticket.status}
      </span>
    </button>
  );
}