"use client";

import { useState } from "react";
import IncidentReportDialog from "./IncidentReportDialog";

interface VenueHeaderProps {
  venueId: string;
}

export default function VenueHeader({ venueId }: VenueHeaderProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] font-black leading-8 text-[#E2E2E2]">
          Tonights Operations
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#2B36CD] bg-[#2B36CD]/20 px-4 text-xs font-bold text-white"
          >
            <span className="text-[#75FB94]">+</span>
            New Report
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 text-xs font-bold text-white"
          >
            Export Event Report
          </button>
        </div>
      </header>

      <IncidentReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        venueId={venueId}
      />
    </>
  );
}
