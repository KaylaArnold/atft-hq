"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Inbox,
  Search,
  UserRound,
} from "lucide-react";

import type { SupportTicket } from "@/data/support";
import { teamMembers } from "@/data/team";

import TicketListItem from "./ticket-list-item";

export type TicketViewFilter = "open" | "resolved";

type TicketListProps = {
  tickets: SupportTicket[];
  selectedTicketId: number;
  activeView?: TicketViewFilter;
  onViewChange?: (view: TicketViewFilter) => void;
  onSelectTicket: (ticketId: number) => void;
};

export default function TicketList({
  tickets,
  selectedTicketId,
  activeView = "open",
  onViewChange,
  onSelectTicket,
}: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const openCount = tickets.filter(
    (ticket) => ticket.status !== "Resolved"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const availableAssignees = useMemo(() => {
    const assignedNames = tickets
      .map((ticket) => ticket.assignedTo)
      .filter((name): name is string => Boolean(name));

    return Array.from(
      new Set([...teamMembers, ...assignedNames])
    ).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    return tickets.filter((ticket) => {
      const matchesView =
        activeView === "resolved"
          ? ticket.status === "Resolved"
          : ticket.status !== "Resolved";

      if (!matchesView) {
        return false;
      }

      const matchesAssignee =
        assigneeFilter === "all"
          ? true
          : assigneeFilter === "unassigned"
            ? !ticket.assignedTo
            : ticket.assignedTo === assigneeFilter;

      if (!matchesAssignee) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableContent = [
        ticket.subject,
        ticket.preview,
        ticket.memberName,
        ticket.email,
        ticket.program,
        ticket.assignedTo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });
  }, [
    activeView,
    assigneeFilter,
    searchQuery,
    tickets,
  ]);

  return (
    <aside className="border-b border-[var(--border)] xl:border-b-0 xl:border-r">
      <div className="border-b border-[var(--border)] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Tickets
          </p>

          <p className="mt-1 text-sm font-medium text-[var(--text)]">
            {visibleTickets.length}{" "}
            {visibleTickets.length === 1
              ? "conversation"
              : "conversations"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-xl bg-[var(--surface-soft)] p-1">
          <button
            type="button"
            onClick={() => onViewChange?.("open")}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeView === "open"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Inbox size={14} />
            Open

            <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
              {openCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange?.("resolved")}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeView === "resolved"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <CheckCircle2 size={14} />
            Resolved

            <span className="rounded-full bg-[var(--success-soft)] px-1.5 py-0.5 text-[10px] text-[var(--success)]">
              {resolvedCount}
            </span>
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search tickets..."
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="relative mt-3">
          <UserRound
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <select
            value={assigneeFilter}
            onChange={(event) =>
              setAssigneeFilter(event.target.value)
            }
            aria-label="Filter tickets by assignee"
            className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-xs text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          >
            <option value="all">All assignees</option>
            <option value="unassigned">Unassigned</option>

            {availableAssignees.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]">
            ▼
          </span>
        </div>
      </div>

      <div className="max-h-[650px] divide-y divide-[var(--border)] overflow-y-auto">
        {visibleTickets.length > 0 ? (
          visibleTickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              ticket={ticket}
              selected={
                ticket.id === selectedTicketId
              }
              onSelect={() =>
                onSelectTicket(ticket.id)
              }
            />
          ))
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[var(--text)]">
              No tickets found
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              {searchQuery.trim()
                ? "Try a different search."
                : assigneeFilter !== "all"
                  ? "No tickets match this assignee filter."
                  : activeView === "resolved"
                    ? "Resolved tickets will appear here."
                    : "There are no open support tickets."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}