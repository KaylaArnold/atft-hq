import {
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ProgramCard from "@/components/program-card";
import PageHeader from "@/components/ui/page-header";
import { programs } from "@/data/programs";

const ecosystemSummary = [
  {
    title: "Defined Levels",
    value: "4",
    description: "A connected path from education to legacy.",
    icon: Layers3,
  },
  {
    title: "Entry Point",
    value: "Academy",
    description: "The foundation for learning structured trading.",
    icon: GraduationCap,
  },
  {
    title: "Growth Path",
    value: "Alignment",
    description: "Personal transformation and wealth stewardship.",
    icon: Sparkles,
  },
  {
    title: "Highest Level",
    value: "Legacy",
    description: "Building, protecting, and transferring wealth.",
    icon: ShieldCheck,
  },
];

export default function ProgramsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 pb-10 pt-10">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Programs"
          title="The ATFT Ecosystem"
          description="Four connected levels guide members from learning how to trade to building, protecting, and transferring generational wealth."
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ecosystemSummary.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {item.title}
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">
                      {item.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={18} />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="panel overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Member Journey
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--text)]">
              From learning to legacy
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              Each level has a distinct purpose, member identity, operating
              structure, and desired outcome. Open a workspace to manage the
              people and delivery behind that stage of the ecosystem.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.title}
                program={program}
                position={index + 1}
                totalPrograms={programs.length}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}