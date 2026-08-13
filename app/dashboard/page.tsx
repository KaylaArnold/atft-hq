import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">ATFT Hub</h1>

      <p className="mt-4 text-gray-600">
        Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}.
      </p>
    </main>
  );
}