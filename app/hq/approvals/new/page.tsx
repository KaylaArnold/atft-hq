
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

export default async function NewApprovalPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.includes(entry.role.name as (typeof STAFF_ROLES)[number])
  );

  if (!currentUser || !isStaff) {
    redirect("/hq");
  }

  const staff = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: { in: [...STAFF_ROLES] },
          },
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  async function createApproval(formData: FormData) {
    "use server";

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) redirect("/sign-in");

    const requester = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (
      !requester ||
      !requester.roles.some((entry) =>
        STAFF_ROLES.includes(entry.role.name as (typeof STAFF_ROLES)[number])
      )
    ) {
      throw new Error("You are not authorized to create approvals.");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const type = String(formData.get("type") ?? "OPERATIONS");
    const approverId = String(formData.get("approverId") ?? "");
    const dueDateValue = String(formData.get("dueDate") ?? "");

    const allowedTypes = [
      "CONTENT",
      "MARKETING",
      "PROGRAM",
      "FINANCIAL",
      "OPERATIONS",
      "DOCUMENT",
      "OTHER",
    ];

    if (!title) throw new Error("A title is required.");
    if (!allowedTypes.includes(type)) {
      throw new Error("Invalid approval type.");
    }

    if (approverId) {
      const validApprover = await prisma.user.findFirst({
        where: {
          id: approverId,
          roles: {
            some: {
              role: {
                name: { in: [...STAFF_ROLES] },
              },
            },
          },
        },
      });

      if (!validApprover) {
        throw new Error("Please select a valid staff approver.");
      }
    }

    const dueDate = dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null;

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      throw new Error("Invalid due date.");
    }

    const approval = await prisma.approval.create({
      data: {
        title,
        description: description || null,
        type: type as
          | "CONTENT"
          | "MARKETING"
          | "PROGRAM"
          | "FINANCIAL"
          | "OPERATIONS"
          | "DOCUMENT"
          | "OTHER",
        requesterId: requester.id,
        approverId: approverId || null,
        dueDate,
        status: "PENDING",
      },
    });

    revalidatePath("/hq/approvals");
    redirect(`/hq/approvals/${approval.id}`);
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/approvals"
          className="text-sm text-emerald-700 hover:underline"
        >
          ← Back to Approvals
        </Link>

        <h1 className="mt-5 text-3xl font-semibold text-[#162019]">
          New Approval Request
        </h1>

        <p className="mt-2 text-sm text-[#657168]">
          Submit a request for review and assign the person responsible
          for making the decision.
        </p>

        <form
          action={createApproval}
          className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Request Title *
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              placeholder="Example: Approve November enrollment email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium"
            >
              Approval Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue="OPERATIONS"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            >
              <option value="CONTENT">Content</option>
              <option value="MARKETING">Marketing</option>
              <option value="PROGRAM">Program</option>
              <option value="FINANCIAL">Financial</option>
              <option value="OPERATIONS">Operations</option>
              <option value="DOCUMENT">Document</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="What needs approval? Include relevant details."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="approverId"
              className="mb-2 block text-sm font-medium"
            >
              Assign Approver
            </label>
            <select
              id="approverId"
              name="approverId"
              defaultValue=""
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            >
              <option value="">Unassigned</option>
              {staff.map((person) => {
                const displayName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();

                return (
                  <option key={person.id} value={person.id}>
                    {displayName || person.email}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block text-sm font-medium"
            >
              Decision Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-5 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Submit Approval Request
            </button>

            <Link
              href="/hq/approvals"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
