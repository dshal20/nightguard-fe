"use client";

type Severity = "HIGH" | "MEDIUM";

const rows: { time: string; title: string; description: string; severity: Severity }[] = [
  { time: "11:36 PM", title: "Harassment", description: "Guest harassing other patrons", severity: "HIGH" },
  { time: "11:55 PM", title: "Fake ID", description: "ID issue discovered during entry check", severity: "MEDIUM" },
  { time: "12:13 AM", title: "Medical Emergency", description: "Guest found unconscious in restroom stall", severity: "HIGH" },
  { time: "11:36 PM", title: "Physical Altercation", description: "Two patrons reported fighting near bathroom", severity: "HIGH" },
  { time: "11:36 PM", title: "Physical Altercation", description: "Two patrons reported fighting near bathroom", severity: "HIGH" },
  { time: "11:36 PM", title: "Intoxication", description: "Patron visibly intoxicated and causing a disturbance", severity: "HIGH" },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const isHigh = severity === "HIGH";
  return (
    <span
      className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${
        isHigh
          ? "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]"
          : "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]"
      }`}
    >
      {severity}
    </span>
  );
}

export default function RecentReports() {
  return (
    <div className="rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black leading-8 text-[#E2E2E2]">
          Recent Reports
        </h2>
        <button
          type="button"
          className="rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2 text-xs font-bold text-white"
        >
          View All Reports
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-left text-[8px] font-bold uppercase leading-[18px] text-[#8B8B9D]">
              <th className="pb-3 pr-4">TIME</th>
              <th className="pb-3 pr-4">TITLE / DESCRIPTION</th>
              <th className="pb-3 text-right">SEVERITY</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[#2A2A34] transition hover:bg-white/[0.02]"
              >
                <td className="py-4 pr-4 text-xs font-bold text-white">
                  {row.time}
                </td>
                <td className="py-4 pr-4">
                  <p className="text-xs font-bold text-white">{row.title}</p>
                  <p className="text-xs font-medium text-[#8B8B9D]">
                    {row.description}
                  </p>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <SeverityBadge severity={row.severity} />
                    <button
                      type="button"
                      className="flex h-[23px] w-[23px] items-center justify-center rounded-[7px] bg-[#26262F] text-white"
                      aria-label="View report"
                    >
                      👁
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
