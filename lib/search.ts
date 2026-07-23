import type { SupportTicket } from "@/data/support";

export type SearchItemType = "member" | "ticket";

export type SearchItem = {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle: string;
  searchText: string;
  href: string;
};

type BuildSearchIndexArgs = {
  members: Array<{
    id: string | number;
    name: string;
    email?: string;
    phone?: string;
    program?: string;
    payments?: string;
    support?: string;
    status?: string;
  }>;
  tickets: SupportTicket[];
};

export function buildSearchIndex({
  members,
  tickets,
}: BuildSearchIndexArgs): SearchItem[] {
  return [
    ...members.map((member) => ({
      id: `member-${member.id}`,
      type: "member" as const,
      title: member.name,
      subtitle: member.program ?? "Member",
      searchText: [
        member.name,
        member.email,
        member.phone,
        member.program,
        member.payments,
        member.support,
        member.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      href: `/members/${member.id}`,
    })),

    ...tickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      type: "ticket" as const,
      title: ticket.subject,
      subtitle: `${ticket.memberName} · ${ticket.status}`,
      searchText: [
        ticket.subject,
        ticket.memberName,
        ticket.email,
        ticket.preview,
        ticket.body,
        ticket.program,
        ticket.status,
        ticket.assignedTo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      href: `/member-care?ticket=${ticket.id}`,
    })),
  ];
}