"use client";

import type { SupportTicket } from "@/data/support";

type ReplyEditorProps = {
  ticket: SupportTicket;
  value: string;
  onChange: (value: string) => void;
};

export default function ReplyEditor({
  ticket,
  value,
  onChange,
}: ReplyEditorProps) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
          Reply
        </p>

        <span className="text-[10px] text-[#606861]">
          Sending to {ticket.email}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Write a reply to ${ticket.memberName}...`}
        className="mt-3 min-h-64 w-full resize-y rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm leading-7 outline-none transition placeholder:text-[#59615b] focus:border-emerald-400/25"
      />

      <div className="mt-2 text-right text-[10px] text-[#5f6861]">
        {value.length} characters
      </div>
    </section>
  );
}