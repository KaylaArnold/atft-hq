"use client";

import TicketList from "./ticket-list";

export default function Workspace() {
  return (
    <section className="panel overflow-hidden rounded-3xl">
      <div className="min-h-[720px]">
        <TicketList />
      </div>
    </section>
  );
}