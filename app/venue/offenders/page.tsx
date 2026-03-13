"use client";

import { useState, useMemo } from "react";
import { Search, AlertCircle, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock offender type for UI only — no backend yet
type MockOffender = {
  id: string;
  name: string;
  addedAt: string;
  incidentCount: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  attributes: string[];
  hasImage?: boolean; // UI only: whether to show "View image" (no real logic)
};

// Mock data for UI demonstration (hasImage = show "View image" button; no real image)
const MOCK_OFFENDERS: MockOffender[] = [
  { id: "1", name: "John Smith", addedAt: "2025-02-15", incidentCount: 3, severity: "HIGH", attributes: ["Banned", "Repeat offender"], hasImage: true },
  { id: "2", name: "Maria Garcia", addedAt: "2025-03-01", incidentCount: 1, severity: "MEDIUM", attributes: ["Warned", "Aggressive"], hasImage: true },
  { id: "3", name: "David Chen", addedAt: "2025-02-28", incidentCount: 2, severity: "MEDIUM", attributes: ["Warned", "No re-entry"], hasImage: false },
  { id: "4", name: "Sarah Williams", addedAt: "2025-03-08", incidentCount: 5, severity: "HIGH", attributes: ["Banned", "Multiple incidents"], hasImage: true },
  { id: "5", name: "James Wilson", addedAt: "2025-03-10", incidentCount: 0, severity: "LOW", attributes: ["Watchlist"], hasImage: false },
  { id: "6", name: "Emily Brown", addedAt: "2025-01-20", incidentCount: 4, severity: "HIGH", attributes: ["Banned", "Known to staff"], hasImage: true },
];

const severityStyle: Record<MockOffender["severity"], string> = {
  LOW: "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH: "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function OffendersPage() {
  const [search, setSearch] = useState("");
  const [imageModalOffender, setImageModalOffender] = useState<MockOffender | null>(null);

  const filteredOffenders = useMemo(() => {
    if (!search.trim()) return MOCK_OFFENDERS;
    const q = search.toLowerCase().trim();
    return MOCK_OFFENDERS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.attributes.some((a) => a.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-screen-2xl px-8 py-8">
      <p className="text-sm text-[#8B8B9D]">
        Search and manage people who have been reported at your venue. Real data will appear when the backend is connected.
      </p>

      {/* Search bar */}
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B9D]" />
        <Input
          type="search"
          placeholder="Search by name or attribute..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-[#2A2A34] bg-[#11111B] pl-9 text-[#E2E2E2] placeholder:text-[#6B6B7D] focus-visible:border-[#3B3B48] focus-visible:ring-[#2B36CD]/50"
        />
      </div>

      {/* Database table */}
      <div className="mt-6 rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left text-[8px] font-bold uppercase leading-[18px] text-[#8B8B9D]">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Attributes</th>
                <th className="pb-3 pr-4">Added</th>
                <th className="pb-3 pr-4">Incident #</th>
                <th className="pb-3 pr-4 w-24">Image</th>
                <th className="pb-3 pr-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffenders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#8B8B9D]">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        {search.trim() ? "No offenders match your search." : "No offenders in the database yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffenders.map((offender) => (
                  <tr
                    key={offender.id}
                    className="border-b border-[#2A2A34] transition hover:bg-white/[0.02]"
                  >
                    <td className="py-4 pr-4">
                      <span className="text-sm font-bold text-white">
                        {offender.name}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {offender.attributes.map((attr) => (
                          <span
                            key={attr}
                            className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-xs font-medium text-[#8B8B9D] whitespace-nowrap">
                      {formatDate(offender.addedAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-bold text-white">
                        {offender.incidentCount}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {offender.hasImage ? (
                        <button
                          type="button"
                          onClick={() => setImageModalOffender(offender)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2.5 py-1.5 text-[10px] font-medium text-[#8B8B9D] transition hover:border-[#3B3B48] hover:bg-white/[0.04] hover:text-[#DDDBDB]"
                        >
                          <ImageIcon className="h-3 w-3" />
                          View image
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B6B7D]">—</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span
                        className={`inline-flex rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${severityStyle[offender.severity]}`}
                      >
                        {offender.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image viewer modal — click to see attached image (placeholder only, no real image) */}
      <Dialog open={!!imageModalOffender} onOpenChange={(open) => !open && setImageModalOffender(null)}>
        <DialogContent className="max-w-md border-[#2A2A34] bg-[#11111B] text-[#E2E2E2]">
          <DialogHeader>
            <DialogTitle className="text-[#E2E2E2]">
              {imageModalOffender ? `Attached image — ${imageModalOffender.name}` : "Attached image"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {/* Placeholder for image: not shown in list, only after clicking "View image" */}
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-[#2A2A34] bg-[#1a1a28]">
              <div className="flex flex-col items-center gap-2 text-[#6B6B7D]">
                <ImageIcon className="h-12 w-12" />
                <span className="text-sm font-medium">Image would load here</span>
                <span className="text-xs">(No backend — placeholder only)</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
