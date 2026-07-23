import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import ProgramCard from "@/components/program-card";
import { programs } from "@/data/programs";

export default function ProgramsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Programs
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Program Management
          </h1>

          <p className="mt-2 text-[var(--text-muted)]">
            Manage all ATFT programs, enrollments, coaches, and operations.
          </p>
        </div>

        <button className="rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-white transition hover:opacity-90">
          + New Program
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Programs" value="8" />
        <StatCard title="Active Students" value="212" />
        <StatCard title="Monthly Revenue" value="$26,842" />
        <StatCard title="Open Enrollment" value="2" />
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"></section>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <p className="text-sm text-[var(--text-muted)]">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}