"use client";

const typeConfig: Record<
  "warning" | "medical" | "trespass",
  { dot: string; pulse: boolean }
> = {
  warning:  { dot: "#E84868", pulse: true },
  medical:  { dot: "#4B7BF5", pulse: true },
  trespass: { dot: "#DBA940", pulse: false },
};

const activities: {
  type: "warning" | "medical" | "trespass";
  title: string;
  description: string;
  time: string;
}[] = [
  {
    type: "warning",
    title: "Nearby Report",
    description: "Two patrons removed for fighting on 12th Street",
    time: "2 min ago",
  },
  {
    type: "medical",
    title: "Medical Emergency",
    description: "Medical emergency reported, 911 called",
    time: "4 min ago",
  },
  {
    type: "trespass",
    title: "Trespass Issued",
    description: "John Doe issued trespass at NG Downtown",
    time: "9 min ago",
  },
  {
    type: "trespass",
    title: "Trespass Issued",
    description: "Jane Smith issued trespass at NG Downtown",
    time: "14 min ago",
  },
  {
    type: "medical",
    title: "Medical Emergency",
    description: "Medical emergency reported, 911 called",
    time: "21 min ago",
  },
];

export default function LiveActivity() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#11111B]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-[#E2E2E2]">Live Activity</h2>
          <p className="mt-0.5 text-[10px] text-[#44445A]">Last updated 30s ago</p>
        </div>
        <button
          type="button"
          className="border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-[#8B8B9D] transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          Filter
        </button>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {activities.map((a, i) => {
          const config = typeConfig[a.type];
          return (
            <li
              key={i}
              className="flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
            >
              <div className="mt-1 shrink-0">
                <span
                  className={`block h-1.75 w-1.75 rounded-full ${config.pulse ? "animate-pulse" : ""}`}
                  style={{ background: config.dot }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white">{a.title}</p>
                  <span className="shrink-0 text-[10px] tabular-nums text-[#44445A]">
                    {a.time}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-relaxed text-[#555568]">
                  {a.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
