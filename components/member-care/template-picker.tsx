"use client";

import { Check, FileText } from "lucide-react";
import type { ReplyTemplate } from "@/data/reply-templates";

type TemplatePickerProps = {
  templates: ReplyTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: ReplyTemplate) => void;
};

export default function TemplatePicker({
  templates,
  selectedTemplateId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
        Reply Templates
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {templates.map((template) => {
          const selected = selectedTemplateId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className={
                selected
                  ? "rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-left"
                  : "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.035]"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <FileText size={16} />
                </span>

                {selected && (
                  <Check size={16} className="text-emerald-300" />
                )}
              </div>

              <p className="mt-4 text-sm font-semibold">
                {template.title}
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                {template.category}
              </p>

              <p className="mt-2 text-xs leading-5 text-[#747d76]">
                {template.description}
              </p>

              <p className="mt-3 text-[10px] text-[#5f6861]">
                Used {template.usageCount} times
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}