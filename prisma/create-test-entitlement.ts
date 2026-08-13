import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  AccessSource,
  EntitlementStatus,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const entitlement = await prisma.registrationEntitlement.create({
    data: {
      email: "officialsarabi@gmail.com",
      program: "Mini Drippers",
      source: AccessSource.STRIPE,
      status: EntitlementStatus.ACTIVE,
    },
  });

  console.log("Test entitlement created:");
  console.log(entitlement);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });