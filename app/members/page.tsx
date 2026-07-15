import AppShell from "@/components/app-shell";
import MemberCard from "@/components/members/member-card";
import PageHeader from "@/components/ui/page-header";
import { members } from "@/data/members";
import { Search } from "lucide-react";

export default function MembersPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="Community"
          title="Members"
          description="Manage members, support requests, access, and program participation."
        />

        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#687069]"
              />

              <input
                type="search"
                placeholder="Search members..."
                className="h-12 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#606861] focus:border-emerald-400/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", "Mini Drippers", "Needs Attention", "Active"].map(
                (filter, index) => (
                  <button
                    key={filter}
                    className={
                      index === 0
                        ? "rounded-xl bg-emerald-400/12 px-4 py-2.5 text-xs font-medium text-emerald-300"
                        : "rounded-xl border border-white/[0.06] px-4 py-2.5 text-xs text-[#848c86] transition hover:bg-white/[0.03] hover:text-white"
                    }
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}