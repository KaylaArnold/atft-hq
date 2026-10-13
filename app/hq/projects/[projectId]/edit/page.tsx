import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const staffRoles = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
];

export default async function EditProjectPage({ params }: PageProps) {
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
  });

  if (!project) {
    notFound();
  }

  async function updateProject(formData: FormData) {
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

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    const status = String(
      formData.get("status") ?? "PLANNING"
    ) as "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETE" | "CANCELLED";

    const startDateValue = String(formData.get("startDate") ?? "").trim();
    const dueDateValue = String(formData.get("dueDate") ?? "").trim();

    if (!name) {
      throw new Error("Project name is required.");
    }

    const startDate = startDateValue
      ? new Date(`${startDateValue}T12:00:00`)
      : null;

    const dueDate = dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null;

    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
        description: description || null,
        status,
        startDate,
        dueDate,
      },
    });

    revalidatePath("/hq/tasks");
    revalidatePath(`/hq/projects/${projectId}`);

    redirect(`/hq/projects/${projectId}`);
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={`/hq/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          {project.name}
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            ATFT Operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Edit Project
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Update the project details, dates, and current status.
          </p>
        </div>

        <form
          action={updateProject}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm font-semibold text-neutral-900"
            >
              Project Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={project.name}
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
              defaultValue={project.description ?? ""}
              className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="status"
              className="text-sm font-semibold text-neutral-900"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={project.status}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETE">Complete</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-neutral-900"
              >
                Start Date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  project.startDate
                    ? project.startDate.toISOString().slice(0, 10)
                    : ""
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
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
                  project.dueDate
                    ? project.dueDate.toISOString().slice(0, 10)
                    : ""
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href={`/hq/projects/${project.id}`}
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