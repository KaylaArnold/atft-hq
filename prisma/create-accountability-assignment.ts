import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { prisma } = await import("../lib/prisma");

  const accountabilityCoachId = "cmsr1b3560000v8v5f1okgnj5";
  const memberId = "cmsr1b3560000v8v5f1okgnj5";
  const programId = "cmsrmx86a0001xbqkke19bwaq";

  const assignment =
    await prisma.accountabilityCoachAssignment.create({
      data: {
        accountabilityCoachId,
        memberId,
        programId,
        active: true,
      },
    });

  console.log(assignment);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});