import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Send } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { ReactionType } from "@/generated/prisma/client";

async function toggleReaction(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const postId = formData.get("postId");
  const reactionType = formData.get("reactionType");

  if (
    typeof postId !== "string" ||
    typeof reactionType !== "string" ||
    !Object.values(ReactionType).includes(reactionType as ReactionType)
  ) {
    return;
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
      },
    },
  });

  if (!user) {
    return;
  }

  const programIds = user.enrollments.map(
    (enrollment) => enrollment.programId
  );

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      published: true,
      OR: [
        {
          programId: null,
        },
        {
          programId: {
            in: programIds,
          },
        },
      ],
    },
  });

  if (!post) {
    return;
  }

  const type = reactionType as ReactionType;

  const existingReaction = await prisma.reaction.findUnique({
    where: {
      postId_userId_type: {
        postId: post.id,
        userId: user.id,
        type,
      },
    },
  });

  if (existingReaction) {
    await prisma.reaction.delete({
      where: {
        id: existingReaction.id,
      },
    });
  } else {
    await prisma.reaction.create({
      data: {
        postId: post.id,
        userId: user.id,
        type,
      },
    });
  }

  revalidatePath("/community");
}

async function addComment(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const postId = formData.get("postId");
  const content = formData.get("content");

  if (
    typeof postId !== "string" ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    return;
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
      },
    },
  });

  if (!user) {
    return;
  }

  const programIds = user.enrollments.map(
    (enrollment) => enrollment.programId
  );

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      published: true,
      OR: [
        {
          programId: null,
        },
        {
          programId: {
            in: programIds,
          },
        },
      ],
    },
  });

  if (!post) {
    return;
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId: post.id,
      authorId: user.id,
    },
  });

  revalidatePath("/community");
}

export default async function CommunityPage() {
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
    redirect("/");
  }

  const programIds = user.enrollments.map(
    (enrollment) => enrollment.program.id
  );

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        {
          programId: null,
        },
        {
          programId: {
            in: programIds,
          },
        },
      ],
    },
    include: {
      author: true,
      program: true,
      reactions: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Community
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            ATFT Community
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Stay connected with ATFT announcements, program updates, and
            community activity.
          </p>
        </section>

        <section className="mt-9 space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => {
              const authorName =
                [post.author.firstName, post.author.lastName]
                  .filter(Boolean)
                  .join(" ") || "ATFT Team";

              const createdAt = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(post.createdAt);

              return (
                <article
                  key={post.id}
                  className="panel rounded-3xl p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {authorName}
                    </p>

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
                    <h2 className="mt-4 text-xl font-semibold text-[var(--text)]">
                      {post.title}
                    </h2>
                  )}

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                    {post.content}
                  </p>

                  <p className="mt-5 text-[11px] text-[var(--text-muted)]">
                    {createdAt}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
  {[
    {
      type: ReactionType.HEART,
      emoji: "❤️",
    },
    {
      type: ReactionType.FIRE,
      emoji: "🔥",
    },
    {
      type: ReactionType.PRAISE,
      emoji: "🙌",
    },
  ].map((reaction) => {
    const count = post.reactions.filter(
      (item) => item.type === reaction.type
    ).length;

    const reacted = post.reactions.some(
      (item) =>
        item.type === reaction.type &&
        item.userId === user.id
    );

    return (
      <form key={reaction.type} action={toggleReaction}>
        <input
          type="hidden"
          name="postId"
          value={post.id}
        />

        <input
          type="hidden"
          name="reactionType"
          value={reaction.type}
        />

        <button
          type="submit"
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
            reacted
              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--accent)]"
          }`}
        >
          <span>{reaction.emoji}</span>

          {count > 0 && (
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {count}
            </span>
          )}
        </button>
      </form>
    );
  })}
</div>

                  {post.comments.length > 0 && (
                    <div className="mt-6 border-t border-[var(--border)] pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        Comments
                      </p>

                      <div className="mt-4 space-y-3">
                        {post.comments.map((comment) => {
                          const commentAuthor =
                            [comment.author.firstName, comment.author.lastName]
                              .filter(Boolean)
                              .join(" ") ||
                            comment.author.email ||
                            "ATFT Member";

                          const commentDate = new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(comment.createdAt);

                          return (
                            <div
                              key={comment.id}
                              className="rounded-2xl bg-[var(--surface-strong)] p-4"
                            >
                              <p className="text-xs font-semibold text-[var(--text)]">
                                {commentAuthor}
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {comment.content}
                              </p>

                              <p className="mt-3 text-[10px] text-[var(--text-muted)]">
                                {commentDate}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <form
                    action={addComment}
                    className="mt-5 border-t border-[var(--border)] pt-5"
                  >
                    <input
                      type="hidden"
                      name="postId"
                      value={post.id}
                    />

                    <div className="flex gap-3">
                      <textarea
                        name="content"
                        placeholder="Write a comment..."
                        rows={2}
                        maxLength={2000}
                        required
                        className="min-h-[76px] flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                      />

                      <button
                        type="submit"
                        aria-label="Post comment"
                        className="grid size-11 shrink-0 place-items-center self-end rounded-xl bg-[var(--accent)] text-white transition hover:opacity-90"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </article>
              );
            })
          ) : (
            <div className="panel rounded-3xl p-6 sm:p-8">
              <p className="text-sm font-medium text-[var(--text)]">
                Nothing has been posted yet.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                ATFT announcements and community posts will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}