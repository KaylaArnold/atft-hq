import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const program = await prisma.program.findUnique({
    where: {
      slug: "mini-drippers",
    },
  });

  if (!program) {
    throw new Error("Mini Drippers program not found.");
  }

  const event = await prisma.event.create({
    data: {
      title: "Mini Drippers Live",
      description: "Live trading session with Coach Arletta.",
      startsAt: new Date("2026-08-14T10:30:00-04:00"),
      endsAt: new Date("2026-08-14T11:30:00-04:00"),
      zoomUrl: "https://zoom.us/",
      programId: program.id,
    },
  });

  console.log("Test event created:");
  console.log(event);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });