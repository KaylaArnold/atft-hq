import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  ListTodo,
  Plus,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null) {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDueState(dueDate: Date | null, status: string) {
  if (!dueDate || status === "COMPLETE" || status === "CANCELLED") {
    return null;
  }

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const due = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";

  return null;
}

function statusLabel(status: string) {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "WAITING":
      return "Waiting";
    case "COMPLETE":
      return "Complete";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function priorityLabel(priority: string) {
  switch (priority) {
    case "LOW":
      return "Low";
    case "NORMAL":
      return "Normal";
    case "HIGH":
      return "High";
    case "URGENT":
      return "Urgent";
    default:
      return priority;
  }
}

export default async function TasksPage() {
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

  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        include: {
          owner: true,
          createdBy: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const tasks = await prisma.task.findMany({
    include: {
      owner: true,
      project: true,
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
});

type TaskRow = (typeof tasks)[number];

  const myTasks = tasks.filter(
    (task: (typeof tasks)[number]) =>
      task.ownerId === currentUser.id &&
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  );

  const overdueTasks = tasks.filter(
    (task: (typeof tasks)[number]) =>
      getDueState(task.dueDate, task.status) === "overdue"
  );

  const dueSoonTasks = tasks.filter(
    (task: (typeof tasks)[number]) =>
      getDueState(task.dueDate, task.status) === "due-soon"
  );

  const waitingTasks = tasks.filter(
    (task: (typeof tasks)[number]) => task.status === "WAITING"
  );

  const activeProjects = projects.filter(
    (project: (typeof projects)[number]) =>
      project.status !== "COMPLETE" &&
      project.status !== "CANCELLED"
  );

  return (
    <AppShell variant="staff">
      <div className="space-y-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              ATFT Operations
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Projects & Tasks
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              Track what is happening, who owns it, when it is due, and where it
              stands.
            </p>
          </div>

        <div className="flex flex-col gap-3 sm:flex-row">
  <Link
    href="/hq/projects/new"
    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
  >
    <FolderKanban className="h-4 w-4" />
    New Project
  </Link>

  <Link
    href="/hq/tasks/new"
    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
  >
    <Plus className="h-4 w-4" />
    New Task
  </Link>
</div>

  </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="My Open Tasks"
            value={myTasks.length}
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
            icon={<Clock3 className="h-5 w-5" />}
          />

          <SummaryCard
            label="Active Projects"
            value={activeProjects.length}
            icon={<FolderKanban className="h-5 w-5" />}
          />
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">
                  My Tasks
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Open tasks currently assigned to you.
                </p>
              </div>
            </div>

            {myTasks.length === 0 ? (
              <EmptyState
                title="No open tasks assigned"
                description="When a task is assigned to you, it will appear here."
              />
            ) : (
              <div className="space-y-3">
                {myTasks.map((task: Parameters<typeof TaskCard>[0]["task"]) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-950">
                Attention Needed
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Work that may need follow-up.
              </p>
            </div>

            <div className="space-y-4">
              <AttentionCard
                label="Overdue"
                count={overdueTasks.length}
                icon={<AlertTriangle className="h-5 w-5" />}
              />

              <AttentionCard
                label="Due Within 3 Days"
                count={dueSoonTasks.length}
                icon={<Clock3 className="h-5 w-5" />}
              />

              <AttentionCard
                label="Waiting"
                count={waitingTasks.length}
                icon={<CircleDashed className="h-5 w-5" />}
              />
            </div>
          </section>
        </div>

        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-950">
              All Tasks
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Current work across ATFT.
            </p>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create a task to start tracking work across ATFT."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <TableHeader>Task</TableHeader>
                      <TableHeader>Owner</TableHeader>
                      <TableHeader>Project</TableHeader>
                      <TableHeader>Priority</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Due</TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {tasks.map((task) => {
                      const dueState = getDueState(task.dueDate, task.status);

                      return (
                        <tr key={task.id} className="hover:bg-neutral-50/70">
                          <TableCell>
                            <div>
                              <p className="font-medium text-neutral-950">
                                {task.title}
                              </p>

                              {task.description && (
                                <p className="mt-1 max-w-md truncate text-sm text-neutral-500">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {task.owner ? (
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-neutral-400" />
                                <span>
                                  {[
                                    task.owner.firstName,
                                    task.owner.lastName,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || task.owner.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-400">
                                Unassigned
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            {task.project?.name ?? (
                              <span className="text-neutral-400">
                                No project
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <PriorityBadge priority={task.priority} />
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={task.status} />
                          </TableCell>

                          <TableCell>
                            <div>
                              <p
                                className={
                                  dueState === "overdue"
                                    ? "font-medium text-red-600"
                                    : dueState === "due-soon"
                                      ? "font-medium text-amber-600"
                                      : "text-neutral-700"
                                }
                              >
                                {formatDate(task.dueDate)}
                              </p>

                              {dueState === "overdue" && (
                                <p className="mt-1 text-xs font-medium text-red-600">
                                  Overdue
                                </p>
                              )}

                              {dueState === "due-soon" && (
                                <p className="mt-1 text-xs font-medium text-amber-600">
                                  Due soon
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-950">
              Projects
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Active and planned company initiatives.
            </p>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Projects will group related tasks and make ownership easier to follow."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project: (typeof projects)[number]) => {
  const openTaskCount = project.tasks.filter(
    (task: { status: string }) =>
      task.status !== "COMPLETE" &&
      task.status !== "CANCELLED"
  ).length;

  return (
    <Link
      key={project.id}
      href={`/hq/projects/${project.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Project
          </p>

          <h3 className="mt-2 text-lg font-semibold text-neutral-950">
            {project.name}
          </h3>
        </div>

        <StatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          {project.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm">
        <span className="text-neutral-500">
          {openTaskCount} open task
          {openTaskCount === 1 ? "" : "s"}
        </span>

        <span className="font-medium text-neutral-700">
          {formatDate(project.dueDate)}
        </span>
      </div>
    </Link>
  );
})}
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          {icon}
        </div>

        <p className="text-3xl font-semibold tracking-tight text-neutral-950">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-neutral-600">{label}</p>
    </div>
  );
}

function AttentionCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          {icon}
        </div>

        <div>
          <p className="font-medium text-neutral-950">{label}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {count === 0 ? "Nothing right now" : "Needs review"}
          </p>
        </div>
      </div>

      <p className="text-2xl font-semibold text-neutral-950">{count}</p>
    </div>
  );
}

function TaskCard({
  task,
}: {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    ownerId: string | null;
    project: {
      name: string;
    } | null;
  };
}) {
  const dueState = getDueState(task.dueDate, task.status);

  return (
    <Link
      href={`/hq/tasks/${task.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          <h3 className="mt-3 text-lg font-semibold text-neutral-950">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {task.description}
            </p>
          )}

          {task.project && (
            <p className="mt-3 text-sm font-medium text-neutral-500">
              {task.project.name}
            </p>
          )}
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p
            className={
              dueState === "overdue"
                ? "font-medium text-red-600"
                : dueState === "due-soon"
                ? "font-medium text-amber-600"
                : "font-medium text-neutral-700"
            }
          >
            {formatDate(task.dueDate)}
          </p>

          {dueState === "overdue" && (
            <p className="mt-1 text-xs font-medium text-red-600">
              Overdue
            </p>
          )}

          {dueState === "due-soon" && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              Due soon
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";

  if (status === "COMPLETE") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700`}>
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
        {statusLabel(status)}
      </span>
    );
  }

  if (status === "IN_PROGRESS" || status === "ACTIVE") {
    return (
      <span className={`${base} bg-blue-50 text-blue-700`}>
        {statusLabel(status)}
      </span>
    );
  }

  if (status === "WAITING" || status === "ON_HOLD") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700`}>
        {statusLabel(status)}
      </span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className={`${base} bg-red-50 text-red-700`}>
        {statusLabel(status)}
      </span>
    );
  }

  return (
    <span className={`${base} bg-neutral-100 text-neutral-700`}>
      {statusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium";

  if (priority === "URGENT") {
    return (
      <span className={`${base} bg-red-50 text-red-700`}>
        {priorityLabel(priority)}
      </span>
    );
  }

  if (priority === "HIGH") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700`}>
        {priorityLabel(priority)}
      </span>
    );
  }

  if (priority === "LOW") {
    return (
      <span className={`${base} bg-neutral-100 text-neutral-500`}>
        {priorityLabel(priority)}
      </span>
    );
  }

  return (
    <span className={`${base} bg-blue-50 text-blue-700`}>
      {priorityLabel(priority)}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      <CircleDashed className="mx-auto h-8 w-8 text-neutral-300" />

      <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-5 py-4 text-sm text-neutral-700">{children}</td>
  );
}
