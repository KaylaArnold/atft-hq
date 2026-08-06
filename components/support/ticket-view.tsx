"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Mail,
  MessageSquareText,
  Plus,
  RotateCcw,
  StickyNote,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  useHQ,
  type TicketActivity,
} from "@/context/HQContext";
import type {
  SupportStatus,
  SupportTicket,
} from "@/data/support";
import {
  replyTemplates,
  type ReplyTemplate,
} from "@/data/reply-templates";

import { teamMembers } from "@/data/team";

import AISuggestion from "./ai-suggestion";
import ReplyEditor from "./reply-editor";
import TemplatePicker from "./template-picker";
import TicketActions from "./ticket-actions";
import TicketMessage from "./ticket-message";

type TicketViewProps = {
  ticket: SupportTicket;
  onStatusChange: (status: SupportStatus) => void;
};

function formatActivityDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function getActivityDetails(activity: TicketActivity) {
  if (activity.type === "note") {
    return {
      title: "Internal Note",
      icon: StickyNote,
    };
  }

  if (activity.type === "reply") {
    return {
      title: "Reply Sent",
      icon: Mail,
    };
  }

  // Some activities may use a misspelled assignment type.
  if (activity.type === "assignment") {
    return {
      title: activity.assignedTo
        ? `Assigned to ${activity.assignedTo}`
        : "Unassigned Ticket",
      icon: UserRound,
    };
  }

  if (activity.newStatus === "Resolved") {
    return {
      title: "Ticket Resolved",
      icon: CheckCircle2,
    };
  }

  if (activity.previousStatus === "Resolved") {
    return {
      title: "Ticket Reopened",
      icon: RotateCcw,
    };
  }

  return {
    title: `Status changed to ${activity.newStatus}`,
    icon: MessageSquareText,
  };
}

export default function TicketView({
  ticket,
  onStatusChange,
}: TicketViewProps) {
  const {
    ticketActivity,
    addTicketNote,
    deleteTicketNote,
    addTicketReply,
    updateTicketAssignment,
  } = useHQ();

  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | null
  >(null);

  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");

  const activities = ticketActivity[ticket.id] ?? [];

  const suggestedTemplate = useMemo(() => {
    const content =
      `${ticket.subject} ${ticket.preview}`.toLowerCase();

    if (
      content.includes("replay") ||
      content.includes("recording")
    ) {
      return replyTemplates.find(
        (item) => item.id === "replay-upload"
      );
    }

    if (
      content.includes("payment") ||
      content.includes("declined")
    ) {
      return replyTemplates.find(
        (item) => item.id === "payment-issue"
      );
    }

    if (
      content.includes("mini dripper") ||
      content.includes("live session")
    ) {
      return replyTemplates.find(
        (item) => item.id === "mini-drippers-access"
      );
    }

    return replyTemplates.find(
      (item) => item.id === "community-access"
    );
  }, [ticket]);

  useEffect(() => {
    setSelectedTemplateId(null);
    setReply("");
    setNote("");
  }, [ticket.id]);

  function selectTemplate(template: ReplyTemplate) {
    setSelectedTemplateId(template.id);
    setReply(template.body);
  }

  function useSuggestion() {
    if (!suggestedTemplate) {
      return;
    }

    setSelectedTemplateId(suggestedTemplate.id);
    setReply(suggestedTemplate.body);
  }

  function handleAddNote() {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      return;
    }

    addTicketNote(ticket.id, trimmedNote);
    setNote("");
  }

  function handleSendReply() {
    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      return;
    }

    addTicketReply(ticket.id, trimmedReply);
    onStatusChange("Waiting on Member");

    setReply("");
    setSelectedTemplateId(null);
  }
  
  return (
    <main className="min-w-0 rounded-3xl bg-[var(--surface)]">
      <TicketMessage 
        ticket={ticket}
        onStatusChange={onStatusChange}
      />

      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <UserRound size={17} />
          </div>

          <div className="w-full max-w-xs">
            <label
              htmlFor={`assigned-to-${ticket.id}`}
              className="block text-sm font-semibold text-[var(--text)]"
            >
              Assigned To
            </label>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Choose who is responsible for this ticket.
            </p>

            <select
              id={`assigned-to-${ticket.id}`}
              value={ticket.assignedTo ?? ""}
              onChange={(event) =>
                updateTicketAssignment(
                  ticket.id,
                  event.target.value || null
                )
              }
              className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">Unassigned</option>
              
              {teamMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
        {ticket.status !== "Resolved" && (
          <>
            {suggestedTemplate && (
              <AISuggestion
                suggestion={suggestedTemplate.body}
                onUse={useSuggestion}
              />
            )}

            <TemplatePicker
              templates={replyTemplates}
              selectedTemplateId={selectedTemplateId}
              onSelect={selectTemplate}
            />

            <ReplyEditor
              ticket={ticket}
              value={reply}
              onChange={setReply}
            />
          </>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <StickyNote size={17} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Add internal note
              </h3>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Notes are visible to the ATFT team only.
              </p>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add context, follow-up details, or an internal reminder..."
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!note.trim()}
              onClick={handleAddNote}
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
              Add Note
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Activity Timeline
            </h3>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Replies, notes, assignments, and status updates for
              this ticket.
            </p>
          </div>

          {activities.length > 0 ? (
            <div className="mt-5 space-y-4">
              {[...activities]
                .reverse()
                .map((activity) => {
                  const details =
                    getActivityDetails(activity);

                  const ActivityIcon = details.icon;

                  return (
                    <article
                      key={activity.id}
                      className="relative flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        <ActivityIcon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">
                              {details.title}
                            </p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              {activity.author} ·{" "}
                              {formatActivityDate(
                                activity.createdAt
                              )}
                            </p>
                          </div>

                          {activity.type === "note" && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteTicketNote(
                                  ticket.id,
                                  activity.id
                                )
                              }
                              aria-label="Delete internal note"
                              className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        {activity.body && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                            {activity.body}
                          </p>
                        )}

                        {activity.type === "status" &&
                          activity.previousStatus &&
                          activity.newStatus && (
                            <p className="mt-3 text-xs text-[var(--text-muted)]">
                              {activity.previousStatus} →{" "}
                              {activity.newStatus}
                            </p>
                          )}
                      </div>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                No activity yet
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Replies, notes, assignments, and status updates
                will appear here.
              </p>
            </div>
          )}
        </section>

        <TicketActions
          ticket={ticket}
          canSend={Boolean(reply.trim())}
          onSend={handleSendReply}
          onResolve={() => onStatusChange("Resolved")}
          onReopen={() => onStatusChange("Needs Reply")}
        />
      </div>
    </main>
  );
}