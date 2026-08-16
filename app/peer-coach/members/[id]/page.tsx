import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  NotebookPen,
  UsersRound,
} from "lucide-react";

import { revalidatePath } from "next/cache";
import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import {
  AccountabilityCycleStatus,
  BalanceMarker,
  CoachingDocumentType,
  RoleName,
} from "@/generated/prisma/client";

type PeerCoachMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function startAccountabilityCycle(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const memberId = formData.get("memberId");

  if (typeof memberId !== "string" || !memberId) {
    return;
  }

  const coach = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!coach) {
    redirect("/");
  }

  const isPeerCoach = coach.roles.some(
    ({ role }) => role.name === RoleName.PEER_COACH
  );

  if (!isPeerCoach) {
    redirect("/");
  }

  /*
   * The coach must actually be assigned to this member.
   */
  const assignment = await prisma.peerCoachAssignment.findFirst({
    where: {
      peerCoachId: coach.id,
      memberId,
      active: true,
    },
  });

  if (!assignment) {
    redirect("/peer-coach");
  }

  /*
   * Don't allow two active accountability cycles
   * for the same assignment.
   */
  const existingCycle = await prisma.accountabilityCycle.findFirst({
    where: {
      assignmentId: assignment.id,
      status: AccountabilityCycleStatus.ACTIVE,
    },
  });

  if (existingCycle) {
    revalidatePath(`/peer-coach/members/${memberId}`);
    return;
  }

  const startDate = new Date();

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  await prisma.accountabilityCycle.create({
    data: {
      assignmentId: assignment.id,
      memberId: assignment.memberId,
      peerCoachId: assignment.peerCoachId,
      programId: assignment.programId,
      startDate,
      endDate,
      status: AccountabilityCycleStatus.ACTIVE,
    },
  });

  revalidatePath(`/peer-coach/members/${memberId}`);
}

