import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Program, ProgramStatus } from "@/data/programs";

type ProgramCardProps = {
  program: Program;
  position?: number;
  totalPrograms?: number;
};

const statusStyles: Record<ProgramStatus, string> = {
  Active:
    "border border-emerald-700/15 bg-emerald-700/[0.07] text-emerald-700",
  Planned:
    "border border-amber-600/15 bg-amber-500/[0.08] text-amber-700",
  "Application Only":
    "border border-sky-600/15 bg-sky-500/[0.08] text-sky-700",
  "Invitation Only":
    "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]",
};

export default function ProgramCard({
  program,
  position,
  totalPrograms,
}: ProgramCardProps) {
  const Icon = program.icon;

  const isFinalLevel =
    position !== undefined &&
    totalPrograms !== undefined &&
    position === totalPrograms;

  return (
    <article className="group flex min-h-[330px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon size={20} strokeWidth={1.8} />
        </div>

        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
          Level {program.level}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {program.stage}
          </p>

          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusStyles[program.status]}`}
          >
            {program.status}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-bold tracking-tight text-[var(--text)]">
          {program.title}
        </h2>

        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
          {program.shortTitle}
        </p>

        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
          {program.tagline}
        </p>
      </div>

      <div className="mt-auto pt-6">
        {position !== undefined && totalPrograms !== undefined && (
          <div className="mb-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent)]">
              {position}
            </span>

            <span>
              {isFinalLevel
                ? "Final level of the ecosystem"
                : `Progresses toward Level ${position + 1}`}
            </span>
          </div>
        )}

        <Link
          href={program.workspaceHref}
          className="inline-flex w-full items-center justify-between rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition group-hover:bg-[var(--accent)] group-hover:text-white"
        >
          Open Workspace
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}