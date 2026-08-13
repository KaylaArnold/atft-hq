import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
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
    return NextResponse.json(
      { error: "ATFT user not found." },
      { status: 403 }
    );
  }

  const body = await request.json();

  const postId =
    typeof body.postId === "string" ? body.postId.trim() : "";

  const content =
    typeof body.content === "string" ? body.content.trim() : "";

  if (!postId || !content) {
    return NextResponse.json(
      { error: "Post and comment are required." },
      { status: 400 }
    );
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { error: "Comment is too long." },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Post not found or access denied." },
      { status: 404 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: post.id,
      authorId: user.id,
    },
  });

  return NextResponse.json(
    {
      id: comment.id,
    },
    { status: 201 }
  );
}