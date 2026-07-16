"use client";

import { useState } from "react";
import { members } from "@/data/members";
import { supportTickets } from "@/data/support";

export function useHQStore() {
  const [allMembers, setMembers] = useState(members);
  const [tickets, setTickets] = useState(supportTickets);

  function updateTicketStatus(
    ticketId: number,
    status: typeof supportTickets[number]["status"]
  ) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status }
          : ticket
      )
    );
  }

  return {
    members: allMembers,
    setMembers,

    tickets,
    setTickets,

    updateTicketStatus,
  };
}