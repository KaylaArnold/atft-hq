import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const staffRoles = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
];

type PageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function HQCalendarPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const currentUser = await prisma.user.findUnique({
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

  if (!currentUser) {
    redirect("/");
  }

  const isStaff = currentUser.roles.some((userRole) =>
    staffRoles.includes(userRole.role.name)
  );

  if (!isStaff) {
    redirect("/");
  }

  const params = await searchParams;

  const now = new Date();

  const requestedMonth = Number(params.month);
  const requestedYear = Number(params.year);

  const month =
    requestedMonth >= 1 && requestedMonth <= 12
      ? requestedMonth
      : now.getMonth() + 1;

  const year =
    requestedYear >= 2000 && requestedYear <= 2100
      ? requestedYear
      : now.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const calendarClient =
    (prisma as any).calendarItem ??
    (prisma as any).calendarItems;

  if (!calendarClient) {
    throw new Error(
      "CalendarItem model is not available on the Prisma client."
    );
  }

  const [calendarItems, tasks, projects] = await Promise.all([
    calendarClient.findMany({
      where: {
        startsAt: {
          gte: monthStart,
          lt: monthEnd,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        owner: true,
      },
      orderBy: {
        startsAt: "asc",
      },
    }),

    prisma.task.findMany({
      where: {
        dueDate: {
          gte: monthStart,
          lt: monthEnd,
        },
        status: {
          notIn: ["COMPLETE", "CANCELLED"],
        },
      },
      include: {
        owner: true,
        project: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    }),

    prisma.project.findMany({
      where: {
        dueDate: {
          gte: monthStart,
          lt: monthEnd,
        },
        status: {
          notIn: ["COMPLETE", "CANCELLED"],
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    }),
  ]);

  const previousMonth =
    month === 1
      ? { month: 12, year: year - 1 }
      : { month: month - 1, year };

  const nextMonth =
    month === 12
      ? { month: 1, year: year + 1 }
      : { month: month + 1, year };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = monthStart.getDay();

  const monthLabel = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function itemsForDay(day: number) {
    const matches: {
      id: string;
      title: string;
      kind: "calendar" | "task" | "project";
      href: string;
    }[] = [];

    for (const item of calendarItems) {
      const date = new Date(item.startsAt);

      if (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      ) {
        matches.push({
          id: `calendar-${item.id}`,
          title: item.title,
          kind: "calendar",
          href: `/hq/calendar/${item.id}`,
        });
      }
    }

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const date = new Date(task.dueDate);

      if (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      ) {
        matches.push({
          id: `task-${task.id}`,
          title: task.title,
          kind: "task",
          href: `/hq/tasks/${task.id}`,
        });
      }
    }

    for (const project of projects) {
      if (!project.dueDate) continue;

      const date = new Date(project.dueDate);

      if (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      ) {
        matches.push({
          id: `project-${project.id}`,
          title: project.name,
          kind: "project",
          href: `/hq/projects/${project.id}`,
        });
      }
    }

    return matches;
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              ATFT Operations
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Operating Calendar
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Company events, deadlines, tasks, and project dates in one place.
            </p>
          </div>

          <Link
            href="/hq/calendar/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add Calendar Item
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
            <Link
              href={`/hq/calendar?month=${previousMonth.month}&year=${previousMonth.year}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-neutral-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-950">
                {monthLabel}
              </h2>

              <Link
                href="/hq/calendar"
                className="mt-1 inline-block text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                Today
              </Link>
            </div>

            <Link
              href={`/hq/calendar?month=${nextMonth.month}&year=${nextMonth.year}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-neutral-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {day}
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div
                key={`blank-${index}`}
                className="min-h-32 border-b border-r border-neutral-100 bg-neutral-50/50"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayItems = itemsForDay(day);

              const isToday =
                now.getFullYear() === year &&
                now.getMonth() + 1 === month &&
                now.getDate() === day;

              return (
                <div
                  key={day}
                  className="min-h-32 border-b border-r border-neutral-100 p-2"
                >
                  <div
                    className={
                      isToday
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white"
                        : "flex h-7 w-7 items-center justify-center text-xs font-semibold text-neutral-600"
                    }
                  >
                    {day}
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block truncate rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                        title={item.title}
                      >
                        {item.kind === "task"
                          ? "Task: "
                          : item.kind === "project"
                          ? "Project: "
                          : ""}
                        {item.title}
                      </Link>
                    ))}

                    {dayItems.length > 4 && (
                      <p className="px-1 text-[10px] font-medium text-neutral-400">
                        +{dayItems.length - 4} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar items
          </div>

          <div>Task: task deadlines</div>

          <div>Project: project deadlines</div>
        </div>
      </div>
    </AppShell>
  );
}