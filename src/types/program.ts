import type { LucideIcon } from "lucide-react";

export type ProgramStatus =
  | "active"
  | "upcoming"
  | "draft"
  | "archived";

export interface Program {
  id: string;
  slug: string;

  title: string;
  shortTitle: string;
  tagline: string;
  promise: string;

  level: number;

  audience: string;
  investment: string;

  status: ProgramStatus;

  icon: LucideIcon;

  navigation: WorkspaceNavigationItem[];

  currentCohort?: Cohort;
}

export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  href: string;
}

export interface Cohort {
  id: string;

  name: string;

  startDate: string;
  endDate: string;

  studentCount: number;

  coachCount: number;

  attendanceRate: number;

  graduationRate: number;
}