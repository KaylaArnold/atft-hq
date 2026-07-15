"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, FileText, Search, UserRound, X } from "lucide-react";

const results = [
  { icon: BookOpen, label: "Mini Drippers Enrollment SOP", group: "Operations" },
  { icon: FileText, label: "Community Access Email", group: "Templates" },
  { icon: UserRound, label: "Member lookup", group: "Members" },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#111016] shadow-2xl">
          <Dialog.Title className="sr-only">Search ATFT HQ</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-white/8 px-5">
            <Search size={19} className="text-[#c6a6ee]" />
            <input autoFocus placeholder="Search SOPs, people, templates and resources..." className="h-16 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#716b78]" />
            <Dialog.Close className="rounded-lg p-2 text-[#716b78] hover:bg-white/5 hover:text-white"><X size={17} /></Dialog.Close>
          </div>
          <div className="p-3">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#716b78]">Suggested</p>
            {results.map(({ icon: Icon, label, group }) => (
              <button key={label} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/[.045]">
                <span className="grid size-9 place-items-center rounded-xl bg-[#c6a6ee]/10 text-[#c6a6ee]"><Icon size={17} /></span>
                <span className="flex-1 text-sm text-[#f6f3fa]">{label}</span>
                <span className="text-xs text-[#716b78]">{group}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 text-[11px] text-[#716b78]">
            <span>Search across your company knowledge</span><span>ESC to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
