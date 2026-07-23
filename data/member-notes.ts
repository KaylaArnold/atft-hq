export type MemberNote = {
  id: number;
  memberId: number;
 author: string;
 body: string;
 createdAt: string;
};

export const memberNotes: MemberNote[] = [
  {
    id: 1,
    memberId: 1,
    author: "Kayla",
    body: "Member requested email address be updated before orientation.",
    createdAt: "2026-07-18T09:15:00",
  },
  {
    id: 2,
    memberId: 1,
    author: "Coach Trent",
    body: "Very engaged during the first week of Mini Drippers.",
    createdAt: "2026-07-19T11:30:00",
  },
];