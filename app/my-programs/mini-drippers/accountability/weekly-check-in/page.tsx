import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { AccountabilityCycleStatus } from "@/generated/prisma/client";

type WeeklyCheckInPageProps = {
  searchParams: Promise<{
    week?: string;
  }>;
};

async function saveMemberCheckIn(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const cycleId = formData.get("cycleId");
  const weekNumber = formData.get("weekNumber");

  if (
    typeof cycleId !== "string" ||
    typeof weekNumber !== "string"
  ) {
    return;
  }

  const parsedWeekNumber = Number(weekNumber);

  if (
    !Number.isInteger(parsedWeekNumber) ||
    parsedWeekNumber < 1 ||
    parsedWeekNumber > 4
  ) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  /*
   * Security:
   * The signed-in member must own this cycle.
   */
  const cycle = await prisma.accountabilityCycle.findFirst({
    where: {
      id: cycleId,
      memberId: user.id,
      status: AccountabilityCycleStatus.ACTIVE,
      program: {
        slug: "mini-drippers",
      },
    },
  });

  if (!cycle) {
    redirect("/my-programs/mini-drippers");
  }

  const requiredString = (name: string) => {
    const value = formData.get(name);

    if (
      typeof value !== "string" ||
      !value.trim()
    ) {
      return null;
    }

    return value.trim();
  };

  const optionalString = (name: string) => {
    const value = formData.get(name);

    return typeof value === "string" &&
      value.trim()
      ? value.trim()
      : null;
  };

  const attendanceStatus =
    requiredString("attendanceStatus");

  const tradingPlanStatus =
    requiredString("tradingPlanStatus");

  const outsideSetupTrades =
    requiredString("outsideSetupTrades");

  const journalConsistency =
    requiredString("journalConsistency");

  const biggestWin =
    requiredString("biggestWin");

  const challenges =
    requiredString("challenges");

  const primaryEmotion =
    requiredString("primaryEmotion");

  const riskDiscipline =
    requiredString("riskDiscipline");

  const marketLesson =
    requiredString("marketLesson");

  const weeklyGoal =
    requiredString("weeklyGoal");

  const traderSignature =
    requiredString("traderSignature");

  if (
    !attendanceStatus ||
    !tradingPlanStatus ||
    !outsideSetupTrades ||
    !journalConsistency ||
    !biggestWin ||
    !challenges ||
    !primaryEmotion ||
    !riskDiscipline ||
    !marketLesson ||
    !weeklyGoal ||
    !traderSignature
  ) {
    return;
  }

  const existingCheckIn =
    await prisma.coachingCheckIn.findFirst({
      where: {
        cycleId,
        weekNumber: parsedWeekNumber,
      },
    });

  /*
   * MEMBER-OWNED FIELDS ONLY.
   *
   * Notice that we do NOT touch:
   * progressStatus
   * areasToCelebrate
   * areasNeedingAttention
   * actionItems
   * coachEncouragement
   * coachSignature
   * nextCheckInDate
   * coachReviewedAt
   */
  const memberData = {
    weekNumber: parsedWeekNumber,

    attendanceStatus,
    attendanceReason:
      optionalString("attendanceReason"),

    tradingPlanStatus,
    tradingPlanExplanation:
      optionalString("tradingPlanExplanation"),

    outsideSetupTrades,
    outsideSetupExplanation:
      optionalString("outsideSetupExplanation"),

    journalConsistency,

    biggestWin,
    challenges,
    primaryEmotion,

    riskDiscipline,
    riskComments:
      optionalString("riskComments"),

    marketLesson,
    weeklyGoal,

    traderSignature,

    memberCompletedAt: new Date(),
  };

  if (existingCheckIn) {
    await prisma.coachingCheckIn.update({
      where: {
        id: existingCheckIn.id,
      },
      data: memberData,
    });
  } else {
    await prisma.coachingCheckIn.create({
      data: {
        cycleId,
        checkInDate: new Date(),
        completed: false,
        ...memberData,
      },
    });
  }

  revalidatePath(
  "/my-programs/mini-drippers/accountability"
);

revalidatePath(
  "/my-programs/mini-drippers/accountability/weekly-check-in"
);

revalidatePath("/peer-coach");

revalidatePath(
  `/peer-coach/members/${user.id}`
);

revalidatePath(
  `/peer-coach/members/${user.id}/weekly-check-in`
);

redirect(
  `/my-programs/mini-drippers/accountability/weekly-check-in?week=${parsedWeekNumber}`
);
}

