import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RoleName } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  const clerkUserId = "user_3HpZDp7I0tjxyb1mGmuLy4DM6Im";
  const email = "kayla.arnold91@gmail.com";

  const cooRole = await prisma.role.findUnique({
    where: { name: RoleName.COO },
  });

  if (!cooRole) {
    throw new Error("COO role not found.");
  }

  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email,
    },
    create: {
      clerkUserId,
      email,
      firstName: "Kayla",
      roles: {
        create: {
          roleId: cooRole.id,
        },
      },
    },
  });

  const existingRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: cooRole.id,
      },
    },
  });

  if (!existingRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: cooRole.id,
      },
    });
  }

  console.log("COO user created/updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });