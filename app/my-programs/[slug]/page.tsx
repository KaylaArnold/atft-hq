import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  NotebookPen,
  PlayCircle,
  UsersRound,
  WalletCards,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type ProgramPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProgramPage({
  params,
}: ProgramPageProps) {
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
      program: true,
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
              You do not have active access to this ATFT program.
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

  const program = enrollment.program;

  const sections =
  program.slug === "mini-drippers"
    ? [
        {
          title: "Upcoming Events",
          description: "View upcoming live sessions and Zoom details.",
          icon: CalendarDays,
          href: `/my-programs/${program.slug}/events`,
        },
        {
          title: "Accountability",
          description:
            "Complete your 30-day assessment and weekly accountability check-ins.",
          icon: NotebookPen,
          href: `/my-programs/${program.slug}/accountability`,
        },
        {
          title: "Monthly Balance",
          description:
            "Submit and review your monthly beginning and ending balances.",
          icon: WalletCards,
          href: `/my-programs/${program.slug}/monthly-balance`,
        },
        {
          title: "Replay Library",
          description: "Watch recordings available for Mini Drippers.",
          icon: PlayCircle,
          href: `/my-programs/${program.slug}/replays`,
        },
        {
          title: "Community",
          description: "Connect with other Mini Drippers.",
          icon: UsersRound,
          href: `/my-programs/${program.slug}/community`,
        },
        {
          title: "Resources",
          description: "Access program files, worksheets, and resources.",
          icon: FileText,
          href: `/my-programs/${program.slug}/resources`,
        },
      ]
    : [
        {
          title: "Course",
          description: "Continue your lessons and program material.",
          icon: BookOpen,
          href: `/my-programs/${program.slug}/course`,
        },
        {
          title: "Upcoming Events",
          description: "View upcoming classes and Zoom sessions.",
          icon: CalendarDays,
          href: `/my-programs/${program.slug}/events`,
        },
        {
          title: "Replay Library",
          description: "Watch recordings available for this program.",
          icon: PlayCircle,
          href: `/my-programs/${program.slug}/replays`,
        },
        {
          title: "Community",
          description: "Connect with members in this program.",
          icon: UsersRound,
          href: `/my-programs/${program.slug}/community`,
        },
        {
          title: "Resources",
          description: "Access files, worksheets, and other materials.",
          icon: FileText,
          href: `/my-programs/${program.slug}/resources`,
        },
      ];

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/my-programs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={14} />
          My Programs
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Active Program
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            {program.name}
          </h1>

          {program.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {program.description}
            </p>
          )}
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Program Home
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
            Everything for {program.name}
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={18} />
                  </span>

                  <h3 className="mt-5 text-sm font-semibold text-[var(--text)]">
                    {section.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {section.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}