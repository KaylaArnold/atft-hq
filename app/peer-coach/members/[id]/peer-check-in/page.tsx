import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

type PeerCheckInPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    week?: string;
  }>;
};
async function savePeerCoachCheckIn(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const memberId = formData.get("memberId");
  const weekValue = formData.get("weekNumber");

  if (
    typeof memberId !== "string" ||
    typeof weekValue !== "string"
  ) {
    return;
  }

  const weekNumber = Number(weekValue);

  if (
    !Number.isInteger(weekNumber) ||
    weekNumber < 1 ||
    weekNumber > 4
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

  const assignment = await prisma.peerCoachAssignment.findFirst({
    where: {
      peerCoachId: coach.id,
      memberId,
      active: true,
      program: {
        slug: "mini-drippers",
      },
    },
  });

  if (!assignment) {
    redirect("/peer-coach");
  }

  const getString = (name: string) => {
    const value = formData.get(name);

    return typeof value === "string" && value.trim()
      ? value.trim()
      : null;
  };

  const getBoolean = (name: string) => {
    const value = formData.get(name);

    if (value === "yes") return true;
    if (value === "no") return false;

    return null;
  };

  const getNumber = (name: string) => {
    const value = getString(name);

    if (!value) return null;

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  };

  const beginningBalance = getNumber("beginningBalance");
  const endingBalance = getNumber("endingBalance");

  let weeklyGainLoss: number | null = null;
  let weeklyPercentage: number | null = null;

  if (
    beginningBalance !== null &&
    endingBalance !== null
  ) {
    weeklyGainLoss = endingBalance - beginningBalance;

    if (beginningBalance !== 0) {
      weeklyPercentage =
        (weeklyGainLoss / beginningBalance) * 100;
    }
  }

  await prisma.peerCoachCheckIn.upsert({
    where: {
      assignmentId_weekNumber: {
        assignmentId: assignment.id,
        weekNumber,
      },
    },

    create: {
      assignmentId: assignment.id,
      weekNumber,

      attendedLiveSessions: getBoolean("attendedLiveSessions"),
      liveSessionsAttended: getNumber("liveSessionsAttended"),
      watchedMissedReplays: getBoolean("watchedMissedReplays"),
      missedSessionReason: getString("missedSessionReason"),

      totalTrades: getNumber("totalTrades"),
      greenTrades: getNumber("greenTrades"),
      redTrades: getNumber("redTrades"),
      tickers: getString("tickers"),
      tickerFocus: getString("tickerFocus"),

      tradingPlanDiscipline: getString("tradingPlanDiscipline"),
      biggestStrength: getString("biggestStrength"),
      biggestChallenge: getString("biggestChallenge"),
      challengeOther: getString("challengeOther"),

      beginningBalance,
      endingBalance,
      weeklyGainLoss,
      weeklyPercentage,
      biggestLesson: getString("biggestLesson"),

      traderFeeling: getString("traderFeeling"),
      traderQuestions: getString("traderQuestions"),
      helpNeeded: getString("helpNeeded"),
      supportNextWeek: getString("supportNextWeek"),

      strengthsNoticed: getString("strengthsNoticed"),
      focusNextWeek: getString("focusNextWeek"),
      actionItem: getString("actionItem"),

      commitmentScore: getNumber("commitmentScore"),
      moveOnePoint: getString("moveOnePoint"),

      completedAt: new Date(),
    },

    update: {
      attendedLiveSessions: getBoolean("attendedLiveSessions"),
      liveSessionsAttended: getNumber("liveSessionsAttended"),
      watchedMissedReplays: getBoolean("watchedMissedReplays"),
      missedSessionReason: getString("missedSessionReason"),

      totalTrades: getNumber("totalTrades"),
      greenTrades: getNumber("greenTrades"),
      redTrades: getNumber("redTrades"),
      tickers: getString("tickers"),
      tickerFocus: getString("tickerFocus"),

      tradingPlanDiscipline: getString("tradingPlanDiscipline"),
      biggestStrength: getString("biggestStrength"),
      biggestChallenge: getString("biggestChallenge"),
      challengeOther: getString("challengeOther"),

      beginningBalance,
      endingBalance,
      weeklyGainLoss,
      weeklyPercentage,
      biggestLesson: getString("biggestLesson"),

      traderFeeling: getString("traderFeeling"),
      traderQuestions: getString("traderQuestions"),
      helpNeeded: getString("helpNeeded"),
      supportNextWeek: getString("supportNextWeek"),

      strengthsNoticed: getString("strengthsNoticed"),
      focusNextWeek: getString("focusNextWeek"),
      actionItem: getString("actionItem"),

      commitmentScore: getNumber("commitmentScore"),
      moveOnePoint: getString("moveOnePoint"),

      completedAt: new Date(),
    },
  });

  redirect(
    `/peer-coach/members/${memberId}/peer-check-in?week=${weekNumber}&saved=1`
  );
}

export default async function PeerCheckInPage({
  params,
  searchParams,
}: PeerCheckInPageProps) {
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
      program: {
        slug: "mini-drippers",
      },
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

  const requestedWeek = Number(query.week);

  const selectedWeek =
    Number.isInteger(requestedWeek) &&
    requestedWeek >= 1 &&
    requestedWeek <= 4
      ? requestedWeek
      : 1;

  const currentCheckIn =
    assignment.checkIns.find(
        (checkIn) => checkIn.weekNumber === selectedWeek
    ) ?? null;
  
  const completedWeeks = new Set(
    assignment.checkIns
        .filter((checkIn) => checkIn.completedAt)
        .map((checkIn) => checkIn.weekNumber)
  );

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
            Mini Dripper
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Weekly Peer Coach Check-In
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Complete the weekly 15-minute Peer Coach check-in for {memberName}.
          </p>
        </section>

        <section className="panel mt-8 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((week) => {
              const active = week === selectedWeek;
              const complete = completedWeeks.has(week);

              return (
                <Link
                  key={week}
                  href={`/peer-coach/members/${id}/peer-check-in?week=${week}`}
                  className={
                    active
                      ? "rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white"
                      : "rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)]"
                  }
                >
                  Week {week}{complete ? " ✓" : ""}
                </Link>
              );
            })}
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

          <form 
            key={selectedWeek}
            action={savePeerCoachCheckIn} 
            className="mt-8 space-y-8"
          >
  <input type="hidden" name="memberId" value={id} />
  <input type="hidden" name="weekNumber" value={selectedWeek} />

  {/* Attendance & Commitment */}
  <FormSection
    number="1"
    title="Attendance & Commitment"
    description="Review the Mini Dripper's participation for the week."
  >
    <YesNoField
      name="attendedLiveSessions"
      label="Did the Mini Dripper attend the live sessions this week?"
      defaultValue={currentCheckIn?.attendedLiveSessions}
    />

    <NumberField
      name="liveSessionsAttended"
      label="How many live sessions did they attend?"
      min={0}
      defaultValue={currentCheckIn?.liveSessionsAttended}
    />

    <YesNoField
      name="watchedMissedReplays"
      label="If sessions were missed, were the replays watched?"
      defaultValue={currentCheckIn?.watchedMissedReplays}
    />

    <TextAreaField
      name="missedSessionReason"
      label="If not, what prevented them from attending or watching the replay?"
      defaultValue={currentCheckIn?.missedSessionReason}
    />
  </FormSection>

  {/* Trading Activity */}
