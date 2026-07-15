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
      <nav className="inline-flex min-w-max rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1">
        {tabs.map(({ label, icon: Icon }) => {
          const isActive = active === label;

          return (
            <button
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:px-5",
                isActive
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "text-[#808781] hover:bg-white/[0.03] hover:text-white"
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