"use client";

import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Operations", icon: ClipboardList },
  { label: "Resources", icon: BookOpen },
  { label: "Support", icon: LifeBuoy },
];

type WorkspaceNavProps = {
  active: string;
};

export default function WorkspaceNav({ active }: WorkspaceNavProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <nav className="inline-flex min-w-max rounded-2xl border border-[var(--border)] bg-white p-1 shadow-sm">
        {tabs.map(({ label, icon: Icon }) => {
          const isActive = active === label;

          return (
            <button
              key={label}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:px-5",
                isActive
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}