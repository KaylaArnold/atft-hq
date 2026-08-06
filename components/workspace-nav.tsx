import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
  Workflow,
} from "lucide-react";

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
    label: "Peer Coaches",
    icon: UsersRound,
    href: "/programs/atft-academy/coaches",
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
    <div className="mb-8">
      <nav className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm">
        {tabs.map(({ label, icon: Icon, href }) => {
          const isActive = active === label;

          return (
            <Link
              key={label}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex items-center gap-2 rounded-xl bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] transition sm:px-5"
                  : "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] sm:px-5"
              }
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