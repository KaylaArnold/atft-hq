"use client";

import type { SelectHTMLAttributes } from "react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export default function SelectField({
  label,
  id,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  const selectId =
    id ??
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-[#2d3730]"
      >
        {label}
      </label>

      <select
        id={selectId}
        className={`w-full rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#17201a] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}