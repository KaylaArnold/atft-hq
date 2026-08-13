"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  LifeBuoy,
  PlayCircle,
  UsersRound,
} from "lucide-react";
import AppShell from "./app-shell";

const memberQuickAccess = [
  {
    title: "My Programs",
    description: "Access your ATFT programs and courses",
    icon: GraduationCap,
    href: "/my-programs",
  },
  {
    title: "Upcoming Events",
    description: "View classes, lives, and community events",
    icon: CalendarDays,
    href: "/events",
  },
  {
    title: "Replay Library",
    description: "Watch available class recordings",
    icon: PlayCircle,
    href: "/replays",
  },
  {
    title: "Community",
    description: "Connect with the ATFT community",
    icon: UsersRound,
    href: "/community",
  },
];

type MemberProgram = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type MemberEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  zoomUrl: string | null;
  programName: string;
  programSlug: string;
};

type MemberPost = {
  id: string;
  title: string | null;
  content: string;
  type: "ANNOUNCEMENT" | "COMMUNITY";
  createdAt: string;
  authorName: string;
  programName: string | null;
};

type MemberDashboardProps = {
  programs: MemberProgram[];
  nextEvent: MemberEvent | null;
  posts: MemberPost[];
};

export function MemberDashboard({
  programs,
  nextEvent,
  posts,
}: MemberDashboardProps) {
  const { user } = useUser();

  const firstName = user?.firstName || "Dripper";

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {today}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Welcome back, {firstName}.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Everything you need for your ATFT journey is right here.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Quick Access
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Your ATFT Hub
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {memberQuickAccess.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-[var(--text)]">
                    {item.title}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              My Programs
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Continue learning
            </h2>

            <div className="mt-6 space-y-3">
              {programs.length > 0 ? (
                programs.map((program) => (
                  <Link
                    key={program.id}
                    href={`/my-programs/${program.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">
                        {program.name}
                      </p>

                      {program.description && (
                        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                          {program.description}
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      size={15}
                      className="ml-4 shrink-0 text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    />
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm font-medium text-[var(--text)]">
                    No active programs found.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    Contact Support if you believe you should have program access.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Coming Up
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Your next event
            </h2>

            {nextEvent ? (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {nextEvent.programName}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">
                      {nextEvent.title}
                    </h3>

                    {nextEvent.description && (
                      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {nextEvent.description}
                      </p>
                    )}

                    <p className="mt-4 text-xs font-medium text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZoneName: "short",
                      }).format(new Date(nextEvent.startsAt))}
                    </p>
                  </div>

                  {nextEvent.zoomUrl && (
                    <Link
                      href={nextEvent.zoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      Join Zoom
                    </Link>
                  )}
                </div>

                <Link
                  href={`/my-programs/${nextEvent.programSlug}/events`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]"
                >
                  View program events
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm font-medium text-[var(--text)]">
                  Nothing coming up yet.
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Your next ATFT class or event will appear here when it is scheduled.
                </p>
              </div>
            )}
          </section>
        </div>
        
        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Community Activity
      </p>

      <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
        What&apos;s happening at ATFT
      </h2>
    </div>

    <Link
      href="/community"
      className="hidden items-center gap-2 text-xs font-semibold text-[var(--accent)] sm:inline-flex"
    >
      View Community
      <ArrowRight size={14} />
    </Link>
  </div>

  <div className="mt-6 space-y-4">
    {posts.length > 0 ? (
      posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text)]">
              {post.authorName}
            </p>

            {post.programName && (
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
                {post.programName}
              </span>
            )}

            {post.type === "ANNOUNCEMENT" && (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Announcement
              </span>
            )}
          </div>

          {post.title && (
            <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
              {post.title}
            </h3>
          )}

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {post.content}
          </p>

          <p className="mt-4 text-[11px] text-[var(--text-muted)]">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(post.createdAt))}
          </p>
        </article>
      ))
    ) : (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
        <p className="text-sm font-medium text-[var(--text)]">
          Nothing new yet.
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          Announcements and community activity will appear here.
        </p>
      </div>
    )}
  </div>

  <Link
    href="/community"
    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] sm:hidden"
  >
    View Community
    <ArrowRight size={14} />
  </Link>
</section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <LifeBuoy size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Support
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                Need help?
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            Get help with your membership, program access, or technical issues.
          </p>

          <Link
            href="/support"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
          >
            Contact Support
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}