<FormSection
  number="2"
  title="Trading Activity"
  description="Review the Mini Dripper's trading activity for the week."
>
  <div className="grid gap-5 sm:grid-cols-3">
    <NumberField
      name="totalTrades"
      label="Total Trades"
      min={0}
      defaultValue={currentCheckIn?.totalTrades}
    />

    <NumberField
      name="greenTrades"
      label="Green Trades"
      min={0}
      defaultValue={currentCheckIn?.greenTrades}
    />

    <NumberField
      name="redTrades"
      label="Red Trades"
      min={0}
      defaultValue={currentCheckIn?.redTrades}
    />
  </div>

  <TextField
    name="tickers"
    label="What ticker(s) did they trade?"
    placeholder="Example: SPY, QQQ, NVDA"
    defaultValue={currentCheckIn?.tickers ?? undefined}
  />

  <TextAreaField
    name="tickerFocus"
    label="Did they stay focused on 1–2 tickers or jump around? Explain."
    defaultValue={currentCheckIn?.tickerFocus}
  />
</FormSection>

{/* Trading Discipline */}
<FormSection
  number="3"
  title="Trading Discipline"
  description="Evaluate how well the Mini Dripper followed their trading process."
>
  <SelectField
    name="tradingPlanDiscipline"
    label="Did they follow their trading plan?"
    options={[
      "Yes",
      "Mostly",
      "Sometimes",
      "No",
    ]}
    defaultValue={currentCheckIn?.tradingPlanDiscipline}
  />

  <TextAreaField
    name="biggestStrength"
    label="What was their biggest trading strength this week?"
    defaultValue={currentCheckIn?.biggestStrength}
  />

  <SelectField
    name="biggestChallenge"
    label="What was their biggest challenge?"
    options={[
      "Overtrading",
      "FOMO",
      "Entering too early",
      "Entering too late",
      "Holding too long",
      "Cutting winners too early",
      "Risk management",
      "Following the trading plan",
      "Emotional trading",
      "Other",
    ]}
    defaultValue={currentCheckIn?.biggestChallenge}
  />

  <TextAreaField
    name="challengeOther"
    label="Additional notes about the challenge"
    defaultValue={currentCheckIn?.challengeOther}
  />
