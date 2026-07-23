"use client";

import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import { useHQ } from "@/context/HQContext";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  HeartPulse,
  Mail,
  NotebookPen,
  Phone,
  Plus,
  ShieldCheck,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { ElementType } from "react";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Support", value: "support" },
  { label: "Payments", value: "payments" },
  { label: "Programs", value: "programs" },
  { label: "Notes", value: "notes" },
  { label: "Activity", value: "activity" },
  { label: "Documents", value: "documents" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { members, tickets } = useHQ();

  const memberId = Number(params.id);
  const member = members.find((item) => item.id === memberId);

  const requestedTab = searchParams.get("tab");
  const activeTab: TabValue = tabs.some(
    (item) => item.value === requestedTab
  )
    ? (requestedTab as TabValue)
    : "overview";

  if (!member) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={16} />
            Back to Member Directory
          </Link>

          <section className="panel mt-8 rounded-3xl p-8 text-center">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              Member not found
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              This member may have been removed or the profile link may be
              incorrect.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const memberTickets = tickets
    .filter((ticket) => ticket.memberId === member.id)
    .sort(
      (first, second) =>
        new Date(second.receivedAt).getTime() -
        new Date(first.receivedAt).getTime()
    );

  const openTickets = memberTickets.filter(
    (ticket) => ticket.status !== "Resolved"
  );

  const needsReplyTickets = memberTickets.filter(
    (ticket) => ticket.status === "Needs Reply"
  );

  const waitingTickets = memberTickets.filter(
    (ticket) => ticket.status === "Waiting on Member"
  );

  const resolvedTickets = memberTickets.filter(
    (ticket) => ticket.status === "Resolved"
  );

  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const health = getMemberHealth({
    paymentsCurrent: member.payments === "Current",
    communityActive: member.community,
    needsReplyCount: needsReplyTickets.length,
  });

  const activityItems = buildMemberActivity({
    memberName: member.name,
    program: member.program,
    community: member.community,
    payments: member.payments,
    tickets: memberTickets,
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/members"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Member Directory
        </Link>

        <PageHeader
          eyebrow="Member Workspace"
          title={member.name}
          description={`${member.program} member record, support history, payments, notes, and activity.`}
        />

        <section className="panel mb-6 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-base font-semibold text-[var(--accent)]">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-semibold text-[var(--text)]">
                    {member.name}
                  </h2>

                  <StatusBadge
                    label={member.status}
                    tone={member.status === "Active" ? "success" : "warning"}
                  />
                </div>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {member.program}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge
                    label={member.payments}
                    tone={
                      member.payments === "Current" ? "success" : "warning"
                    }
                  />

                  <StatusBadge
                    label={
                      member.community
                        ? "Community Active"
                        : "Community Pending"
                    }
                    tone={member.community ? "success" : "warning"}
                  />

                  <StatusBadge
                    label={
                      openTickets.length === 0
                        ? "No Open Tickets"
                        : `${openTickets.length} Open ${
                            openTickets.length === 1 ? "Ticket" : "Tickets"
                          }`
                    }
                    tone={openTickets.length === 0 ? "success" : "warning"}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 xl:min-w-56">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{
                    backgroundColor: health.background,
                    color: health.color,
                  }}
                >
                  <HeartPulse size={18} />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Member Health
                  </p>

                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: health.color }}
                  >
                    {health.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 overflow-x-auto">
          <nav className="inline-flex min-w-max rounded-2xl border border-[var(--border)] bg-white p-1 shadow-sm">
            {tabs.map((item) => {
              const isActive = activeTab === item.value;

              return (
                <Link
                  key={item.value}
                  href={`/members/${member.id}?tab=${item.value}`}
                  className={
                    isActive
                      ? "rounded-xl bg-[var(--accent-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)]"
                      : "rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <section className="panel rounded-3xl p-5 sm:p-6">
              <SectionHeading
                eyebrow="Quick Actions"
                title="Work from this member record"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {member.email ? (
                  <QuickAction
                    icon={Mail}
                    label="Email Member"
                    description={member.email}
                    href={`mailto:${member.email}`}
                  />
                ) : (
                  <DisabledAction
                    icon={Mail}
                    label="Email Member"
                    description="No email on file"
                  />
                )}

                {member.phone ? (
                  <QuickAction
                    icon={Phone}
                    label="Call Member"
                    description={member.phone}
                    href={`tel:${member.phone}`}
                  />
                ) : (
                  <DisabledAction
                    icon={Phone}
                    label="Call Member"
                    description="No phone on file"
                  />
                )}

                <QuickAction
                  icon={Ticket}
                  label="View Member Care"
                  description={`${memberTickets.length} total ${
                    memberTickets.length === 1 ? "ticket" : "tickets"
                  }`}
                  href={`/members/${member.id}?tab=support`}
                />

                <QuickAction
                  icon={NotebookPen}
                  label="Add Internal Note"
                  description="Save staff context"
                  href={`/members/${member.id}?tab=notes`}
                />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <SnapshotCard
                icon={BookOpen}
                eyebrow="Program"
                title={member.program}
              >
                <SnapshotRow label="Enrollment status" value={member.status} />
                <SnapshotRow
                  label="Community access"
                  value={member.community ? "Granted" : "Pending"}
                />
                <SnapshotRow label="Program record" value="Active enrollment" />
              </SnapshotCard>

              <SnapshotCard
                icon={WalletCards}
                eyebrow="Payments"
                title={member.payments}
              >
                <SnapshotRow
                  label="Account standing"
                  value={
                    member.payments === "Current"
                      ? "In good standing"
                      : "Needs attention"
                  }
                />
                <SnapshotRow label="Payment history" value="Not connected yet" />
                <SnapshotRow
                  label="Next scheduled payment"
                  value="Not available"
                />
              </SnapshotCard>

              <SnapshotCard
                icon={Ticket}
                eyebrow="Support"
                title={`${openTickets.length} open ${
                  openTickets.length === 1 ? "ticket" : "tickets"
                }`}
              >
                <SnapshotRow
                  label="Needs reply"
                  value={String(needsReplyTickets.length)}
                />
                <SnapshotRow
                  label="Waiting on member"
                  value={String(waitingTickets.length)}
                />
                <SnapshotRow
                  label="Resolved"
                  value={String(resolvedTickets.length)}
                />
              </SnapshotCard>

              <section className="panel rounded-3xl p-6">
                <SectionHeading
                  eyebrow="Latest Activity"
                  title="Recent member updates"
                  action={
                    <Link
                      href={`/members/${member.id}?tab=activity`}
                      className="text-xs font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
                    >
                      View all
                    </Link>
                  }
                />

                <ActivityTimeline
                  items={activityItems.slice(0, 4)}
                  compact
                />
              </section>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <section className="panel rounded-3xl p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeading
                eyebrow="Support"
                title="Member Care history"
                description={`${memberTickets.length} ${
                  memberTickets.length === 1 ? "ticket" : "tickets"
                } connected to this member.`}
              />

              <Link
                href="/member-care"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                <Ticket size={14} />
                Open Member Care
              </Link>
            </div>

            {memberTickets.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No support history"
                description="No Member Care tickets are currently connected to this member."
              />
            ) : (
              <div className="mt-6 space-y-3">
                {memberTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:border-[var(--border-strong)] hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">
                            Ticket #{ticket.id}
                          </span>

                          <TicketStatusBadge status={ticket.status} />
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-[var(--text)]">
                          {ticket.subject}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {ticket.preview}
                        </p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-xs font-medium text-[var(--text-muted)]">
                          Assigned to
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                          {ticket.assignedTo ?? "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {formatDate(ticket.receivedAt)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={13} />
                        {ticket.program}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={13} />
                        {ticket.email}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "payments" && (
          <WorkspacePlaceholder
            icon={WalletCards}
            eyebrow="Payments"
            title="Payment workspace"
            description="Payment schedules, balances, transaction history, and manual payment records will appear here."
          />
        )}

        {activeTab === "programs" && (
          <section className="panel rounded-3xl p-5 sm:p-8">
            <SectionHeading
              eyebrow="Programs"
              title="Enrollment and progress"
              description="Review the member’s active program and future enrollment history."
            />

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <BookOpen size={18} />
                  </span>

                  <div>
                    <p className="font-semibold text-[var(--text)]">
                      {member.program}
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Current enrollment
                    </p>
                  </div>
                </div>

                <StatusBadge
                  label={member.status}
                  tone={member.status === "Active" ? "success" : "warning"}
                />
              </div>

              <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
                <ProgramMetric label="Community" value={
                  member.community ? "Active" : "Pending"
                } />

                <ProgramMetric
                  label="Progress"
                  value="Not tracked yet"
                />

                <ProgramMetric
                  label="Attendance"
                  value="Not tracked yet"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "notes" && (
          <section className="panel rounded-3xl p-5 sm:p-8">
            <SectionHeading
              eyebrow="Internal Notes"
              title="Staff context"
              description="Notes are visible to ATFT HQ staff and are not shared with the member."
            />

            <textarea
              placeholder="Add an internal note about this member..."
              className="mt-6 min-h-40 w-full resize-y rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-light)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={14} />
              Save Note
            </button>
          </section>
        )}

        {activeTab === "activity" && (
          <section className="panel rounded-3xl p-5 sm:p-8">
            <SectionHeading
              eyebrow="Activity"
              title="Complete member timeline"
              description="A chronological view of enrollment, access, payments, and Member Care activity."
            />

            <ActivityTimeline items={activityItems} />
          </section>
        )}

        {activeTab === "documents" && (
          <section className="panel rounded-3xl p-5 sm:p-8">
            <SectionHeading
              eyebrow="Documents"
              title="Member files"
              description="Store applications, agreements, receipts, and other member records."
            />

            <EmptyState
              icon={FileText}
              title="No documents uploaded"
              description="Documents connected to this member will appear here."
              action="Upload Document"
            />
          </section>
        )}
      </div>
    </AppShell>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

type QuickActionProps = {
  icon: ElementType;
  label: string;
  description: string;
  href: string;
};

function QuickAction({
  icon: Icon,
  label,
  description,
  href,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--accent)] transition group-hover:bg-white">
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--text)]">
          {label}
        </span>

        <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">
          {description}
        </span>
      </span>

      <ChevronRight
        size={16}
        className="shrink-0 text-[var(--text-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
      />
    </Link>
  );
}

type DisabledActionProps = {
  icon: ElementType;
  label: string;
  description: string;
};

function DisabledAction({
  icon: Icon,
  label,
  description,
}: DisabledActionProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 opacity-65">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--text-muted)]">
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--text)]">
          {label}
        </span>

        <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">
          {description}
        </span>
      </span>
    </div>
  );
}

type SnapshotCardProps = {
  icon: ElementType;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

function SnapshotCard({
  icon: Icon,
  eyebrow,
  title,
  children,
}: SnapshotCardProps) {
  return (
    <section className="panel rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon size={17} />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-5">
        {children}
      </div>
    </section>
  );
}

function SnapshotRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>

      <span className="text-right font-semibold text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning";
}) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={
        tone === "success"
          ? {
              backgroundColor: "var(--success-soft)",
              color: "var(--success)",
            }
          : {
              backgroundColor: "var(--info-soft)",
              color: "var(--warning)",
            }
      }
    >
      {label}
    </span>
  );
}

