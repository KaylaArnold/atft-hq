export type MemberStatus = "Active" | "Needs Attention" | "Inactive";

export type PaymentStatus =
  | "Current"
  | "Past Due"
  | "Deposit Paid"
  | "Paid in Full";

export type SupportStatus =
  | "None"
  | "Open"
  | "Awaiting Reply"
  | "Waiting on Member"
  | "Resolved";

export type Member = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  program: string;
  community: string;
  payments: string;
  support: string;
  status: string;
  peerCoachId?: number | null;
};