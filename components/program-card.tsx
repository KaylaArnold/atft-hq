import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Program, ProgramStatus } from "@/data/programs";

type ProgramCardProps = {
  program: Program;
};

const statusStyles: Record<ProgramStatus, string> = {
  Active:
    "border border-emerald-700/15 bg-emerald-700/[0.07] text-emerald-700",
  Planned:
    "border border-amber-600/15 bg-amber-500/[0.08] text-amber-700",
  "Application Only":
    "border border-sky-600/15 bg-sky-500/[0.08] text-sky-700",
  "Invitation Only":
    "border border-[#d9dfdb] bg-[#f4f6f5] text-[#667169]",
};

export default function ProgramCard({ program }: ProgramCardProps) {
  const Icon = program.icon;

  return (
    <Link
      href={program.workspaceHref}
      className="panel group flex flex-col rounded-3xl p-6 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-[0_12px_35px_rgba(15,23,18,0.08)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-700/[0.08] text-emerald-700">
            <Icon size={20} strokeWidth={1.8} />
          </span>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {program.stage}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7d8880]">
              Level {program.level}
            </p>
          </div>
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#8d9790] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700"
        />
      </div>

      <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#17201a]">
        {program.title}
      </h2>

      <p className="mt-2 text-sm text-[#748078]">
        Current Cohort · {program.shortTitle}
      </p>

      <p className="mt-4 text-sm font-medium text-emerald-700">
        {program.tagline}
      </p>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#667169]">
        {program.description}
      </p>

      <div className="mt-7 grid gap-6 border-t border-[#e5e9e6] pt-6 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7d8880]">
            Primary audience
          </p>

          <p className="mt-2 text-sm leading-6 text-[#566159]">
            {program.audience}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7d8880]">
            Investment
          </p>

          <p className="mt-2 text-sm font-medium text-[#2c3730]">
            {program.investment}
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-[#e5e9e6] pt-5">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusStyles[program.status]}`}
        >
          {program.status}
        </span>

        <span className="flex items-center gap-2 text-sm font-medium text-[#667169] transition group-hover:text-emerald-700">
          Open Workspace
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}