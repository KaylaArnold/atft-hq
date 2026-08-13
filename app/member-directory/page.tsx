import { auth } from "@clerk/nextjs/server";
import { CalendarDays, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type MemberDirectoryPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function MemberDirectoryPage({
    searchParams,
}: MemberDirectoryPageProps) {

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const currentUser = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      enrollments: {
        where: {
          active: true,
        },
        select: {
          programId: true,
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/");
  }

  const currentUserProgramIds = currentUser.enrollments.map(
    (enrollment) => enrollment.programId
  );

  const members = await prisma.user.findMany({
  where: {
    roles: {
      some: {
        role: {
          name: "MEMBER",
        },
      },
    },
    ...(search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
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
  orderBy: [
    {
      firstName: "asc",
    },
    {
      lastName: "asc",
    },
  ],
});

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Member Directory
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Connect with the community
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Discover and connect with members across the ATFT community.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <UsersRound size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {members.length}{" "}
                  {members.length === 1 ? "member" : "members"}
                </p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Active ATFT community members
                </p>
              </div>
            </div>

            <form
  action="/member-directory"
  method="get"
  className="relative w-full sm:max-w-sm"
>
  <Search
    size={15}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
  />

  <input
    type="search"
    name="q"
    defaultValue={search}
    placeholder="Search members..."
    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
  />
</form>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const memberName =
                [member.firstName, member.lastName]
                  .filter(Boolean)
                  .join(" ") || "ATFT Member";

              const initials =
                [member.firstName, member.lastName]
                  .filter(Boolean)
                  .map((name) => name!.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "A";

              const memberSince = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(member.createdAt);

              return (
                <Link
                  key={member.id}
                  href={`/community/members/${member.id}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={memberName}
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-[var(--text)]">
                        {memberName}
                      </h2>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                        <CalendarDays size={12} />
                        Member since {memberSince}
                      </div>
                    </div>
                  </div>

                  {member.enrollments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.enrollments.map((enrollment) => (
                        <span
                          key={enrollment.id}
                          className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]"
                        >
                          {enrollment.program.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-8 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                No members found yet.
              </p>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Members who share your active programs will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}