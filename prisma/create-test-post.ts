import { PrismaPg } from "@prisma/adapter-pg";
import {
  PostType,
  PrismaClient,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const author = await prisma.user.findUnique({
    where: {
      email: "kayla.arnold91@gmail.com",
    },
  });

  if (!author) {
    throw new Error("COO user not found.");
  }

  const program = await prisma.program.findUnique({
    where: {
      slug: "mini-drippers",
    },
  });

  if (!program) {
    throw new Error("Mini Drippers program not found.");
  }

  const post = await prisma.post.create({
    data: {
      title: "Welcome Mini Drippers",
      content:
        "Welcome to the ATFT Hub! Your upcoming classes, program updates, replays, and community activity will appear here.",
      type: PostType.ANNOUNCEMENT,
      authorId: author.id,
      programId: program.id,
      published: true,
    },
  });

  console.log("Test announcement created:");
  console.log(post);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });