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

type MemberDashboardProps = {
  programs: MemberProgram[];
};

export function MemberDashboard({
  programs,
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

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--text)]">
                Upcoming classes and events will appear here.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                You&apos;ll be able to access event details and Zoom links
                directly from the Hub.
              </p>
            </div>
          </section>
        </div>

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