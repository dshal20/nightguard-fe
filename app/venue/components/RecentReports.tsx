"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import type { IncidentResponse, IncidentSeverity, IncidentStatus } from "@/lib/api";
import IncidentDetailModal from "./IncidentDetailModal";

const statusStyle: Record<IncidentStatus, string> = {
  ACTIVE:    "border-amber-400 bg-amber-400/10 text-amber-400",
  COMPLETED: "border-green-400 bg-green-400/10 text-green-400",
};

const severityStyle: Record<IncidentSeverity, string> = {
  LOW: "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH: "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface RecentReportsProps {
  incidents: IncidentResponse[];
  loading: boolean;
}

export default function RecentReports({ incidents, loading }: RecentReportsProps) {
  const recent = incidents.slice(0, 6);
  const [selected, setSelected] = useState<IncidentResponse | null>(null);

  return (
    <>
      <div className="rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black leading-8 text-[#E2E2E2]">
            Recent Reports
          </h2>
          <Link
            href="/venue/incidents"
            className="rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2 text-xs font-bold text-white"
          >
            View All Reports
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#8B8B9D]" />
          </div>
        )}

        {!loading && recent.length === 0 && (
          <p className="py-8 text-center text-sm text-[#8B8B9D]">No incidents reported yet.</p>
        )}

        {!loading && recent.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-[8px] font-bold uppercase leading-[18px] text-[#8B8B9D]">
                  <th className="pb-3 pr-4">TIME</th>
                  <th className="pb-3 pr-4">TITLE / DESCRIPTION</th>
                  <th className="pb-3 pr-4 text-right">SEVERITY</th>
                  <th className="pb-3 pr-4">STATUS</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {recent.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-[#2A2A34] transition hover:bg-white/[0.02]"
                  >
                    <td className="py-4 pr-4 text-xs font-bold text-white whitespace-nowrap">
                      {formatTime(inc.createdAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-xs font-bold text-white">{formatType(inc.type)}</p>
                      <p className="text-xs font-medium text-[#8B8B9D] max-w-[300px] truncate">
                        {inc.description}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span
                        className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${severityStyle[inc.severity]}`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${statusStyle[inc.status]}`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => setSelected(inc)}
                        className="flex items-center justify-center rounded-md p-1.5 text-[#8B8B9D] transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </>
  );
}
