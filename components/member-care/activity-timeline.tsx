const activity = [
  {
    title: "Reply drafted",
    time: "Just now",
    tone: "emerald",
  },
  {
    title: "Community access granted",
    time: "Yesterday",
    tone: "emerald",
  },
  {
    title: "Replay uploaded",
    time: "Jul 14",
    tone: "sky",
  },
  {
    title: "Mini Drippers enrolled",
    time: "Jul 13",
    tone: "neutral",
  },
  {
    title: "Deposit received",
    time: "Jul 10",
    tone: "amber",
  },
] as const;

export default function ActivityTimeline() {
  return (
    <section className="mt-6 border-t border-white/[0.06] pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d857f]">
        Activity Timeline
      </p>

      <div className="relative mt-5 pl-6">
        <div className="absolute bottom-0 left-2 top-0 w-px bg-white/[0.08]" />

        {activity.map((item) => {
          const dotClass =
            item.tone === "emerald"
              ? "bg-emerald-400"
              : item.tone === "sky"
                ? "bg-sky-400"
                : item.tone === "amber"
                  ? "bg-amber-400"
                  : "bg-[#768078]";

          return (
            <div
              key={`${item.title}-${item.time}`}
              className="relative mb-6 last:mb-0"
            >
              <span
                className={`absolute -left-[22px] top-1 size-3 rounded-full ring-4 ring-[#0b100d] ${dotClass}`}
              />

              <p className="text-sm font-medium text-[#e1e6e2]">
                {item.title}
              </p>

              <p className="mt-1 text-xs text-[#737c75]">
                {item.time}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}