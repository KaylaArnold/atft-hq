"use client";

import Link from "next/link";
import { useHQ } from "@/context/HQContext";
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
    href: "/members",
  },
  {
    label: "Support Queue",
    value: "2",
    detail: "Member emails waiting",
    icon: Mail,
    href: "/member-care",
  },
  {
    label: "Classes Today",
    value: "1",
    detail: "Mini Drippers at 10:30 AM",
    icon: CalendarDays,
    href: "/calendar",
  },
  {
    label: "Payments",
    value: "70",
    detail: "Paid Mini Drippers",
    icon: CreditCard,
    href: "/members",
  },
];

const quickActions = [
  {
    title: "Mighty Networks",
    description: "Open the ATFT Network",
    icon: Users,
    href: "https://arletta-the-friendly-trader.mn.co/",
    external: true,
  },
  {
    title: "Support Gmail",
    description: "Open the support inbox",
    icon: Mail,
    href: "https://mail.google.com/mail/u/support@arlettathefriendlytrader.com/#inbox",
    external: true,
  },
  {
    title: "Google Calendar",
    description: "View classes and deadlines",
    icon: CalendarDays,
    href: "https://calendar.google.com",
    external: true,
  },
  {
    title: "Replay Vault",
    description: "Manage class recordings",
    icon: PlayCircle,
    href: "/resources",
    external: false,
  },
  {
    title: "Payments",
    description: "Review enrollment payments",
    icon: CreditCard,
    href: "/members",
    external: false,
  },
  {
    title: "Knowledge Center",
    description: "Find SOPs and templates",
    icon: BookOpen,
    href: "/resources",
    external: false,
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
    href: "/resources",
  },
  {
    title: "Community Access Response",
    type: "Email Template",
    href: "/resources",
  },
  {
    title: "Replay Vault Checklist",
    type: "Checklist",
    href: "/resources",
  },
];

export function Dashboard() {
  const { tickets } = useHQ();

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const openTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Resolved"
  ).length;

  const liveSnapshot = snapshot.map((item) => {
    if (item.label !== "Support Queue") {
      return item;
    }

    return {
      ...item,
      value: String(openTicketCount),
      detail:
        openTicketCount === 1
          ? "1 member email waiting"
          : `${openTicketCount} member emails waiting`,
    };
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {today}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
              Good morning, Kayla.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Everything you need to keep ATFT moving today.
            </p>
          </div>

          <Link
            href="/operations"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
          >
            <Plus size={15} />
            Quick Action
          </Link>
        </section>

        <section className="panel mt-9 rounded-3xl p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Today&apos;s Snapshot
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
              What needs your attention
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {liveSnapshot.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    />
                  </div>

                  <p className="mt-5 text-2xl font-semibold text-[var(--text)]">
                    {item.value}
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text)]">
                    {item.label}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {item.detail}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Quick Access
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
                Open an ATFT system
              </h2>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-left transition hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={19} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--text)]">
                        {item.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">
                        {item.description}
                      </span>
                    </span>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Today&apos;s Schedule
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
                Your day at a glance
              </h2>
            </div>

            <div className="mt-6 divide-y divide-[var(--border)]">
              {schedule.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-[72px] shrink-0 text-xs font-medium text-[var(--text-muted)]">
                    {item.time}
                  </div>

                  <span
                    className={`h-10 w-0.5 rounded-full ${
                      item.active
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--border-strong)]"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {item.detail}
                    </p>
                  </div>

                  {item.active && (
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
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
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <CheckCircle2 size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Announcement
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                  Company update
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] p-5">
              <p className="text-sm font-medium text-[var(--text)]">
                Founder&apos;s Day giving remains open through Sunday.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                Continue directing contribution questions to the official
                support inbox.
              </p>
            </div>
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileText size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Knowledge Center
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                  Recently updated
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {recentUpdates.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-left transition hover:border-[var(--accent)]/20 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-sm font-medium text-[var(--text)]">
                    {item.title}
                  </p>

                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {item.type}
                  </p>

                  <ArrowRight
                    size={15}
                    className="mt-5 text-[var(--text-light)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}