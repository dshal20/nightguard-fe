"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, Loader2, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { IncidentResponse, IncidentSeverity, IncidentStatus } from "@/lib/api";
import IncidentDetailModal from "./IncidentDetailModal";
import EditIncidentModal from "./EditIncidentModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const statusStyle: Record<IncidentStatus, string> = {
  ACTIVE:    "border-amber-400 bg-amber-400/10 text-amber-400",
  COMPLETED: "border-green-400 bg-green-400/10 text-green-400",
};

const severityStyle: Record<IncidentSeverity, string> = {
  LOW:    "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH:   "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

type SortKey = "createdAt" | "updatedAt" | "severity" | "status";
type SortDir = "asc" | "desc";

const SEVERITY_ORDER: Record<IncidentSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const STATUS_ORDER: Record<IncidentStatus, number>     = { COMPLETED: 0, ACTIVE: 1 };

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-[#4A4A5A]" />;
  return sortDir === "asc"
    ? <ChevronUp   className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />
    : <ChevronDown className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />;
}

interface RecentReportsProps {
  incidents: IncidentResponse[];
  loading: boolean;
}

export default function RecentReports({ incidents, loading }: RecentReportsProps) {
  const [selected, setSelected] = useState<IncidentResponse | null>(null);
  const [editing, setEditing] = useState<IncidentResponse | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const recent = useMemo(() => {
    return [...incidents].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt")      cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortKey === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortKey === "severity")  cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      else if (sortKey === "status")    cmp = STATUS_ORDER[a.status]     - STATUS_ORDER[b.status];
      return sortDir === "asc" ? cmp : -cmp;
    }).slice(0, 10);
  }, [incidents, sortKey, sortDir]);

  return (
    <>
      <div className="rounded-xl border border-white/[0.07] bg-[#11111B]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-lg font-black leading-8 text-[#E2E2E2]">Recent Reports</h2>
          <Link
            href="/venue/incidents"
            className="rounded-lg border border-white/[0.07] bg-[#26262F]/48 px-4 py-2 text-xs font-bold text-white"
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
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.07] hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase text-[#8B8B9D]">Type / Description</TableHead>
                <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase text-[#8B8B9D] hover:text-[#DDDBDB] transition-colors" onClick={() => handleSort("severity")}>
                  Severity <SortIcon col="severity" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="w-28 cursor-pointer select-none text-[10px] font-bold uppercase text-[#8B8B9D] hover:text-[#DDDBDB] transition-colors" onClick={() => handleSort("status")}>
                  Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase text-[#8B8B9D] hover:text-[#DDDBDB] transition-colors whitespace-nowrap" onClick={() => handleSort("createdAt")}>
                  Created At <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase text-[#8B8B9D] hover:text-[#DDDBDB] transition-colors whitespace-nowrap" onClick={() => handleSort("updatedAt")}>
                  Last Updated <SortIcon col="updatedAt" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((inc) => (
                <TableRow key={inc.id} className="border-white/[0.07] hover:bg-white/[0.02]">
                  <TableCell className="py-2">
                    <p className="text-xs font-medium text-white">{formatType(inc.type)}</p>
                    <p className="max-w-[300px] truncate text-xs text-[#8B8B9D]">{inc.description}</p>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-medium leading-[18px] ${severityStyle[inc.severity]}`}>
                      {inc.severity}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 w-28">
                    <span className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-medium leading-[18px] ${statusStyle[inc.status]}`}>
                      {inc.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-xs font-normal text-[#8B8B9D] whitespace-nowrap">
                    {dayjs(inc.createdAt).fromNow()}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-normal text-[#8B8B9D] whitespace-nowrap">
                    {dayjs(inc.updatedAt).fromNow()}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(inc)}
                        className="flex items-center justify-center rounded-md p-1.5 text-[#8B8B9D] transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditing(inc)}
                        className="flex items-center justify-center rounded-md p-1.5 text-[#8B8B9D] transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
      <EditIncidentModal incident={editing} onClose={() => setEditing(null)} />
    </>
  );
}
