"use client";

import { Card, CardContent } from "@/components/ui/card";

const typeStyles: Record<"warning" | "medical" | "trespass", string> = {
  warning:  "border-[#6B2233]",
  medical:  "border-[#1E2469]",
  trespass: "border-[#6B5320]",
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
    <div className="rounded-[21px] border border-[#2A2A34] bg-[#11111B]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#2A2A34]">
        <div>
          <h2 className="text-lg font-black leading-8 text-[#E2E2E2]">
            Live Activity
          </h2>
          <p className="text-[8px] font-bold text-[#8B8B9D]">
            Last updated 30s ago
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/[0.06]"
        >
          Filter
        </button>
      </div>

      <ul className="space-y-2 p-4">
        {activities.map((a, i) => (
          <Card
            key={i}
            className={`gap-0 py-0 shadow-none transition-colors hover:bg-white/[0.02] bg-[#16161F] border ${typeStyles[a.type]}`}
          >
            <CardContent className="flex items-center gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white">{a.title}</p>
                  <span className="shrink-0 font-mono text-[10px] text-[#4A4A5A]">
                    {a.time}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-[1.4] text-[#6B6B7D]">
                  {a.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
}
