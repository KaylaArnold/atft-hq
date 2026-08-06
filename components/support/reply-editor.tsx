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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
          Reply
        </p>

        <span className="text-[10px] text-[#77827a]">
          Sending to{" "}
          <span className="font-medium text-[#4f5b54]">
            {ticket.email}
          </span>
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Write a reply to ${ticket.memberName}...`}
        className="
          mt-3
          min-h-64
          w-full
          resize-y
          rounded-2xl
          border
          border-[#dfe5e1]
          bg-white
          p-4
          text-sm
          leading-7
          text-[#17201a]
          shadow-sm
          outline-none
          transition
          placeholder:text-[#9aa39d]
          focus:border-emerald-700/20
          focus:ring-4
          focus:ring-emerald-700/5
        "
      />

      <div className="mt-2 flex justify-between text-[11px] text-[#8b958e]">
        <span>Professional replies work best when they're concise.</span>

        <span>{value.length} characters</span>
      </div>
    </section>
  );
}