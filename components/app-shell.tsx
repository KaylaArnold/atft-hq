"use client";

import { ReactNode, useState } from "react";
import { Bell, Command, Menu, Search } from "lucide-react";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <CommandPalette open={command} onOpenChange={setCommand} />

      <main className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-white/[.06] bg-[#070a09]/85 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button
            onClick={() => setMenu(true)}
            className="rounded-xl p-2 text-[#a9a3b1] hover:bg-white/5 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => setCommand(true)}
            className="flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.025] px-3 text-left text-xs text-[#716b78] hover:border-white/[.13] hover:bg-white/[.04]"
          >
            <Search size={15} />
            <span className="flex-1">Search ATFT HQ...</span>

            <span className="hidden items-center gap-1 rounded-md border border-white/[.08] bg-black/20 px-1.5 py-1 text-[10px] sm:flex">
              <Command size={10} /> K
            </span>
          </button>

          <button className="relative ml-auto grid size-10 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-[#a9a3b1] hover:bg-white/[.05]">
            <Bell size={17} />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-emerald-400" />
          </button>
        </header>

        {children}
      </main>
    </div>
  );
}