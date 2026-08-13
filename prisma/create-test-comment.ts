import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const author = await prisma.user.findUnique({
    where: {
      email: "officialsarabi@gmail.com",
    },
  });

  if (!author) {
    throw new Error("Test member not found.");
  }

  const post = await prisma.post.findFirst({
    where: {
      title: "Welcome Mini Drippers",
    },
  });

  if (!post) {
    throw new Error("Test post not found.");
  }

  const comment = await prisma.comment.create({
    data: {
      content: "Got it! 🙌",
      authorId: author.id,
      postId: post.id,
    },
  });

  console.log("Test comment created:");
  console.log(comment);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });