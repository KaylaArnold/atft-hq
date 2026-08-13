import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  WalletCards,
} from "lucide-react";

import { BalanceMarker } from "@/generated/prisma/client";
import MonthlyBalanceEditForm from "@/components/monthly-balance-edit-form";
import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type MonthlyBalancePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function calculateBalanceMarker(
  startingBalance: number,
  endingBalance: number
): BalanceMarker {
  if (endingBalance >= startingBalance * 2) {
    return BalanceMarker.GREEN;
  }

  if (endingBalance > startingBalance) {
    return BalanceMarker.YELLOW;
  }

  return BalanceMarker.RED;
}

async function submitMonthlyBalance(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const programId = formData.get("programId");
  const slug = formData.get("slug");
  const month = formData.get("month");
  const year = formData.get("year");
  const startingBalance = formData.get("startingBalance");
  const endingBalance = formData.get("endingBalance");
  const signature = formData.get("signature");

  if (
    typeof programId !== "string" ||
    typeof slug !== "string" ||
    typeof month !== "string" ||
    typeof year !== "string" ||
    typeof startingBalance !== "string" ||
    typeof endingBalance !== "string" ||
    typeof signature !== "string"
  ) {
    return;
  }

  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const parsedStartingBalance = Number(startingBalance);
  const parsedEndingBalance = Number(endingBalance);

  if (
    !Number.isInteger(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    !Number.isInteger(parsedYear) ||
    !Number.isFinite(parsedStartingBalance) ||
    !Number.isFinite(parsedEndingBalance) ||
    parsedStartingBalance < 0 ||
    parsedEndingBalance < 0 ||
    !signature.trim()
  ) {
    return;
  }

  const marker = calculateBalanceMarker(
    parsedStartingBalance,
    parsedEndingBalance
  );

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      enrollments: {
        where: {
          active: true,
          programId,
        },
      },
    },
  });

  if (!user || user.enrollments.length === 0) {
    return;
  }

  const existingSubmission = await prisma.monthlyBalance.findUnique({
    where: {
      userId_programId_month_year: {
        userId: user.id,
        programId,
        month: parsedMonth,
        year: parsedYear,
      },
    },
  });

  if (existingSubmission) {
    redirect(`/my-programs/${slug}/monthly-balance`);
  }

  const submittedAt = new Date();

  // Example:
  // July report opens August 1 at 12:00 AM.
  const opensAt = new Date(
    parsedYear,
    parsedMonth,
    1,
    0,
    0,
    0,
    0
  );

  if (submittedAt < opensAt) {
    return;
  }

  // The full 1st is considered on time.
  const dueDate = new Date(
    parsedYear,
    parsedMonth,
    1,
    23,
    59,
    59,
    999
  );

  // The 2nd and later are accepted but marked late.
  const late = submittedAt > dueDate;

  await prisma.monthlyBalance.create({
    data: {
      userId: user.id,
      programId,
      month: parsedMonth,
      year: parsedYear,
      startingBalance: parsedStartingBalance,
      endingBalance: parsedEndingBalance,
      marker,
      signature: signature.trim(),
      submittedAt,
      late,
    },
  });

  revalidatePath(`/my-programs/${slug}/monthly-balance`);

  redirect(`/my-programs/${slug}/monthly-balance`);
}

async function updateMonthlyBalance(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const balanceId = formData.get("balanceId");
  const slug = formData.get("slug");
  const startingBalance = formData.get("startingBalance");
  const endingBalance = formData.get("endingBalance");
  const signature = formData.get("signature");

  if (
    typeof balanceId !== "string" ||
    typeof slug !== "string" ||
    typeof startingBalance !== "string" ||
    typeof endingBalance !== "string" ||
    typeof signature !== "string"
  ) {
    return;
  }

  const parsedStartingBalance = Number(startingBalance);
  const parsedEndingBalance = Number(endingBalance);

  if (
    !Number.isFinite(parsedStartingBalance) ||
    !Number.isFinite(parsedEndingBalance) ||
    parsedStartingBalance < 0 ||
    parsedEndingBalance < 0 ||
    !signature.trim()
  ) {
    return;
  }

  const marker = calculateBalanceMarker(
    parsedStartingBalance,
    parsedEndingBalance
  );

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    return;
  }

  // Members may only edit their own balance record.
  const balance = await prisma.monthlyBalance.findFirst({
    where: {
      id: balanceId,
      userId: user.id,
    },
  });

  if (!balance) {
    return;
  }

  await prisma.monthlyBalance.update({
    where: {
      id: balance.id,
    },
    data: {
      startingBalance: parsedStartingBalance,
      endingBalance: parsedEndingBalance,
      marker,
      signature: signature.trim(),

      // Original submission timing is intentionally preserved:
      // submittedAt
      // late
    },
  });

  revalidatePath(`/my-programs/${slug}/monthly-balance`);

  redirect(`/my-programs/${slug}/monthly-balance`);
}

