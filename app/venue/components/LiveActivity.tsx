"use client";

import { Ambulance, TriangleAlert } from "lucide-react";

const activities: {
  type: "warning" | "medical" | "trespass";
  title: string;
  description: string;
  time: string;
  borderColor: string;
  iconColor: string;
}[] = [
  {
    type: "warning",
    title: "Nearby Report",
    description: "Two patrons removed for fighting on 12th Street",
    time: "2 min ago",
    borderColor: "border-l-[#E84868]",
    iconColor: "#F07A92",
  },
  {
    type: "medical",
    title: "Medical Emergency",
    description: "Medical emergency reported, 911 called",
    time: "2 min ago",
    borderColor: "border-l-[#2B36CD]",
    iconColor: "#7B8AF8",
  },
  {
    type: "trespass",
    title: "Trespass Issued",
    description: "John Doe issued trespass at NG Downtown",
    time: "2 min ago",
    borderColor: "border-l-[#DBA940]",
    iconColor: "#E8BC5C",
  },
  {
    type: "trespass",
    title: "Trespass Issued",
    description: "John Doe issued trespass at NG Downtown",
    time: "2 min ago",
    borderColor: "border-l-[#DBA940]",
    iconColor: "#E8BC5C",
  },
  {
    type: "medical",
    title: "Medical Emergency",
    description: "Medical emergency reported, 911 called",
    time: "2 min ago",
    borderColor: "border-l-[#2B36CD]",
    iconColor: "#7B8AF8",
  },
];

function ActivityIcon({
  type,
  color,
}: {
  type: "warning" | "medical" | "trespass";
  color: string;
}) {
  const style = { color };
  if (type === "medical") {
    return <Ambulance className="h-7 w-7" style={style} strokeWidth={2} />;
  }
  return <TriangleAlert className="h-7 w-7" style={style} strokeWidth={2} />;
}

export default function LiveActivity() {
  return (
    <div className="rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          className="rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2 text-xs font-bold text-white"
        >
          Filter
        </button>
      </div>
      <ul className="space-y-3">
        {activities.map((a, i) => (
          <li
            key={i}
            className={`flex overflow-hidden rounded-[10px] border-l-4 bg-[#1B1B26] ${a.borderColor}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-l-[10px] bg-[#1B1B26]">
              <ActivityIcon type={a.type} color={a.iconColor} />
            </div>
            <div className="min-w-0 flex-1 pr-3 py-2">
              <p className="text-xs font-bold text-white">{a.title}</p>
              <p className="text-[10px] font-medium leading-[18px] text-[#8B8B9D]">
                {a.description}
              </p>
            </div>
            <p className="shrink-0 px-2 py-2 text-[8px] font-medium text-[#8B8B9D]">
              {a.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
