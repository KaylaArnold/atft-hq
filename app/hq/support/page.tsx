import AppShell from "@/components/app-shell";
import SupportTicketCard from "@/components/support/ticket-view";
import PageHeader from "@/components/ui/page-header";
import { supportTickets } from "@/data/support";
import {
  CheckCircle2,
  Clock3,
  Mail,
  Search,
} from "lucide-react";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

const filters = [
  "All",
  "Needs Reply",
  "Waiting on Member",
  "Resolved",
];

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

  const hasHQAccess = user.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER ||
      role.name === RoleName.COO ||
      role.name === RoleName.MEMBER_SERVICES ||
      role.name === RoleName.ADMINISTRATIVE_SERVICES ||
      role.name === RoleName.TECHNICAL_SUPPORT
  );

  if (!hasHQAccess) {
    redirect("/");
  }
    const needsReply = supportTickets.filter(
    (ticket) => ticket.status === "Needs Reply"
  ).length;

  const waiting = supportTickets.filter(
    (ticket) => ticket.status === "Waiting on Member"
  ).length;

  const resolved = supportTickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="Member Care"
          title="Support"
          description="Review member issues, open profiles, and respond through the official support inbox."
        />

        <section className="grid gap-4 md:grid-cols-3">
          <div className="panel rounded-3xl p-5">
            <Mail size={18} className="text-amber-300" />
            <p className="mt-4 text-2xl font-semibold">
              {needsReply}
            </p>
            <p className="mt-1 text-sm font-medium">
              Needs Reply
            </p>
            <p className="mt-2 text-xs text-[#727a74]">
              Waiting for the ATFT team
            </p>
          </div>

          <div className="panel rounded-3xl p-5">
            <Clock3 size={18} className="text-sky-300" />
            <p className="mt-4 text-2xl font-semibold">
              {waiting}
            </p>
            <p className="mt-1 text-sm font-medium">
              Waiting on Member
            </p>
            <p className="mt-2 text-xs text-[#727a74]">
              Follow-up may be required
            </p>
          </div>

          <div className="panel rounded-3xl p-5">
            <CheckCircle2
              size={18}
              className="text-emerald-300"
            />
            <p className="mt-4 text-2xl font-semibold">
              {resolved}
            </p>
            <p className="mt-1 text-sm font-medium">
              Resolved
            </p>
            <p className="mt-2 text-xs text-[#727a74]">
              Recently completed issues
            </p>
          </div>
        </section>

        <section className="panel mt-6 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#687069]"
              />

              <input
                type="search"
                placeholder="Search support..."
                className="h-12 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#606861] focus:border-emerald-400/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  className={
                    index === 0
                      ? "rounded-xl bg-emerald-400/12 px-4 py-2.5 text-xs font-medium text-emerald-300"
                      : "rounded-xl border border-white/[0.06] px-4 py-2.5 text-xs text-[#848c86] transition hover:bg-white/[0.03] hover:text-white"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-4">
          {supportTickets.map((ticket) => (
            <SupportTicketCard
              key={ticket.id}
              ticket={ticket}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}