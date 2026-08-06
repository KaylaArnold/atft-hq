import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";
import PageHeader from "@/components/ui/page-header";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  GraduationCap,
  Mail,
  PlayCircle,
  UserPlus,
  Users,
} from "lucide-react";

const operationsSummary = [
  {
    label: "Pending Enrollment",
    value: "3",
    detail: "Waiting for access or verification",
    icon: UserPlus,
  },
  {
    label: "Today's Live",
    value: "10:30 AM",
    detail: "Coach Arletta · Mini Drippers",
    icon: PlayCircle,
  },
  {
    label: "Open Follow-Ups",
    value: "6",
    detail: "Member and administrative tasks",
    icon: CircleAlert,
  },
  {
    label: "Next Milestone",
    value: "Graduation",
    detail: "August 25, 2026",
    icon: GraduationCap,
  },
];

const enrollmentQueue = [
  {
    title: "Verify payment",
    detail: "Confirm the member’s enrollment payment was completed.",
    count: "2 members",
  },
  {
    title: "Grant community access",
    detail: "Add verified members to the correct Mighty Networks spaces.",
    count: "3 members",
  },
  {
    title: "Send welcome instructions",
    detail: "Deliver login, orientation, and cohort information.",
    count: "1 member",
  },
];

const dailyChecklist = [
  {
    title: "Confirm today’s live session",
    detail: "Verify host, Zoom link, event listing, and coach assignment.",
    status: "Ready",
  },
  {
    title: "Review attendance",
    detail: "Check the latest attendance record and identify absences.",
    status: "Pending",
  },
  {
    title: "Upload today’s replay",
    detail: "Publish the recording to the Mini Drippers Replay Vault.",
    status: "After live",
  },
  {
    title: "Reply to support messages",
    detail: "Review member questions received through the support inbox.",
    status: "3 unread",
  },
];

const upcomingSchedule = [
  {
    date: "Today",
    time: "10:30 AM",
    title: "Mini Drippers Live",
    detail: "Daily Academy session with Coach Arletta",
    icon: PlayCircle,
  },
  {
    date: "This week",
    time: "Friday",
    title: "Attendance Review",
    detail: "Weekly participation and follow-up review",
    icon: Users,
  },
  {
    date: "Aug 25",
    time: "1:00 PM",
    title: "Drippers Graduation",
    detail: "Graduation event and certificate completion",
    icon: GraduationCap,
  },
];

const communicationActions = [
  {
    title: "Send cohort announcement",
    detail: "Share an operational update with all current members.",
    icon: Mail,
  },
  {
    title: "Send attendance follow-up",
    detail: "Contact members who missed required sessions.",
    icon: Users,
  },
  {
    title: "Send graduation reminder",
    detail: "Notify eligible members about upcoming requirements.",
    icon: GraduationCap,
  },
];

export default function AcademyOperationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="ATFT Academy"
          title="Operations"
          description="Manage enrollment, daily delivery, communications, attendance, replays, and graduation workflows."
        />

        <WorkspaceNav active="Operations" />

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {operationsSummary.map((item) => {
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

                      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#17201a]">
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

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Enrollment Queue
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Complete new member setup
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Review the remaining steps required before new members are
                  fully enrolled.
                </p>
              </div>

              <div className="mt-6 divide-y divide-[#e8ece9]">
                {enrollmentQueue.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="group flex w-full items-start gap-4 py-4 text-left first:pt-0 last:pb-0"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                      <UserPlus size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#2d3730]">
                        {item.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                        {item.detail}
                      </span>
                    </span>

                    <span className="shrink-0 rounded-full border border-[#e3e8e5] bg-[#fbfcfb] px-3 py-1.5 text-xs font-medium text-[#6f7a72]">
                      {item.count}
                    </span>

                    <ArrowRight
                      size={15}
                      className="mt-1 shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Daily Checklist
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Keep Academy delivery moving
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Complete the recurring operational work required each day.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                {dailyChecklist.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="group flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-[#e3e8e5] hover:bg-[#fbfcfb]"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#2d3730]">
                        {item.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                        {item.detail}
                      </span>
                    </span>

                    <span className="shrink-0 text-xs font-semibold text-[#6f7a72]">
                      {item.status}
                    </span>

                    <ArrowRight
                      size={14}
                      className="mt-1 shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                  <CalendarDays size={18} />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                    Upcoming Schedule
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#17201a]">
                    Important Academy dates
                  </h2>
                </div>
              </div>

              <div className="mt-6 divide-y divide-[#e8ece9]">
                {upcomingSchedule.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f4f7f5] text-emerald-700">
                        <Icon size={18} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-[#2d3730]">
                            {item.title}
                          </p>

                          <span className="rounded-full border border-[#e3e8e5] bg-[#fbfcfb] px-2.5 py-1 text-[11px] font-medium text-[#6f7a72]">
                            {item.date}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#77827a]">
                          {item.detail}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#6f7a72]">
                        <Clock3 size={14} />
                        {item.time}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="panel rounded-3xl p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Communications
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Reach the right members
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Start common Academy communications without leaving the
                  operations workspace.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {communicationActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="group flex w-full items-center gap-4 rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-4 text-left transition hover:border-emerald-700/20 hover:bg-white hover:shadow-sm"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                        <Icon size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#2d3730]">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#77827a]">
                          {item.detail}
                        </span>
                      </span>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}