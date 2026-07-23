"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Command Center",
    icon: LayoutDashboard,
    href: "/programs/atft-academy",
  },
  {
    label: "People",
    icon: Users,
    href: "/programs/atft-academy/people",
  },
  {
    label: "Operations",
    icon: Workflow,
    href: "/programs/atft-academy/operations",
  },
  {
    label: "Playbooks",
    icon: BookOpen,
    href: "/programs/atft-academy/playbooks",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/programs/atft-academy/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/programs/atft-academy/settings",
  },
];

type WorkspaceNavProps = {
  active: string;
};

export default function WorkspaceNav({ active }: WorkspaceNavProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <nav className="inline-flex min-w-max rounded-2xl border border-[var(--border)] bg-white p-1 shadow-sm">
        {tabs.map(({ label, icon: Icon, href }) => {
          const isActive = active === label;

          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:px-5",
                isActive
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}