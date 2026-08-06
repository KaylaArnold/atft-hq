import Link from "next/link";
import { Plus } from "lucide-react";

import AppShell from "@/components/app-shell";
import Workspace from "@/components/support/support-workspace";
import PageHeader from "@/components/ui/page-header";

export default function MemberCarePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1700px] space-y-8 px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            eyebrow="Member Care"
            title="Member Care"
            description="Review conversations, respond to members, and keep support history connected to each member record."
          />

          <Link
            href="/member-care/tickets/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            New Ticket
          </Link>
        </div>

        <Workspace />
      </div>
    </AppShell>
  );
}