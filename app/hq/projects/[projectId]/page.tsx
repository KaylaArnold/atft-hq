import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  Plus,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
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

  const staffRoles = [
    "OWNER",
    "COO",
    "MEMBER_SERVICES",
    "ADMINISTRATIVE_SERVICES",
  ];

  const isStaff = currentUser.roles.some((userRole) =>
    staffRoles.includes(userRole.role.name)
  );

  if (!isStaff) {
    redirect("/");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      tasks: {
        include: {
          owner: true,
          createdBy: true,
        },
        orderBy: [
          {
            dueDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const completedTasks = project.tasks.filter(
    (task) => task.status === "COMPLETE"
  );

  const openTasks = project.tasks.filter(
    (task) =>
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  );

  const waitingTasks = project.tasks.filter(
    (task) => task.status === "WAITING"
  );

  const completionPercentage =
    project.tasks.length > 0
      ? Math.round(
          (completedTasks.length / project.tasks.length) * 100
        )
      : 0;

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/hq/tasks"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects & Tasks
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
                <FolderKanban className="h-5 w-5 text-neutral-700" />
              </div>

              <ProjectStatusBadge status={project.status} />
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-950">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
  <Link
    href={`/hq/projects/${project.id}/edit`}
    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
  >
    Edit Project
  </Link>

  <Link
    href={`/hq/tasks/new?projectId=${project.id}`}
    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
  >
    <Plus className="h-4 w-4" />
    Add Task
  </Link>
</div>

  </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Tasks"
            value={project.tasks.length}
            icon={<CircleDashed className="h-5 w-5" />}
          />

          <SummaryCard
            label="Open Tasks"
            value={openTasks.length}
            icon={<Clock3 className="h-5 w-5" />}
          />

          <SummaryCard
            label="Waiting"
            value={waitingTasks.length}
            icon={<Clock3 className="h-5 w-5" />}
          />

          <SummaryCard
            label="Complete"
            value={completedTasks.length}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Project Progress
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                {completedTasks.length} of {project.tasks.length} tasks complete
              </p>
            </div>

            <p className="text-2xl font-semibold text-neutral-950">
              {completionPercentage}%
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Start: {formatDate(project.startDate)}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Due: {formatDate(project.dueDate)}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Project Tasks
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Everyone can see who is responsible, what is due, and where the
              work stands.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {project.tasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CircleDashed className="mx-auto h-8 w-8 text-neutral-300" />

                <h3 className="mt-4 font-semibold text-neutral-900">
                  No tasks yet
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Add the first task for this project.
                </p>

                <Link
                  href={`/hq/tasks/new?projectId=${project.id}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-neutral-600">
                        Task
                      </th>

                      <th className="px-5 py-3 font-semibold text-neutral-600">
                        Owner
                      </th>

                      <th className="px-5 py-3 font-semibold text-neutral-600">
                        Priority
                      </th>

                      <th className="px-5 py-3 font-semibold text-neutral-600">
                        Status
                      </th>

                      <th className="px-5 py-3 font-semibold text-neutral-600">
                        Due
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {project.tasks.map((task) => (
                      <tr key={task.id} className="transition hover:bg-neutral-50">
  <td className="px-5 py-4">
    <Link
      href={`/hq/tasks/${task.id}`}
      className="block"
    >
      <p className="font-semibold text-neutral-900 hover:underline">
        {task.title}
      </p>

      {task.description && (
        <p className="mt-1 max-w-md truncate text-xs text-neutral-500">
          {task.description}
        </p>
      )}
    </Link>
  </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {task.owner
                            ? [
                                task.owner.firstName,
                                task.owner.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") || task.owner.email
                            : "Unassigned"}
                        </td>

                        <td className="px-5 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td className="px-5 py-4">
                          <TaskStatusBadge status={task.status} />
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {formatDate(task.dueDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
      {statusLabel(status)}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
      {statusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className="inline-flex rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}