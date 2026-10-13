
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, CalendarDays } from "lucide-react";

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
  "ZOOM",
  "YOUTUBE",
  "INSTAGRAM",
  "TIKTOK",
  "FACEBOOK",
  "TWITCH",
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
    throw new Error("You do not have permission to create content.");
  }

  return currentUser;
}

async function createContent(formData: FormData) {
  "use server";

  await requireStaff();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const platformInput = String(
    formData.get("platform") ?? ""
  ).trim();

  const statusInput = String(
    formData.get("status") ?? "IDEA"
  ).trim();

  if (!title) {
    throw new Error("Content title is required.");
  }

  if (!PLATFORMS.some((platform) => platform === platformInput)) {
    throw new Error("Please select a valid platform.");
  }

  if (!STATUSES.some((status) => status === statusInput)) {
    throw new Error("Please select a valid status.");
  }

  if (statusInput !== "IDEA" && statusInput !== "DRAFT") {
  throw new Error(
    "New content must start as an Idea or Draft. Use Submit for Approval to request review."
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

  const contentPlatform = platformInput as (typeof PLATFORMS)[number];
  const contentStatus = statusInput as (typeof STATUSES)[number];

  const item = await prisma.contentItem.create({
    data: {
      title,
      description: description || null,
      platform: contentPlatform,
      status: contentStatus,
      publishDate: optionalDate(formData.get("publishDate")),
      publishTime: String(formData.get("publishTime") ?? "").trim() || null,
      ownerId,
    },
  });

  revalidatePath("/hq/content");

  redirect(`/hq/content/${item.id}?saved=1`);
}

export default async function NewContentPage() {
  await requireStaff();

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
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-600";

  const labelClass =
    "block text-sm font-semibold text-[#162019]";

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/content"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#657168] hover:text-[#162019]"
        >
          <ArrowLeft size={16} />
          Back to Content Calendar
        </Link>

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            ATFT Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
            New Content
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            Plan a social media post, email campaign, website update,
            or other marketing content.
          </p>
        </div>

        <form
          action={createContent}
          className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-[#162019]">
                Content Details
              </h2>

              <p className="text-xs text-[#657168]">
                Fields marked * are required.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Content Title *
              <input
                name="title"
                required
                maxLength={200}
                placeholder="Example: Wednesday Live Trading Reminder"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Platform *
              <select
                name="platform"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select a platform
                </option>

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
                defaultValue="IDEA"
                className={inputClass}
              >
                {(["IDEA", "DRAFT"] as const).map((status) => (
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
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
                Publish Time (Eastern)
                <input
                    name="publishTime"
                    type="time"
                    className={inputClass}
                />
            </label>

            <label className={labelClass}>
              Assigned Owner
              <select
                name="ownerId"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Unassigned</option>

                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {[person.firstName, person.lastName]
                      .filter(Boolean)
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
                placeholder="Caption ideas, campaign details, links, creative direction, or other instructions..."
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            Content statuses are currently tracked manually.
            Selecting Approved does not create an approval decision
            in the Approvals system. We'll connect that workflow
            before staff rollout.
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/hq/content"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#657168] hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-6 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Content
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
