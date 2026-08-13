import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const programs = [
  {
    name: "5% Drippers",
    slug: "5-percent-drippers",
    description: "ATFT's main trading community.",
  },
  {
    name: "Mini Drippers",
    slug: "mini-drippers",
    description: "ATFT's six-month Mini Drippers program.",
  },
  {
    name: "Swing Drip",
    slug: "swing-drip",
    description: "ATFT swing trading program.",
  },
  {
    name: "Futures Drip",
    slug: "futures-drip",
    description: "ATFT futures trading program.",
  },
];

async function main() {
  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: program,
      create: program,
    });
  }

  console.log("ATFT programs seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });