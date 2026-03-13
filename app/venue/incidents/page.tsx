"use client";

import { useState, useMemo } from "react";
import { type IncidentSeverity, type IncidentStatus, type IncidentResponse } from "@/lib/api";
import { Eye, Loader2, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import IncidentDetailModal from "../components/IncidentDetailModal";
import EditIncidentModal from "../components/EditIncidentModal";
import { useVenueContext } from "../context/VenueContext";
import { useIncidentsQuery } from "@/lib/queries";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function formatDateTime(iso: string) {
  return dayjs(iso).format("MMM D, YYYY h:mm A");
}

type SortKey = "createdAt" | "updatedAt" | "type" | "severity" | "status";
type SortDir = "asc" | "desc";

const SEVERITY_ORDER: Record<IncidentSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const STATUS_ORDER: Record<IncidentStatus, number> = { COMPLETED: 0, ACTIVE: 1 };

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-[#4A4A5A]" />;
  return sortDir === "asc"
    ? <ChevronUp   className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />
    : <ChevronDown className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />;
}

export default function IncidentsPage() {
  const { selectedVenue } = useVenueContext();
  const { data: incidents = [], isLoading, isError } = useIncidentsQuery(selectedVenue?.id);
  const [selected, setSelected] = useState<IncidentResponse | null>(null);
  const [editing, setEditing] = useState<IncidentResponse | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...incidents].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortKey === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "severity") cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      else if (sortKey === "status") cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [incidents, sortKey, sortDir]);

  const thClass = "text-[10px] font-bold uppercase text-[#8B8B9D] cursor-pointer select-none hover:text-[#DDDBDB] transition-colors";

  return (
    <>
      <div className="mx-auto max-w-[1172px] px-8 py-8">
        <h1 className="text-[28px] font-black leading-8 text-[#E2E2E2]">Incidents</h1>

        {isLoading && (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B8B9D]" />
          </div>
        )}

        {isError && (
          <p className="mt-8 text-sm text-[#E84868]">Failed to load incidents.</p>
        )}

        {!isLoading && !isError && incidents.length === 0 && (
          <p className="mt-8 text-sm text-[#8B8B9D]">No incidents reported yet.</p>
        )}

        {!isLoading && incidents.length > 0 && (
          <div className="mt-6 rounded-[21px] border border-[#2A2A34] bg-[#11111B]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A34] hover:bg-transparent">
                  <TableHead className={thClass} onClick={() => handleSort("createdAt")}>
                    Date & Time <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                  </TableHead>
                  <TableHead className={thClass} onClick={() => handleSort("updatedAt")}>
                    Last Updated <SortIcon col="updatedAt" sortKey={sortKey} sortDir={sortDir} />
                  </TableHead>
                  <TableHead className={thClass} onClick={() => handleSort("type")}>
                    Type <SortIcon col="type" sortKey={sortKey} sortDir={sortDir} />
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-[#8B8B9D]">
                    Description
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-[#8B8B9D]">
                    Keywords
                  </TableHead>
                  <TableHead className={thClass} onClick={() => handleSort("severity")}>
                    Severity <SortIcon col="severity" sortKey={sortKey} sortDir={sortDir} />
                  </TableHead>
                  <TableHead className={`w-28 ${thClass}`} onClick={() => handleSort("status")}>
                    Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((inc) => (
                  <TableRow key={inc.id} className="border-[#2A2A34] hover:bg-white/[0.02]">
                    <TableCell className="py-2 text-xs font-medium text-[#DDDBDB] whitespace-nowrap">
                      {formatDateTime(inc.createdAt)}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-[#8B8B9D] whitespace-nowrap">
                      {dayjs(inc.updatedAt).fromNow()}
                    </TableCell>
                    <TableCell className="py-2 text-xs font-bold text-white whitespace-nowrap">
                      {formatType(inc.type)}
                    </TableCell>
                    <TableCell className="py-2 max-w-[260px] truncate text-xs text-[#8B8B9D]">
                      {inc.description}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {inc.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-1.5 py-0.5 text-[10px] text-[#DDDBDB]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${severityStyle[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 w-28">
                      <span className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${statusStyle[inc.status]}`}>
                        {inc.status}
                      </span>
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
          </div>
        )}
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
      <EditIncidentModal incident={editing} onClose={() => setEditing(null)} />
    </>
  );
}
