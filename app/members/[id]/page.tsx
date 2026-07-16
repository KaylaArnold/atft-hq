import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import { members } from "@/data/members";
import {
  ArrowLeft,
  FileText,
  Mail,
  NotebookPen,
  Phone,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity" },
  { label: "Support", value: "support" },
  { label: "Notes", value: "notes" },
  { label: "Files", value: "files" },
] as const;

type MemberProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function MemberProfilePage({
  params,
  searchParams,
}: MemberProfilePageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  const member = members.find((item) => String(item.id) === id);

  if (!member) {
    notFound();
  }

  const activeTab = tabs.some((item) => item.value === tab)
    ? tab
    : "overview";

  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/members"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#7f8881] transition hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          Back to Members
        </Link>

        <PageHeader
          eyebrow="Member Workspace"
          title={member.name}
          description={`${member.program} member record, support history, notes, and files.`}
        />

        <div className="mb-8 overflow-x-auto">
          <nav className="inline-flex min-w-max rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1">
            {tabs.map((item) => {
              const isActive = activeTab === item.value;

              return (
                <Link
                  key={item.value}
                  href={`/members/${member.id}?tab=${item.value}`}
                  className={
                    isActive
                      ? "rounded-xl bg-emerald-400/15 px-5 py-2.5 text-sm font-medium text-emerald-300"
                      : "rounded-xl px-5 py-2.5 text-sm font-medium text-[#808781] transition hover:bg-white/[0.03] hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="panel rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-base font-semibold text-emerald-300">
                  {initials}
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{member.name}</h2>
                  <p className="mt-1 text-sm text-[#7f8881]">
                    {member.program}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-emerald-300" />

                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="truncate text-[#d0d7d2] hover:text-emerald-300"
                    >
                      {member.email}
                    </a>
                  ) : (
                    <span className="text-[#6f7771]">
                      No email on file
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-emerald-300" />

                  {member.phone ? (
                    <a
                      href={`tel:${member.phone}`}
                      className="text-[#a6afa8] hover:text-emerald-300"
                    >
                      {member.phone}
                    </a>
                  ) : (
                    <span className="text-[#6f7771]">
                      No phone number on file
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-6">
                <StatusRow
                  icon={ShieldCheck}
                  label="Community"
                  value={member.community ? "Access Granted" : "No Access"}
                  tone={member.community ? "success" : "warning"}
                />

                <StatusRow
                  icon={WalletCards}
                  label="Payments"
                  value={member.payments}
                  tone={
                    member.payments === "Current" ? "success" : "warning"
                  }
                />

                <StatusRow
                  icon={Mail}
                  label="Support"
                  value={member.support}
                  tone={
                    member.support === "Waiting Reply"
                      ? "warning"
                      : "success"
                  }
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    Email Member
                  </a>
                )}

                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    Call Member
                  </a>
                )}

                <Link
                  href={`/members/${member.id}?tab=notes`}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
                >
                  <NotebookPen size={14} />
                  Add Note
                </Link>
              </div>
            </section>

            <section className="panel rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                Recent Activity
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Latest member updates
              </h2>

              <ActivityTimeline />
            </section>
          </div>
        )}

        {activeTab === "activity" && (
          <section className="panel rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
              Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Complete member timeline
            </h2>

            <ActivityTimeline />
          </section>
        )}

        {activeTab === "support" && (
          <section className="panel rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
              Support
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Support history
            </h2>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-sm text-[#9aa39c]">
                No support conversations have been added yet.
              </p>
            </div>
          </section>
        )}

        {activeTab === "notes" && (
          <section className="panel rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
              Internal Notes
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Staff context
            </h2>

            <textarea
              placeholder="Add an internal note about this member..."
              className="mt-6 min-h-40 w-full resize-y rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm outline-none transition placeholder:text-[#606861] focus:border-emerald-400/25"
            />

            <button className="mt-4 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-[#07110a] transition hover:bg-emerald-300">
              Save Note
            </button>
          </section>
        )}

        {activeTab === "files" && (
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-emerald-300" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858b87]">
                  Files
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Member documents
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] p-8 text-center">
              <p className="text-sm text-[#9aa39c]">
                No files have been uploaded for this member.
              </p>

              <button className="mt-4 rounded-xl border border-white/[0.07] px-4 py-2.5 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300">
                Upload File
              </button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

type StatusRowProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  tone: "success" | "warning";
};

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-[#818a83]">
        <Icon size={16} className="text-emerald-300" />
        {label}
      </span>

      <span
        className={
          tone === "success"
            ? "text-sm font-medium text-emerald-300"
            : "text-sm font-medium text-amber-300"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ActivityTimeline() {
  const activity = [
    {
      title: "Community access granted",
      date: "Yesterday",
      active: true,
    },
    {
      title: "Welcome email sent",
      date: "2 days ago",
      active: false,
    },
    {
      title: "Payment received",
      date: "July 12, 2026",
      active: false,
    },
  ];

  return (
    <div className="mt-6 space-y-5">
      {activity.map((item) => (
        <div
          key={`${item.title}-${item.date}`}
          className={
            item.active
              ? "border-l border-emerald-400/30 pl-4"
              : "border-l border-white/[0.08] pl-4"
          }
        >
          <p className="text-sm font-medium">{item.title}</p>
          <p className="mt-1 text-xs text-[#717a73]">{item.date}</p>
        </div>
      ))}
    </div>
  );
}