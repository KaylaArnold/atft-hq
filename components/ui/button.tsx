"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-700/20",
  secondary:
    "border border-[#dfe5e1] bg-white text-[#2d3730] hover:bg-[#f7f9f7] focus:ring-emerald-700/10",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20",
  ghost:
    "bg-transparent text-[#4f5b53] hover:bg-[#f2f5f3] focus:ring-emerald-700/10",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}