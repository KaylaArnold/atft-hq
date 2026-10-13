import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const staffRoles = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
];

export default async function NewCalendarItemPage() {
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

  const users = await prisma.user.findMany({
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  async function createCalendarItem(formData: FormData) {
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
      staffRoles.includes(userRole.role.name)
    );

    if (!creatorIsStaff) {
      redirect("/");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const type = String(
      formData.get("type") ?? "OPERATIONS"
    ) as
      | "MEETING"
      | "CLASS"
      | "CONTENT"
      | "DEADLINE"
      | "CORPORATE"
      | "OPERATIONS"
      | "OTHER";

    const date = String(formData.get("date") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();

    const allDay = formData.get("allDay") === "on";

    const ownerId = String(formData.get("ownerId") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();

    if (!title || !date) {
      throw new Error("Title and date are required.");
    }

    const startsAt = allDay
      ? new Date(`${date}T12:00:00`)
      : new Date(`${date}T${startTime || "09:00"}:00`);

    const endsAt =
      !allDay && endTime
        ? new Date(`${date}T${endTime}:00`)
        : null;

    const calendarClient =
      (prisma as any).calendarItem ??
      (prisma as any).calendarItems;

    if (!calendarClient) {
      throw new Error(
        "CalendarItem model is not available on the Prisma client."
      );
    }

    await calendarClient.create({
      data: {
        title,
        description: description || null,
        type,
        startsAt,
        endsAt,
        allDay,
        location: location || null,
        meetingUrl: meetingUrl || null,
        ownerId: ownerId || null,
        createdById: creator.id,
      },
    });

    revalidatePath("/hq/calendar");
    revalidatePath("/hq");

    const createdDate = new Date(startsAt);

    redirect(
      `/hq/calendar?month=${createdDate.getMonth() + 1}&year=${createdDate.getFullYear()}`
    );
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/hq/calendar"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Operating Calendar
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            ATFT Operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Add Calendar Item
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Add a company meeting, class, deadline, content date, or other
            operational event.
          </p>
        </div>

        <form
          action={createCalendarItem}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-neutral-900"
            >
              Title *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
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
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="type"
              className="text-sm font-semibold text-neutral-900"
            >
              Type
            </label>

            <select
              id="type"
              name="type"
              defaultValue="OPERATIONS"
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
            >
              <option value="MEETING">Meeting</option>
              <option value="CLASS">Class</option>
              <option value="CONTENT">Content</option>
              <option value="DEADLINE">Deadline</option>
              <option value="CORPORATE">Corporate Opportunity</option>
              <option value="OPERATIONS">Operations</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="mt-6">
            <label
              htmlFor="date"
              className="text-sm font-semibold text-neutral-900"
            >
              Date *
            </label>

            <input
              id="date"
              name="date"
              type="date"
              required
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <input
                name="allDay"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300"
              />
              All-day item
            </label>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startTime"
                className="text-sm font-semibold text-neutral-900"
              >
                Start Time
              </label>

              <input
                id="startTime"
                name="startTime"
                type="time"
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="text-sm font-semibold text-neutral-900"
              >
                End Time
              </label>

              <input
                id="endTime"
                name="endTime"
                type="time"
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="ownerId"
              className="text-sm font-semibold text-neutral-900"
            >
              Owner
            </label>

            <select
              id="ownerId"
              name="ownerId"
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
            >
              <option value="">No owner</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {[user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ") || user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="location"
                className="text-sm font-semibold text-neutral-900"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Office, Zoom, etc."
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="meetingUrl"
                className="text-sm font-semibold text-neutral-900"
              >
                Meeting Link
              </label>

              <input
                id="meetingUrl"
                name="meetingUrl"
                type="url"
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/hq/calendar"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Add to Calendar
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}