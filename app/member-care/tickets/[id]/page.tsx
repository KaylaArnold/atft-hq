"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";

import AppShell from "@/components/app-shell";
import TicketView from "@/components/member-care/ticket-view";
import { useHQ } from "@/context/HQContext";
import type { SupportStatus } from "@/data/support";

export default function SupportTicketPage() {
  const params = useParams<{ id: string }>();

  const {
    tickets,
    updateTicketStatus,
  } = useHQ();

  const ticketId = Number(params.id);

  const ticket = tickets.find(
    (item) => item.id === ticketId
  );

  function handleStatusChange(status: SupportStatus) {
    if (!ticket) {
      return;
    }

    updateTicketStatus(ticket.id, status);
  }

  if (!ticket) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <Link
            href="/member-care"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={16} />
            Back to Member Care
          </Link>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger)]">
              <CircleAlert size={21} />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-[var(--text)]">
              Ticket not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              This support ticket may have been removed, or the ticket link
              may be incorrect.
            </p>

            <Link
              href="/member-care"
              className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Return to Member Care
            </Link>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/member-care"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Member Care
        </Link>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <TicketView
            ticket={ticket}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </AppShell>
  );
}