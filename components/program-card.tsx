import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Program, ProgramStatus } from "@/data/programs";

type ProgramCardProps = {
  program: Program;
};

const statusStyles: Record<ProgramStatus, string> = {
  Active:
    "border border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
  Planned:
    "border border-amber-400/15 bg-amber-400/10 text-amber-300",
  "Application Only":
    "border border-sky-400/15 bg-sky-400/10 text-sky-300",
  "Invitation Only":
    "border border-white/[0.08] bg-white/[0.04] text-[#aab2ac]",
};

export default function ProgramCard({ program }: ProgramCardProps) {
  const Icon = program.icon;

  return (
    <Link
      href={program.workspaceHref}
      className="panel group flex flex-col rounded-3xl p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-400/20 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Icon size={20} strokeWidth={1.8} />
          </span>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {program.stage}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#6f7871]">
              Level {program.level}
            </p>
          </div>
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#59615b] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300"
        />
      </div>

      <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">
        {program.title}
      </h2>

      <p className="mt-2 text-sm text-[#8d9690]">
        Current Cohort • {program.shortTitle}
      </p>

      <p className="mt-4 text-sm font-medium text-emerald-300">
        {program.tagline}
      </p>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#858e88]">
        {program.description}
      </p>

      <div className="mt-7 grid gap-6 border-t border-white/[0.06] pt-6 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#626a64]">
            Primary audience
          </p>

          <p className="mt-2 text-sm leading-6 text-[#a5ada7]">
            {program.audience}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#626a64]">
            Investment
          </p>

          <p className="mt-2 text-sm font-medium text-[#e3e8e4]">
            {program.investment}
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-5">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusStyles[program.status]}`}
        >
          {program.status}
        </span>

        <span className="flex items-center gap-2 text-sm font-medium text-[#8f9891] transition group-hover:text-emerald-300">
          Open Workspace
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}