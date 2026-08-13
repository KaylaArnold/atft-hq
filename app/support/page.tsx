import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LifeBuoy, Mail, ArrowRight } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

export default async function SupportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const isMember = user.roles.some(
    ({ role }) => role.name === RoleName.MEMBER
  );

  if (!isMember) {
    redirect("/");
  }

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Support
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            How can we help?
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Get help with your membership, program access, classes, or technical issues.
          </p>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <LifeBuoy size={19} />
            </span>

            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                Contact ATFT Support
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Send your question to the official ATFT Support team.
              </p>

              <Link
                href="mailto:support@arlettathefriendlytrader.com"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Mail size={16} />
                Email Support
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}