export default async function MonthlyBalancePage({
  params,
}: MonthlyBalancePageProps) {
  const { slug } = await params;
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

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      active: true,
      program: {
        slug,
      },
    },
    include: {
      program: true,
    },
  });

  if (!enrollment) {
    return (
      <AppShell variant="member">
        <div className="flex min-h-[calc(100vh-76px)] items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-[var(--text)]">
              Program Access Required
            </h1>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              You do not have active access to this program.
            </p>

            <Link
              href="/my-programs"
              className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)]"
            >
              Return to My Programs
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const now = new Date();

  // The report submitted this month represents the previous month.
  // Example: an August submission reports July 1 through July 31.
  const reportingDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const month = reportingDate.getMonth() + 1;
  const year = reportingDate.getFullYear();

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(reportingDate);

  const dueDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(
      reportingDate.getFullYear(),
      reportingDate.getMonth() + 1,
      1
    )
  );

  const existingSubmission = await prisma.monthlyBalance.findUnique({
    where: {
      userId_programId_month_year: {
        userId: user.id,
        programId: enrollment.program.id,
        month,
        year,
      },
    },
  });

  const markerLabel =
    existingSubmission?.marker === BalanceMarker.GREEN
      ? "You Did It!"
      : existingSubmission?.marker === BalanceMarker.YELLOW
        ? "Keep Working!"
        : existingSubmission?.marker === BalanceMarker.RED
          ? "See Peer Coach"
          : null;

  const markerClasses =
    existingSubmission?.marker === BalanceMarker.GREEN
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : existingSubmission?.marker === BalanceMarker.YELLOW
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href={`/my-programs/${enrollment.program.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to {enrollment.program.name}
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Monthly Balance
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            {monthLabel}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Submit your beginning and ending account balances for{" "}
            {monthLabel}.
          </p>

          <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
            Due {dueDateLabel}. Submissions after the 1st are accepted
            but marked late.
          </p>
        </section>

        {existingSubmission ? (
          <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <CheckCircle2 size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Submitted
                  </p>

                  {existingSubmission.late && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                      Late
                    </span>
                  )}

                  {markerLabel && (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${markerClasses}`}
                    >
                      {markerLabel} 
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
                  Your {monthLabel} balance is on file.
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--surface-strong)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">
                      Starting Balance
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                      $
                      {Number(
                        existingSubmission.startingBalance
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[var(--surface-strong)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">
                      Ending Balance
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                      $
                      {Number(
                        existingSubmission.endingBalance
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs text-[var(--text-muted)]">
                  Originally submitted{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(existingSubmission.submittedAt)}
                </p>

                <MonthlyBalanceEditForm
                  balanceId={existingSubmission.id}
                  slug={enrollment.program.slug}
                  startingBalance={Number(
                    existingSubmission.startingBalance
                  )}
                  endingBalance={Number(
                    existingSubmission.endingBalance
                  )}
                  signature={existingSubmission.signature}
                  action={updateMonthlyBalance}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <WalletCards size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Balance Submission
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                  Submit your monthly balance
                </h2>
              </div>
            </div>

            <form
              action={submitMonthlyBalance}
              className="mt-7 space-y-6"
            >
              <input
                type="hidden"
                name="programId"
                value={enrollment.program.id}
              />

              <input
                type="hidden"
                name="slug"
                value={enrollment.program.slug}
              />

              <input
                type="hidden"
                name="month"
                value={month}
              />

              <input
                type="hidden"
                name="year"
                value={year}
              />

              <div>
                <label
                  htmlFor="startingBalance"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                >
                  Starting Monthly Balance
                </label>

                <input
                  id="startingBalance"
                  name="startingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="endingBalance"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                >
                  Ending Monthly Balance
                </label>

                <input
                  id="endingBalance"
                  name="endingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="signature"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                >
                  Signature
                </label>

                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Type your full name to certify that this balance
                  submission is accurate.
                </p>

                <input
                  id="signature"
                  name="signature"
                  type="text"
                  required
                  placeholder="Type your full name"
                  className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
              >
                Submit Monthly Balance
              </button>
            </form>
          </section>
        )}
      </div>
    </AppShell>
  );
}