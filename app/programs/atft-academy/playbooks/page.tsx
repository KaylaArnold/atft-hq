import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";
import PageHeader from "@/components/ui/page-header";

import {
  ArrowRight,
  BookOpenCheck,
  CheckSquare,
  FileText,
  FolderOpen,
  Mail,
  PlayCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

const playbookSummary = [
  {
    label: "SOPs",
    value: "8",
    detail: "Documented operating procedures",
    icon: ShieldCheck,
  },
  {
    label: "Templates",
    value: "6",
    detail: "Reusable emails and documents",
    icon: FileText,
  },
  {
    label: "Checklists",
    value: "5",
    detail: "Step-by-step operational guides",
    icon: CheckSquare,
  },
  {
    label: "Training Guides",
    value: "4",
    detail: "Staff walkthroughs and videos",
    icon: PlayCircle,
  },
];

const categories = [
  {
    title: "Standard Operating Procedures",
    description:
      "Documented processes for enrollment, community access, attendance, replays, communications, and graduation.",
    count: "8 SOPs",
    icon: ShieldCheck,
  },
  {
    title: "Email & Document Templates",
    description:
      "Reusable messages and documents for member onboarding, reminders, follow-ups, and support.",
    count: "6 templates",
    icon: Mail,
  },
  {
    title: "Operational Checklists",
    description:
      "Step-by-step checklists that help the team complete recurring Academy responsibilities correctly.",
    count: "5 checklists",
    icon: CheckSquare,
  },
  {
    title: "Training & Walkthroughs",
    description:
      "Internal guides and video walkthroughs for systems, processes, and staff responsibilities.",
    count: "4 guides",
    icon: PlayCircle,
  },
];

const featuredResources = [
  {
    title: "Enrollment SOP",
    type: "Standard Operating Procedure",
    description:
      "Verify payment, confirm registration, grant access, and send welcome instructions.",
    updated: "Updated recently",
  },
  {
    title: "Community Access SOP",
    type: "Standard Operating Procedure",
    description:
      "Add eligible members to the correct Mighty Networks spaces and confirm access.",
    updated: "Updated recently",
  },
  {
    title: "Welcome Email",
    type: "Email Template",
    description:
      "Send new members their login, orientation, schedule, and support information.",
    updated: "Ready to use",
  },
  {
    title: "Replay Publishing Checklist",
    type: "Checklist",
    description:
      "Prepare, title, upload, organize, and verify each Academy replay.",
    updated: "Ready to use",
  },
  {
    title: "Attendance Follow-Up",
    type: "Email Template",
    description:
      "Contact members who have missed required sessions or need participation support.",
    updated: "Ready to use",
  },
  {
    title: "Graduation Checklist",
    type: "Checklist",
    description:
      "Review completion status, certificates, communications, and event readiness.",
    updated: "Updated recently",
  },
];

const recentlyUsed = [
  {
    title: "Welcome Email",
    type: "Email Template",
  },
  {
    title: "Enrollment SOP",
    type: "Standard Operating Procedure",
  },
  {
    title: "Replay Publishing Checklist",
    type: "Checklist",
  },
];

export default function AcademyPlaybooksPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="ATFT Academy"
          title="Playbooks"
          description="Access the SOPs, templates, checklists, and training guides used to operate the Academy consistently."
        />

        <WorkspaceNav active="Playbooks" />

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {playbookSummary.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="panel rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
                        {item.label}
                      </p>

                      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
                        {item.value}
                      </p>
                    </div>

                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#6f7a72]">
                    {item.detail}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Knowledge Library
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Find an Academy resource
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Search by title, resource type, process, or keyword.
                </p>
              </div>

              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89938c]"
                />

                <input
                  type="search"
                  placeholder="Search playbooks..."
                  className="h-12 w-full rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] pl-11 pr-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#98a19a] focus:border-emerald-700/30 focus:bg-white focus:ring-4 focus:ring-emerald-700/5"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.title}
                  type="button"
                  className="panel group flex min-h-[250px] flex-col rounded-3xl p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-700/10 text-emerald-700">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>

                    <span className="rounded-full border border-[#e3e8e5] bg-[#fbfcfb] px-3 py-1.5 text-xs font-medium text-[#6f7a72]">
                      {category.count}
                    </span>
                  </div>

                  <h2 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-[#17201a]">
                    {category.title}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-6 text-[#6f7a72]">
                    {category.description}
                  </p>

                  <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    Browse resources

                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </button>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="panel rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                  <BookOpenCheck size={18} />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                    Featured Resources
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#17201a]">
                    Common Academy playbooks
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {featuredResources.map((resource) => (
                  <button
                    key={resource.title}
                    type="button"
                    className="group flex min-h-[175px] flex-col rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] p-5 text-left transition hover:border-emerald-700/20 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#2d3730]">
                          {resource.title}
                        </p>

                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          {resource.type}
                        </p>
                      </div>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      />
                    </div>

                    <p className="mt-4 flex-1 text-xs leading-5 text-[#77827a]">
                      {resource.description}
                    </p>

                    <p className="mt-4 text-[11px] font-medium text-[#89938c]">
                      {resource.updated}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <section className="panel rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                    <FolderOpen size={18} />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                      Recently Used
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-[#17201a]">
                      Continue working
                    </h2>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-[#e8ece9]">
                  {recentlyUsed.map((resource) => (
                    <button
                      key={resource.title}
                      type="button"
                      className="group flex w-full items-center gap-4 py-4 text-left first:pt-0 last:pb-0"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f7f5] text-emerald-700">
                        <FileText size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#2d3730]">
                          {resource.title}
                        </span>

                        <span className="mt-1 block text-xs text-[#77827a]">
                          {resource.type}
                        </span>
                      </span>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-[#98a19a] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      />
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel rounded-3xl p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Missing Something?
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Add a new resource
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                  Create or upload an SOP, template, checklist, policy, or
                  training guide for the Academy team.
                </p>

                <button
                  type="button"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Add resource
                  <ArrowRight size={15} />
                </button>
              </section>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}