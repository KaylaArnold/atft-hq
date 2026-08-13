import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { MemberDashboard } from "@/components/member-dashboard";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

export default async function Home() {
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

  const hasHQAccess = user.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER || role.name === RoleName.COO
  );

  if (hasHQAccess) {
    return <Dashboard />;
  }

  const isMember = user.roles.some(
    ({ role }) => role.name === RoleName.MEMBER
  );

  if (isMember) {
    const memberPrograms = user.enrollments.map((enrollment) => ({
      id: enrollment.program.id,
      name: enrollment.program.name,
      slug: enrollment.program.slug,
      description: enrollment.program.description,
    }));

    return <MemberDashboard programs={memberPrograms} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Access Not Configured</h1>

        <p className="mt-3 text-gray-600">
          Your ATFT Hub access has not been configured. Please contact Support.
        </p>
      </div>
    </main>
  );
}