import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

type CommunityMemberProfileProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CommunityMemberProfile({
  params,
}: CommunityMemberProfileProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

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

  const { id } = await params;

  const member = await prisma.user.findUnique({
    where: {
      id,
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
      posts: {
        where: {
          published: true,
        },
        include: {
          program: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!member) {
    notFound();
  }

  const currentUserProgramIds = new Set(
    currentUser.enrollments.map((enrollment) => enrollment.programId)
  );

  const visiblePrograms = member.enrollments.filter((enrollment) =>
    currentUserProgramIds.has(enrollment.programId)
  );

  const visiblePosts = member.posts.filter(
    (post) =>
      post.programId === null ||
      currentUserProgramIds.has(post.programId)
  );

  const memberName =
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "ATFT Member";

  const initials =
    [member.firstName, member.lastName]
      .filter(Boolean)
      .map((name) => name!.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(member.createdAt);

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Community
        </Link>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={memberName}
                className="size-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="grid size-20 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xl font-semibold text-[var(--accent)]">
                {initials}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                ATFT Community
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                {memberName}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <CalendarDays size={15} />
                Member since {memberSince}
              </div>
            </div>
          </div>

          {visiblePrograms.length > 0 && (
            <div className="mt-7 border-t border-[var(--border)] pt-6">
              <div className="flex items-center gap-2">
                <BookOpen
                  size={15}
                  className="text-[var(--text-muted)]"
                />

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Programs
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {visiblePrograms.map((enrollment) => (
                  <span
                    key={enrollment.id}
                    className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]"
                  >
                    {enrollment.program.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Community Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              Recent posts
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {visiblePosts.length > 0 ? (
              visiblePosts.map((post) => {
                const createdAt = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(post.createdAt);

                return (
                  <article
                    key={post.id}
                    className="panel rounded-3xl p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {post.program && (
                        <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
                          {post.program.name}
                        </span>
                      )}

                      {post.type === "ANNOUNCEMENT" && (
                        <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                          Announcement
                        </span>
                      )}
                    </div>

                    {post.title && (
                      <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">
                        {post.title}
                      </h3>
                    )}

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                      {post.content}
                    </p>

                    <p className="mt-4 text-[11px] text-[var(--text-muted)]">
                      {createdAt}
                    </p>
                  </article>
                );
              })
            ) : (
              <div className="panel rounded-3xl p-6">
                <p className="text-sm font-medium text-[var(--text)]">
                  No community posts yet.
                </p>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Posts from this member will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}