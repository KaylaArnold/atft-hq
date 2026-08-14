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
    programId?: string;
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

  const selectedMonth = params.month
    ? Number(params.month)
    : null;

  const selectedYear = params.year
    ? Number(params.year)
    : null;

  const selectedStatus = params.status ?? "ALL";

  const hasReportingPeriod =
    selectedMonth !== null &&
    selectedYear !== null;

  const programs = await prisma.program.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (programs.length === 0) {
    return (
      <AppShell variant="staff">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <section className="panel rounded-3xl p-8">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              No programs found
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Add an ATFT program before using monthly balance tracking.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const requestedProgramId =
    params.programId;

  const selectedProgramId =
    requestedProgramId &&
    programs.some(
      (program) =>
        program.id === requestedProgramId
    )
      ? requestedProgramId
      : "ALL";

  const selectedProgram =
    selectedProgramId === "ALL"
      ? null
      : programs.find(
          (program) =>
            program.id === selectedProgramId
        ) ?? null;

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
        some:
          selectedProgramId === "ALL"
            ? {
                active: true,
              }
            : {
                active: true,
                programId: selectedProgramId,
              },
      },
    },

    include: {
      enrollments: {
        where:
          selectedProgramId === "ALL"
            ? {
                active: true,
              }
            : {
                active: true,
                programId: selectedProgramId,
              },

        include: {
          program: true,
        },
      },

      monthlyBalances: {
        where: hasReportingPeriod
          ? {
              month: selectedMonth,
              year: selectedYear,

              ...(selectedProgramId !==
              "ALL"
                ? {
                    programId:
                      selectedProgramId,
                  }
                : {}),
            }
          : {
              id: "__NO_REPORTING_PERIOD__",
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

  const rows = members.flatMap(
    (member) => {
      const memberName =
        [member.firstName, member.lastName]
          .filter(Boolean)
          .join(" ") ||
        member.email ||
        "ATFT Member";

      return member.enrollments.map(
        (enrollment) => {
          const balance =
            member.monthlyBalances.find(
              (item) =>
                item.programId ===
                enrollment.programId
            ) ?? null;

          return {
            memberId: member.id,
            memberName,
            programId:
              enrollment.program.id,
            programName:
              enrollment.program.name,
            balance,
          };
        }
      );
    }
  );

  const filteredRows = rows.filter(
    (row) => {
      if (!hasReportingPeriod) {
        return false;
      }

      if (selectedStatus === "ALL") {
        return true;
      }

      if (
        selectedStatus ===
        "NOT_SUBMITTED"
      ) {
        return !row.balance;
      }

      if (selectedStatus === "LATE") {
        return (
          row.balance?.late === true
        );
      }

      if (selectedStatus === "GREEN") {
        return (
          row.balance?.marker ===
          BalanceMarker.GREEN
        );
      }

      if (
        selectedStatus === "YELLOW"
      ) {
        return (
          row.balance?.marker ===
          BalanceMarker.YELLOW
        );
      }

      if (selectedStatus === "RED") {
        return (
          row.balance?.marker ===
          BalanceMarker.RED
        );
      }

      return true;
    }
  );

  const submittedCount = rows.filter(
    (row) => row.balance
  ).length;

  const greenCount = rows.filter(
    (row) =>
      row.balance?.marker ===
      BalanceMarker.GREEN
  ).length;

  const yellowCount = rows.filter(
    (row) =>
      row.balance?.marker ===
      BalanceMarker.YELLOW
  ).length;

  const redCount = rows.filter(
    (row) =>
      row.balance?.marker ===
      BalanceMarker.RED
  ).length;

  const lateCount = rows.filter(
    (row) =>
      row.balance?.late === true
  ).length;

  const notSubmittedCount =
    rows.filter(
      (row) => !row.balance
    ).length;

  const reportingLabel =
    hasReportingPeriod
      ? new Intl.DateTimeFormat(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        ).format(
          new Date(
            selectedYear,
            selectedMonth - 1,
            1
          )
        )
      : "Monthly Balances";

  const programLabel =
    selectedProgramId === "ALL"
      ? "All Programs"
      : selectedProgram?.name ??
        "Program";

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
            Internal monthly balance
            tracking for {programLabel}.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-5 sm:p-6">
          <form
            action="/hq/monthly-balances"
            method="get"
            className="flex flex-col gap-4 xl:flex-row xl:items-end"
          >
            <div>
              <label
                htmlFor="programId"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Program
              </label>

              <select
                id="programId"
                name="programId"
                defaultValue={
                  selectedProgramId
                }
                className="mt-2 min-w-52 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                <option value="ALL">
                  All Programs
                </option>

                {programs.map(
                  (program) => (
                    <option
                      key={program.id}
                      value={program.id}
                    >
                      {program.name}
                    </option>
                  )
                )}
              </select>
            </div>

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
                defaultValue={
                  selectedMonth
                    ? String(
                        selectedMonth
                      )
                    : ""
                }
                className="mt-2 min-w-40 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                <option value="">
                  — Select Month —
                </option>

                {Array.from({
                  length: 12,
                }).map((_, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {new Intl.DateTimeFormat(
                      "en-US",
                      {
                        month: "long",
                      }
                    ).format(
                      new Date(
                        2026,
                        index,
                        1
                      )
                    )}
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
                defaultValue={
                  selectedYear
                    ? String(selectedYear)
                    : ""
                }
                className="mt-2 min-w-32 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                <option value="">
                  — Select Year —
                </option>

                {[2025, 2026, 2027].map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  )
                )}
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
                defaultValue={
                  selectedStatus
                }
                className="mt-2 min-w-48 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="GREEN">
                  Green
                </option>

                <option value="YELLOW">
                  Yellow
                </option>

                <option value="RED">
                  Red
                </option>

                <option value="LATE">
                  Late
                </option>

                <option value="NOT_SUBMITTED">
                  Not Submitted
                </option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Search
              </button>

              <a
                href="/hq/monthly-balances"
                className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Clear Filters
              </a>
            </div>
          </form>
        </section>

        {!hasReportingPeriod ? (
          <section className="panel mt-6 rounded-3xl p-10 text-center">
            <p className="text-lg font-semibold text-[var(--text)]">
              Select a reporting period
            </p>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
              Choose a month and year above
              to view monthly balance
              submissions, performance
              statuses, late reports, and
              members who have not
              submitted.
            </p>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <SummaryCard
                label="Enrolled"
                value={rows.length}
                detail={
                  selectedProgramId ===
                  "ALL"
                    ? "Active program enrollments"
                    : selectedProgram?.name ??
                      ""
                }
                tone="neutral"
              />

              <SummaryCard
                label="Submitted"
                value={
                  submittedCount
                }
                detail="Reports received"
                tone="neutral"
              />

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
                label="Not Submitted"
                value={
                  notSubmittedCount
                }
                detail="Balance report not received"
                tone="neutral"
              />
            </section>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[var(--text)]">
                Showing{" "}
                {filteredRows.length} of{" "}
                {rows.length}{" "}
                {rows.length === 1
                  ? "enrollment"
                  : "enrollments"}
              </p>

              {selectedStatus !==
                "ALL" && (
                <p className="text-xs text-[var(--text-muted)]">
                  Filter:{" "}
                  {getStatusFilterLabel(
                    selectedStatus
                  )}
                </p>
              )}
            </div>

            <section className="panel mt-4 overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-strong)]">
                      <TableHeader>
                        Member
                      </TableHeader>

                      <TableHeader>
                        Program
                      </TableHeader>

                      <TableHeader>
                        Starting
                      </TableHeader>

                      <TableHeader>
                        Ending
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Submission
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map(
                      (row) => (
                        <tr
                          key={`${row.memberId}-${row.programId}`}
                          className="border-b border-[var(--border)] last:border-b-0"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[var(--text)]">
                              {
                                row.memberName
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-[var(--text-secondary)]">
                              {
                                row.programName
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-[var(--text)]">
                            {row.balance
                              ? `$${Number(
                                  row
                                    .balance
                                    .startingBalance
                                ).toFixed(
                                  2
                                )}`
                              : "—"}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-[var(--text)]">
                            {row.balance
                              ? `$${Number(
                                  row
                                    .balance
                                    .endingBalance
                                ).toFixed(
                                  2
                                )}`
                              : "—"}
                          </td>

                          <td className="px-5 py-4">
                            {row.balance
                              ?.marker ? (
                              <BalanceStatusBadge
                                marker={
                                  row
                                    .balance
                                    .marker
                                }
                              />
                            ) : (
                              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                                Not Submitted
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {row.balance ? (
                              <div>
                                <p
                                  className={
                                    row
                                      .balance
                                      .late
                                      ? "text-xs font-semibold text-amber-700"
                                      : "text-xs font-semibold text-[var(--text)]"
                                  }
                                >
                                  {row
                                    .balance
                                    .late
                                    ? "Late"
                                    : "On Time"}
                                </p>

                                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                  {new Intl.DateTimeFormat(
                                    "en-US",
                                    {
                                      month:
                                        "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  ).format(
                                    row
                                      .balance
                                      .submittedAt
                                  )}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-red-600">
                                Balance report
                                not received
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}

                    {filteredRows.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center"
                        >
                          <p className="text-sm font-medium text-[var(--text)]">
                            No members
                            match these
                            filters.
                          </p>

                          <p className="mt-2 text-xs text-[var(--text-secondary)]">
                            Try another
                            program or
                            status, or clear
                            the filters.
                          </p>

                          <a
                            href="/hq/monthly-balances"
                            className="mt-4 inline-flex text-xs font-semibold text-[var(--accent)]"
                          >
                            Clear Filters
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {lateCount > 0 && (
              <p className="mt-4 text-xs text-[var(--text-muted)]">
                {lateCount}{" "}
                {lateCount === 1
                  ? "submission was"
                  : "submissions were"}{" "}
                received after the 1st
                for this reporting
                period.
              </p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function getStatusFilterLabel(
  status: string
) {
  if (status === "GREEN") {
    return "Green";
  }

  if (status === "YELLOW") {
    return "Yellow";
  }

  if (status === "RED") {
    return "Red";
  }

  if (status === "LATE") {
    return "Late";
  }

  if (
    status === "NOT_SUBMITTED"
  ) {
    return "Not Submitted";
  }

  return "All Statuses";
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
      : marker ===
          BalanceMarker.YELLOW
        ? "Keep Working!"
        : "See Peer Coach";

  const classes =
    marker === BalanceMarker.GREEN
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : marker ===
          BalanceMarker.YELLOW
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
  tone:
    | "green"
    | "yellow"
    | "red"
    | "neutral";
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