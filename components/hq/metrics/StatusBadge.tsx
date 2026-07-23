type Status =
  | "active"
  | "inactive"
  | "healthy"
  | "warning"
  | "danger"
  | "pending"
  | "completed"
  | "scheduled"
  | "upcoming"
  | "draft"
  | "cancelled"
  | "resolved";

type StatusBadgeProps = {
  status: Status;
  label?: string;
  className?: string;
};

const styles: Record<Status, string> = {
  active:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  healthy:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  completed:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  resolved:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  pending:
    "bg-amber-100 text-amber-700 border-amber-200",

  warning:
    "bg-amber-100 text-amber-700 border-amber-200",

  scheduled:
    "bg-sky-100 text-sky-700 border-sky-200",

  upcoming:
    "bg-sky-100 text-sky-700 border-sky-200",

  draft:
    "bg-slate-100 text-slate-700 border-slate-200",

  inactive:
    "bg-slate-100 text-slate-700 border-slate-200",

  cancelled:
    "bg-rose-100 text-rose-700 border-rose-200",

  danger:
    "bg-rose-100 text-rose-700 border-rose-200",
};

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border",
        "px-3 py-1",
        "text-xs font-semibold tracking-wide",
        styles[status],
        className,
      ].join(" ")}
    >
      {label ?? prettify(status)}
    </span>
  );
}

function prettify(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}