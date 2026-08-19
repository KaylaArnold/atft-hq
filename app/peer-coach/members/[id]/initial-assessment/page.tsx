import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { AccountabilityCycleStatus } from "@/generated/prisma/client";

type InitialAssessmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InitialAssessmentPage({
  params,
}: InitialAssessmentPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const accountabilityPartner = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!accountabilityPartner) {
    redirect("/");
  }

  const accountabilityAssignment =
    await prisma.accountabilityCoachAssignment.findFirst({
      where: {
        accountabilityCoachId: accountabilityPartner.id,
        memberId: id,
        active: true,
        program: {
          slug: "mini-drippers",
        },
      },
      include: {
        member: true,
        cycles: {
          where: {
            status: AccountabilityCycleStatus.ACTIVE,
          },
          include: {
            initialAssessment: true,
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
      },
    });

  if (!accountabilityAssignment) {
    redirect("/my-programs");
  }

  const cycle = accountabilityAssignment.cycles[0];

  if (!cycle) {
    redirect("/my-programs");
  }

  const assessment = cycle.initialAssessment;

  const memberName =
    [
      accountabilityAssignment.member.firstName,
      accountabilityAssignment.member.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    accountabilityAssignment.member.email ||
    "ATFT Member";

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[950px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/my-programs"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ATFT-001
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            30-Day Accountability Assessment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Review {memberName}&apos;s initial accountability assessment.
            Member responses are read-only.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardCheck size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Member Assessment
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {memberName}
              </p>
            </div>
          </div>

          {!assessment ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-6">
              <p className="text-sm font-semibold text-[var(--text)]">
                Assessment not completed yet.
              </p>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                The member must complete ATFT-001 from their own accountability area.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <ReadOnlyField
                label="1. Greatest strengths"
                value={assessment.strengths}
              />

              <ReadOnlyField
                label="2. Weaknesses identified"
                value={assessment.weaknesses}
              />

              <ReadOnlyField
                label="3. Steps already taken"
                value={assessment.stepsTaken}
              />

              <ReadOnlyField
                label="4. Biggest obstacle"
                value={assessment.biggestObstacle}
              />

              <ReadOnlyField
                label="5. Commitment score"
                value={`${assessment.commitmentScore}/10`}
              />

              <ReadOnlyField
                label="Commitment reason"
                value={assessment.commitmentReason}
              />

              <ReadOnlyField
                label="6. Trading rule broken most often"
                value={formatValue(assessment.brokenTradingRule)}
              />

              <ReadOnlyField
                label="7. Attendance consistency"
                value={formatValue(assessment.attendanceConsistency)}
              />

              <ReadOnlyField
                label="8. Journaling consistency"
                value={formatValue(assessment.journalingConsistency)}
              />

              <ReadOnlyField
                label="9. Primary emotion"
                value={formatValue(assessment.primaryEmotion)}
              />

              <ReadOnlyField
                label="10. One area to improve"
                value={assessment.oneAreaToImprove}
              />

              <ReadOnlyField
                label="11. Definition of success"
                value={assessment.successDefinition}
              />

              <ReadOnlyField
                label="12. Support needed"
                value={assessment.coachSupportNeeded}
              />

              <ReadOnlyField
                label="13. Willing to be accountable"
                value={assessment.willingToBeAccountable ? "Yes" : "No"}
              />

              <ReadOnlyField
                label="Accountability explanation"
                value={assessment.accountabilityExplanation}
              />

              <ReadOnlyField
                label="14. Personal commitment"
                value={assessment.personalCommitment}
              />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>

      <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--text)]">
        {value?.trim() || "Not provided"}
      </div>
    </div>
  );
}

function formatValue(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}