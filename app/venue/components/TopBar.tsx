"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import IncidentReportDialog from "./IncidentReportDialog";
import CreateOffenderModal from "./CreateOffenderModal";
import { useVenueContext } from "../context/VenueContext";

const SUB_PAGE_TITLES: Record<string, string> = {
  incidents:   "Incidents",
  capacity:    "Patrons",
  offenders:   "Offenders",
  logs:        "Patron Logs",
  account:     "Account",
  preferences: "Venue Preferences",
};

export default function TopBar() {
  const pathname = usePathname() ?? "";
  const { selectedVenue } = useVenueContext();
  const [reportOpen, setReportOpen] = useState(false);
  const [offenderOpen, setOffenderOpen] = useState(false);

  // Pathname is /venue/[id]/subpage — extract the third segment
  const segments = pathname.split("/").filter(Boolean);
  const subPage = segments[2];
  const title = subPage ? SUB_PAGE_TITLES[subPage] : null;

  // Don't render on the dashboard
  if (!title) return null;

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#1A1A26] bg-[#0F0F19]/80 px-8 py-4 backdrop-blur-sm">
        <h1 className="text-xl font-black tracking-tight text-[#E2E2E2]">{title}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffenderOpen(true)}
            className="flex h-8 items-center gap-2 rounded-lg border border-red-400/50 bg-red-400/10 px-3 text-xs font-bold text-red-400 transition hover:border-red-400 hover:bg-red-400/15"
            disabled={!selectedVenue}
          >
            + Add Offender
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex h-8 items-center gap-2 rounded-lg border border-green-400/50 bg-green-400/10 px-3 text-xs font-bold text-green-400 transition hover:border-green-400 hover:bg-green-400/15"
            disabled={!selectedVenue}
          >
            + New Report
          </button>
        </div>
      </div>

      {selectedVenue && (
        <>
          <IncidentReportDialog
            open={reportOpen}
            onOpenChange={setReportOpen}
            venueId={selectedVenue.id}
          />
          <CreateOffenderModal
            open={offenderOpen}
            venueId={selectedVenue.id}
            onClose={() => setOffenderOpen(false)}
            onCreated={() => setOffenderOpen(false)}
          />
        </>
      )}
    </>
  );
}