export default async function MemberWeeklyCheckInPage({
  searchParams,
}: WeeklyCheckInPageProps): Promise<import("react").JSX.Element> {
  const query = await searchParams;

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

  const cycle =
    await prisma.accountabilityCycle.findFirst({
      where: {
        memberId: user.id,
        status:
          AccountabilityCycleStatus.ACTIVE,
        program: {
          slug: "mini-drippers",
        },
      },

      include: {
        checkIns: {
          orderBy: {
            weekNumber: "asc",
          },
        },
        peerCoach: true,
      },

      orderBy: {
        startDate: "desc",
      },
    });

  if (!cycle) {
    return (
      <AppShell variant="member">
        <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <Link
            href="/my-programs/mini-drippers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={16} />
            Back to Mini Drippers
          </Link>

          <section className="panel mt-6 rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              No Active Accountability Cycle
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              You do not currently have an
              active 30-day accountability
              cycle.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const requestedWeek = Number(query.week);

  const nextIncompleteWeek =
    [1, 2, 3, 4].find(
      (week) =>
        !cycle.checkIns.some(
          (checkIn) =>
            checkIn.weekNumber === week &&
            checkIn.memberCompletedAt
        )
    ) ?? 4;

  const selectedWeek =
    Number.isInteger(requestedWeek) &&
    requestedWeek >= 1 &&
    requestedWeek <= 4
      ? requestedWeek
      : nextIncompleteWeek;

  const checkIn =
    cycle.checkIns.find(
      (item) =>
        item.weekNumber === selectedWeek
    ) ?? null;

  const checkInWithOptionalFields =
    checkIn as
      | (typeof checkIn & {
          attendanceReason?: string | null;
          tradingPlanExplanation?: string | null;
          outsideSetupExplanation?: string | null;
          riskComments?: string | null;
        })
      | null;

  const memberName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    user.email ||
    "ATFT Member";

  const coachName =
    [
      cycle.peerCoach.firstName,
      cycle.peerCoach.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    cycle.peerCoach.email ||
    "Peer Coach";

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[950px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/my-programs/mini-drippers"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Mini Drippers
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ATFT-002
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Weekly Accountability Check-In
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Complete your weekly accountability
            check-in. Your Peer Coach can review
            your responses but cannot change them.
          </p>

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Peer Coach: {coachName}
          </p>
        </section>

        <section className="panel mt-8 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((week) => {
              const weekCheckIn =
                cycle.checkIns.find(
                  (item) =>
                    item.weekNumber === week
                );

              const memberDone = Boolean(
                weekCheckIn?.memberCompletedAt
              );

              const coachDone = Boolean(
                weekCheckIn?.coachReviewedAt
              );

              const active =
                week === selectedWeek;

              return (
                <Link
                  key={week}
                  href={`/my-programs/mini-drippers/accountability/weekly-check-in?week=${week}`}
                  className={
                    active
                      ? "rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white"
                      : coachDone
                        ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700"
                        : memberDone
                          ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700"
                          : "rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)]"
                  }
                >
                  Week {week}
                  {coachDone
                    ? " ✓"
                    : memberDone
                      ? " •"
                      : ""}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-[var(--text-muted)]">
            <span>• Submitted by you</span>
            <span>✓ Reviewed by coach</span>
          </div>
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardCheck size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Week {selectedWeek}
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {memberName}
              </p>
            </div>
          </div>

          {checkIn?.coachReviewedAt && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">
                Peer Coach Review Complete
              </p>

              <p className="mt-1 text-xs text-blue-700/80">
                Your coach has reviewed this weekly
                check-in.
              </p>
            </div>
          )}

          <form
            action={saveMemberCheckIn}
            className="mt-8 space-y-9"
          >
            <input
              type="hidden"
              name="cycleId"
              value={cycle.id}
            />

            <input
              type="hidden"
              name="weekNumber"
              value={selectedWeek}
            />

            <FormSection
              title="Weekly Progress"
              description="Review your attendance, trading discipline, and journaling for the week."
            >
              <SelectField
                name="attendanceStatus"
                label="1. Did you attend the live trading sessions this week?"
                defaultValue={
                  checkIn?.attendanceStatus
                }
                options={[
                  ["", "Select one"],
                  ["EVERY_DAY", "Every Day"],
                  ["MOST_DAYS", "Most Days"],
                  ["FEW_DAYS", "A Few Days"],
                  ["NOT_AT_ALL", "Not at All"],
                ]}
              />

              <TextAreaField
                name="attendanceReason"
                label="If not every day, why?"
                defaultValue={
                  checkInWithOptionalFields?.attendanceReason
                }
              />

              <SelectField
                name="tradingPlanStatus"
                label="2. Did you follow your trading plan this week?"
                defaultValue={
                  checkIn?.tradingPlanStatus
                }
                options={[
                  ["", "Select one"],
                  ["YES", "Yes"],
                  ["MOSTLY", "Mostly"],
                  ["SOMETIMES", "Sometimes"],
                  ["NO", "No"],
                ]}
              />

              <TextAreaField
                name="tradingPlanExplanation"
                label="If not, what happened?"
                defaultValue={
                  checkInWithOptionalFields?.tradingPlanExplanation
                }
              />

              <SelectField
                name="outsideSetupTrades"
                label="3. How many trades did you take outside of your A+ setup?"
                defaultValue={
                  checkIn?.outsideSetupTrades
                }
                options={[
                  ["", "Select one"],
                  ["0", "0"],
                  ["1_2", "1–2"],
                  ["3_5", "3–5"],
                  [
                    "MORE_THAN_5",
                    "More than 5",
                  ],
                ]}
              />

              <TextAreaField
                name="outsideSetupExplanation"
                label="Explain"
                defaultValue={
                  checkInWithOptionalFields?.outsideSetupExplanation
                }
              />

              <SelectField
                name="journalConsistency"
                label="4. Did you journal your trades this week?"
                defaultValue={
                  checkIn?.journalConsistency
                }
                options={[
                  ["", "Select one"],
                  [
                    "EVERY_TRADE",
                    "Every Trade",
                  ],
                  [
                    "MOST_TRADES",
                    "Most Trades",
                  ],
                  [
                    "SOME_TRADES",
                    "Some Trades",
                  ],
                  ["NONE", "None"],
                ]}
              />

              <TextAreaField
                name="biggestWin"
                label="5. What was your biggest win this week? It does not have to be financial."
                defaultValue={
                  checkIn?.biggestWin
                }
                required
              />

              <TextAreaField
                name="challenges"
                label="6. What challenged you the most this week?"
                defaultValue={
                  checkIn?.challenges
                }
                required
              />
            </FormSection>

            <FormSection
              title="Discipline & Reflection"
              description="Reflect on mindset, discipline, lessons, and your next goal."
            >
              <SelectField
                name="primaryEmotion"
                label="7. Which emotion showed up the most this week?"
                defaultValue={
                  checkIn?.primaryEmotion
                }
                options={[
                  ["", "Select one"],
                  ["FEAR", "Fear"],
                  ["GREED", "Greed"],
                  ["FOMO", "FOMO"],
                  [
                    "IMPATIENCE",
                    "Impatience",
                  ],
                  [
                    "REVENGE_TRADING",
                    "Revenge Trading",
                  ],
                  [
                    "OVERCONFIDENCE",
                    "Overconfidence",
                  ],
                  [
                    "FRUSTRATION",
                    "Frustration",
                  ],
                  ["ANXIETY", "Anxiety"],
                  ["OTHER", "Other"],
                ]}
              />

              <SelectField
                name="riskDiscipline"
                label="8. Did you remain disciplined with your stop losses and profit targets?"
                defaultValue={
                  checkIn?.riskDiscipline
                }
                options={[
                  ["", "Select one"],
                  ["ALWAYS", "Always"],
                  [
                    "MOST_OF_TIME",
                    "Most of the Time",
                  ],
                  [
                    "SOMETIMES",
                    "Sometimes",
                  ],
                  ["NO", "No"],
                ]}
              />

              <TextAreaField
                name="riskComments"
                label="Comments"
                defaultValue={
                  checkInWithOptionalFields?.riskComments
                }
              />

              <TextAreaField
                name="marketLesson"
                label="9. What lesson did the market teach you this week?"
                defaultValue={
                  checkIn?.marketLesson
                }
                required
              />

              <TextAreaField
                name="weeklyGoal"
                label="10. What is one specific goal you are committing to before your next check-in?"
                defaultValue={
                  checkIn?.weeklyGoal
                }
                required
              />
            </FormSection>

            <FormSection
              title="Signature"
              description="Confirm that these are your weekly accountability responses."
            >
              <TextField
                name="traderSignature"
                label="Trader Signature"
                defaultValue={
                  checkIn?.traderSignature ??
                  memberName
                }
                required
              />
            </FormSection>

            <div className="space-y-4">
  <button
    type="submit"
    className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
  >
    {checkIn?.memberCompletedAt
      ? `Save Week ${selectedWeek} Changes`
      : `Submit Week ${selectedWeek} Check-In`}
  </button>

  {checkIn?.memberCompletedAt && (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-emerald-600"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Week {selectedWeek} Submitted Successfully
          </p>

          <p className="mt-1 text-xs leading-5 text-emerald-700/80">
            Your responses have been saved and are ready for your Peer
            Coach to review.
          </p>
        </div>
      </div>
    </div>
  )}
</div>
          </form>
        </section>

        {checkIn?.coachReviewedAt && (
          <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Peer Coach Review
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Week {selectedWeek} Feedback
            </h2>

            <div className="mt-6 space-y-5">
              <ReadOnlyField
                label="Overall Progress"
                value={formatValue(
                  checkIn.progressStatus
                )}
              />

              <ReadOnlyField
                label="Areas to Celebrate"
                value={
                  checkIn.areasToCelebrate
                }
              />

              <ReadOnlyField
                label="Areas Needing Attention"
                value={
                  checkIn.areasNeedingAttention
                }
              />

              <ReadOnlyField
                label="Action Items for Next Week"
                value={checkIn.actionItems}
              />

              <ReadOnlyField
                label="Coach Encouragement"
                value={
                  checkIn.coachEncouragement
                }
              />

              <ReadOnlyField
                label="Next Check-In"
                value={
                  checkIn.nextCheckInDate
                    ? new Intl.DateTimeFormat(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      ).format(
                        checkIn.nextCheckInDate
                      )
                    : "Not scheduled"
                }
              />
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border)] pt-7 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold text-[var(--text)]">
        {title}
      </h2>

      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
        {description}
      </p>

      <div className="mt-6 space-y-6">
        {children}
      </div>
    </section>
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

function TextField({
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

      <input
        id={name}
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
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
        {options.map(
          ([value, label]) => (
            <option
              key={`${name}-${value}`}
              value={value}
              disabled={value === ""}
            >
              {label}
            </option>
          )
        )}
      </select>
    </div>
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

function formatValue(
  value?: string | null
) {
  if (!value) {
    return "Not provided";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}