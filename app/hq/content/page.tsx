
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  ClipboardCheck,
  FilePenLine,
  Plus,
  Send,
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

const STATUSES = [
  "IDEA",
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
] as const;

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: Date | null) {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function formatTime(value: string | null) {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  const period = hours >= 12 ? "PM" : "AM";

  return `${hour}:${String(minutes).padStart(2, "0")} ${period} ET`;
}

export default async function ContentCalendarPage() {
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

  const items = await prisma.contentItem.findMany({
    include: { owner: true },
    orderBy: [
      { publishDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  const upcoming = items.filter(
    (item) =>
      item.publishDate &&
      item.publishDate >= today &&
      item.status !== "PUBLISHED"
  );

  const inReview = items.filter(
    (item) => item.status === "IN_REVIEW"
  );

  const published = items.filter(
    (item) => item.status === "PUBLISHED"
  );

  const drafts = items.filter(
    (item) =>
      item.status === "IDEA" || item.status === "DRAFT"
  );

  const statusColors: Record<string, string> = {
    IDEA: "bg-gray-100 text-gray-700",
    DRAFT: "bg-blue-50 text-blue-700",
    IN_REVIEW: "bg-amber-50 text-amber-800",
    APPROVED: "bg-emerald-50 text-emerald-800",
    SCHEDULED: "bg-purple-50 text-purple-700",
    PUBLISHED: "bg-green-50 text-green-800",
  };

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ATFT Operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
              Content Calendar
            </h1>

            <p className="mt-2 text-sm text-[#657168]">
              Plan, assign, review, and track ATFT marketing content.
            </p>
          </div>

          <Link
            href="/hq/content/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#253129]"
          >
            <Plus size={16} />
            New Content
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Upcoming Content",
              value: upcoming.length,
              icon: CalendarDays,
            },
            {
              label: "In Review",
              value: inReview.length,
              icon: ClipboardCheck,
            },
            {
              label: "Ideas & Drafts",
              value: drafts.length,
              icon: FilePenLine,
            },
            {
              label: "Published",
              value: published.length,
              icon: Send,
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

        <div className="mb-8 rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#162019]">
            Content Pipeline
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STATUSES.map((status) => {
              const count = items.filter(
                (item) => item.status === status
              ).length;

              return (
                <div
                  key={status}
                  className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4"
                >
                  <p className="text-xs font-semibold text-[#657168]">
                    {formatLabel(status)}
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#162019]">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#162019]">
                Content Schedule
              </h2>

              <p className="mt-1 text-xs text-[#8a938d]">
                Planned publishing dates, platforms, and assignments.
              </p>
            </div>

            <span className="text-xs text-[#8a938d]">
              {items.length} content items
            </span>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Clock3
                size={26}
                className="mx-auto text-[#8a938d]"
              />

              <h3 className="mt-4 font-semibold text-[#162019]">
                No content scheduled yet
              </h3>

              <p className="mt-2 text-sm text-[#657168]">
                Add your first content item to start planning
                ATFT marketing.
              </p>

              <Link
                href="/hq/content/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                New Content
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs text-[#657168]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Content
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Platform
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Publish Date
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Owner
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/hq/content/${item.id}`}
                          className="font-semibold text-[#162019] hover:text-emerald-700"
                        >
                          {item.title}
                        </Link>

                        {item.description && (
                          <p className="mt-1 max-w-sm truncate text-xs text-[#8a938d]">
                            {item.description}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-[#657168]">
                        {formatLabel(item.platform)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusColors[item.status]
                          }`}
                        >
                          {formatLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-[#657168]">
                        <div className="font-medium">
                            {formatDate(item.publishDate)}
                        </div>

                        {item.publishTime && (
                          <div className="mt-1 text-xs text-emerald-700">
                            {formatTime(item.publishTime)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[#657168]">
                        {[item.owner?.firstName, item.owner?.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                          item.owner?.email ||
                          "Unassigned"}
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
