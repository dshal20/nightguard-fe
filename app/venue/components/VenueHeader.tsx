"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
          <Button
            type="button"
            size="sm"
            onClick={() => setReportOpen(true)}
            className="h-8 gap-1.5 border border-green-400/40 bg-green-400/10 px-3 text-green-400 hover:bg-green-400/15 hover:text-green-400"
          >
            + New Report
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 border border-white/15 bg-white/10 px-3 text-white/70 hover:bg-white/15 hover:text-white"
          >
            Export Event Report
          </Button>
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
