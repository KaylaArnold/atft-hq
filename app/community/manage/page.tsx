import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { PostType, RoleName } from "@/generated/prisma/client";

import { DeletePostButton } from "@/components/delete-post-button";

async function createAnnouncement(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
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

  if (!user) {
    return;
  }

  const canManageCommunity = user.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER ||
      role.name === RoleName.COO
  );

  if (!canManageCommunity) {
    return;
  }

  const title = formData.get("title");
  const content = formData.get("content");
  const programId = formData.get("programId");

  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    !title.trim() ||
    !content.trim()
  ) {
    return;
  }

  let selectedProgramId: string | null = null;

  if (typeof programId === "string" && programId) {
    const program = await prisma.program.findUnique({
      where: {
        id: programId,
      },
    });

    if (!program) {
      return;
    }

    selectedProgramId = program.id;
  }

  await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      type: PostType.ANNOUNCEMENT,
      authorId: user.id,
      programId: selectedProgramId,
      published: true,
    },
  });

  revalidatePath("/community");
  revalidatePath("/community/manage");
  revalidatePath("/");
}

async function togglePublished(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const canManage =
    user?.roles.some(
      ({ role }) =>
        role.name === RoleName.OWNER ||
        role.name === RoleName.COO
    ) ?? false;

  if (!user || !canManage) {
    return;
  }

  const postId = formData.get("postId");

  if (typeof postId !== "string") {
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return;
  }

  await prisma.post.update({
    where: { id: post.id },
    data: {
      published: !post.published,
    },
  });

  revalidatePath("/community/manage");
  revalidatePath("/community");
  revalidatePath("/");
}

async function deletePost(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const canManage =
    user?.roles.some(
      ({ role }) =>
        role.name === RoleName.OWNER ||
        role.name === RoleName.COO
    ) ?? false;

  if (!user || !canManage) {
    return;
  }

  const postId = formData.get("postId");

  if (typeof postId !== "string") {
    return;
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  revalidatePath("/community/manage");
  revalidatePath("/community");
  revalidatePath("/");
}

async function editPost(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const canManage =
    user?.roles.some(
      ({ role }) =>
        role.name === RoleName.OWNER ||
        role.name === RoleName.COO
    ) ?? false;

  if (!user || !canManage) {
    return;
  }

  const postId = formData.get("postId");
  const title = formData.get("title");
  const content = formData.get("content");

  if (
    typeof postId !== "string" ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    return;
  }

  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      title:
        typeof title === "string" && title.trim()
          ? title.trim()
          : null,
      content: content.trim(),
    },
  });

  revalidatePath("/community/manage");
  revalidatePath("/community");
  revalidatePath("/");
}

export default async function ManageCommunityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const posts = await prisma.post.findMany({
  include: {
    author: true,
    program: true,
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 25,
});

  const user = await prisma.user.findUnique({
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

  if (!user) {
    redirect("/");
  }

  const canManageCommunity = user.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER ||
      role.name === RoleName.COO
  );

  if (!canManageCommunity) {
    redirect("/");
  }

  const programs = await prisma.program.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Community Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Create Announcement
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Publish an official ATFT announcement to the entire community or
            to members of a specific program.
          </p>
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
      Community Management
    </p>

    <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
      Recent posts
    </h2>
  </div>

  <div className="mt-6 space-y-4">
    {posts.map((post) => {
      const authorName =
        [post.author.firstName, post.author.lastName]
          .filter(Boolean)
          .join(" ") ||
        post.author.email ||
        "ATFT User";

      return (
        <div
          key={post.id}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text)]">
              {authorName}
            </span>

            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
              {post.type}
            </span>

            {post.program && (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
                {post.program.name}
              </span>
            )}

            <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {post.published ? "Published" : "Unpublished"}
            </span>
          </div>

          <form action={editPost} className="mt-4 space-y-3">
            <input type="hidden" name="postId" value={post.id} />

            <input
              name="title"
              defaultValue={post.title ?? ""}
              placeholder="Post title"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none"
            />

            <textarea
              name="content"
              defaultValue={post.content}
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm leading-6 text-[var(--text)] outline-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
              >
                Save Changes
              </button>

              <span className="text-xs text-[var(--text-muted)]">
                {post._count.comments} comments ·{" "}
                {post._count.reactions} reactions
              </span>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
            <form action={togglePublished}>
              <input type="hidden" name="postId" value={post.id} />

              <button
                type="submit"
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
            </form>

            <DeletePostButton
                postId={post.id}
                deleteAction={deletePost}
            />
          </div>
        </div>
      );
    })}
  </div>
</section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <form action={createAnnouncement} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Announcement Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={150}
                placeholder="Enter announcement title"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Message
              </label>

              <textarea
                id="content"
                name="content"
                required
                rows={7}
                maxLength={5000}
                placeholder="Write your announcement..."
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="programId"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Audience
              </label>

              <select
                id="programId"
                name="programId"
                defaultValue=""
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none"
              >
                <option value="">Entire ATFT Community</option>

                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Publish Announcement
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}