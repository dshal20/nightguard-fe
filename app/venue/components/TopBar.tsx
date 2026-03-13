"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import IncidentReportDialog from "./IncidentReportDialog";
import { useVenueContext } from "../context/VenueContext";

const PAGE_TITLES: Record<string, string> = {
  "/venue/incidents": "Incidents",
  "/venue/capacity":  "Headcount",
  "/venue/offenders": "Offenders",
  "/venue/account":   "Account",
};

export default function TopBar() {
  const pathname = usePathname() ?? "";
  const { selectedVenue } = useVenueContext();
  const [reportOpen, setReportOpen] = useState(false);

  const title = PAGE_TITLES[pathname];

  // Don't render on the dashboard
  if (!title) return null;

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#1A1A26] bg-[#0F0F19]/80 px-8 py-4 backdrop-blur-sm">
        <h1 className="text-xl font-black tracking-tight text-[#E2E2E2]">{title}</h1>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="flex h-8 items-center gap-2 rounded-lg border border-green-400/50 bg-green-400/10 px-3 text-xs font-bold text-green-400 transition hover:border-green-400 hover:bg-green-400/15"
          disabled={!selectedVenue}
        >
          + New Report
        </button>
      </div>

      {selectedVenue && (
        <IncidentReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          venueId={selectedVenue.id}
        />
      )}
    </>
  );
}
