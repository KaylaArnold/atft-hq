import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "officialsarabi@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`No ATFT user found for ${email}`);
  }

  const program = await prisma.program.findUnique({
    where: { slug: "mini-drippers" },
  });

  if (!program) {
    throw new Error("Mini Drippers program not found");
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_programId: {
        userId: user.id,
        programId: program.id,
      },
    },
    update: {
      active: true,
    },
    create: {
      userId: user.id,
      programId: program.id,
      active: true,
    },
  });

  console.log(`Enrolled ${email} in ${program.name}`);
  console.log(enrollment);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });