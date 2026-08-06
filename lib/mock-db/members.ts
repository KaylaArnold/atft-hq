import type { Member } from "@/lib/types/member";

export const members: Member[] = [
  {
    id: 1,
    name: "Mary Longoria",
    email: "missmary1984@yahoo.com",
    phone: "(956)533-2841",
    program: "Mini Drippers",
    community: "Yes",
    payments: "Current",
    support: "None",
    status: "Active",
  },
  {
    id: 2,
    name: "Kiana Stevenson",
    email: null,
    phone: null,
    program: "Mini Drippers",
    community: "Yes",
    payments: "Current",
    support: "Waiting Reply",
    status: "Needs Attention",
  },
  {
    id: 3,
    name: "Taryl Atkins",
    email: null,
    phone: null,
    program: "Mini Drippers",
    community: "Yes",
    payments: "Current",
    support: "Resolved",
    status: "Active",
  },
];

export function getMemberById(memberId: number) {
  return members.find((member) => member.id === memberId);
}