</FormSection>

{/* Accountability & Growth */}
<FormSection
  number="4"
  title="Accountability & Growth"
  description="Record the account progress and the week's biggest lesson."
>
  <div className="grid gap-5 sm:grid-cols-2">
    <NumberField
      name="beginningBalance"
      label="Beginning Balance"
      min={0}
      step="0.01"
      defaultValue={currentCheckIn?.beginningBalance?.toString()}
    />

    <NumberField
      name="endingBalance"
      label="Ending Balance"
      min={0}
      step="0.01"
      defaultValue={currentCheckIn?.endingBalance?.toString()}
    />
  </div>

  <p className="text-xs leading-5 text-[var(--text-muted)]">
    Weekly gain/loss and percentage will be calculated automatically from
    the beginning and ending balances.
  </p>

  <TextAreaField
    name="biggestLesson"
    label="What was their biggest lesson from the market this week?"
    defaultValue={currentCheckIn?.biggestLesson}
  />
</FormSection>

{/* Mini Dripper Check-In */}
<FormSection
  number="5"
  title="Mini Dripper Check-In"
  description="Use this section to capture the Mini Dripper's own feedback."
>
  <TextAreaField
    name="traderFeeling"
    label="How does the Mini Dripper feel about their trading this week?"
    defaultValue={currentCheckIn?.traderFeeling}
  />

  <TextAreaField
    name="traderQuestions"
    label="What questions do they have?"
    defaultValue={currentCheckIn?.traderQuestions}
  />

  <TextAreaField
    name="helpNeeded"
    label="What do they feel they need help with?"
    defaultValue={currentCheckIn?.helpNeeded}
  />

  <TextAreaField
    name="supportNextWeek"
    label="What support would be most helpful next week?"
    defaultValue={currentCheckIn?.supportNextWeek}
  />
</FormSection>

{/* Peer Coach Notes */}
<FormSection
  number="6"
  title="Peer Coach Notes"
  description="Document your observations and plan for the upcoming week."
>
  <TextAreaField
    name="strengthsNoticed"
    label="Strengths you noticed"
    defaultValue={currentCheckIn?.strengthsNoticed}
  />

  <TextAreaField
    name="focusNextWeek"
    label="What should they focus on next week?"
    defaultValue={currentCheckIn?.focusNextWeek}
  />

  <TextAreaField
    name="actionItem"
    label="Specific action item for next week"
    defaultValue={currentCheckIn?.actionItem}
  />
</FormSection>

{/* Commitment */}
<FormSection
  number="7"
  title="Commitment Check"
  description="Finish the weekly conversation with a commitment assessment."
>
  <NumberField
    name="commitmentScore"
    label="On a scale of 1–10, how committed are they to improving next week?"
    min={1}
    max={10}
    defaultValue={currentCheckIn?.commitmentScore}
  />

  <TextAreaField
    name="moveOnePoint"
    label="What would help move them one point higher?"
    defaultValue={currentCheckIn?.moveOnePoint}
  />
</FormSection>

<div className="border-t border-[var(--border)] pt-6">
  {currentCheckIn?.completedAt && (
    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-700">
        Week {selectedWeek} Check-In Complete
      </p>

      <p className="mt-1 text-xs text-emerald-700/80">
        This check-in has been submitted. You can update the answers below
        and save the changes if needed.
      </p>
    </div>
  )}

  <div className="flex justify-end">
    <button
      type="submit"
      className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      {currentCheckIn?.completedAt
        ? `Save Week ${selectedWeek} Changes`
        : `Submit Week ${selectedWeek} Check-In`}
    </button>
  </div>
</div>
</form>
        </section>
      </div>
    </AppShell>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
          {number}
        </span>

        <div>
          <h2 className="font-semibold text-[var(--text)]">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

function TextField({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string 
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>

      <input
        name={name}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>

      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

function NumberField({
  name,
  label,
  min,
  max,
  step,
  defaultValue,
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: string;
  defaultValue?: number | string | null;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>

      <input
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

function YesNoField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: boolean | null;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--text)]">
        {label}
      </legend>

      <div className="mt-3 flex gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
                type="radio"
                name={name}
                value="yes"
                defaultChecked={defaultValue === true}
                className="accent-[var(--accent)]"
            />
            Yes
        </label>
        
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input 
                type="radio"
                name={name}
                value="no"
                defaultChecked={defaultValue === false}
                className="accent-[var(--accent}]"
            />
            No
        </label>
      </div>
    </fieldset>
  );
}

function SelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      >
        <option value="" disabled>
          Select an option
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}