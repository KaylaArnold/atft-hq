"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  PlayCircle,
  Plus,
  Users,
  UsersRound,
} from "lucide-react";
import AppShell from "./app-shell";

const snapshot = [
  {
    label: "Pending Enrollments",
    value: "7",
    detail: "Deposits awaiting registration",
    icon: UsersRound,
  },
  {
    label: "Support Queue",
    value: "2",
    detail: "Member emails waiting",
    icon: Mail,
  },
  {
    label: "Classes Today",
    value: "1",
    detail: "Mini Drippers at 10:30 AM",
    icon: CalendarDays,
  },
  {
    label: "Payments",
    value: "70",
    detail: "Paid Mini Drippers",
    icon: CreditCard,
  },
];

const quickActions = [
  {
    title: "Mighty Networks",
    description: "Open the ATFT Network",
    icon: Users,
  },
  {
    title: "Support Gmail",
    description: "Open the support inbox",
    icon: Mail,
  },
  {
    title: "Google Calendar",
    description: "View classes and deadlines",
    icon: CalendarDays,
  },
  {
    title: "Replay Vault",
    description: "Manage class recordings",
    icon: PlayCircle,
  },
  {
    title: "Payments",
    description: "Review enrollment payments",
    icon: CreditCard,
  },
  {
    title: "Knowledge Center",
    description: "Find SOPs and templates",
    icon: BookOpen,
  },
];

const schedule = [
  {
    time: "10:30 AM",
    title: "Mini Drippers Live",
    detail: "Coach Arletta · 60 minutes",
    active: true,
  },
  {
    time: "12:00 PM",
    title: "Support Review",
    detail: "Operations · 30 minutes",
    active: false,
  },
  {
    time: "2:00 PM",
    title: "Graduation Planning",
    detail: "Internal · 45 minutes",
    active: false,
  },
];

const recentUpdates = [
  {
    title: "Mini Dripper Enrollment SOP",
    type: "Standard Operating Procedure",
  },
  {
    title: "Community Access Response",
    type: "Email Template",
  },
  {
    title: "Replay Vault Checklist",
    type: "Checklist",
  },
];

export function Dashboard() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {today}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-[42px]">
              Good morning, Kayla.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#858e88]">
              Everything you need to keep ATFT moving today.
            </p>
          </div>

          <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-xs font-semibold text-[#06110a] transition hover:bg-emerald-300">
            <Plus size={15} />
            Quick Action
          </button>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
              Today&apos;s Snapshot
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              What needs your attention
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshot.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.035]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Icon size={18} />
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-[#505752] transition group-hover:translate-x-1 group-hover:text-emerald-300"
                    />
                  </div>

                  <p className="mt-5 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-[#e2e7e3]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#727a74]">
                    {item.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                Quick Access
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Open an ATFT system
              </h2>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.035]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Icon size={19} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#e4e8e5]">
                        {item.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#737a75]">
                        {item.description}
                      </span>
                    </span>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-[#58605a] transition group-hover:translate-x-1 group-hover:text-emerald-300"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                Today&apos;s Schedule
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Your day at a glance
              </h2>
            </div>

            <div className="mt-6 divide-y divide-white/[0.06]">
              {schedule.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-[72px] shrink-0 text-xs font-medium text-[#7d857f]">
                    {item.time}
                  </div>

                  <span
                    className={`h-10 w-0.5 rounded-full ${
                      item.active ? "bg-emerald-400" : "bg-white/10"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#e3e8e4]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-[#727973]">
                      {item.detail}
                    </p>
                  </div>

                  {item.active && (
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                      Next
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <CheckCircle2 size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                  Announcement
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Company update
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5">
              <p className="text-sm font-medium text-[#e3e8e4]">
                Founder&apos;s Day giving remains open through Sunday.
              </p>

              <p className="mt-2 text-xs leading-5 text-[#737a75]">
                Continue directing contribution questions to the official
                support inbox.
              </p>
            </div>
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <FileText size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                  Knowledge Center
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Recently updated
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {recentUpdates.map((item) => (
                <button
                  key={item.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.035]"
                >
                  <p className="text-sm font-medium text-[#e2e6e3]">
                    {item.title}
                  </p>

                  <p className="mt-2 text-xs text-[#707772]">
                    {item.type}
                  </p>

                  <ArrowRight
                    size={15}
                    className="mt-5 text-[#505752] transition group-hover:translate-x-1 group-hover:text-emerald-300"
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