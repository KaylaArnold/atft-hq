"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  Pencil,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";

import { useHQ } from "@/context/HQContext";
import type {
  SupportStatus,
  SupportTicket,
} from "@/data/support";

type TicketMessageProps = {
  ticket: SupportTicket;
  onStatusChange: (status: SupportStatus) => void;
};

export default function TicketMessage({
  ticket,
  onStatusChange,
}: TicketMessageProps) {
  const { updateTicketDetails } = useHQ();

  const [isEditing, setIsEditing] = useState(false);
  const [memberName, setMemberName] = useState(
    ticket.memberName
  );
  const [email, setEmail] = useState(ticket.email);
  const [program, setProgram] = useState(ticket.program);
  const [subject, setSubject] = useState(ticket.subject);
  const [body, setBody] = useState(
    ticket.body ?? ticket.preview
  );

  const statusClass =
    ticket.status === "Needs Reply"
      ? "border-amber-500/20 bg-amber-50 text-amber-700"
      : ticket.status === "Waiting on Member"
        ? "border-sky-500/20 bg-sky-50 text-sky-700"
        : "border-emerald-600/20 bg-emerald-50 text-emerald-700";

  const canSave =
    memberName.trim() &&
    email.trim() &&
    program.trim() &&
    subject.trim() &&
    body.trim();

  useEffect(() => {
    setIsEditing(false);
    setMemberName(ticket.memberName);
    setEmail(ticket.email);
    setProgram(ticket.program);
    setSubject(ticket.subject);
    setBody(ticket.body ?? ticket.preview);
  }, [ticket]);

  function cancelEditing() {
    setMemberName(ticket.memberName);
    setEmail(ticket.email);
    setProgram(ticket.program);
    setSubject(ticket.subject);
    setBody(ticket.body ?? ticket.preview);
    setIsEditing(false);
  }

  function handleSave() {
    if (!canSave) {
      return;
    }

    updateTicketDetails(ticket.id, {
      memberId: ticket.memberId,
      memberName: memberName.trim(),
      email: email.trim(),
      program: program.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });

    setIsEditing(false);
  }

  return (
    <>
      <div className="border-b border-[#e5e9e6] p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
                Ticket #{ticket.id}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17201a]">
                {ticket.subject}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#667169]">
                <span className="flex items-center gap-2">
                  <UserRound
                    size={14}
                    className="text-emerald-700"
                  />
                  {ticket.memberName}
                </span>

                <span className="flex items-center gap-2">
                  <Mail
                    size={14}
                    className="text-emerald-700"
                  />
                  {ticket.email}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3
                    size={14}
                    className="text-emerald-700"
                  />
                  {ticket.receivedAt}
                </span>
              </div>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass}`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-2 text-xs font-semibold text-[#4e5b53] transition hover:border-emerald-700 hover:text-emerald-700"
            >
              <Pencil size={14} />
              Edit Ticket
            </button>

            {ticket.status !== "Waiting on Member" &&
              ticket.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={() =>
                    onStatusChange("Waiting on Member")
                  }
                  className="flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  <Clock3 size={14} />
                  Waiting on Member
                </button>
              )}

            {ticket.status === "Resolved" ? (
              <button
                type="button"
                onClick={() =>
                  onStatusChange("Needs Reply")
                }
                className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <RotateCcw size={14} />
                Reopen Ticket
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onStatusChange("Resolved")
                }
                className="flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <CheckCircle2 size={14} />
                Resolve Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <section className="border-b border-[#e5e9e6] bg-[#fbfcfb] px-5 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-[#17201a]">
                Edit Ticket
              </h3>

              <p className="mt-1 text-xs text-[#667169]">
                Update the member details and original
                support request.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelEditing}
              aria-label="Close ticket editor"
              className="rounded-lg p-2 text-[#667169] transition hover:bg-[#eef2ef] hover:text-[#17201a]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[#4e5b53]">
                Member Name
              </span>

              <input
                type="text"
                value={memberName}
                onChange={(event) =>
                  setMemberName(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-2.5 text-sm text-[#17201a] outline-none transition focus:border-emerald-700"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-[#4e5b53]">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-2.5 text-sm text-[#17201a] outline-none transition focus:border-emerald-700"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#4e5b53]">
                Program
              </span>

              <input
                type="text"
                value={program}
                onChange={(event) =>
                  setProgram(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-2.5 text-sm text-[#17201a] outline-none transition focus:border-emerald-700"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#4e5b53]">
                Subject
              </span>

              <input
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-2.5 text-sm text-[#17201a] outline-none transition focus:border-emerald-700"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#4e5b53]">
                Original Message
              </span>

              <textarea
                value={body}
                onChange={(event) =>
                  setBody(event.target.value)
                }
                rows={6}
                className="mt-2 w-full resize-y rounded-xl border border-[#dfe5e1] bg-white px-3.5 py-3 text-sm leading-6 text-[#17201a] outline-none transition focus:border-emerald-700"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-xs font-semibold text-[#4e5b53] transition hover:bg-[#f3f6f4]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Changes
            </button>
          </div>
        </section>
      )}

      <section className="px-5 pt-6 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
          Original Message
        </p>

        <div className="mt-3 rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#4e5b53]">
            {ticket.body ?? ticket.preview}
          </p>
        </div>
      </section>
    </>
  );
}