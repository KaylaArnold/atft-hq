"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  Save,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import { useHQ } from "@/context/HQContext";
import type { SupportStatus } from "@/data/support";
import { teamMembers } from "@/data/team";

const ticketStatuses: SupportStatus[] = [
  "Needs Reply",
  "Waiting on Member",
  "Resolved",
];

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { members, tickets, addTicket } = useHQ();

  const [createdTicketId, setCreatedTicketId] = useState<
    number | null
  >(null);

  const [memberId, setMemberId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] =
    useState<SupportStatus>("Needs Reply");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedMember = useMemo(
    () =>
      members.find(
        (member) => String(member.id) === memberId
      ),
    [memberId, members]
  );

  useEffect(() => {
    if (createdTicketId === null) {
        return;
    }

    const ticketExists = tickets.some(
        (ticket) => ticket.id === createdTicketId
    );

    if (ticketExists) {
        router.push(
            `/member-care/tickets/${createdTicketId}`
        );
    }
  }, [createdTicketId, router, tickets]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedMember) {
      setError("Select a member for this ticket.");
      return;
    }

    if (!selectedMember.email?.trim()) {
      setError(
        "The selected member does not have an email address on file."
      );
      return;
    }

    if (!subject.trim()) {
      setError("Enter a subject for this ticket.");
      return;
    }

    if (!message.trim()) {
      setError("Enter the member's message or concern.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicketId = addTicket({
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        email: selectedMember.email,
        program: selectedMember.program,
        subject,
        body: message,
        status,
        assignedTo: assignedTo || null,
      });

      setCreatedTicketId(newTicketId);

    } catch (submitError) {
      console.error(
        "Unable to create support ticket:",
        submitError
      );

      setError(
        "The ticket could not be created. Please try again."
      );

      setIsSubmitting(false);
    }
  }

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

        <PageHeader
          eyebrow="Member Care"
          title="New Support Ticket"
          description="Document a member question, phone call, social message, or support concern."
        />

        <form
          onSubmit={handleSubmit}
          className="panel mt-8 overflow-hidden rounded-3xl"
        >
          <div className="space-y-7 p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700"
              >
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="member"
                className="text-sm font-semibold text-[var(--text)]"
              >
                Member
              </label>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Select the member connected to this
                inquiry.
              </p>

              <select
                id="member"
                value={memberId}
                onChange={(event) =>
                  setMemberId(event.target.value)
                }
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              >
                <option value="">
                  Select a member
                </option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name} — {member.program}
                  </option>
                ))}
              </select>
            </div>

            {selectedMember && (
              <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-[var(--text)]">
                    {selectedMember.email ||
                      "No email on file"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Program
                  </p>

                  <p className="mt-1 text-sm text-[var(--text)]">
                    {selectedMember.program}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="subject"
                className="text-sm font-semibold text-[var(--text)]"
              >
                Subject
              </label>

              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="Example: Unable to access live sessions"
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="text-sm font-semibold text-[var(--text)]"
              >
                Original Message or Concern
              </label>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Enter what the member said or summarize the
                support issue.
              </p>

              <textarea
                id="message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                rows={8}
                placeholder="Enter the member's inquiry here..."
                className="mt-3 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-semibold text-[var(--text)]"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as SupportStatus
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                >
                  {ticketStatuses.map(
                    (ticketStatus) => (
                      <option
                        key={ticketStatus}
                        value={ticketStatus}
                      >
                        {ticketStatus}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignedTo"
                  className="text-sm font-semibold text-[var(--text)]"
                >
                  Assigned To
                </label>

                <select
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="">Unassigned</option>

                  {teamMembers.map((teamMember) => (
                    <option
                      key={teamMember}
                      value={teamMember}
                    >
                      {teamMember}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <Link
              href="/member-care"
              className="inline-flex justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {isSubmitting
                ? "Creating Ticket..."
                : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}