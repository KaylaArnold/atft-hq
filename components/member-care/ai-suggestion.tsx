"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

type AISuggestionProps = {
  suggestion: string;
  onUse: () => void;
};

export default function AISuggestion({
  suggestion,
  onUse,
}: AISuggestionProps) {
  const [copied, setCopied] = useState(false);

  async function copySuggestion() {
    await navigator.clipboard.writeText(suggestion);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Sparkles size={16} />
        </span>

        <div>
          <p className="text-sm font-semibold">Suggested Response</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#778079]">
            Mock AI suggestion
          </p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#a5aea7]">
        {suggestion}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUse}
          className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-[#06110a] transition hover:bg-emerald-300"
        >
          Use Suggestion
        </button>

        <button
          type="button"
          onClick={copySuggestion}
          className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}