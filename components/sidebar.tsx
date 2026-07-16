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
import { useHQ } from "@/context/HQContext";
import { cn } from "@/lib/utils";

const primary = [
  { label: "Home", href: "/", icon: Home },
  { label: "Members", href: "/members", icon: UsersRound },
  { label: "Programs", href: "/programs", icon: GraduationCap },
  { label: "Events", href: "/events", icon: Ticket },
  { label: "Member Care", href: "/member-care", icon: LifeBuoy },
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
  const { tickets } = useHQ();

  const openTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Resolved"
  ).length;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-black/10 bg-[#17221c] p-4 shadow-[8px_0_30px_rgba(15,23,18,0.06)] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-sm font-black tracking-tight text-emerald-200">
              A
            </div>

            <div>
              <p className="m-0 text-[15px] font-semibold tracking-tight text-white">
                ATFT HQ
              </p>

              <p className="m-0 mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#8e9a91]">
                Operations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-xl p-2 text-[#8e9a91] transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto scrollbar-none">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9eaaa2]">
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
                      ? "bg-emerald-300/14 text-white"
                      : "text-[#d2d9d4] hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={cn(
                      "transition",
                      isActive
                        ? "text-emerald-300"
                        : "text-[#7f8a82] group-hover:text-white"
                    )}
                  />

                  <span className="flex-1">{label}</span>

                  {label === "Member Care" && openTicketCount > 0 && (
                    <span className="rounded-full bg-emerald-300/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      {openTicketCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.055] p-3.5">
          <div className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
              <Sparkles size={15} />
            </span>

            <div>
              <p className="m-0 text-xs font-medium text-white">
                HQ Assistant
              </p>

              <p className="m-0 mt-1 text-[11px] leading-4 text-[#8f9a92]">
                AI-powered company knowledge is coming later.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/[0.055]"
        >
          <div className="grid size-9 place-items-center rounded-full bg-emerald-300/12 text-xs font-bold text-emerald-200">
            KA
          </div>

          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-xs font-medium text-white">
              Kayla Arnold
            </p>

            <p className="m-0 mt-0.5 truncate text-[11px] text-[#8d9890]">
              COO · Administrator
            </p>
          </div>

          <ChevronDown size={14} className="text-[#7f8a82]" />
        </button>
      </aside>
    </>
  );
}