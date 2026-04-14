"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVenueContext } from "../../context/VenueContext";
import { usePatronLogsQuery } from "@/lib/queries";
import type { PatronLogResponse } from "@/lib/api";

dayjs.extend(relativeTime);

function SortButton({ column }: { column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void } }) {
  const sorted = column.getIsSorted();
  return (
    <button type="button" onClick={() => column.toggleSorting(sorted === "asc")} className="ml-1 inline-flex">
      {sorted === "asc" ? (
        <ChevronUp className="h-3 w-3 text-[#8B8B9D]" />
      ) : sorted === "desc" ? (
        <ChevronDown className="h-3 w-3 text-[#8B8B9D]" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 text-[#4A4A5A]" />
      )}
    </button>
  );
}

export default function LogsPage() {
  const { selectedVenue } = useVenueContext();
  const { data: logs = [], isLoading } = usePatronLogsQuery(selectedVenue?.id);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

  const columns = useMemo<ColumnDef<PatronLogResponse>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) =>
        [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" "),
      cell: ({ row }) => {
        const log = row.original;
        const first = log.firstName ?? "";
        const last = log.lastName ?? "";
        const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
        const name = [first, log.middleName, last].filter(Boolean).join(" ") || "Unknown";
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
              {initials}
            </div>
            <span className="font-medium text-white">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: "Date of Birth",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return (
          <span className="text-[#8B8B9D]">
            {v ? dayjs(v).format("MM/DD/YYYY") : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "driversLicenseId",
      header: "License #",
      cell: ({ getValue }) => (
        <span className="font-mono text-[11px] text-[#8B8B9D]">
          {(getValue() as string | null) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ getValue }) => (
        <span className="text-[#8B8B9D]">{(getValue() as string | null) ?? "—"}</span>
      ),
    },
    {
      accessorKey: "decision",
      header: "Decision",
      cell: ({ getValue }) => {
        const decision = getValue() as "ADMITTED" | "DENIED";
        const admitted = decision === "ADMITTED";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              admitted
                ? "border border-[#75FB94]/30 bg-[#75FB94]/10 text-[#75FB94]"
                : "border border-[#E84868]/30 bg-[#E84868]/10 text-[#E84868]"
            }`}
          >
            {admitted ? "Admitted" : "Denied"}
          </span>
        );
      },
    },
    {
      id: "recordedBy",
      header: "Recorded By",
      accessorFn: (row) =>
        row.recordedBy
          ? [row.recordedBy.firstName, row.recordedBy.lastName].filter(Boolean).join(" ")
          : "",
      cell: ({ getValue }) => (
        <span className="text-[#8B8B9D]">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span className="flex items-center whitespace-nowrap">
          Time <SortButton column={column} />
        </span>
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-[#8B8B9D]">
          {dayjs(getValue() as string).fromNow()}
        </span>
      ),
    },
  ], []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="mx-auto max-w-screen-2xl px-8 py-8">
      <p className="text-sm text-[#8B8B9D]">
        A record of every patron scanned and admitted or denied at your venue.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B9D]" />
        <Input
          type="search"
          placeholder="Search logs..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border-[#2A2A34] bg-[#11111B] pl-9 text-[#E2E2E2] placeholder:text-[#6B6B7D] focus-visible:border-[#3B3B48] focus-visible:ring-[#2B36CD]/50"
        />
      </div>

      <div className="mt-6 rounded-xl border border-[#2A2A34] bg-[#11111B]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-[#2A2A34] hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-[10px] font-bold uppercase text-[#8B8B9D]">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#8B8B9D]">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#8B8B9D]">
                  {globalFilter ? "No logs match your search." : "No patron logs yet. Use the ID Scanner on the Patrons page to log entries."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-[#2A2A34] hover:bg-white/2">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && logs.length > 0 && (
          <div className="border-t border-[#2A2A34] px-4 py-3 text-xs text-[#4A4A5A]">
            {table.getFilteredRowModel().rows.length} of {logs.length} log{logs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
