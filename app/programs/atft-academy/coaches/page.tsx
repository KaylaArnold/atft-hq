import {
  CheckCircle2,
  ShieldCheck,
  UsersRound,
  XCircle,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import PeerCoachTable from "@/components/coaches/peer-coach-table";
import WorkspaceNav from "@/components/workspace-nav";
import { peerCoaches } from "@/lib/mock-db/peer-coaches";

export default function PeerCoachesPage() {
  const peerCoachCount = peerCoaches.filter(
    (coach) => coach.role === "Peer Coach",
  ).length;

  const accountabilityCoachCount = peerCoaches.filter(
    (coach) => coach.role === "Accountability Coach",
  ).length;

  const attendedCount = peerCoaches.filter(
    (coach) => coach.meetingStatus === "Attended",
  ).length;

  const didNotAttendCount = peerCoaches.filter(
    (coach) => coach.meetingStatus === "Did Not Attend",
  ).length;

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
          ATFT Academy
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
          Peer Coaches
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6f7a72]">
          Manage peer coaches, accountability coaches, assignments, and weekly
          check-ins.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Peer Coaches"
            value={peerCoachCount}
            description="Supporting Academy members"
            icon={UsersRound}
          />

          <StatCard
            label="Accountability Coaches"
            value={accountabilityCoachCount}
            description="Focused on member accountability"
            icon={ShieldCheck}
          />

          <StatCard
            label="Attended"
            value={attendedCount}
            description="Recorded meeting attendance"
            icon={CheckCircle2}
          />

          <StatCard
            label="Did Not Attend"
            value={didNotAttendCount}
            description="May require follow-up"
            icon={XCircle}
          />
        </section>

        <div className="mt-6">
          <PeerCoachTable coaches={peerCoaches} />
        </div>
      </main>
    </AppShell>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#89938c]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
            {value}
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#6f7a72]">
        {description}
      </p>
    </article>
  );
}