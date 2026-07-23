import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  HeartHandshake,
  Landmark,
  TrendingUp,
} from "lucide-react";

export type ProgramStatus =
  | "Active"
  | "Planned"
  | "Application Only"
  | "Invitation Only";

export type Program = {
  id: string;
  stage: string;
  level: number;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  audience: string;
  investment: string;
  status: ProgramStatus;
  workspaceHref: string;
  icon: LucideIcon;
};

export const programs: Program[] = [
  {
    id: "atft-academy",
    stage: "Foundation",
    level: 1,
    title: "ATFT Academy",
    shortTitle: "Mini Drippers",
    tagline: "Learn to trade.",
    description:
      "A six-month foundational mentorship focused on trading structure, discipline, risk management, and repeatable strategies.",
    audience: "Beginning and developing traders",
    investment: "$299 monthly for six months",
    status: "Active",
    workspaceHref: "/programs/atft-academy",
    icon: BookOpenCheck,
  },
  {
    id: "dripper-maintenance",
    stage: "Growth",
    level: 2,
    title: "Dripper Maintenance",
    shortTitle: "Maintenance",
    tagline: "Maintain, strengthen, and scale.",
    description:
      "Ongoing accountability, strategy reinforcement, live trading support, and responsible scaling for Academy graduates.",
    audience: "ATFT Academy graduates",
    investment: "$99 monthly",
    status: "Planned",
    workspaceHref: "/programs/dripper-maintenance",
    icon: TrendingUp,
  },
  {
    id: "alignment-experience",
    stage: "Transformation",
    level: 3,
    title: "The Alignment Experience",
    shortTitle: "Alignment",
    tagline: "Become aligned enough to sustain success.",
    description:
      "A transformational experience centered on identity, healing, faith, discipline, stewardship, leadership, and purpose.",
    audience: "Application-based transformational cohort",
    investment: "Recommended value: $12,500",
    status: "Application Only",
    workspaceHref: "/programs/alignment-experience",
    icon: HeartHandshake,
  },
  {
    id: "legacy-wealth",
    stage: "Legacy",
    level: 4,
    title: "Legacy Wealth",
    shortTitle: "Legacy",
    tagline: "Build, protect, and transfer wealth.",
    description:
      "A private wealth circle focused on long-term investing, preservation, stewardship, succession, and generational legacy.",
    audience: "Financially prepared and qualified participants",
    investment: "$30,000 annually",
    status: "Invitation Only",
    workspaceHref: "/programs/legacy-wealth",
    icon: Landmark,
  },
];