export default async function PeerCoachMemberPage({
  params,
}: PeerCoachMemberPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const coach = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!coach) {
    redirect("/");
  }

  const isPeerCoach = coach.roles.some(
    ({ role }) => role.name === RoleName.PEER_COACH
  );

  if (!isPeerCoach) {
    redirect("/");
  }

  /*
   * Security:
   * Only allow a Peer Coach to open a member
   * who is actively assigned to that coach.
   */
  const assignment = await prisma.peerCoachAssignment.findFirst({
    where: {
      peerCoachId: coach.id,
      memberId: id,
      active: true,
    },
    include: {
      member: true,
      program: true,
      accountabilityCycles: {
        orderBy: {
          startDate: "desc",
        },
        include: {
          initialAssessment: true,  
          checkIns: {
            orderBy: {
              checkInDate: "desc",
            },
          },
          documents: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    redirect("/peer-coach");
  }

  const member = assignment.member;

  const memberName =
    [member.firstName, member.lastName]
      .filter(Boolean)
      .join(" ") ||
    member.email ||
    "ATFT Member";

  const initials =
    [member.firstName, member.lastName]
      .filter(Boolean)
      .map((name) => name!.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  /*
   * Current reporting month = previous calendar month.
   * We only read marker status here.
   * No dollar amounts are exposed to Peer Coaches.
   */
  const now = new Date();

  const reportingDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const reportingMonth = reportingDate.getMonth() + 1;
  const reportingYear = reportingDate.getFullYear();

  const balanceStatus = await prisma.monthlyBalance.findUnique({
    where: {
      userId_programId_month_year: {
        userId: member.id,
        programId: assignment.programId,
        month: reportingMonth,
        year: reportingYear,
      },
    },
    select: {
      marker: true,
    },
  });

  const needsFollowUp =
    balanceStatus?.marker === BalanceMarker.RED;

  const currentCycle =
    assignment.accountabilityCycles.find(
      (cycle) =>
        cycle.status === AccountabilityCycleStatus.ACTIVE
    ) ?? assignment.accountabilityCycles[0] ?? null;

  const completedCheckIns =
    currentCycle?.checkIns.filter(
      (checkIn) => checkIn.completed
    ) ?? [];

  const latestCheckIn =
    currentCycle?.checkIns[0] ?? null;

  const journalStatus =
    latestCheckIn?.journalConsistency ?? null;

  const initialAssessment =
    currentCycle?.initialAssessment ?? null;

  const finalReport =
    currentCycle?.documents.find(
      (document) =>
        document.type ===
        CoachingDocumentType.FINAL_REPORT_CARD
    ) ?? null;

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/peer-coach"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Peer Coaching
        </Link>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={memberName}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="grid size-16 place-items-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent)]">
                  {initials}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  Assigned Dripper
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-3xl">
                  {memberName}
                </h1>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {assignment.program.name}
                </p>
              </div>
            </div>

            {needsFollowUp ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                <AlertTriangle size={13} />
                Follow-Up Needed
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={13} />
                On Track
              </span>
            )}
          </div>

          {needsFollowUp && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/60 p-4">
              <p className="text-sm font-semibold text-red-700">
                Monthly coaching follow-up needed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700/80">
                Please connect with this Dripper for coaching support.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={UsersRound}
            label="Assignment"
            value="Active"
          />

          <SummaryCard
            icon={ClipboardCheck}
            label="Check-Ins"
            value={`${
              currentCycle?.checkIns.filter(
                (checkIn) => checkIn.memberCompletedAt
              ).length ?? 0
            } of 4 submitted`}
          />

          <SummaryCard
            icon={NotebookPen}
            label="Journaling"
            value={journalStatus ?? "Not recorded"}
          />

          <SummaryCard
            icon={CalendarDays}
            label="Next Check-In"
            value={
              latestCheckIn?.nextCheckInDate
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                  }).format(latestCheckIn.nextCheckInDate)
                : "Not scheduled"
            }
          />
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            30-Day Accountability
          </p>

          {currentCycle ? (
            <>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">
                    Current Accountability Cycle
                  </h2>

                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(currentCycle.startDate)}
                    {" – "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(currentCycle.endDate)}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
                  {formatCycleStatus(currentCycle.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Weekly Check-Ins
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
                    {currentCycle?.checkIns.filter(
                      (checkIn) => checkIn.memberCompletedAt
                    ).length ?? 0}{" "}
                    of 4
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Submitted during this cycle
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Current Journal Status
                  </p>

                  <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                    {journalStatus ?? "Not recorded"}
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Based on the most recent coaching check-in
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-6">
              <p className="text-sm font-semibold text-[var(--text)]">
                No accountability cycle started yet.
              </p>

              <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--text-secondary)]">
                Start a 30-day accountability cycle when this Dripper begins
                structured coaching support.
              </p>

              <form action={startAccountabilityCycle} className="mt-5">
                <input type="hidden" name="memberId" value={member.id} />

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <CalendarDays size={16} />
                  Start 30-Day Cycle
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardCheck size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Coaching
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                Check-In History
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {currentCycle && currentCycle.checkIns.length > 0 ? (
              currentCycle.checkIns.map((checkIn) => (
                <Link
                  key={checkIn.id}
                  href={`/peer-coach/members/${member.id}/weekly-check-in?week=${checkIn.weekNumber ?? 1}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {checkIn.weekNumber
                          ? `Week ${checkIn.weekNumber} Check-In`
                          : "Coaching Check-In"}
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(checkIn.checkInDate)}
                      </p>
                    </div>

                    {checkIn.progressStatus && (
                      <span className="w-fit rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {checkIn.progressStatus}
                      </span>
                    )}
                  </div>

                  {checkIn.actionItems && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">
                        Action Items
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {checkIn.actionItems}
                      </p>
                    </div>
                  )}

                  {checkIn.coachNotes && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">
                        Coach Notes
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {checkIn.coachNotes}
                      </p>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center">
                <p className="text-sm font-medium text-[var(--text)]">
                  No check-ins recorded yet.
                </p>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Weekly coaching activity will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <FileText size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Forms & Documents
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                Coaching Forms
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href={`/peer-coach/members/${member.id}/initial-assessment`}>
                <DocumentCard
                    title="Initial Assessment"
                    detail="ATFT-001 · 30-Day Accountability Assessment"
                    status={initialAssessment ? "complete" : "not-started"}
                />
            </Link>

            <Link href={`/peer-coach/members/${member.id}/weekly-check-in`}>
              <DocumentCard
                title="Weekly Check-In"
                detail="ATFT-002 · Weeks 1–4"
                status={
                  currentCycle?.checkIns.length
                    ? currentCycle.checkIns.length >= 4
                      ? "complete"
                      : "in-progress"
                    : "not-started"
                }
              />
            </Link>

            <DocumentCard
              title="Peer Coach Check-In"
              detail="Mini Dripper Weekly Peer Coach Check-In"
              status={
                currentCycle?.documents.some(
                  (document) =>
                    document.type ===
                    CoachingDocumentType.PEER_COACH_CHECK_IN
                )
                  ? "complete"
                  : "not-started"
              }
            />

            <DocumentCard
              title="Final Report Card"
              detail="ATFT-005 · End-of-cycle evaluation"
              status={finalReport ? "complete" : "not-started"}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="text-[var(--accent)]">
        <Icon size={17} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}

function DocumentCard({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: "not-started" | "in-progress" | "complete";
}) {
  const statusConfig = {
    "not-started": {
      label: "Not Started",
      className:
        "border-[var(--border)] bg-white text-[var(--text-muted)]",
    },
    "in-progress": {
      label: "In Progress",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },
    complete: {
      label: "Complete",
      className: 
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {detail}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

function formatCycleStatus(
  status: AccountabilityCycleStatus
) {
  if (status === AccountabilityCycleStatus.ACTIVE) {
    return "Active";
  }

  if (status === AccountabilityCycleStatus.COMPLETED) {
    return "Completed";
  }

  if (status === AccountabilityCycleStatus.EXTENDED) {
    return "Extended";
  }

  return "Cancelled";
}