type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-emerald-300">
            {eyebrow}
          </p>
        )}

        <h1 className="text-4xl font-semibold tracking-[-.04em]">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8c8593]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}