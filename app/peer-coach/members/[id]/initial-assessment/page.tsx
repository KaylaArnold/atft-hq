import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import {
  AccountabilityCycleStatus,
  RoleName,
} from "@/generated/prisma/client";

type InitialAssessmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function saveInitialAssessment(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const memberId = formData.get("memberId");
  const cycleId = formData.get("cycleId");

  if (
    typeof memberId !== "string" ||
    typeof cycleId !== "string" ||
    !memberId ||
    !cycleId
  ) {
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
   * Security:
   * The signed-in Peer Coach must actually be assigned
   * to this member and this accountability cycle.
   */
  const cycle = await prisma.accountabilityCycle.findFirst({
    where: {
      id: cycleId,
      memberId,
      peerCoachId: coach.id,
      status: AccountabilityCycleStatus.ACTIVE,
      assignment: {
        active: true,
        peerCoachId: coach.id,
        memberId,
      },
    },
  });

  if (!cycle) {
    redirect("/peer-coach");
  }

  const getRequiredString = (name: string) => {
    const value = formData.get(name);

    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    return value.trim();
  };

  const optionalString = (name: string) => {
    const value = formData.get(name);

    return typeof value === "string" && value.trim()
      ? value.trim()
      : null;
  };

  const strengths = getRequiredString("strengths");
  const weaknesses = getRequiredString("weaknesses");
  const biggestObstacle = getRequiredString("biggestObstacle");
  const brokenTradingRule = getRequiredString("brokenTradingRule");
  const attendanceConsistency = getRequiredString(
    "attendanceConsistency"
  );
  const journalingConsistency = getRequiredString(
    "journalingConsistency"
  );
  const primaryEmotion = getRequiredString("primaryEmotion");
  const oneAreaToImprove = getRequiredString("oneAreaToImprove");
  const successDefinition = getRequiredString("successDefinition");
  const coachSupportNeeded = getRequiredString("coachSupportNeeded");
  const willingToBeAccountable = getRequiredString(
    "willingToBeAccountable"
  );
  const personalCommitment = getRequiredString(
    "personalCommitment"
  );

  const commitmentScoreValue = formData.get("commitmentScore");
  const commitmentScore = Number(commitmentScoreValue);

  if (
    !strengths ||
    !weaknesses ||
    !biggestObstacle ||
    !brokenTradingRule ||
    !attendanceConsistency ||
    !journalingConsistency ||
    !primaryEmotion ||
    !oneAreaToImprove ||
    !successDefinition ||
    !coachSupportNeeded ||
    !willingToBeAccountable ||
    !personalCommitment ||
    !Number.isInteger(commitmentScore) ||
    commitmentScore < 1 ||
    commitmentScore > 10
  ) {
    return;
  }

  await prisma.initialAccountabilityAssessment.upsert({
    where: {
      cycleId: cycle.id,
    },
    update: {
      strengths,
      weaknesses,
      stepsTaken: optionalString("stepsTaken") ?? "",
      biggestObstacle,
      commitmentScore,
      commitmentReason: optionalString("commitmentReason"),
      brokenTradingRule,
      attendanceConsistency,
      journalingConsistency,
      primaryEmotion,
      oneAreaToImprove,
      successDefinition,
      coachSupportNeeded,
      willingToBeAccountable:
        willingToBeAccountable === "YES",
      accountabilityExplanation: optionalString(
        "accountabilityExplanation"
      ),
      personalCommitment,
      completedAt: new Date(),
    },
    create: {
      cycleId: cycle.id,
      strengths,
      weaknesses,
      stepsTaken: optionalString("stepsTaken") ?? "",
      biggestObstacle,
      commitmentScore,
      commitmentReason: optionalString("commitmentReason"),
      brokenTradingRule,
      attendanceConsistency,
      journalingConsistency,
      primaryEmotion,
      oneAreaToImprove,
      successDefinition,
      coachSupportNeeded,
      willingToBeAccountable:
        willingToBeAccountable === "YES",
      accountabilityExplanation: optionalString(
        "accountabilityExplanation"
      ),
      personalCommitment,
    },
  });

  revalidatePath(`/peer-coach/members/${memberId}`);
  revalidatePath(
    `/peer-coach/members/${memberId}/initial-assessment`
  );

  redirect(`/peer-coach/members/${memberId}`);
}

export default async function InitialAssessmentPage({
  params,
}: InitialAssessmentPageProps) {
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

  const assignment = await prisma.peerCoachAssignment.findFirst({
    where: {
      peerCoachId: coach.id,
      memberId: id,
      active: true,
    },
    include: {
      member: true,
      accountabilityCycles: {
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

  if (!assignment) {
    redirect("/peer-coach");
  }

  const cycle = assignment.accountabilityCycles[0];

  if (!cycle) {
    redirect(`/peer-coach/members/${id}`);
  }

  const assessment = cycle.initialAssessment;

  const memberName =
    [assignment.member.firstName, assignment.member.lastName]
      .filter(Boolean)
      .join(" ") ||
    assignment.member.email ||
    "ATFT Member";

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[950px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href={`/peer-coach/members/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to {memberName}
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ATFT-001
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            30-Day Accountability Assessment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Complete the initial accountability assessment for{" "}
            {memberName}&apos;s current 30-day coaching cycle.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardCheck size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Initial Assessment
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {memberName}
              </p>
            </div>
          </div>

          {assessment && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                Assessment Complete
              </p>

              <p className="mt-1 text-xs text-emerald-700/80">
                You may update this assessment if additional information
                is needed.
              </p>
            </div>
          )}

          <form
            action={saveInitialAssessment}
            className="mt-8 space-y-8"
          >
            <input
              type="hidden"
              name="memberId"
              value={id}
            />

            <input
              type="hidden"
              name="cycleId"
              value={cycle.id}
            />

            <TextAreaField
              name="strengths"
              label="1. What are your greatest strengths in your trading journey?"
              defaultValue={assessment?.strengths}
              required
            />

            <TextAreaField
              name="weaknesses"
              label="2. What weaknesses have you identified in your trading journey?"
              defaultValue={assessment?.weaknesses}
              required
            />

            <TextAreaField
              name="stepsTaken"
              label="3. What steps have you already taken to overcome the challenges mentioned above?"
              defaultValue={assessment?.stepsTaken}
            />

            <TextAreaField
              name="biggestObstacle"
              label="4. What is the biggest obstacle preventing you from becoming a consistently profitable trader?"
              defaultValue={assessment?.biggestObstacle}
              required
            />

            <SelectField
              name="commitmentScore"
              label="5. On a scale of 1–10, how committed are you to following your trading plan every single day?"
              defaultValue={
                assessment
                  ? String(assessment.commitmentScore)
                  : ""
              }
              options={[
                ["", "Select 1–10"],
                ...Array.from(
                  { length: 10 },
                  (_, index) => [
                    String(index + 1),
                    String(index + 1),
                  ]
                ),
              ]}
            />

            <TextAreaField
              name="commitmentReason"
              label="Why did you choose that number?"
              defaultValue={
                assessment?.commitmentReason
              }
            />

            <SelectField
              name="brokenTradingRule"
              label="6. Which trading rule do you break most often?"
              defaultValue={
                assessment?.brokenTradingRule
              }
              options={[
                ["", "Select one"],
                ["OVERTRADING", "Overtrading"],
                [
                  "REVENGE_TRADING",
                  "Revenge Trading",
                ],
                [
                  "MOVING_STOP_LOSS",
                  "Moving My Stop Loss",
                ],
                [
                  "OUTSIDE_SETUP",
                  "Taking Trades Outside My Setup",
                ],
                [
                  "HOLDING_TOO_LONG",
                  "Holding Winners Too Long",
                ],
                [
                  "NOT_FOLLOWING_PLAN",
                  "Not Following My Trading Plan",
                ],
                [
                  "SELLING_TOO_EARLY",
                  "Selling Too Early",
                ],
                ["FOMO", "FOMO"],
                [
                  "LACK_OF_PATIENCE",
                  "Lack of Patience",
                ],
                ["OTHER", "Other"],
              ]}
            />

            <SelectField
              name="attendanceConsistency"
              label="7. How consistently are they attending the daily live sessions or watching the replay?"
              defaultValue={
                assessment?.attendanceConsistency
              }
              options={[
                ["", "Select one"],
                ["EVERY_DAY", "Every Day"],
                [
                  "4_5_DAYS",
                  "4–5 Days Per Week",
                ],
                [
                  "2_3_DAYS",
                  "2–3 Days Per Week",
                ],
                ["RARELY", "Rarely"],
                ["NOT_AT_ALL", "Not At All"],
              ]}
            />

            <SelectField
              name="journalingConsistency"
              label="8. Are they consistently journaling their trades?"
              defaultValue={
                assessment?.journalingConsistency
              }
              options={[
                ["", "Select one"],
                ["YES", "Yes"],
                ["SOMETIMES", "Sometimes"],
                ["NO", "No"],
              ]}
            />

            <SelectField
              name="primaryEmotion"
              label="9. Which emotion affects their trading the most?"
              defaultValue={
                assessment?.primaryEmotion
              }
              options={[
                ["", "Select one"],
                ["FEAR", "Fear"],
                ["GREED", "Greed"],
                ["IMPATIENCE", "Impatience"],
                ["FOMO", "FOMO"],
                [
                  "REVENGE_TRADING",
                  "Revenge Trading",
                ],
                [
                  "OVERCONFIDENCE",
                  "Overconfidence",
                ],
                ["ANXIETY", "Anxiety"],
                [
                  "LACK_OF_CONFIDENCE",
                  "Lack of Confidence",
                ],
                ["OTHER", "Other"],
              ]}
            />

            <TextAreaField
              name="oneAreaToImprove"
              label="10. If they could improve only one area of their trading over the next 30 days, what would it be?"
              defaultValue={
                assessment?.oneAreaToImprove
              }
              required
            />

            <TextAreaField
              name="successDefinition"
              label="11. What does success look like at the end of these 30 days?"
              defaultValue={
                assessment?.successDefinition
              }
              required
            />

            <TextAreaField
              name="coachSupportNeeded"
              label="12. How can you best support this trader during the 30-day journey?"
              defaultValue={
                assessment?.coachSupportNeeded
              }
              required
            />

            <SelectField
              name="willingToBeAccountable"
              label="13. Is the trader willing to be honest, coachable, and accountable—even when it is uncomfortable?"
              defaultValue={
                assessment
                  ? assessment.willingToBeAccountable
                    ? "YES"
                    : "NO"
                  : ""
              }
              options={[
                ["", "Select one"],
                ["YES", "Yes"],
                ["NO", "No"],
              ]}
            />

            <TextAreaField
              name="accountabilityExplanation"
              label="Please explain"
              defaultValue={
                assessment?.accountabilityExplanation
              }
            />

            <TextAreaField
              name="personalCommitment"
              label="14. What commitment is the trader making to themselves over the next 30 days?"
              defaultValue={
                assessment?.personalCommitment
              }
              required
            />

            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {assessment
                ? "Save Assessment Changes"
                : "Complete Initial Assessment"}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-[var(--text)]"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        rows={4}
        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      />
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  options: string[][];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-[var(--text)]"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      >
        {options.map(([value, label]) => (
          <option
            key={`${name}-${value}`}
            value={value}
            disabled={value === ""}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}