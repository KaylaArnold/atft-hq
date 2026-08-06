export type MiniDripperAssignment = {
  id: number;
  coachName: string;
  studentNames: string[];
};

export type AccountabilityGroup = {
  id: number;
  partnerName: string;
  participantNames: string[];
};

export type AccountabilityCycleStatus =
  | "Upcoming"
  | "Active"
  | "Completed";

export type AccountabilityCycle = {
  id: number;
  name: string;
  durationWeeks: number;
  checkInDay: "Monday";
  status: AccountabilityCycleStatus;
  startDate: string | null;
  endDate: string | null;
};