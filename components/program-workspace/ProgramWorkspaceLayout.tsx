import { ReactNode } from "react";
import type { Program } from "@/data/programs";

type ProgramWorkspaceLayoutProps = {
  program: Program;
  children: ReactNode;
};

export default function ProgramWorkspaceLayout({
  program,
  children,
}: ProgramWorkspaceLayoutProps) {
  const Icon = program.icon;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Level {program.level}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {program.stage}
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--text)]">
                {program.title}
              </h1>

              <p className="mt-2 text-lg text-[var(--text-secondary)]">
                {program.shortTitle}
              </p>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                {program.tagline}
              </p>
            </div>

            <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:grid-cols-2 lg:min-w-[320px]">
              <Metric
                label="Status"
                value={program.status}
              />

              <Metric
                label="Investment"
                value={program.investment}
              />

              <Metric
                label="Audience"
                value={program.audience}
              />

              <Metric
                label="Stage"
                value={`Level ${program.level}`}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <WorkspacePill active>Command Center</WorkspacePill>
            <WorkspacePill>People</WorkspacePill>
            <WorkspacePill>Learning</WorkspacePill>
            <WorkspacePill>Operations</WorkspacePill>
            <WorkspacePill>Analytics</WorkspacePill>
            <WorkspacePill>Settings</WorkspacePill>
          </div>
        </div>
      </section>

      <section>{children}</section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}

function WorkspacePill({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={[
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}