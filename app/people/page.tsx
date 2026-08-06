import Link from "next/link";
import {
  Users,
  Briefcase,
  UserRound,
  ArrowRight,
} from "lucide-react";

import AppShell from "@/components/app-shell";

const sections = [
  {
    title: "Directory",
    description: "Search everyone across ATFT.",
    href: "/people/directory",
    icon: Users,
  },
  {
    title: "Members",
    description: "Manage students and community members.",
    href: "/members",
    icon: UserRound,
  },
  {
    title: "Employees",
    description: "View staff, coordinators, and leadership.",
    href: "/people/employees",
    icon: Briefcase,
  },
  {
    title: "Peer Coaches",
    description: "Manage coach assignments and accountability.",
    href: "/programs/atft-academy/coaches",
    icon: Users,
  },
];

export default function PeoplePage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
          People
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
          People Hub
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-[#6f7a72]">
          Manage every person connected to ATFT—from employees and coaches to
          members and future applicants.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {sections.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-700/20 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-700/10 text-emerald-700">
                  <Icon size={22} />
                </span>

                <ArrowRight
                  size={18}
                  className="text-[#9aa49d] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold text-[#17201a]">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}