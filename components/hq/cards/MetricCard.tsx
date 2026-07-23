import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  detail?: ReactNode;
  className?: string;
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  detail,
  className = "",
}: MetricCardProps) {
  return (
    <article
      className={[
        "rounded-2xl border border-[var(--border)]",
        "bg-[var(--surface)] p-5",
        "transition duration-200",
        "hover:border-[var(--border-strong)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">
            {value}
          </p>
        </div>

        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            {icon}
          </div>
        ) : null}
      </div>

      {subtitle || detail ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {subtitle ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {subtitle}
            </p>
          ) : (
            <span />
          )}

          {detail ? (
            <div className="shrink-0 text-sm font-medium text-[var(--text)]">
              {detail}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}