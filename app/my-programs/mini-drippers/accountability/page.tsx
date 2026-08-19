import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { AccountabilityCycleStatus } from "@/generated/prisma/client";

export default async function AccountabilityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const cycle = await prisma.accountabilityCycle.findFirst({
    where: {
      memberId: user.id,
      status: AccountabilityCycleStatus.ACTIVE,
      program: {
        slug: "mini-drippers",
      },
    },
    include: {
      initialAssessment: true,
      
      accountabilityCoachAssignment: {
        include: {
          accountabilityCoach: true,
        },
      },

      checkIns: {
        orderBy: {
          weekNumber: "asc",
        },
      },
    },

    orderBy: {
      startDate: "desc",
    },
  });

  const memberName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "ATFT Member";

  if (!cycle) {
    return (
      <AppShell variant="member">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <Link
            href="/my-programs/mini-drippers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={16} />
            Back to Mini Drippers
          </Link>

          <section className="panel mt-6 rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              30-Day Accountability
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              You do not currently have an active accountability cycle.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const accountabilityCoach = 
    cycle.accountabilityCoachAssignment?.accountabilityCoach;

  const coachName = accountabilityCoach
    ? [accountabilityCoach.firstName, accountabilityCoach.lastName]
      .filter(Boolean)
      .join(" ") ||
    accountabilityCoach.email ||
    "Accountability Coach"
  : "Not Assigned";
  

  const assessmentComplete = Boolean(
    cycle.initialAssessment?.completedAt
  );

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/my-programs/mini-drippers"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Mini Drippers
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Mini Drippers
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            30-Day Accountability
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Complete your accountability forms and keep track of your
            weekly progress throughout your current coaching cycle.
          </p>
        </section>

        <section className="panel mt-8 rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Current Cycle
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">
                Dripper
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {memberName}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)]">
                Accountability Partner
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {coachName}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Accountability Forms
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Your 30-Day Progress
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            <AccountabilityCard
              title="Initial Assessment"
              detail="ATFT-001 · Complete at the beginning of your accountability cycle."
              href="/my-programs/mini-drippers/accountability/initial-assessment"
              status={
                assessmentComplete ? "complete" : "not-started"
              }
            />

            {[1, 2, 3, 4].map((week) => {
              const checkIn = cycle.checkIns.find(
                (item) => item.weekNumber === week
              );

              const memberComplete = Boolean(
                checkIn?.memberCompletedAt
              );

              const coachReviewed = Boolean(
                checkIn?.coachReviewedAt
              );

              let status:
                | "not-started"
                | "submitted"
                | "reviewed" = "not-started";

              if (coachReviewed) {
                status = "reviewed";
              } else if (memberComplete) {
                status = "submitted";
              }

              return (
                <AccountabilityCard
                  key={week}
                  title={`Week ${week} Check-In`}
                  detail={`ATFT-002 · Week ${week} accountability and reflection.`}
                  href={`/my-programs/mini-drippers/accountability/weekly-check-in?week=${week}`}
                  status={status}
                />
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

type CardStatus =
  | "complete"
  | "not-started"
  | "submitted"
  | "reviewed";

function AccountabilityCard({
  title,
  detail,
  href,
  status,
}: {
  title: string;
  detail: string;
  href: string;
  status: CardStatus;
}) {
  const statusConfig = {
    complete: {
      label: "Complete",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    reviewed: {
      label: "Reviewed",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    submitted: {
      label: "Awaiting Coach Review",
      icon: Clock3,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    "not-started": {
      label: "Not Started",
      icon: ClipboardCheck,
      className:
        "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:shadow-sm"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <ClipboardCheck size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          {detail}
        </p>

        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
        >
          <StatusIcon size={12} />
          {config.label}
        </span>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
      />
    </Link>
  );
}