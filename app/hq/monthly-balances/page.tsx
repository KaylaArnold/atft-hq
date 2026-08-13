import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import {
  BalanceMarker,
  RoleName,
} from "@/generated/prisma/client";

type MonthlyBalancesPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
  }>;
};

export default async function MonthlyBalancesPage({
  searchParams,
}: MonthlyBalancesPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
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

  if (!user) {
    redirect("/");
  }

  const hasHQAccess = user.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER ||
      role.name === RoleName.COO ||
      role.name === RoleName.MEMBER_SERVICES ||
      role.name === RoleName.ADMINISTRATIVE_SERVICES
  );

  if (!hasHQAccess) {
    redirect("/");
  }

  const params = await searchParams;

  const now = new Date();
  const defaultReportingDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const selectedMonth = Number(
    params.month ?? defaultReportingDate.getMonth() + 1
  );

  const selectedYear = Number(
    params.year ?? defaultReportingDate.getFullYear()
  );

  const selectedStatus = params.status ?? "ALL";

  const programs = await prisma.program.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const members = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: RoleName.MEMBER,
          },
        },
      },
      enrollments: {
        some: {
          active: true,
        },
      },
    },
    include: {
      enrollments: {
        where: {
          active: true,
        },
        include: {
          program: true,
        },
      },
      monthlyBalances: {
        where: {
          month: selectedMonth,
          year: selectedYear,
        },
      },
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });

  const rows = members.flatMap((member) =>
    member.enrollments.map((enrollment) => {
      const balance = member.monthlyBalances.find(
        (item) => item.programId === enrollment.programId
      );

      const memberName =
        [member.firstName, member.lastName]
          .filter(Boolean)
          .join(" ") ||
        member.email ||
        "ATFT Member";

      return {
        memberId: member.id,
        memberName,
        programId: enrollment.program.id,
        programName: enrollment.program.name,
        balance,
      };
    })
  );

  const filteredRows = rows.filter((row) => {
    if (selectedStatus === "ALL") {
      return true;
    }

    if (selectedStatus === "MISSING") {
      return !row.balance;
    }

    if (selectedStatus === "LATE") {
      return row.balance?.late === true;
    }

    return row.balance?.marker === selectedStatus;
  });

  const greenCount = rows.filter(
    (row) => row.balance?.marker === BalanceMarker.GREEN
  ).length;

  const yellowCount = rows.filter(
    (row) => row.balance?.marker === BalanceMarker.YELLOW
  ).length;

  const redCount = rows.filter(
    (row) => row.balance?.marker === BalanceMarker.RED
  ).length;

  const lateCount = rows.filter(
    (row) => row.balance?.late === true
  ).length;

  const missingCount = rows.filter(
    (row) => !row.balance
  ).length;

  const reportingDate = new Date(
    selectedYear,
    selectedMonth - 1,
    1
  );

  const reportingLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(reportingDate);

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Monthly Balance Tracking
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            {reportingLabel}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Internal tracking for member monthly balance submissions,
            performance status, late reports, and missing reports.
          </p>
        </section>

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Green"
            value={greenCount}
            detail="You Did It!"
            tone="green"
          />

          <SummaryCard
            label="Yellow"
            value={yellowCount}
            detail="Keep Working!"
            tone="yellow"
          />

          <SummaryCard
            label="Red"
            value={redCount}
            detail="See Peer Coach"
            tone="red"
          />

          <SummaryCard
            label="Late"
            value={lateCount}
            detail="Submitted after the 1st"
            tone="neutral"
          />

          <SummaryCard
            label="Missing"
            value={missingCount}
            detail="No submission on file"
            tone="neutral"
          />
        </section>

        <section className="panel mt-6 rounded-3xl p-5 sm:p-6">
          <form
            action="/hq/monthly-balances"
            method="get"
            className="flex flex-col gap-4 lg:flex-row lg:items-end"
          >
            <div>
              <label
                htmlFor="month"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Month
              </label>

              <select
                id="month"
                name="month"
                defaultValue={String(selectedMonth)}
                className="mt-2 min-w-40 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                    }).format(new Date(2026, index, 1))}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Year
              </label>

              <select
                id="year"
                name="year"
                defaultValue={String(selectedYear)}
                className="mt-2 min-w-32 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {[2025, 2026, 2027].map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={selectedStatus}
                className="mt-2 min-w-44 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                <option value="ALL">All</option>
                <option value="GREEN">Green</option>
                <option value="YELLOW">Yellow</option>
                <option value="RED">Red</option>
                <option value="LATE">Late</option>
                <option value="MISSING">Missing</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Apply Filters
            </button>
          </form>
        </section>

        <section className="panel mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-strong)]">
                  <TableHeader>Member</TableHeader>
                  <TableHeader>Program</TableHeader>
                  <TableHeader>Starting</TableHeader>
                  <TableHeader>Ending</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Submission</TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.memberId}-${row.programId}`}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/members/${row.memberId}`}
                        className="text-sm font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
                      >
                        {row.memberName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                      {row.programName}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-[var(--text)]">
                      {row.balance
                        ? `$${Number(
                            row.balance.startingBalance
                          ).toFixed(2)}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-[var(--text)]">
                      {row.balance
                        ? `$${Number(
                            row.balance.endingBalance
                          ).toFixed(2)}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {row.balance?.marker ? (
                        <BalanceStatusBadge
                          marker={row.balance.marker}
                        />
                      ) : (
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {row.balance ? (
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">
                            {row.balance.late
                              ? "Late"
                              : "On Time"}
                          </p>

                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(row.balance.submittedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">
                          Not submitted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-[var(--text)]">
                        No matching balance records.
                      </p>

                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        Try another month or status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
      {children}
    </th>
  );
}

function BalanceStatusBadge({
  marker,
}: {
  marker: BalanceMarker;
}) {
  const label =
    marker === BalanceMarker.GREEN
      ? "You Did It!"
      : marker === BalanceMarker.YELLOW
        ? "Keep Working!"
        : "See Peer Coach";

  const classes =
    marker === BalanceMarker.GREEN
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : marker === BalanceMarker.YELLOW
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "green" | "yellow" | "red" | "neutral";
}) {
  const classes =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "yellow"
        ? "border-amber-200 bg-amber-50"
        : tone === "red"
          ? "border-red-200 bg-red-50"
          : "border-[var(--border)] bg-[var(--surface-strong)]";

  return (
    <div
      className={`rounded-2xl border p-5 ${classes}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {detail}
      </p>
    </div>
  );
}