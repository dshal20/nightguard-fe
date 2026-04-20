"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationActivityQuery } from "@/lib/queries";
import { useVenueContext } from "../context/VenueContext";

type TimeRange = { label: string; minutes: number };

const TIME_RANGES: TimeRange[] = [
  { label: "Last 30 Minutes", minutes: 30 },
  { label: "Last Hour", minutes: 60 },
  { label: "Last 6 Hours", minutes: 360 },
  { label: "Last 24 Hours", minutes: 1440 },
];

const tint = "rgba(75,123,245,0.07)";
const dot = "#4B7BF5";

export default function NetworkAlertsCard() {
  const { selectedVenue } = useVenueContext();
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[1]);
  const { data: activity = [], isLoading } = useNotificationActivityQuery(
    selectedVenue?.id,
    timeRange.minutes,
  );

  const venueCount = new Set(activity.map((a) => a.fromVenueId)).size;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] px-5 pt-5 pb-4"
      style={{
        background: `radial-gradient(ellipse 100% 100% at 100% 0%, ${tint}, transparent 100%), #11111B`,
      }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="h-1.75 w-1.75 shrink-0 rounded-full" style={{ background: dot }} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
          Network Alerts
        </p>
      </div>

      {/* Value */}
      <p className="mt-5 text-[42px] font-bold leading-none tracking-tight text-white">
        {isLoading ? "—" : activity.length}
      </p>

      {/* Separator */}
      <div className="my-4 h-px w-full bg-white/6" />

      {/* Time range dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-[#8B8B9D] outline-none transition hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white">
          {timeRange.label}
          <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] border-white/[0.07] bg-[#11111B] p-1 text-[#8B8B9D] shadow-xl shadow-black/40"
        >
          {TIME_RANGES.map((r) => (
            <DropdownMenuItem
              key={r.minutes}
              onSelect={() => setTimeRange(r)}
              className={`cursor-pointer text-[11px] focus:bg-white/5 focus:text-white ${timeRange.minutes === r.minutes ? "text-white" : ""}`}
            >
              {r.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Context */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-white">
          {isLoading ? "Loading…" : `From ${venueCount} venue${venueCount !== 1 ? "s" : ""}`}
        </p>
        <p className="text-[10px] leading-relaxed text-white/60">
          {timeRange.label.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
