import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("roles:", await prisma.role.count());
  console.log("users:", await prisma.user.count());
  console.log("programs:", await prisma.program.count());
  console.log("enrollments:", await prisma.enrollment.count());
  console.log(
    "entitlements:",
    await prisma.registrationEntitlement.count()
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });