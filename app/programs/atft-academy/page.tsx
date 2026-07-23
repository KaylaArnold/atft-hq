import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";
import PageHeader from "@/components/ui/page-header";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FolderOpen,
  Mail,
  PlayCircle,
  Users,
} from "lucide-react";

const quickActions = [
  {
    title: "Open Mighty Networks",
    description: "Community and member access",
    icon: Users,
    href: "#",
  },
  {
    title: "Open Support Gmail",
    description: "View and respond to support",
    icon: Mail,
    href: "#",
  },
  {
    title: "Open Google Calendar",
    description: "Classes, meetings, and deadlines",
    icon: CalendarDays,
    href: "#",
  },
  {
    title: "Open Replay Vault",
    description: "Manage class recordings",
    icon: PlayCircle,
    href: "#",
  },
  {
    title: "Open Google Drive",
    description: "Documents and shared resources",
    icon: FolderOpen,
    href: "#",
  },
  {
    title: "Open Payments",
    description: "Review enrollment payments",
    icon: CreditCard,
    href: "#",
  },
];

const tasks = [
  {
    title: "Verify new enrollments",
    detail: "Confirm payment and registration status.",
  },
  {
    title: "Grant community access",
    detail: "Add eligible members to the correct Mighty spaces.",
  },
  {
    title: "Reply to member emails",
    detail: "Review and respond through the support inbox.",
  },
  {
    title: "Upload today’s replay",
    detail: "Publish the recording to the Replay Vault.",
  },
  {
    title: "Review graduation progress",
    detail: "Check completion and certificate readiness.",
  },
];

const resources = [
  {
    title: "Welcome Email",
    type: "Email Template",
  },
  {
    title: "Enrollment SOP",
    type: "Standard Operating Procedure",
  },
  {
    title: "Community Access SOP",
    type: "Standard Operating Procedure",
  },
  {
    title: "Replay Checklist",
    type: "Checklist",
  },
  {
    title: "Graduation Checklist",
    type: "Checklist",
  },
];

export default function ATFTAcademyPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="Foundation · Level 1"
          title="ATFT Academy"
          description="Manage today's operations for the current Mini Drippers cohort."
        />

        <WorkspaceNav active="Command Center" />

        <div className="space-y-6">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Today&apos;s Status 
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17201a]">
                  Mini Drippers
                </h2>

                <p className="mt-2 text-sm text-[#667169]">
                  July–December 2026 cohort
                </p>
              </div>

              <span className="w-fit rounded-full border border-emerald-700/15 bg-emerald-700/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Active
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Current Cohort",
                  value: "Mini Drippers",
                  detail: "July–December 2026",
                },
                {
                  label: "Today's Live",
                  value: "10:30 AM",
                  detail: "Coach Arletta",
                },
                {
                  label: "Members",
                  value: "74",
                  detail: "Community access",
                },
                {
                  label: "Next Milestone",
                  value: "Graduation",
                  detail: "August 25, 2026",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-5"
                >
                  <p className="text-xs text-[#7d8880]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[#17201a]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-[#6f7a72]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Business Systems
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Open an ATFT system
                </h2>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {quickActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      className="group flex items-center gap-4 rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-4 transition hover:border-emerald-700/20 hover:bg-white hover:shadow-sm"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                        <Icon size={19} strokeWidth={1.8} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#2d3730]">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                          {item.description}
                        </span>
                      </span>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      />
                    </a>
                  );
                })}
              </div>
            </section>

            <section className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Today&apos;s Priorities
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Keep the program moving
                </h2>
              </div>

              <div className="mt-6 space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.title}
                    type="button"
                    className="group flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-[#e3e8e5] hover:bg-[#fbfcfb]"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#2d3730]">
                        {task.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                        {task.detail}
                      </span>
                    </span>

                    <ArrowRight
                      size={14}
                      className="mt-1 shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                <BookOpen size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Playbooks
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#17201a]">
                  Program guidance
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <button
                  key={resource.title}
                  type="button"
                  className="group flex items-center justify-between rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-5 text-left transition hover:border-emerald-700/20 hover:bg-white hover:shadow-sm"
                >
                  <span>
                    <span className="block text-sm font-medium text-[#2d3730]">
                      {resource.title}
                    </span>

                    <span className="mt-1 block text-xs text-[#77827a]">
                      {resource.type}
                    </span>
                  </span>

                  <ArrowRight
                    size={15}
                    className="text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}