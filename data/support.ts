export type SupportStatus =
  | "Needs Reply"
  | "Waiting on Member"
  | "Resolved";

export type SupportTicket = {
  id: number;
  memberId: number;
  memberName: string;
  email: string;
  subject: string;
  preview: string;
  body: string | null;
  program: string;
  status: SupportStatus;
  assignedTo: string | null;
  receivedAt: string;
};

export const supportTickets: SupportTicket[] = [
  {
    id: 1,
    memberId: 2,
    memberName: "Kiana Stevenson",
    email: "kiana@example.com",
    subject: "Unable to access live sessions",
    preview:
      "I'm having a difficult time joining the live sessions and need help accessing the community.",
    body:
      "Good morning, I'm having difficulty joining the live sessions. I have refreshed the app several times...",
    program: "Mini Drippers",
    status: "Needs Reply",
    assignedTo: null,
    receivedAt: "21 minutes ago",
  },
  {
   id: 2,
    memberId: 1,
    memberName: "Mary Longoria",
    email: "missmary1984@yahoo.com",
    subject: "Cannot access Mini Drippers",
    preview:
      "I need some assistance accessing the six-month Mini Drippers course in Mighty Networks.",
    body: null,
    program: "Mini Drippers",
    status: "Waiting on Member",
    assignedTo: null,
    receivedAt: "Yesterday", 
  },
  {
   id: 3,
    memberId: 3,
    memberName: "Taryl Atkins",
    email: "atkins.taryl70@gmail.com",
    subject: "Missing class emails",
    preview:
      "I recently enrolled but I am not receiving the emails related to the new class.",
    body: null,
    program: "Mini Drippers",
    assignedTo: null,
    status: "Resolved",
    receivedAt: "July 14", 
  },
];