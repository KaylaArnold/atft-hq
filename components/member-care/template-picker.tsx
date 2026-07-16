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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
        Reply Templates
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {templates.map((template) => {
          const selected = selectedTemplateId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className={
                selected
                  ? "rounded-2xl border border-emerald-700/20 bg-emerald-50 p-5 text-left shadow-sm transition"
                  : "rounded-2xl border border-[#e3e8e5] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-sm"
              }
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                  <FileText size={17} />
                </span>

                {selected && (
                  <span className="grid size-7 place-items-center rounded-full bg-emerald-700 text-white">
                    <Check size={13} />
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-base font-semibold text-[#17201a]">
                {template.title}
              </h3>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {template.category}
              </p>

              <p className="mt-3 text-sm leading-6 text-[#667169]">
                {template.description}
              </p>

              <p className="mt-4 text-[11px] text-[#8b958e]">
                Used {template.usageCount} times
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}