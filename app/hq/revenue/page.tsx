
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  DollarSign,
  CalendarDays,
  Receipt,
  Plus,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

const SOURCES = [
  "DRIPPER_PROGRAM",
  "MEMBERSHIP",
  "CLASS",
  "CORPORATE_PARTNERSHIP",
  "OTHER",
] as const;

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; duplicate?: string }>;
}) {
  const { saved, duplicate } = await searchParams;

  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!isStaff) redirect("/");

  const entries = await prisma.revenueEntry.findMany({
    include: {
      recordedBy: true,
    },
    orderBy: [
      { paymentDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const totalRevenue = entries.reduce(
    (sum: number, entry: any) => sum + Number(entry.amount),
    0
  );

  const monthlyEntries = entries.filter((entry: any) => {
    const date = entry.paymentDate;

    return (
      date.getUTCFullYear() === currentYear &&
      date.getUTCMonth() === currentMonth
    );
  });

  const monthlyRevenue = monthlyEntries.reduce(
    (sum: number, entry: any) => sum + Number(entry.amount),
    0
  );

  const sourceTotals = SOURCES.map((source) => ({
    source,
    amount: entries
      .filter((entry: any) => entry.source === source)
      .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0),
  }));

  const monthTotals = Array.from({ length: 6 }, (_, index) => {
    const monthStart = new Date(
      Date.UTC(currentYear, currentMonth - (5 - index), 1)
    );

    const year = monthStart.getUTCFullYear();
    const month = monthStart.getUTCMonth();

    const amount = entries
      .filter(
        (entry: any) =>
          entry.paymentDate.getUTCFullYear() === year &&
          entry.paymentDate.getUTCMonth() === month
      )
      .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

    return {
      label: monthStart.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      amount,
    };
  });

  const maxMonthlyAmount = Math.max(
    1,
    ...monthTotals.map((month) => month.amount)
  );

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ATFT Operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
              Revenue Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#657168]">
              Track payments received, revenue sources, and monthly
              performance.
            </p>
          </div>

          <Link
            href="/hq/revenue/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#253129]"
          >
            <Plus size={16} />
            Add Revenue
          </Link>
        </div>

        {saved === "1" && (
          <div 
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
          >
            Revenue saved successfully!
          </div>
        )}
        {duplicate === "1" && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800"
          >
            A matching payment already exists. No new revenue was recorded. 
            Please check the payment history.
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Recorded Revenue",
              value: formatMoney(totalRevenue),
              icon: DollarSign,
            },
            {
              label: "Revenue This Month",
              value: formatMoney(monthlyRevenue),
              icon: CalendarDays,
            },
            {
              label: "Payments Recorded",
              value: String(entries.length),
              icon: Receipt,
            },
            {
              label: "Payments This Month",
              value: String(monthlyEntries.length),
              icon: ArrowUpRight,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#657168]">
                    {stat.label}
                  </p>

                  <Icon size={17} className="text-[#8a938d]" />
                </div>

                <p className="mt-2 text-3xl font-semibold text-[#162019]">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#162019]">
              Revenue by Source
            </h2>

            <p className="mt-1 text-xs text-[#8a938d]">
              All-time recorded revenue by category.
            </p>

            <div className="mt-6 space-y-5">
              {sourceTotals.map((item) => {
                const percentage =
                  totalRevenue > 0
                    ? (item.amount / totalRevenue) * 100
                    : 0;

                return (
                  <div key={item.source}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="text-[#657168]">
                        {formatLabel(item.source)}
                      </span>

                      <span className="font-semibold text-[#162019]">
                        {formatMoney(item.amount)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#162019]">
              Monthly Revenue
            </h2>

            <p className="mt-1 text-xs text-[#8a938d]">
              Recorded payments over the last six months.
            </p>

            <div className="mt-6 space-y-4">
              {monthTotals.map((month) => (
                <div
                  key={month.label}
                  className="grid grid-cols-[75px_1fr_auto] items-center gap-3"
                >
                  <span className="text-xs text-[#657168]">
                    {month.label}
                  </span>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${
                          (month.amount / maxMonthlyAmount) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-[#162019]">
                    {formatMoney(month.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#162019]">
                Payment History
              </h2>

              <p className="mt-1 text-xs text-[#8a938d]">
                Manually recorded payments received by ATFT.
              </p>
            </div>

            <span className="text-xs text-[#8a938d]">
              {entries.length} records
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Receipt
                size={26}
                className="mx-auto text-[#8a938d]"
              />

              <h3 className="mt-4 font-semibold text-[#162019]">
                No revenue recorded yet
              </h3>

              <p className="mt-2 text-sm text-[#657168]">
                Add your first payment to start tracking revenue.
              </p>

              <Link
                href="/hq/revenue/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add Revenue
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs text-[#657168]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Payment Date
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Source
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Description
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Recorded By
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry: any) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-[#657168]">
                        {formatDate(entry.paymentDate)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {formatLabel(entry.source)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-[#657168]">
                        {entry.description || "—"}
                      </td>

                      <td className="px-4 py-4 text-[#657168]">
                        {entry.recordedBy.name ||
                          entry.recordedBy.email}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-[#162019]">
                        {formatMoney(Number(entry.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
