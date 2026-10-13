import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  UserRound,
  Video,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function CalendarItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { itemId } = await params;

  const calendarClient =
    (prisma as any).calendarItem ??
    (prisma as any).calendarItems;

  if (!calendarClient) {
    throw new Error("CalendarItem model is not available on the Prisma client.");
  }

  const item = await calendarClient.findUnique({
    where: {
      id: itemId,
    },
    include: {
      owner: true,
      createdBy: true,
    },
  });

  if (!item) {
    notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const ownerName =
    item.owner?.name ??
    item.owner?.fullName ??
    item.owner?.email ??
    "Unassigned";

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hq/calendar"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#657168] transition hover:text-[#162019]"
          >
            <ArrowLeft size={16} />
            Back to Calendar
          </Link>

          <Link
            href={`/hq/calendar/${item.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Pencil size={15} />
            Edit Event
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-sm">
          <div className="border-b border-black/[0.06] px-6 py-7 sm:px-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {formatLabel(item.type)}
              </span>

              <span className="rounded-full bg-[#f3f5f4] px-3 py-1 text-xs font-semibold text-[#657168]">
                {formatLabel(item.status)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#162019] sm:text-3xl">
              {item.title}
            </h1>

            {item.description && (
              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#657168]">
                {item.description}
              </p>
            )}
          </div>

          <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                <CalendarDays size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-[#162019]">
                  {dateFormatter.format(new Date(item.startsAt))}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                <Clock3 size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-[#162019]">
                  {item.allDay
                    ? "All day"
                    : item.endsAt
                      ? `${timeFormatter.format(
                          new Date(item.startsAt)
                        )} – ${timeFormatter.format(new Date(item.endsAt))}`
                      : timeFormatter.format(new Date(item.startsAt))}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                  Owner
                </p>
                <p className="mt-1 text-sm font-medium text-[#162019]">
                  {ownerName}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                  Location
                </p>
                <p className="mt-1 text-sm font-medium text-[#162019]">
                  {item.location || "Not specified"}
                </p>
              </div>
            </div>

            {item.meetingUrl && (
              <div className="flex gap-3 sm:col-span-2">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                  <Video size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                    Meeting
                  </p>

                  <a
                    href={item.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}