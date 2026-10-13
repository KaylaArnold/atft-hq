import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const staffRoles = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
];

export default async function HQHomePage() {
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

  const taskClient =
    (prisma as any).task ??
    (prisma as any).tasks ??
    (prisma as any).projectTask;

  if (!taskClient) {
    throw new Error("Task model is not available on the Prisma client.");
  }

  const [tasks, projects] = await Promise.all([
    taskClient.findMany({
      include: {
        owner: true,
        project: true,
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),

    prisma.project.findMany({
      orderBy: {
        dueDate: "asc",
      },
    }),
  ]);

  const now = new Date();

  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const myOpenTasks = tasks.filter(
    (task: any) =>
      task.ownerId === currentUser.id &&
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  );

  const overdueTasks = tasks.filter(
    (task: any) =>
      task.dueDate &&
      task.dueDate < now &&
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  );

  const dueSoonTasks = tasks.filter(
    (task: any) =>
      task.dueDate &&
      task.dueDate >= now &&
      task.dueDate <= threeDaysFromNow &&
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  );

  const waitingTasks = tasks.filter(
    (task: any) => task.status === "WAITING"
  );

  const activeProjects = projects.filter(
    (project) =>
      project.status === "ACTIVE" ||
      project.status === "PLANNING"
  );

  const firstName = currentUser.firstName || "Team";

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            ATFT Operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Welcome, {firstName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Here&apos;s what needs attention across ATFT right now.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="My Open Tasks"
            value={myOpenTasks.length}
            icon={<ListTodo className="h-5 w-5" />}
          />

          <SummaryCard
            label="Overdue"
            value={overdueTasks.length}
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          <SummaryCard
            label="Due Soon"
            value={dueSoonTasks.length}
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <SummaryCard
            label="Active Projects"
            value={activeProjects.length}
            icon={<FolderKanban className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  My Tasks
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Your current assigned work.
                </p>
              </div>

              <Link
                href="/hq/tasks"
                className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-neutral-950"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {myOpenTasks.length === 0 ? (
              <div className="px-6 py-10">
                <CheckCircle2 className="h-7 w-7 text-neutral-300" />

                <p className="mt-3 font-semibold text-neutral-900">
                  No open tasks assigned to you
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Assigned work will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {myOpenTasks.slice(0, 5).map((task: any) => (
                  <Link
                    key={task.id}
                    href={`/hq/tasks/${task.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-900">
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {task.project?.name || "No project"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-neutral-700">
                        {formatDate(task.dueDate)}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {statusLabel(task.status)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                Attention Needed
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Work that may need follow-up.
              </p>
            </div>

            <div className="divide-y divide-neutral-100">
              <AttentionRow
                label="Overdue Tasks"
                value={overdueTasks.length}
                icon={<AlertTriangle className="h-5 w-5" />}
              />

              <AttentionRow
                label="Due Within 3 Days"
                value={dueSoonTasks.length}
                icon={<CalendarDays className="h-5 w-5" />}
              />

              <AttentionRow
                label="Waiting"
                value={waitingTasks.length}
                icon={<Clock3 className="h-5 w-5" />}
              />
            </div>

            <div className="border-t border-neutral-100 p-5">
              <Link
                href="/hq/tasks"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Open Projects & Tasks
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-950">
                Active Projects
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Current initiatives across ATFT.
              </p>
            </div>

            <Link
              href="/hq/tasks"
              className="text-sm font-semibold text-neutral-700 hover:text-neutral-950"
            >
              View Projects & Tasks
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
              <FolderKanban className="mx-auto h-7 w-7 text-neutral-300" />

              <p className="mt-3 font-semibold text-neutral-900">
                No active projects
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Active company initiatives will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeProjects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/hq/projects/${project.id}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <FolderKanban className="h-5 w-5 text-neutral-400" />

                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                      {statusLabel(project.status)}
                    </span>
                  </div>

                  <h3 className="mt-4 font-semibold text-neutral-950">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                      {project.description}
                    </p>
                  )}

                  <p className="mt-4 text-xs font-medium text-neutral-500">
                    Due {formatDate(project.dueDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <div className="text-neutral-400">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-semibold text-neutral-950">
        {value}
      </p>
    </div>
  );
}

function AttentionRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="text-neutral-400">{icon}</div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
      </div>

      <span className="text-lg font-semibold text-neutral-950">
        {value}
      </span>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}