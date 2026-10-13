import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

const staffRoles = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
];

export default async function TaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
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

const [task, users, projects] = await Promise.all([
  taskClient.findUnique({
    where: {
      id: taskId,
    },
    include: {
      owner: true,
      project: true,
      createdBy: true,
    },
  }),

    prisma.user.findMany({
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
    }),

    prisma.project.findMany({
      where: {
        status: {
          notIn: ["COMPLETE", "CANCELLED"],
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!task) {
    notFound();
  }

  async function updateTask(formData: FormData) {
    "use server";

    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    const editor = await prisma.user.findUnique({
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

    if (!editor) {
      redirect("/");
    }

    const editorIsStaff = editor.roles.some((userRole) =>
      staffRoles.includes(userRole.role.name)
    );

    if (!editorIsStaff) {
      redirect("/");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const ownerId = String(formData.get("ownerId") ?? "").trim();
    const projectId = String(formData.get("projectId") ?? "").trim();

    const priority = String(
      formData.get("priority") ?? "NORMAL"
    ) as "LOW" | "NORMAL" | "HIGH" | "URGENT";

    const status = String(
      formData.get("status") ?? "NOT_STARTED"
    ) as
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "WAITING"
      | "COMPLETE"
      | "CANCELLED";

    const dueDateValue = String(formData.get("dueDate") ?? "").trim();

    if (!title) {
      throw new Error("Task title is required.");
    }

    const dueDate = dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null;

    const updateTaskClient =
  (prisma as any).task ??
  (prisma as any).tasks ??
  (prisma as any).projectTask;

if (!updateTaskClient) {
  throw new Error("Task model is not available on the Prisma client.");
}

const existingTask = await updateTaskClient.findUnique({
  where: {
    id: taskId,
  },
  select: {
    completedAt: true,
  },
});

    if (!existingTask) {
      notFound();
    }

    await updateTaskClient.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description: description || null,
        ownerId: ownerId || null,
        projectId: projectId || null,
        priority,
        status,
        dueDate,
        completedAt:
          status === "COMPLETE"
            ? existingTask.completedAt ?? new Date()
            : null,
      },
    });

    revalidatePath("/hq/tasks");

if (projectId) {
  revalidatePath(`/hq/projects/${projectId}`);
}

redirect("/hq/tasks");
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={
            task.project
              ? `/hq/projects/${task.project.id}`
              : "/hq/tasks"
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          {task.project ? task.project.name : "Projects & Tasks"}
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            ATFT Operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Edit Task
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Update responsibility, deadline, priority, and status.
          </p>
        </div>

        <form
          action={updateTask}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-neutral-900"
            >
              Task *
            </label>

            <input
              id="title"
              name="title"
              required
              defaultValue={task.title}
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-neutral-900"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={task.description ?? ""}
              className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ownerId"
                className="text-sm font-semibold text-neutral-900"
              >
                Owner
              </label>

              <select
                id="ownerId"
                name="ownerId"
                defaultValue={task.ownerId ?? ""}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
              >
                <option value="">Unassigned</option>

                {users.map((user) => {
                  const name =
                    [user.firstName, user.lastName]
                      .filter(Boolean)
                      .join(" ") || user.email;

                  return (
                    <option key={user.id} value={user.id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="projectId"
                className="text-sm font-semibold text-neutral-900"
              >
                Project
              </label>

              <select
                id="projectId"
                name="projectId"
                defaultValue={task.projectId ?? ""}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
              >
                <option value="">No Project</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="priority"
                className="text-sm font-semibold text-neutral-900"
              >
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                defaultValue={task.priority}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="text-sm font-semibold text-neutral-900"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={task.status}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting</option>
                <option value="COMPLETE">Complete</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="text-sm font-semibold text-neutral-900"
              >
                Due Date
              </label>

              <input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  task.dueDate
                    ? task.dueDate.toISOString().slice(0, 10)
                    : ""
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/hq/tasks"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}