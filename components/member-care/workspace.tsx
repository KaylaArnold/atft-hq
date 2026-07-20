"use client";

import { useState } from "react";
import { useHQ } from "@/context/HQContext";
import TicketList from "./ticket-list";
import TicketView from "./ticket-view";
import MemberSnapshot from "./member-snapshot";

export type SentReply = {
  body: string;
  sentAt: string;
};

export default function Workspace() {
  const { tickets, updateTicketStatus } = useHQ();

  const [selectedTicketId, setSelectedTicketId] = useState(
    tickets[0]?.id ?? null
  );

  const [sentReplies, setSentReplies] = useState<
    Record<string, SentReply>
  >({});

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ??
    tickets[0];

  function sendReply(ticketId: string, body: string) {
    const trimmedBody = body.trim();

    if (!trimmedBody) return;

    setSentReplies((currentReplies) => ({
      ...currentReplies,
      [ticketId]: {
        body: trimmedBody,
        sentAt: new Date().toISOString(),
      },
    }));
  }

  if (!selectedTicket) {
    return (
      <section className="panel rounded-3xl p-8 text-center">
<<<<<<< Updated upstream
        <p className="text-sm text-[#667169]">
=======
        <p className="text-sm text-[var(--text-muted)]">
>>>>>>> Stashed changes
          No member-care tickets are available.
        </p>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden rounded-3xl">
      <div className="grid min-h-[720px] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <TicketList
          tickets={tickets}
          selectedTicketId={selectedTicket.id}
          onSelectTicket={setSelectedTicketId}
        />

        <TicketView
          ticket={selectedTicket}
<<<<<<< Updated upstream
          onStatusChange={(status) =>
            updateTicketStatus(selectedTicket.id, status)
          }
=======
          sentReply={sentReplies[selectedTicket.id]}
          onSendReply={sendReply}
>>>>>>> Stashed changes
        />

        <MemberSnapshot ticket={selectedTicket} />
      </div>
    </section>
  );
}