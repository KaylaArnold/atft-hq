import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Video,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type EventsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventsPage({
  params,
}: EventsPageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      active: true,
      program: {
        slug,
      },
    },
    include: {
      program: {
        include: {
          events: {
            where: {
              startsAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              startsAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return (
      <AppShell variant="member">
        <div className="flex min-h-[calc(100vh-76px)] items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-[var(--text)]">
              Program Access Required
            </h1>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              You do not have active access to this program.
            </p>

            <Link
              href="/my-programs"
              className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)]"
            >
              Return to My Programs
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { program } = enrollment;
  const events = program.events;

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href={`/my-programs/${program.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={14} />
          {program.name}
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Events
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Upcoming {program.name} events
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            View your upcoming sessions and join live classes directly from
            ATFT Hub.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => {
                const date = new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(event.startsAt);

                const time = new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                }).format(event.startsAt);

                return (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--text)]">
                          {event.title}
                        </h2>

                        {event.description && (
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {event.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={14} />
                            {date}
                          </span>

                          <span className="flex items-center gap-2">
                            <Clock size={14} />
                            {time}
                          </span>
                        </div>
                      </div>

                      {event.zoomUrl && (
                        <Link
                          href={event.zoomUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                        >
                          <Video size={16} />
                          Join Zoom
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--text)]">
                No upcoming events.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                New sessions will appear here when they are scheduled.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}