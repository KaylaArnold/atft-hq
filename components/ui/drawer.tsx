"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "md" | "lg";
};

export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = "md",
}: DrawerProps) {
  if (!open) return null;

  const widthClass = width === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-full ${widthClass} bg-white shadow-2xl`}
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-md p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="h-[calc(100%-73px)] overflow-y-auto p-6">
          {children}
        </div>
      </aside>
    </>
  );
}