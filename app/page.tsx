import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

export default async function Home() {
  const { userId } = await auth();

  // Not signed in at all
  if (!userId) {
    redirect("/sign-in");
  }

  // Find this Clerk user inside ATFT
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

  // Signed into Clerk, but no ATFT account/permissions exist
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

  // For NOW, this existing dashboard is specifically the executive/COO HQ.
  if (!hasHQAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Dashboard Coming Soon</h1>
          <p className="mt-3 text-gray-600">
            Your ATFT Hub dashboard is being configured for your account.
          </p>
        </div>
      </main>
    );
  }

  return <Dashboard />;
}