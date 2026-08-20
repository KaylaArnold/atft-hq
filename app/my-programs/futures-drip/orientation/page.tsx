import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Monitor,
  MousePointerClick,
  PlugZap,
  SlidersHorizontal,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function FuturesDripOrientationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      active: true,
      program: {
        slug: "futures-drip",
      },
    },
    include: {
      program: true,
    },
  });

  if (!enrollment) {
    redirect("/my-programs");
  }

  const modules = [
    {
      number: "01",
      title: "Account Setup",
      description:
        "Understand the trading account, funding basics, and the difference between SIM and Live trading.",
      icon: PlugZap,
    },
    {
      number: "02",
      title: "Platform Setup",
      description:
        "Connect NinjaTrader and TradingView, verify the account connection, and confirm market data.",
      icon: Monitor,
    },
    {
      number: "03",
      title: "Chart Setup",
      description:
        "Build the ATFT chart environment with MES, J20 / 20 EMA, Volume, timeframe, and saved layout.",
      icon: SlidersHorizontal,
    },
    {
      number: "04",
      title: "Order Entry Basics",
      description:
        "Practice Buy, Sell, Market, Limit, Stop Loss, Take Profit, Cancel, Close Position, and SIM order management.",
      icon: MousePointerClick,
    },
    {
      number: "05",
      title: "Ready Checklist",
      description:
        "Confirm platform competency and readiness before advancing to Lesson One.",
      icon: ClipboardCheck,
    },
  ];

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/my-programs/futures-drip"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} />
          Back to Futures Drip
        </Link>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Futures Drip
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Student Orientation
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Complete orientation before beginning Lesson One. This process
            establishes platform competency, SIM readiness, and the basic
            chart environment used throughout Futures Drip.
          </p>
        </section>

        <section className="panel mt-8 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <CheckCircle2 size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Orientation Requirement
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
                Complete all five orientation modules
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
                Futures Drip students should demonstrate basic platform and
                SIM competency before moving into strategy instruction.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const href = `/my-programs/futures-drip/orientation/${module.number}`;

              return (
                <Link
                  key={module.number}
                  href={href}
                  className="group rounded-3xl border border-[var(--border)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={19} />
                    </span>

                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
                      Not Started
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Module {module.number}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">
                    {module.title}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {module.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}