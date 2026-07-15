"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bell, BookOpenCheck, ChevronRight, CircleAlert, CircleCheck, Clock3, Command, FileText, Menu, MessageSquareText, Plus, Search, UserPlus, UsersRound } from "lucide-react";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const attention = [
  { icon: UsersRound, value: "7", title: "Mini Drippers need to enroll", detail: "Paid deposits awaiting registration", tone: "danger" },
  { icon: MessageSquareText, value: "2", title: "Member emails are waiting", detail: "Oldest waiting 42 minutes", tone: "warning" },
  { icon: CircleCheck, value: "74", title: "Mini Drippers have community access", detail: "MCurrent community membership", tone: "success" },
];

const actions = [
  { icon: UserPlus, label: "Invite a member" }, { icon: FileText, label: "Use an email template" }, { icon: BookOpenCheck, label: "Find an SOP" }, { icon: Plus, label: "Add a resource" },
];

const schedule = [
  { time: "10:30 AM", title: "Mini Drippers Live", meta: "Community · 60 min", active: true },
  { time: "12:00 PM", title: "Support review", meta: "Operations · 30 min" },
  { time: "2:00 PM", title: "Graduation planning", meta: "Internal · 45 min" },
];

export function Dashboard() {
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommand(true); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <CommandPalette open={command} onOpenChange={setCommand} />
      <main className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-white/[.06] bg-[#08070b]/80 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button onClick={() => setMenu(true)} className="rounded-xl p-2 text-[#a9a3b1] hover:bg-white/5 lg:hidden"><Menu size={20}/></button>
          <button onClick={() => setCommand(true)} className="flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.025] px-3 text-left text-xs text-[#716b78] hover:border-white/[.13] hover:bg-white/[.04]">
            <Search size={15}/><span className="flex-1">Search ATFT HQ...</span><span className="hidden items-center gap-1 rounded-md border border-white/[.08] bg-black/20 px-1.5 py-1 text-[10px] sm:flex"><Command size={10}/> K</span>
          </button>
          <button className="relative ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-[#a9a3b1] hover:bg-white/[.05]"><Bell size={17}/><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#c6a6ee]"/></button>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-[#9d7cc1]">{today}</p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-.04em] sm:text-[42px]">Good morning, Kayla.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#8c8593]">Everything you need to keep ATFT moving today.</p></div>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d7bbf3] px-4 text-xs font-semibold text-[#17111d] hover:bg-[#e2cbf7]"><Plus size={15}/> Quick action</button>
          </section>

          <section className="mt-9">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><CircleAlert size={17} className="text-[#c6a6ee]"/><h2 className="m-0 text-sm font-semibold">Today's Focus</h2></div><button className="flex items-center gap-1 text-xs text-[#8e8795] hover:text-white">View all <ChevronRight size={14}/></button></div>
            <div className="grid gap-3 md:grid-cols-3">
              {attention.map(({ icon: Icon, value, title, detail, tone }) => {
                const toneClass = tone === "danger" ? "bg-[#e47f88]/10 text-[#ef9aa2]" : tone === "warning" ? "bg-[#e9ba65]/10 text-[#e9ba65]" : "bg-[#6cc59a]/10 text-[#7ed3aa]";
                return <button key={title} className="panel group flex items-center gap-4 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-white/[.13]">
                  <span className={`grid size-11 place-items-center rounded-2xl ${toneClass}`}><Icon size={19}/></span><span className="min-w-0 flex-1"><span className="block text-xl font-semibold tracking-tight">{value}</span><span className="mt-0.5 block truncate text-xs font-medium text-[#ddd8e2]">{title}</span><span className="mt-1 block truncate text-[11px] text-[#716b78]">{detail}</span></span><ChevronRight size={15} className="text-[#4e4952] transition group-hover:translate-x-0.5 group-hover:text-[#a9a3b1]"/></button>;
              })}
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.85fr]">
            <div className="space-y-6">
              <section className="panel rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="m-0 text-sm font-semibold">Today’s schedule</p><p className="mt-1 text-xs text-[#716b78]">Your day at a glance</p></div><button className="rounded-xl border border-white/[.08] px-3 py-2 text-[11px] text-[#9d96a3] hover:bg-white/[.04]">Open calendar</button></div>
                <div className="mt-5 divide-y divide-white/[.06]">
                  {schedule.map((item) => <div key={item.title} className="flex items-center gap-4 py-4 first:pt-2 last:pb-0"><div className="w-[72px] shrink-0 text-[11px] font-medium text-[#817a87]">{item.time}</div><span className={`h-10 w-0.5 rounded-full ${item.active ? "bg-[#c6a6ee]" : "bg-white/10"}`}/><div className="min-w-0 flex-1"><p className="m-0 truncate text-xs font-medium text-[#e9e5ed]">{item.title}</p><p className="m-0 mt-1 text-[11px] text-[#716b78]">{item.meta}</p></div>{item.active && <span className="rounded-full bg-[#c6a6ee]/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-[#c6a6ee]">Next</span>}</div>)}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between"><div><h2 className="m-0 text-sm font-semibold">Workflows</h2><p className="mt-1 text-xs text-[#716b78]">Start a common ATFT task</p></div></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{actions.map(({icon: Icon,label}) => <button key={label} className="panel group rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-[#c6a6ee]/25"><span className="grid size-9 place-items-center rounded-xl bg-white/[.04] text-[#b9a1d1] group-hover:bg-[#c6a6ee]/10 group-hover:text-[#d8c0ef]"><Icon size={17}/></span><span className="mt-4 block text-xs font-medium leading-4 text-[#d6d1da]">{label}</span><ArrowRight size={14} className="mt-3 text-[#514c55] transition group-hover:translate-x-0.5 group-hover:text-[#a9a3b1]"/></button>)}</div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="panel rounded-3xl p-5">
                <div className="flex items-start justify-between"><div><p className="m-0 text-sm font-semibold">Announcement</p><p className="mt-1 text-[11px] text-[#716b78]">Published today</p></div><span className="grid size-9 place-items-center rounded-xl bg-[#c6a6ee]/10 text-[#c6a6ee]"><Bell size={16}/></span></div>
                <div className="mt-5 rounded-2xl border border-[#c6a6ee]/12 bg-[#c6a6ee]/[.045] p-4"><p className="m-0 text-xs font-semibold leading-5 text-[#e8ddf2]">Founder's Day giving remains open through Sunday.</p><p className="mb-0 mt-2 text-[11px] leading-5 text-[#8c8492]">Continue support follow-up and direct contribution questions to the official support inbox.</p></div>
                <button className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[#b99bd7] hover:text-[#d4bbed]">Read announcement <ChevronRight size={13}/></button>
              </section>

              <section className="panel rounded-3xl p-5">
                <div className="flex items-center justify-between"><div><p className="m-0 text-sm font-semibold">Knowledge Center</p><p className="mt-1 text-[11px] text-[#716b78]">Recently updated guidance</p></div><Clock3 size={16} className="text-[#716b78]"/></div>
                <div className="mt-4 space-y-1">
                  {[['Mini Dripper enrollment','SOP · 8 min'],['Community access response','Email template'],['Replay Vault publishing','Checklist · 5 steps']].map(([title,meta]) => <button key={title} className="group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-white/[.035]"><span className="grid size-9 place-items-center rounded-xl bg-white/[.035] text-[#8f829a]"><FileText size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#d6d1da]">{title}</span><span className="mt-1 block text-[10px] text-[#6f6875]">{meta}</span></span><ChevronRight size={13} className="text-[#4b464f] group-hover:text-[#918a97]"/></button>)}
                </div>
                <button className="mt-3 w-full rounded-xl border border-white/[.07] py-2.5 text-[11px] text-[#8f8895] hover:bg-white/[.035] hover:text-white">Open Knowledge Center</button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
