"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useHQ } from "@/context/HQContext";
import TicketList, {
  type TicketViewFilter,
} from "./ticket-list";

export default function Workspace() {
  const router = useRouter();
  const { tickets } = useHQ();

  const [activeView, setActiveView] =
    useState<TicketViewFilter>("open");

  function openTicket(ticketId: number) {
    router.push(`/member-care/tickets/${ticketId}`);
  }

  return (
    <section className="panel overflow-hidden rounded-3xl">
      <div className="min-h-[720px]">
        <TicketList
          tickets={tickets}
          selectedTicketId={-1}
          activeView={activeView}
          onViewChange={setActiveView}
          onSelectTicket={openTicket}
        />
      </div>
    </section>
  );
}