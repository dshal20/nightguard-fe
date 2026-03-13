"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useVenueContext } from "../context/VenueContext";
import { useOffendersQuery } from "@/lib/queries";
import type { OffenderResponse } from "@/lib/api";
import OffenderDetailModal from "./OffenderDetailModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

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

function OffendersTableInner() {
  const { selectedVenue } = useVenueContext();
  const { data: offenders = [], isLoading } = useOffendersQuery(selectedVenue?.id);
  const searchParams = useSearchParams();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [selected, setSelected] = useState<OffenderResponse | null>(null);

  // Auto-open modal when arriving via /offenders?id=xxx
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || offenders.length === 0) return;
    const match = offenders.find((o) => o.id === id);
    if (match) setSelected(match);
  }, [searchParams, offenders]);

  const columns = useMemo<ColumnDef<OffenderResponse>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const o = row.original;
        const initials = `${o.firstName[0] ?? ""}${o.lastName[0] ?? ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
              {initials}
            </div>
            <span className="font-medium text-white">{o.firstName} {o.lastName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "physicalMarkers",
      header: "Physical Markers",
      cell: ({ getValue }) => (
        <span className="text-[#8B8B9D]">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "riskScore",
      header: ({ column }) => (
        <span className="flex items-center">Risk Score <SortButton column={column} /></span>
      ),
      cell: ({ getValue }) => {
        const score = getValue() as number | null;
        if (score == null) return <span className="text-[#4A4A5A]">—</span>;
        const color = score >= 8 ? "text-[#E84868]" : score >= 5 ? "text-[#DBA940]" : "text-[#5B6AFF]";
        return <span className={`font-bold ${color}`}>{score}</span>;
      },
    },
    {
      accessorKey: "currentStatus",
      header: "Status",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined;
        return v ? (
          <span className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]">{v}</span>
        ) : (
          <span className="text-[#4A4A5A]">—</span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ getValue }) => (
        <span className="block max-w-[220px] truncate text-xs text-[#8B8B9D]">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "globalId",
      header: "Global ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-[11px] text-[#4A4A5A]">
          {getValue() ? String(getValue()).slice(0, 8) + "…" : "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span className="flex items-center whitespace-nowrap">Added <SortButton column={column} /></span>
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-[#8B8B9D]">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <span className="flex items-center whitespace-nowrap">Last Updated <SortButton column={column} /></span>
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-[#8B8B9D]">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelected(row.original)}
          className="h-8 gap-1.5 border border-[#2A2A34] bg-transparent px-3 text-[#8B8B9D] hover:bg-white/5 hover:text-white"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ], []);

  const table = useReactTable({
    data: offenders,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <p className="text-sm text-[#8B8B9D]">
        Search and manage people who have been reported at your venue.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B9D]" />
        <Input
          type="search"
          placeholder="Search offenders..."
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
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#8B8B9D]">Loading…</TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#8B8B9D]">
                  {globalFilter ? "No offenders match your search." : "No offenders in the database yet."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-[#2A2A34] hover:bg-white/[0.02]">
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

        {!isLoading && offenders.length > 0 && (
          <div className="border-t border-[#2A2A34] px-4 py-3 text-xs text-[#4A4A5A]">
            {table.getFilteredRowModel().rows.length} of {offenders.length} offender{offenders.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <OffenderDetailModal offender={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function OffendersTable() {
  return (
    <Suspense>
      <OffendersTableInner />
    </Suspense>
  );
}
