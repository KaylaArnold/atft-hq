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
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-black/[0.07] bg-white/85 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
            className="rounded-xl p-2 text-[#657168] transition hover:bg-black/[0.04] hover:text-[#162019] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <button
            type="button"
            onClick={() => setCommand(true)}
            className="flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-black/[0.08] bg-[#f8faf9] px-3 text-left text-xs text-[#77827a] transition hover:border-emerald-700/20 hover:bg-white"
          >
            <Search size={15} />

            <span className="flex-1">
              Search ATFT HQ...
            </span>

            <span className="hidden items-center gap-1 rounded-md border border-black/[0.08] bg-white px-1.5 py-1 text-[10px] text-[#667168] shadow-sm sm:flex">
              <Command size={10} />
              K
            </span>
          </button>

          <button
            type="button"
            aria-label="Open notifications"
            className="relative ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white text-[#657168] shadow-sm transition hover:border-emerald-700/20 hover:bg-[#f8faf9] hover:text-[#162019]"
          >
            <Bell size={17} />

            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-emerald-600" />
          </button>
        </header>

        {children}
      </main>
    </div>
  );
}