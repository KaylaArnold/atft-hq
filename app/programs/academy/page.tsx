import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MessageSquareText,
  Radio,
  Upload,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  DashboardGrid,
  MetricCard,
  SectionCard,
  StatusBadge,
} from "@/components/hq";
import ProgramWorkspaceLayout from "@/components/program-workspace/ProgramWorkspaceLayout";
import { programs } from "@/data/programs";

const academy = programs.find((program) => program.slug === "academy");

const operations = [
  {
    title: "Morning Meetup",
    description: "Daily preparation and market review",
    time: "8:45 AM",
    status: "completed" as const,
    icon: CheckCircle2,
  },
  {
    title: "Live Trading Session",
    description: "Structured market instruction",
    time: "10:30 AM",
    status: "upcoming" as const,
    icon: Radio,
  },
  {
    title: "Homework Review",
    description: "Student assignment review",
    time: "2:00 PM",
    status: "scheduled" as const,
    icon: CalendarCheck,
  },
  {
    title: "Replay Upload",
    description: "Publish today’s training replay",
    time: "6:00 PM",
    status: "pending" as const,
    icon: Upload,
  },
];

const studentHealth = [
  {
    label: "On Track",
    value: 168,
    description: "Meeting attendance and assignment expectations",
    status: "healthy" as const,
  },
  {
    label: "Falling Behind",
    value: 31,
    description: "Needs a check-in or additional support",
    status: "warning" as const,
  },
  {
    label: "Needs Intervention",
    value: 13,
    description: "Immediate coach follow-up recommended",
    status: "danger" as const,
  },
];

const coachWorkload = [
  {
    name: "Coach Arletta",
    role: "Lead Coach",
    students: 84,
    followUps: 6,
  },
  {
    name: "Coach Trent",
    role: "Coach",
    students: 52,
    followUps: 8,
  },
  {
    name: "Peer Coach One",
    role: "Peer Coach",
    students: 38,
    followUps: 4,
  },
  {
    name: "Peer Coach Two",
    role: "Peer Coach",
    students: 38,
    followUps: 2,
  },
];

const recentActivity = [
  {
    title: "Attendance follow-up assigned",
    description: "Six students were assigned to Coach Trent.",
    time: "18 minutes ago",
    icon: UserRoundCheck,
  },
  {
    title: "Replay added to the vault",
    description: "The latest live trading session is now available.",
    time: "1 hour ago",
    icon: Upload,
  },
  {
    title: "Coach note added",
    description: "A progress note was added for a student needing support.",
    time: "2 hours ago",
    icon: MessageSquareText,
  },
];

export default function AcademyPage() {
  if (!academy) {
    notFound();
  }

  return (
    <ProgramWorkspaceLayout program={academy}>
      <div className="space-y-6">
        <DashboardGrid columns={4} gap="sm">
          <MetricCard
            title="Students"
            value="212"
            subtitle="18 joined this cohort"
            icon={<Users size={19} />}
          />

          <MetricCard
            title="Peer Coaches"
            value="4"
            subtitle="All students assigned"
            icon={<UserRoundCheck size={19} />}
          />

          <MetricCard
            title="Need Attention"
            value="27"
            subtitle="Follow-up recommended"
            icon={<AlertTriangle size={19} />}
            detail={
              <StatusBadge
                status="warning"
                label="Review"
              />
            }
          />

          <MetricCard
            title="Weekly Attendance"
            value="94%"
            subtitle="Past seven days"
            icon={<CalendarCheck size={19} />}
            detail={
              <StatusBadge
                status="healthy"
                label="Healthy"
              />
            }
          />
        </DashboardGrid>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <SectionCard
            title="Today’s Operations"
            description="The Academy schedule and delivery tasks requiring attention today."
            contentClassName="divide-y divide-[var(--border)] p-0"
          >
            {operations.map((operation) => {
              const Icon = operation.icon;

              return (
                <div
                  key={operation.title}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text)]">
                        {operation.title}
                      </p>

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {operation.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                      <Clock3 size={15} />
                      {operation.time}
                    </div>

                    <StatusBadge status={operation.status} />
                  </div>
                </div>
              );
            })}
          </SectionCard>

          <SectionCard
            title="Student Health"
            description="A quick view of students who may require additional support."
            contentClassName="space-y-3"
          >
            {studentHealth.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--text)]">
                        {group.label}
                      </p>

                      <StatusBadge
                        status={group.status}
                        label={group.label}
                      />
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      {group.description}
                    </p>
                  </div>

                  <p className="shrink-0 text-2xl font-bold tracking-tight text-[var(--text)]">
                    {group.value}
                  </p>
                </div>
              </div>
            ))}
          </SectionCard>
        </div>

        <DashboardGrid columns={2}>
          <SectionCard
            title="Coach Workload"
            description="Current student assignments and outstanding follow-ups."
            action={
              <button
                type="button"
                className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
              >
                View coaches
              </button>
            }
            contentClassName="divide-y divide-[var(--border)] p-0"
          >
            {coachWorkload.map((coach) => (
              <div
                key={coach.name}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                    {coach.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text)]">
                      {coach.name}
                    </p>

                    <p className="text-sm text-[var(--text-muted)]">
                      {coach.role} · {coach.students} students
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-semibold text-[var(--text)]">
                    {coach.followUps}
                  </p>

                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    Follow-ups
                  </p>
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Graduation Readiness"
            description="Progress toward completing the current Academy experience."
            action={
              <StatusBadge
                status="healthy"
                label="84% Complete"
              />
            }
          >
            <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <GraduationCap size={22} />
                </div>

                <div>
                  <p className="text-3xl font-bold tracking-tight text-[var(--text)]">
                    84%
                  </p>

                  <p className="text-sm text-[var(--text-muted)]">
                    Overall cohort completion
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full w-[84%] rounded-full bg-[var(--accent)]" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ReadinessMetric
                label="Ready"
                value="12"
                status="healthy"
              />

              <ReadinessMetric
                label="At Risk"
                value="8"
                status="warning"
              />

              <ReadinessMetric
                label="Missing Items"
                value="3"
                status="danger"
              />
            </div>
          </SectionCard>
        </DashboardGrid>

        <SectionCard
          title="Recent Academy Activity"
          description="The latest operational updates across the workspace."
          action={
            <button
              type="button"
              className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              View all activity
            </button>
          }
          contentClassName="divide-y divide-[var(--border)] p-0"
        >
          {recentActivity.map((activity) => {
            const Icon = activity.icon;

            return (
              <div
                key={activity.title}
                className="flex items-start gap-4 px-6 py-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--text)]">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {activity.description}
                  </p>
                </div>

                <p className="hidden shrink-0 text-sm text-[var(--text-muted)] sm:block">
                  {activity.time}
                </p>
              </div>
            );
          })}
        </SectionCard>
      </div>
    </ProgramWorkspaceLayout>
  );
}

function ReadinessMetric({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "healthy" | "warning" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
          {value}
        </p>

        <StatusBadge
          status={status}
          label={label}
        />
      </div>
    </div>
  );
}