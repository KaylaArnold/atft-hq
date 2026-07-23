import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";
import PageHeader from "@/components/ui/page-header";

import {
  ArrowRight,
  GraduationCap,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

const peopleSummary = [
  {
    label: "Active Members",
    value: "74",
    detail: "Current Mini Drippers cohort",
    icon: Users,
  },
  {
    label: "Coaches",
    value: "4",
    detail: "Assigned to Academy delivery",
    icon: ShieldCheck,
  },
  {
    label: "Needs Attention",
    value: "6",
    detail: "Access, attendance, or payment issues",
    icon: UserCheck,
  },
  {
    label: "Graduation Ready",
    value: "18",
    detail: "Currently meeting requirements",
    icon: GraduationCap,
  },
];

const peopleGroups = [
  {
    title: "Current Members",
    description:
      "View active students, enrollment status, community access, and cohort participation.",
    count: "74 members",
    icon: Users,
  },
  {
    title: "Coaches & Staff",
    description:
      "Manage the coaches and team members responsible for Academy delivery and support.",
    count: "4 team members",
    icon: ShieldCheck,
  },
  {
    title: "Graduation Candidates",
    description:
      "Review completion progress, certificate readiness, and graduation requirements.",
    count: "18 candidates",
    icon: GraduationCap,
  },
];

const attentionItems = [
  {
    name: "Pending community access",
    detail: "3 members have paid but still need Mighty Networks access.",
    status: "3 members",
  },
  {
    name: "Attendance follow-up",
    detail: "2 members have missed multiple live sessions this week.",
    status: "2 members",
  },
  {
    name: "Payment review",
    detail: "1 member has an unresolved payment status.",
    status: "1 member",
  },
];

export default function AcademyPeoplePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="ATFT Academy"
          title="People"
          description="Manage the members, coaches, and graduation candidates connected to the current Academy cohort."
        />

        <WorkspaceNav active="People" />

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {peopleSummary.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="panel rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
                        {item.label}
                      </p>

                      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
                        {item.value}
                      </p>
                    </div>

                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#6f7a72]">
                    {item.detail}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  People Directory
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Find an Academy member
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Search by name, email address, cohort, or enrollment status.
                </p>
              </div>

              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89938c]"
                />

                <input
                  type="search"
                  placeholder="Search people..."
                  className="h-12 w-full rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] pl-11 pr-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#98a19a] focus:border-emerald-700/30 focus:bg-white focus:ring-4 focus:ring-emerald-700/5"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {peopleGroups.map((group) => {
              const Icon = group.icon;

              return (
                <button
                  key={group.title}
                  type="button"
                  className="panel group flex min-h-[230px] flex-col rounded-3xl p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-700/10 text-emerald-700">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>

                    <span className="rounded-full border border-[#e3e8e5] bg-[#fbfcfb] px-3 py-1.5 text-xs font-medium text-[#6f7a72]">
                      {group.count}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#17201a]">
                    {group.title}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-6 text-[#6f7a72]">
                    {group.description}
                  </p>

                  <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    Open directory

                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </button>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Needs Attention
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Member follow-up
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  People-related items that may require action from the Academy
                  team.
                </p>
              </div>

              <div className="mt-6 divide-y divide-[#e8ece9]">
                {attentionItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="group flex w-full items-center gap-4 py-4 text-left first:pt-0 last:pb-0"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-700">
                      <UserCheck size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#2d3730]">
                        {item.name}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                        {item.detail}
                      </span>
                    </span>

                    <span className="shrink-0 text-xs font-semibold text-[#6f7a72]">
                      {item.status}
                    </span>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel rounded-3xl p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                <Mail size={19} />
              </span>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                Communications
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                Contact the cohort
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                Send an announcement, enrollment reminder, attendance follow-up,
                or graduation update to selected Academy members.
              </p>

              <button
                type="button"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Create communication
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}