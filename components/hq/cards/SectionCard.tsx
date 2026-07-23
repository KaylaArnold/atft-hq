import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "",
}: SectionCardProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border border-[var(--border)]",
        "bg-[var(--surface)]",
        className,
      ].join(" ")}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="shrink-0">
            {action}
          </div>
        ) : null}
      </header>

      <div className={["p-6", contentClassName].join(" ")}>
        {children}
      </div>
    </section>
  );
}