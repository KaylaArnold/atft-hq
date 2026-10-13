
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

const PLATFORMS = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "TWITCH",
  "ZOOM",
  "EMAIL",
  "WEBSITE",
  "OTHER",
] as const;

const STATUSES = [
  "IDEA",
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
] as const;

type ContentPlatform = (typeof PLATFORMS)[number];
type ContentStatus = (typeof STATUSES)[number];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error("Invalid publishing date.");
  }

  const date = new Date(`${text}T12:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  ) {
    throw new Error("Invalid publishing date.");
  }

  return date;
}

function optionalTime(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) return null;

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
    throw new Error("Invalid publishing time.");
  }

  return text;
}

function formatTime(value: string | null) {
  if (!value) return "Not scheduled";

  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  const period = hours >= 12 ? "PM" : "AM";

  return `${hour}:${String(minutes).padStart(2, "0")} ${period} ET`;
}

async function requireStaff() {
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
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!currentUser || !isStaff) {
    throw new Error("You do not have permission to edit content.");
  }
}

async function updateContent(
  contentId: string,
  formData: FormData
) {
  "use server";

  await requireStaff();

  const existing = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!existing) notFound();

  if (existing.approvalId) {
  const approval = await prisma.approval.findUnique({
    where: { id: existing.approvalId },
  });

  if (approval?.status === "PENDING") {
    throw new Error(
      "This content is currently awaiting approval. It cannot be edited until the reviewer makes a decision."
    );
  }
}

  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const platformInput = String(
    formData.get("platform") ?? ""
  ).trim();

  const statusInput = String(
    formData.get("status") ?? ""
  ).trim();

  if (!title) {
    throw new Error("Content title is required.");
  }

  if (!PLATFORMS.some((value) => value === platformInput)) {
    throw new Error("Invalid content platform.");
  }

  if (!STATUSES.some((value) => value === statusInput)) {
    throw new Error("Invalid content status.");
  }

  const requiresApproval = [
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
].includes(statusInput);

const isLegacyScheduledEdit =
  existing.status === "SCHEDULED" &&
  statusInput === "SCHEDULED" &&
  !existing.approvalId;

if (requiresApproval && !isLegacyScheduledEdit) {
  const approval = existing.approvalId
    ? await prisma.approval.findUnique({
        where: { id: existing.approvalId },
      })
    : null;

  if (!approval || approval.status !== "APPROVED") {
    throw new Error(
      "Content must receive approval before it can be approved, scheduled, or published."
    );
  }
}

if (
  statusInput === "IN_REVIEW" &&
  existing.status !== "IN_REVIEW"
) {
  throw new Error(
    "Use Submit for Approval to move content into review."
  );
}

  const ownerInput = String(formData.get("ownerId") ?? "").trim();

  let ownerId: string | null = null;

  if (ownerInput) {
    const owner = await prisma.user.findFirst({
      where: {
        id: ownerInput,
        roles: {
          some: {
            role: {
              name: { in: [...STAFF_ROLES] },
            },
          },
        },
      },
    });

    if (!owner) {
      throw new Error("Please select a valid staff owner.");
    }

    ownerId = owner.id;
  }

  await prisma.contentItem.update({
    where: { id: contentId },
    data: {
      title,
      description: description || null,
      platform: platformInput as ContentPlatform,
      status: statusInput as ContentStatus,
      publishDate: optionalDate(formData.get("publishDate")),
      publishTime: optionalTime(formData.get("publishTime")),
      ownerId,
    },
  });

  revalidatePath("/hq/content");
  revalidatePath(`/hq/content/${contentId}`);

  redirect(`/hq/content/${contentId}?saved=1`);
}

async function submitContentForApproval(
  contentId: string,
  formData: FormData
) {
  "use server";

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
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!currentUser || !isStaff) {
    throw new Error("You do not have permission to submit content.");
  }

  const approverId = String(formData.get("approverId") ?? "").trim();

const approver = await prisma.user.findFirst({
  where: {
    id: approverId,
    roles: {
      some: {
        role: {
          name: { in: ["OWNER", "COO"] },
        },
      },
    },
  },
});

if (!approver) {
  throw new Error("Please select an authorized reviewer.");
}

  await prisma.$transaction(async (tx) => {
    const content = await tx.contentItem.findUnique({
      where: { id: contentId },
      include: { approval: true },
    });

    if (!content) {
      throw new Error("Content not found.");
    }

    if (content.approvalId) {
      throw new Error(
        "This content already has an approval request. Review it in Approvals."
      );
    }

    if (
      content.status === "APPROVED" ||
      content.status === "PUBLISHED"
    ) {
      throw new Error(
        "Approved or published content cannot be submitted again."
      );
    }

    const approval = await tx.approval.create({
      data: {
        title: `Content Review: ${content.title}`,
        description:
          content.description ||
          `Review ${content.title} for ${formatLabel(content.platform)}.`,
        type: "CONTENT",
        status: "PENDING",
        requesterId: currentUser.id,
        approverId: approver.id,
      },
    });

    await tx.contentItem.update({
      where: { id: contentId },
      data: {
        approvalId: approval.id,
        status: "IN_REVIEW",
      },
    });
  });

  revalidatePath("/hq/content");
  revalidatePath("/hq/approvals");
  revalidatePath(`/hq/content/${contentId}`);

  redirect(`/hq/content/${contentId}?submitted=1`);
}


export default async function ContentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contentId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireStaff();

  const { contentId } = await params;
  const { saved } = await searchParams;

  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!content) notFound();

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
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: { firstName: "asc" },
  });

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-600";

  const labelClass =
    "block text-sm font-semibold text-[#162019]";

  const linkedApproval = content.approvalId
  ? await prisma.approval.findUnique({
      where: { id: content.approvalId },
    })
  : null;

  const isPendingReview = linkedApproval?.status === "PENDING";
    
  const saveAction = updateContent.bind(null, contentId);

  const submitApprovalAction =
    submitContentForApproval.bind(null, contentId);

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/content"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#657168] hover:text-[#162019]"
        >
          <ArrowLeft size={16} />
          Back to Content Calendar
        </Link>

        {saved === "1" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
          >
            <CheckCircle2 size={20} />
            Changes saved successfully!
          </div>
        )}

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            Content Calendar
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
            {content.title}
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            Edit content details, scheduling, and ownership.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-[#657168]">Platform</p>
            <p className="mt-1 font-semibold text-[#162019]">
              {formatLabel(content.platform)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-[#657168]">Status</p>
            <p className="mt-1 font-semibold text-[#162019]">
              {formatLabel(content.status)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-[#657168]">
              Scheduled Time
            </p>
            <p className="mt-1 font-semibold text-[#162019]">
              {formatTime(content.publishTime)}
            </p>
          </div>
        </div>

        {!isPendingReview && (
          <form
            action={saveAction}
            className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="mb-6 border-b border-gray-100 pb-5 text-lg font-semibold text-[#162019]">
              Content Details
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Content Title *
                <input
                  name="title"
                  required
                  maxLength={200}
                  defaultValue={content.title}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Platform *
                <select
                  name="platform"
                  defaultValue={content.platform}
                  className={inputClass}
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {formatLabel(platform)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Status *
                <select
                  name="status"
                  defaultValue={content.status}
                  className={inputClass}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Publish Date
                <input
                  name="publishDate"
                  type="date"
                  defaultValue={
                    content.publishDate
                      ? content.publishDate.toISOString().slice(0, 10)
                      : ""
                  }
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Publish Time (Eastern)
                <input
                  name="publishTime"
                  type="time"
                  defaultValue={content.publishTime ?? ""}
                  className={inputClass}
                />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Assigned Owner
              <select
                name="ownerId"
                defaultValue={content.ownerId ?? ""}
                className={inputClass}
              >
                <option value="">Unassigned</option>

                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {[person.firstName, person.lastName]
                      .filter((name) => name !== null)
                      .join(" ") || person.email}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description / Content Notes
              <textarea
                name="description"
                rows={6}
                defaultValue={content.description ?? ""}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            Approval statuses are tracked manually for now.
            Selecting Approved does not create an approval
            decision in the Approvals system.
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/hq/content"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#657168] hover:bg-gray-50"
            >
              Back to Calendar
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-6 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Changes
            </button>
          </div>
        </form>
        )}

{!content.approvalId &&
  content.status !== "APPROVED" &&
  content.status !== "PUBLISHED" && (
    
<form
  action={submitApprovalAction}
  className="mt-5 rounded-xl border border-gray-200 bg-white p-5"
>
  <label className="block text-sm font-semibold text-[#162019]">
    Assigned Approver *
    <select
      name="approverId"
      required
      defaultValue=""
      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019]"
    >
      <option value="" disabled>
        Select a reviewer
      </option>

      {staff
        .filter((person) =>
          person.roles.some((entry) =>
            ["OWNER", "COO"].includes(entry.role.name)
          )
        )
        .map((person) => (
          <option key={person.id} value={person.id}>
            {[person.firstName, person.lastName]
              .filter(Boolean)
              .join(" ") || person.email}
          </option>
        ))}
    </select>
  </label>

  <button
    type="submit"
    className="mt-4 w-full rounded-xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white hover:bg-emerald-800"
  >
    Submit for Approval
  </button>
</form>

  )}

    {content.approvalId && (
  <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-sm font-semibold text-[#162019]">
      Approval Request
    </p>

    <p className="mt-1 text-sm text-[#657168]">
      This content is linked to an approval request.
    </p>

    <Link
      href={`/hq/approvals/${content.approvalId}`}
      className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
    >
      View Approval Request →
    </Link>
  </div>
    )}

      </div>
    </AppShell>
  );
}
