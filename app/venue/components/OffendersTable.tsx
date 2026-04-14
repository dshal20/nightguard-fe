"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Eye, Pencil } from "lucide-react";
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
import { ColorTag } from "@/components/ui/color-tag";
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
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

  const selected = offenders.find((o) => o.id === searchParams.get("id")) ?? null;
  const [editingOffender, setEditingOffender] = useState<OffenderResponse | null>(null);

  function handleClose() {
    if (editingOffender) {
      setEditingOffender(null);
    } else {
      router.replace("?", { scroll: false });
    }
  }

  const columns = useMemo<ColumnDef<OffenderResponse>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const o = row.original;
        const initials = `${o.firstName[0] ?? ""}${o.lastName[0] ?? ""}`.toUpperCase();
        const photo = o.photoUrls?.[0];
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
                  {initials}
                </div>
              )}
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
          <ColorTag>{v}</ColorTag>
        ) : (
          <span className="text-[#4A4A5A]">—</span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ getValue }) => (
        <span className="block max-w-55 truncate text-xs text-[#8B8B9D]">{(getValue() as string) || "—"}</span>
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
        <div className="flex items-center gap-2.5">
          <Button
            size="icon-sm"
            onClick={() => router.replace(`?id=${row.original.id}`, { scroll: false })}
            className="border border-primary bg-primary/50 text-white hover:bg-primary/70"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            onClick={() => setEditingOffender(row.original)}
            className="border border-primary bg-transparent text-primary hover:bg-primary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [router, setEditingOffender]);

  // eslint-disable-next-line react-hooks/incompatible-library
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

        {!isLoading && offenders.length > 0 && (
          <div className="border-t border-[#2A2A34] px-4 py-3 text-xs text-[#4A4A5A]">
            {table.getFilteredRowModel().rows.length} of {offenders.length} offender{offenders.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <OffenderDetailModal
        offender={editingOffender ?? selected}
        initialEditing={!!editingOffender}
        onClose={handleClose}
      />
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
