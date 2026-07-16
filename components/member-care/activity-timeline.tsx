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
    <section className="mt-6 border-t border-[#e5e9e6] pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
        Activity Timeline
      </p>

      <div className="relative mt-5 pl-6">
        <div className="absolute bottom-0 left-2 top-0 w-px bg-[#dfe5e1]" />

        {activity.map((item) => {
          const dotClass =
            item.tone === "emerald"
              ? "bg-emerald-700"
              : item.tone === "sky"
                ? "bg-sky-600"
                : item.tone === "amber"
                  ? "bg-amber-600"
                  : "bg-[#8b958e]";

          return (
            <div
              key={`${item.title}-${item.time}`}
              className="relative mb-6 last:mb-0"
            >
              <span
                className={`absolute -left-[22px] top-1 size-3 rounded-full ring-4 ring-white ${dotClass}`}
              />

              <p className="text-sm font-medium text-[#2d3730]">
                {item.title}
              </p>

              <p className="mt-1 text-xs text-[#77827a]">
                {item.time}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}