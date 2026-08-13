import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function MyProgramsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      enrollments: {
        where: {
          active: true,
        },
        include: {
          program: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Access Not Configured</h1>
          <p className="mt-3 text-gray-600">
            Your ATFT Hub account has not been configured. Please contact
            Support.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            My Programs
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Your ATFT programs
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Access the programs, courses, replays, events, and resources
            included with your enrollment.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          {user.enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {user.enrollments.map(({ program }) => (
                <Link
                  key={program.id}
                  href={`/my-programs/${program.slug}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <GraduationCap size={19} />
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-[var(--text)]">
                    {program.name}
                  </h2>

                  {program.description && (
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                      {program.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
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
        </section>
      </div>
    </AppShell>
  );
}