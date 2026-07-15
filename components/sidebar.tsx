"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  FileStack,
  GraduationCap,
  Home,
  LifeBuoy,
  Sparkles,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { label: "Home", href: "/", icon: Home },
  { label: "Members", href: "/members", icon: UsersRound },
  { label: "Programs", href: "/programs", icon: GraduationCap },
  { label: "Events", href: "/events", icon: Ticket },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Operations", href: "/operations", icon: BookOpenCheck },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Resources", href: "/resources", icon: FileStack },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-white/[0.06] bg-[#080b09]/95 p-4 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-black tracking-tight text-emerald-300">
              A
            </div>

            <div>
              <p className="m-0 text-[15px] font-semibold tracking-tight text-[#eef2ef]">
                ATFT HQ
              </p>

              <p className="m-0 mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#677069]">
                Operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#6f7771] transition hover:bg-white/[0.04] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto scrollbar-none">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#566058]">
            Workspace
          </p>

          <div className="space-y-1">
            {primary.map(({ label, href, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "text-[#8b938d] hover:bg-white/[0.035] hover:text-white"
                  )}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>

                  {label === "Support" && (
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      2
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.045] p-3.5">
          <div className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Sparkles size={15} />
            </span>

            <div>
              <p className="m-0 text-xs font-medium text-[#e5e9e6]">
                HQ Assistant
              </p>

              <p className="m-0 mt-1 text-[11px] leading-4 text-[#737c75]">
                AI-powered company knowledge is coming later.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.035]">
          <div className="grid size-9 place-items-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
            KA
          </div>

          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-xs font-medium text-[#edf1ee]">
              Kayla Arnold
            </p>

            <p className="m-0 mt-0.5 truncate text-[11px] text-[#6f7871]">
              COO · Administrator
            </p>
          </div>

          <ChevronDown size={14} className="text-[#6f7871]" />
        </div>
      </aside>
    </>
  );
}