function TicketStatusBadge({
  status,
}: {
  status: "Needs Reply" | "Waiting on Member" | "Resolved";
}) {
  const style =
    status === "Resolved"
      ? {
          backgroundColor: "var(--success-soft)",
          color: "var(--success)",
        }
      : status === "Waiting on Member"
        ? {
            backgroundColor: "var(--info-soft)",
            color: "var(--info)",
          }
        : {
            backgroundColor: "var(--warning-soft, var(--info-soft))",
            color: "var(--warning)",
          };

  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={style}
    >
      {status}
    </span>
  );
}

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "support" | "payment" | "community" | "program";
};

function ActivityTimeline({
  items,
  compact = false,
}: {
  items: ActivityItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--text-secondary)]">
        No member activity has been recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      {items.map((item, index) => {
        const Icon = getActivityIcon(item.type);
        const isLatest = index === 0;

        return (
          <div
            key={item.id}
            className={
              isLatest
                ? "border-l-2 border-[var(--accent)] pl-4"
                : "border-l-2 border-[var(--border-strong)] pl-4"
            }
          >
            <div className="flex items-start gap-3">
              <Icon
                size={15}
                className={
                  isLatest
                    ? "mt-0.5 shrink-0 text-[var(--accent)]"
                    : "mt-0.5 shrink-0 text-[var(--text-muted)]"
                }
              />

              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">
                  {item.title}
                </p>

                {!compact && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                )}

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {item.date}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getActivityIcon(type: ActivityItem["type"]) {
  if (type === "support") return Ticket;
  if (type === "payment") return WalletCards;
  if (type === "community") return ShieldCheck;
  return BookOpen;
}

type HealthArgs = {
  paymentsCurrent: boolean;
  communityActive: boolean;
  needsReplyCount: number;
};

function getMemberHealth({
  paymentsCurrent,
  communityActive,
  needsReplyCount,
}: HealthArgs) {
  const score =
    Number(paymentsCurrent) +
    Number(communityActive) +
    Number(needsReplyCount === 0);

  if (score === 3) {
    return {
      label: "Excellent",
      color: "var(--success)",
      background: "var(--success-soft)",
    };
  }

  if (score === 2) {
    return {
      label: "Good",
      color: "var(--info)",
      background: "var(--info-soft)",
    };
  }

  return {
    label: "Needs Attention",
    color: "var(--warning)",
    background: "var(--info-soft)",
  };
}

type BuildMemberActivityArgs = {
  memberName: string;
  program: string;
  community: boolean;
  payments: string;
  tickets: Array<{
    id: number;
    subject: string;
    status: "Needs Reply" | "Waiting on Member" | "Resolved";
    receivedAt: string;
  }>;
};

function buildMemberActivity({
  memberName,
  program,
  community,
  payments,
  tickets,
}: BuildMemberActivityArgs): ActivityItem[] {
  const ticketActivity: ActivityItem[] = tickets.map((ticket) => ({
    id: `ticket-${ticket.id}`,
    title: ticket.subject,
    description: `Member Care ticket is currently marked ${ticket.status}.`,
    date: formatDate(ticket.receivedAt),
    type: "support",
  }));

  return [
    ...ticketActivity,
    {
      id: "community-status",
      title: community
        ? "Community access granted"
        : "Community access pending",
      description: community
        ? `${memberName} currently has access to the ATFT community.`
        : `${memberName} does not currently have community access.`,
      date: "Current status",
      type: "community",
    },
    {
      id: "payment-status",
      title: `Payment status: ${payments}`,
      description:
        payments === "Current"
          ? "The member account is currently in good standing."
          : "The member account may require payment follow-up.",
      date: "Current status",
      type: "payment",
    },
    {
      id: "program-status",
      title: `Enrolled in ${program}`,
      description: `${memberName} is connected to the ${program} program.`,
      date: "Current enrollment",
      type: "program",
    },
  ];
}

function ProgramMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}

function WorkspacePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: ElementType;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="panel rounded-3xl p-5 sm:p-8">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <EmptyState
        icon={Icon}
        title={`${title} coming next`}
        description="This workspace is ready to be connected to its full data model."
      />
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-strong)] p-8 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-[var(--accent)] shadow-sm">
        <Icon size={19} />
      </span>

      <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>

      {action && (
        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Plus size={14} />
          {action}
        </button>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}