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
import {
  AccountabilityCycleStatus,
  RoleName,
} from "@/generated/prisma/client";

type WeeklyCheckInPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    week?: string;
  }>;
};

async function saveCoachReview(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const memberId = formData.get("memberId");
  const checkInId = formData.get("checkInId");

  const progressStatus = formData.get("progressStatus");
  const areasToCelebrate = formData.get("areasToCelebrate");
  const areasNeedingAttention = formData.get(
    "areasNeedingAttention"
  );
  const actionItems = formData.get("actionItems");
  const coachEncouragement = formData.get(
    "coachEncouragement"
  );
  const coachSignature = formData.get("coachSignature");
  const nextCheckInDate = formData.get("nextCheckInDate");

  if (
    typeof memberId !== "string" ||
    typeof checkInId !== "string" ||
    typeof progressStatus !== "string" ||
    typeof areasToCelebrate !== "string" ||
    typeof areasNeedingAttention !== "string" ||
    typeof actionItems !== "string" ||
    typeof coachEncouragement !== "string" ||
    typeof coachSignature !== "string"
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
   * Make sure this check-in belongs to a member
   * actively assigned to the signed-in Peer Coach.
   */
  const checkIn = await prisma.coachingCheckIn.findFirst({
    where: {
      id: checkInId,
      cycle: {
        peerCoachId: coach.id,
        memberId,
        status: AccountabilityCycleStatus.ACTIVE,
        assignment: {
          active: true,
          peerCoachId: coach.id,
          memberId,
        },
      },
    },
  });

  if (!checkIn) {
    redirect("/peer-coach");
  }

  /*
   * The coach may only update coach-owned fields.
   * Member responses are intentionally untouched.
   */
  await prisma.coachingCheckIn.update({
    where: {
      id: checkIn.id,
    },
    data: {
      progressStatus,
      areasToCelebrate: areasToCelebrate.trim(),
      areasNeedingAttention:
        areasNeedingAttention.trim(),
      actionItems: actionItems.trim(),
      coachEncouragement:
        coachEncouragement.trim(),
      coachSignature: coachSignature.trim(),
      nextCheckInDate:
        typeof nextCheckInDate === "string" &&
        nextCheckInDate
          ? new Date(`${nextCheckInDate}T12:00:00`)
          : null,
      coachReviewedAt: new Date(),
    },
  });

  revalidatePath(
    `/peer-coach/members/${memberId}`
  );

  revalidatePath(
    `/peer-coach/members/${memberId}/weekly-check-in`
  );

  redirect(
    `/peer-coach/members/${memberId}/weekly-check-in?week=${checkIn.weekNumber ?? 1}`
  );
}

export default async function WeeklyCheckInPage({
  params,
  searchParams,
}: WeeklyCheckInPageProps) {
  const { id } = await params;
  const query = await searchParams;

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
          checkIns: {
            orderBy: {
              weekNumber: "asc",
            },
          },
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

  const requestedWeek = Number(query.week);

  const selectedWeek =
    Number.isInteger(requestedWeek) &&
    requestedWeek >= 1 &&
    requestedWeek <= 4
      ? requestedWeek
      : 1;

  const checkIn =
    cycle.checkIns.find(
      (item) => item.weekNumber === selectedWeek
    ) ?? null;

  const memberName =
    [
      assignment.member.firstName,
      assignment.member.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    assignment.member.email ||
    "ATFT Member";

  const coachName =
    [coach.firstName, coach.lastName]
      .filter(Boolean)
      .join(" ") ||
    coach.email ||
    "Peer Coach";

  const notes = parseCoachNotes(
    checkIn?.coachNotes
  );

  const memberSubmitted =
    Boolean(checkIn?.memberCompletedAt);

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
            ATFT-002
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Weekly Accountability Check-In
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Review {memberName}&apos;s weekly responses and complete
            the Accountability Coach Notes section.
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

              const memberDone =
                Boolean(
                  weekCheckIn?.memberCompletedAt
                );

              const coachDone =
                Boolean(
                  weekCheckIn?.coachReviewedAt
                );

              const active =
                week === selectedWeek;

              return (
                <Link
                  key={week}
                  href={`/peer-coach/members/${id}/weekly-check-in?week=${week}`}
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
        </section>

        {!checkIn || !memberSubmitted ? (
          <section className="panel mt-6 rounded-3xl p-8 text-center">
            <ClipboardCheck
              size={24}
              className="mx-auto text-[var(--text-muted)]"
            />

            <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">
              Waiting for Member Response
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
              {memberName} has not submitted the Week{" "}
              {selectedWeek} accountability check-in yet.
              Coach review will become available after the
              member completes their portion.
            </p>
          </section>
        ) : (
          <>
            <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Member Response
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                  Week {selectedWeek}
                </h2>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Submitted{" "}
                  {checkIn.memberCompletedAt
                    ? new Intl.DateTimeFormat(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      ).format(
                        checkIn.memberCompletedAt
                      )
                    : ""}
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <ReadOnlyField
                  label="1. Attendance"
                  value={formatValue(
                    checkIn.attendanceStatus
                  )}
                />

                <ReadOnlyField
                  label="If not every day, why?"
                  value={notes.attendance}
                />

                <ReadOnlyField
                  label="2. Followed trading plan"
                  value={formatValue(
                    checkIn.tradingPlanStatus
                  )}
                />

                <ReadOnlyField
                  label="If not, what happened?"
                  value={notes.tradingPlan}
                />

                <ReadOnlyField
                  label="3. Trades outside A+ setup"
                  value={formatValue(
                    checkIn.outsideSetupTrades
                  )}
                />

                <ReadOnlyField
                  label="Explanation"
                  value={notes.outsideSetup}
                />

                <ReadOnlyField
                  label="4. Journaling"
                  value={formatValue(
                    checkIn.journalConsistency
                  )}
                />

                <ReadOnlyField
                  label="5. Biggest win"
                  value={checkIn.biggestWin}
                />

                <ReadOnlyField
                  label="6. Biggest challenge"
                  value={checkIn.challenges}
                />

                <ReadOnlyField
                  label="7. Primary emotion"
                  value={formatValue(
                    checkIn.primaryEmotion
                  )}
                />

                <ReadOnlyField
                  label="8. Risk discipline"
                  value={formatValue(
                    checkIn.riskDiscipline
                  )}
                />

                <ReadOnlyField
                  label="Comments"
                  value={notes.risk}
                />

                <ReadOnlyField
                  label="9. Market lesson"
                  value={checkIn.marketLesson}
                />

                <ReadOnlyField
                  label="10. Goal before next check-in"
                  value={checkIn.weeklyGoal}
                />

                <ReadOnlyField
                  label="Trader Signature"
                  value={checkIn.traderSignature}
                />
              </div>
            </section>

            <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Accountability Coach Notes
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                  Coach Review
                </h2>

                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  The fields below belong to the Peer Coach.
                  Member responses above cannot be edited.
                </p>
              </div>

              <form
                action={saveCoachReview}
                className="mt-8 space-y-7"
              >
                <input
                  type="hidden"
                  name="memberId"
                  value={id}
                />

                <input
                  type="hidden"
                  name="checkInId"
                  value={checkIn.id}
                />

                <SelectField
                  name="progressStatus"
                  label="Overall Progress"
                  defaultValue={
                    checkIn.progressStatus
                  }
                  options={[
                    ["", "Select one"],
                    ["EXCELLENT", "Excellent"],
                    ["GOOD", "Good"],
                    [
                      "NEEDS_IMPROVEMENT",
                      "Needs Improvement",
                    ],
                    ["AT_RISK", "At Risk"],
                  ]}
                />

                <TextAreaField
                  name="areasToCelebrate"
                  label="Areas to Celebrate"
                  defaultValue={
                    checkIn.areasToCelebrate
                  }
                  required
                />

                <TextAreaField
                  name="areasNeedingAttention"
                  label="Areas That Need Immediate Attention"
                  defaultValue={
                    checkIn.areasNeedingAttention
                  }
                />

                <TextAreaField
                  name="actionItems"
                  label="Action Items for Next Week"
                  defaultValue={
                    checkIn.actionItems
                  }
                  required
                />

                <TextAreaField
                  name="coachEncouragement"
                  label="Coach Encouragement"
                  defaultValue={
                    checkIn.coachEncouragement
                  }
                />

                <TextField
                  name="coachSignature"
                  label="Coach Signature"
                  defaultValue={
                    checkIn.coachSignature ??
                    coachName
                  }
                  required
                />

                <div>
                  <label
                    htmlFor="nextCheckInDate"
                    className="text-sm font-semibold text-[var(--text)]"
                  >
                    Next Check-In Date
                  </label>

                  <div className="relative mt-3">
                    <CalendarDays
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      id="nextCheckInDate"
                      name="nextCheckInDate"
                      type="date"
                      defaultValue={
                        checkIn.nextCheckInDate
                          ? formatDateInput(
                              checkIn.nextCheckInDate
                            )
                          : ""
                      }
                      className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
  <button
    type="submit"
    className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
  >
    {checkIn.coachReviewedAt
      ? `Save Week ${selectedWeek} Coach Review`
      : `Complete Week ${selectedWeek} Coach Review`}
  </button>

  {checkIn.coachReviewedAt && (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-emerald-600"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Week {selectedWeek} Coach Review Saved
          </p>

          <p className="mt-1 text-xs leading-5 text-emerald-700/80">
            Your review has been saved and is now available to the member.
          </p>
        </div>
      </div>
    </div>
  )}
</div>
              </form>
            </section>
          </>
        )}
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

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function parseCoachNotes(
  notes?: string | null
) {
  const result = {
    attendance: "",
    tradingPlan: "",
    outsideSetup: "",
    risk: "",
  };

  if (!notes) {
    return result;
  }

  for (const section of notes.split("\n\n")) {
    if (
      section.startsWith("Attendance: ")
    ) {
      result.attendance =
        section.replace(
          "Attendance: ",
          ""
        );
    }

    if (
      section.startsWith(
        "Trading Plan: "
      )
    ) {
      result.tradingPlan =
        section.replace(
          "Trading Plan: ",
          ""
        );
    }

    if (
      section.startsWith(
        "Outside A+ Setup: "
      )
    ) {
      result.outsideSetup =
        section.replace(
          "Outside A+ Setup: ",
          ""
        );
    }

    if (
      section.startsWith(
        "Risk Discipline: "
      )
    ) {
      result.risk =
        section.replace(
          "Risk Discipline: ",
          ""
        );
    }
  }

  return result;
}