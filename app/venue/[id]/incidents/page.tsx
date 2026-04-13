"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type SortingFn,
} from "@tanstack/react-table";
import { type IncidentSeverity, type IncidentStatus, type IncidentResponse } from "@/lib/api";
import { Eye, Loader2, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorTag, severityVariant, statusVariant } from "@/components/ui/color-tag";
import IncidentDetailModal from "../../components/IncidentDetailModal";
import EditIncidentModal from "../../components/EditIncidentModal";
import { useVenueContext } from "../../context/VenueContext";
import { useIncidentsQuery } from "@/lib/queries";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

dayjs.extend(relativeTime);


const SEVERITY_ORDER: Record<IncidentSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const STATUS_ORDER: Record<IncidentStatus, number> = { COMPLETED: 0, ACTIVE: 1 };

const severitySortFn: SortingFn<IncidentResponse> = (a, b) =>
  SEVERITY_ORDER[a.original.severity] - SEVERITY_ORDER[b.original.severity];

const statusSortFn: SortingFn<IncidentResponse> = (a, b) =>
  STATUS_ORDER[a.original.status] - STATUS_ORDER[b.original.status];

function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-[#4A4A5A]" />;
  return sorted === "asc"
    ? <ChevronUp   className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />
    : <ChevronDown className="ml-1 inline h-3 w-3 text-[#8B8B9D]" />;
}

const thClass = "text-[10px] font-bold uppercase text-[#8B8B9D] cursor-pointer select-none hover:text-[#DDDBDB] transition-colors";

export default function IncidentsPage() {
  const { selectedVenue } = useVenueContext();
  const { data: incidents = [], isLoading, isError } = useIncidentsQuery(selectedVenue?.id);
  const [selected, setSelected] = useState<IncidentResponse | null>(null);
  const [editing, setEditing]   = useState<IncidentResponse | null>(null);
  const [sorting, setSorting]   = useState<SortingState>([{ id: "updatedAt", desc: true }]);

  const columns: ColumnDef<IncidentResponse>[] = [
    {
      accessorKey: "createdAt",
      header: "Date & Time",
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-[#DDDBDB] whitespace-nowrap">
          {dayjs(getValue<string>()).format("MMM D, YYYY h:mm A")}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8B8B9D] whitespace-nowrap">
          {dayjs(getValue<string>()).fromNow()}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => (
        <span className="text-xs font-bold text-white whitespace-nowrap">
          {formatType(getValue<string>())}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="max-w-65 truncate text-xs text-[#8B8B9D]">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "keywords",
      header: "Keywords",
      enableSorting: false,
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue<string[]>().map((kw, i) => (
            <ColorTag key={i}>{kw}</ColorTag>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      sortingFn: severitySortFn,
      cell: ({ getValue }) => {
        const v = getValue<IncidentSeverity>();
        return <ColorTag variant={severityVariant[v]}>{v}</ColorTag>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      sortingFn: statusSortFn,
      cell: ({ getValue }) => {
        const v = getValue<IncidentStatus>();
        return <ColorTag variant={statusVariant[v]}>{v}</ColorTag>;
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Button
            size="icon-sm"
            onClick={() => setSelected(row.original)}
            className="border border-primary bg-primary/50 text-white hover:bg-primary/70 ml-auto"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            onClick={() => setEditing(row.original)}
            className="border border-primary bg-transparent text-primary hover:bg-primary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: incidents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-8 py-8">
        {isLoading && (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B8B9D]" />
          </div>
        )}
        {isError && <p className="mt-8 text-sm text-[#E84868]">Failed to load incidents.</p>}
        {!isLoading && !isError && incidents.length === 0 && (
          <p className="mt-8 text-sm text-[#8B8B9D]">No incidents reported yet.</p>
        )}

        {!isLoading && incidents.length > 0 && (
          <div className="mt-6 rounded-xl border border-[#2A2A34] bg-[#11111B]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-[#2A2A34] hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={header.column.getCanSort() ? thClass : "text-[10px] font-bold uppercase text-[#8B8B9D]"}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIndicator sorted={header.column.getIsSorted()} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-[#2A2A34] hover:bg-white/2">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
      <EditIncidentModal   incident={editing}  onClose={() => setEditing(null)} />
    </>
  );
}
