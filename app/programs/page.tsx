import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import ProgramCard from "@/components/program-card";
import { programs } from "@/data/programs";

export default function ProgramsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="The ATFT Journey"
          title="Programs"
          description="A progression from learning how to trade to building, protecting, and transferring generational wealth."
        />

        <div className="space-y-12">
          {programs.map((program) => (
            <section key={program.id}>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full border border-emerald-700/15 bg-emerald-700/[0.07] text-sm font-bold text-emerald-700">
                  {program.level}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {program.stage}
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#17201a]">
                    {program.title}
                  </h2>
                </div>
              </div>

              <ProgramCard program={program} />
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}