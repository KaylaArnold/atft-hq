import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ListTodo } from "lucide-react";
import { revalidatePath } from "next/cache";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type StaffRoleName =
  | "OWNER"
  | "COO"
  | "MEMBER_SERVICES"
  | "ADMINISTRATIVE_SERVICES";

type PageProps = {
  searchParams: Promise<{
    projectId?: string;
  }>;
};

export default async function NewTaskPage({ searchParams }: PageProps) {
  const { projectId: selectedProjectId } = await searchParams;  const { userId } = await auth();

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

  const staffRoles: StaffRoleName[] = [
    "OWNER",
    "COO",
    "MEMBER_SERVICES",
    "ADMINISTRATIVE_SERVICES",
  ];

  const isStaff = currentUser.roles.some((userRole) =>
    staffRoles.some((staffRole) => staffRole === userRole.role.name)
  );

  if (!isStaff) {
    redirect("/");
  }

  const [employees, projects] = await Promise.all([
    prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: {
                in: staffRoles,
              },
            },
          },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
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

  async function createTask(formData: FormData) {
    "use server";

    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    const creator = await prisma.user.findUnique({
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

    if (!creator) {
      redirect("/");
    }

    const creatorIsStaff = creator.roles.some((userRole) =>
      staffRoles.some((staffRole) => staffRole === userRole.role.name)
    );

    if (!creatorIsStaff) {
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

    const taskClient =
      (prisma as any).task ??
      (prisma as any).tasks ??
      (prisma as any).projectTask;

    if (!taskClient) {
      throw new Error("Task model is not available on the Prisma client.");
    }

    await taskClient.create({
      data: {
        title,
        description: description || null,
        priority,
        status,
        dueDate,
        ownerId: ownerId || null,
        projectId: projectId || null,
        createdById: creator.id,
        completedAt: status === "COMPLETE" ? new Date() : null,
      },
    });

    revalidatePath("/hq/tasks");
    redirect("/hq/tasks");
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/hq/tasks"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects & Tasks
        </Link>

        <div className="mt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
            <ListTodo className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            ATFT Operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            New Task
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Assign responsibility, establish a deadline, and make the status
            of the work visible.
          </p>
        </div>

        <form
          action={createTask}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-neutral-900"
            >
              Task Title *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Example: Review October enrollment applications"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
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
              placeholder="Add instructions, context, or the expected outcome..."
              className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ownerId"
                className="text-sm font-semibold text-neutral-900"
              >
                Responsible Person
              </label>

              <select
                id="ownerId"
                name="ownerId"
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="">Unassigned</option>

                {employees.map((employee) => {
                  const name = [
                    employee.firstName,
                    employee.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <option key={employee.id} value={employee.id}>
                      {name || employee.email}
                    </option>
                  );
                })}
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
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="projectId"
              className="text-sm font-semibold text-neutral-900"
            >
              Project
            </label>

            <select
              id="projectId"
              name="projectId"
              defaultValue={selectedProjectId ?? ""}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
            >
              <option value="">No project</option>

              {projects.map((project: { id: string; name: string }) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {projects.length === 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                No projects have been created yet. Tasks can still be created
                without a project.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
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
                defaultValue="NORMAL"
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
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
                defaultValue="NOT_STARTED"
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting</option>
                <option value="COMPLETE">Complete</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/hq/tasks"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
