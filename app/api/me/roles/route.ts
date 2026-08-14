import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        isPeerCoach: false,
      },
      {
        status: 401,
      }
    );
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
    return NextResponse.json({
      isPeerCoach: false,
    });
  }

  const isPeerCoach = user.roles.some(
    ({ role }) => role.name === RoleName.PEER_COACH
  );

  return NextResponse.json({
    isPeerCoach,
  });
}