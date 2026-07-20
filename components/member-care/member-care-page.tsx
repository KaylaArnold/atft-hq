import AppShell from "@/components/app-shell";
import Workspace from "@/components/member-care/workspace";
import PageHeader from "@/components/ui/page-header";

export default function MemberCarePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1700px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="Member Care"
          title="Member Care"
          description="Review conversations, respond to members, and keep support history connected to each member record."
        />

        <Workspace />
      </div>
    </AppShell>
  );
}