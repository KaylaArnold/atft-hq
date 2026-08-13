import { clerkClient } from "@clerk/nextjs/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const client = await clerkClient();

  const users = await prisma.user.findMany();

  for (const user of users) {
    const clerkUser = await client.users.getUser(user.clerkUserId);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: clerkUser.imageUrl ?? null,
        firstName: clerkUser.firstName ?? user.firstName,
        lastName: clerkUser.lastName ?? user.lastName,
      },
    });

    console.log(`Synced ${user.email}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });