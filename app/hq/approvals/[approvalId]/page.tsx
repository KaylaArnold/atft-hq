
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
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

function isStaffUser(user: {
  roles: { role: { name: string } }[];
} | null) {
  return !!user?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );
}

function displayName(
  user:
    | {
        name?: string | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      }
    | null
) {
  if (!user) return "Unassigned";

  if (user.name) return user.name;

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || "Unassigned";
}

function formatDate(date: Date | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  if (!isStaffUser(currentUser)) redirect("/hq");

  const { approvalId } = await params;

  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      requester: true,
      approver: true,
    },
  });

  if (!approval) notFound();

  const canDecide =
    approval.status === "PENDING" &&
    (approval.approverId === currentUser!.id ||
      currentUser!.roles.some((entry) =>
        ["OWNER", "COO"].includes(entry.role.name)
      ));

  async function recordDecision(formData: FormData) {
    "use server";

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) redirect("/sign-in");

    const decisionMaker = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { roles: { include: { role: true } } },
    });

    if (!isStaffUser(decisionMaker)) {
      throw new Error("You are not authorized to review approvals.");
    }

    const request = await prisma.approval.findUnique({
      where: { id: approvalId },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("This request is no longer pending.");
    }

    const isLeadership = decisionMaker!.roles.some((entry) =>
      ["OWNER", "COO"].includes(entry.role.name)
    );

    if (
      request.approverId !== decisionMaker!.id &&
      !isLeadership
    ) {
      throw new Error("You are not assigned to approve this request.");
    }

    const status = String(formData.get("status") ?? "");
    const notes = String(formData.get("decisionNotes") ?? "").trim();

    if (
      !["APPROVED", "CHANGES_REQUESTED", "REJECTED"].includes(status)
    ) {
      throw new Error("Invalid approval decision.");
    }

    if (status !== "APPROVED" && !notes) {
      throw new Error("Please explain the decision in the notes.");
    }

    
    const decisionStatus = status as
      | "APPROVED"
      | "CHANGES_REQUESTED"
      | "REJECTED";

    const linkedContentId = await prisma.$transaction(async (tx) => {
      const result = await tx.approval.updateMany({
        where: {
          id: approvalId,
          status: "PENDING",
        },
        data: {
          status: decisionStatus,
          decisionNotes: notes || null,
          decidedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        throw new Error("This request has already been reviewed.");
      }

      const linkedContent = await tx.contentItem.findUnique({
        where: { approvalId },
      });

      if (!linkedContent) {
        return null;
      }

      await tx.contentItem.update({
        where: { id: linkedContent.id },
        data: {
          status:
            decisionStatus === "APPROVED"
              ? "APPROVED"
              : "DRAFT",
          ...(decisionStatus !== "APPROVED"
            ? { approvalId: null }
            : {}),
        },
      });

      return linkedContent.id;
    });

    if (linkedContentId) {
      revalidatePath("/hq/content");
      revalidatePath(`/hq/content/${linkedContentId}`);
    }


    revalidatePath("/hq/approvals");
    revalidatePath(`/hq/approvals/${approvalId}`);
    redirect(`/hq/approvals/${approvalId}`);
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/approvals"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to Approvals
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Approval Request
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#162019]">
              {approval.title}
            </h1>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
            {formatLabel(approval.status)}
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Request Details</h2>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Type</dt>
              <dd className="mt-1 font-medium">
                {formatLabel(approval.type)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Due Date</dt>
              <dd className="mt-1 font-medium">
                {formatDate(approval.dueDate)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Requested By</dt>
              <dd className="mt-1 font-medium">
                {displayName(approval.requester)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Assigned Approver</dt>
              <dd className="mt-1 font-medium">
                {displayName(approval.approver)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Submitted</dt>
              <dd className="mt-1 font-medium">
                {formatDate(approval.createdAt)}
              </dd>
            </div>

            {approval.decidedAt && (
              <div>
                <dt className="text-xs text-gray-500">Decision Date</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(approval.decidedAt)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {approval.description || "No description provided."}
            </p>
          </div>

          {approval.decisionNotes && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold">Decision Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {approval.decisionNotes}
              </p>
            </div>
          )}
        </div>

        {canDecide && (
          <form
            action={recordDecision}
            className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Record Decision</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review the request and choose the appropriate decision.
              Notes are required when requesting changes or rejecting.
            </p>

            <label
              htmlFor="decisionNotes"
              className="mt-5 block text-sm font-medium"
            >
              Decision Notes
            </label>
            <textarea
              id="decisionNotes"
              name="decisionNotes"
              rows={4}
              placeholder="Add feedback or explain your decision..."
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                name="status"
                value="APPROVED"
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Approve
              </button>

              <button
                type="submit"
                name="status"
                value="CHANGES_REQUESTED"
                className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900"
              >
                Request Changes
              </button>

              <button
                type="submit"
                name="status"
                value="REJECTED"
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
              >
                Reject
              </button>
            </div>
          </form>
        )}

        {approval.status === "PENDING" && !canDecide && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            This request is waiting for its assigned approver.
          </div>
        )}
      </div>
    </AppShell>
  );
}
