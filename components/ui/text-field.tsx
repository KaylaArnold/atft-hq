"use client";

import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function TextField({
  label,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId =
    id ??
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[#2d3730]"
      >
        {label}
      </label>

      <input
        id={inputId}
        className={`w-full rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#17201a] outline-none transition placeholder:text-[#9aa39d] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${className}`}
        {...props}
      />
    </div>
  );
}