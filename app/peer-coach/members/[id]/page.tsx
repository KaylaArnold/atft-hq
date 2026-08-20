import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UsersRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import {
  BalanceMarker,
  RoleName,
} from "@/generated/prisma/client";

type PeerCoachMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
      checkIns: {
        orderBy: {
          weekNumber: "asc",
        },
      },
    },
  });

  if (!assignment) {
    redirect("/peer-coach");
  }

  const member = assignment.member;

  const completedPeerCheckIns =
  assignment.checkIns.filter(
    (checkIn) => checkIn.completedAt
  );

const peerCheckInStatus =
  completedPeerCheckIns.length === 0
    ? "not-started"
    : completedPeerCheckIns.length >= 4
      ? "complete"
      : "in-progress";

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
                Peer Coaching Forms
              </h2>
            </div>
          </div>
          
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href={` /peer-coach/members/${id}/peer-check-in` }>
            <DocumentCard
              title="Peer Coach Check-In"
              detail="Mini Dripper Weekly Peer Coach Check-In"
              status={peerCheckInStatus}
            />
          </Link>
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
