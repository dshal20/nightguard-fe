"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { ChevronDown } from "lucide-react";
import { ColorTag, severityVariant } from "@/components/ui/color-tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationActivityQuery } from "@/lib/queries";
import { useVenueContext } from "../context/VenueContext";
import IncidentDetailModal from "./IncidentDetailModal";
import type { NotificationActivity, IncidentType } from "@/lib/api";
import type { IncidentModalData } from "./IncidentDetailModal";

dayjs.extend(relativeTime);

function formatIncidentType(type: IncidentType): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function toModalData(activity: NotificationActivity): IncidentModalData | null {
  const i = activity.incident;
  if (!i) return null;
  return {
    id: i.id,
    type: i.type,
    severity: i.severity,
    status: i.status,
    description: i.description,
    keywords: i.keywords,
    offenderIds: i.offenderIds,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}

type TimeRange = { label: string; minutes: number };

const TIME_RANGES: TimeRange[] = [
  { label: "Last 30 Minutes", minutes: 30 },
  { label: "Last Hour", minutes: 60 },
  { label: "Last 6 Hours", minutes: 360 },
  { label: "Last 24 Hours", minutes: 1440 },
];

export default function LiveActivity() {
  const { selectedVenue } = useVenueContext();
  const [timeRange, setTimeRange] = useState(TIME_RANGES[1]);
  const { data: activity = [], isLoading } = useNotificationActivityQuery(
    selectedVenue?.id,
    timeRange.minutes,
  );
  const [selected, setSelected] = useState<NotificationActivity | null>(null);

  return (
    <>
      <div className="rounded-xl border border-white/[0.07] bg-[#11111B]">
        <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#E2E2E2]">
              Live Activity
            </h2>
            <p className="mt-0.5 text-[10px] text-[#44445A]">
              {isLoading
                ? "Loading…"
                : `${activity.length} network event${activity.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-[#8B8B9D] outline-none transition hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white">
              {timeRange.label}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-40 border-white/[0.07] bg-[#11111B] p-1 text-[#8B8B9D] shadow-xl shadow-black/40"
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
        </div>

        {isLoading && (
          <div className="px-5 py-6 text-center text-xs text-[#44445A]">
            Loading…
          </div>
        )}

        {!isLoading && activity.length === 0 && (
          <div className="px-5 py-6 text-center text-xs text-[#44445A]">
            No network activity yet
          </div>
        )}

        <ul className="divide-y divide-white/4">
          {activity.map((a) => {
            const incident = a.incident;
            const offender = a.offender;

            return (
              <li
                key={a.id}
                className="px-5 py-4 transition-colors hover:bg-white/2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="truncate text-xs font-semibold text-white">
                      {incident
                        ? `${formatIncidentType(incident.type)} @ ${a.fromVenueName}`
                        : offender
                        ? `Offender Added @ ${a.fromVenueName}`
                        : a.fromVenueName}
                    </p>
                    {incident?.description && (
                      <p className="text-[12px] mt-1 leading-relaxed text-white/80">
                        {incident.description}
                      </p>
                    )}
                    {offender && !incident && (
                      <div className="mt-1">
                        <p className="text-[12px] font-medium text-white/80">
                          {offender.firstName} {offender.lastName}
                        </p>
                        {offender.physicalMarkers && (
                          <p className="text-[11px] text-[#44445A] mt-0.5">
                            {offender.physicalMarkers}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {incident && (
                      <ColorTag variant={severityVariant[incident.severity]}>
                        {incident.severity}
                      </ColorTag>
                    )}
                    {offender && !incident && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold uppercase text-[#8B8B9D]">
                        {offender.firstName?.[0]}{offender.lastName?.[0]}
                      </div>
                    )}
                    <span className="text-[11px] tabular-nums text-[#44445A]">
                      {dayjs(a.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2"></div>

                {incident && (
                  <button
                    onClick={() => setSelected(a)}
                    className="mt-3 w-full rounded-md border border-white/10 bg-white/5 py-1.5 text-[11px] font-medium text-[#8B8B9D] transition hover:bg-white/10 hover:text-white"
                  >
                    View Details
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <IncidentDetailModal
        incident={selected ? toModalData(selected) : null}
        onClose={() => setSelected(null)}
        sourceVenueName={selected?.fromVenueName}
      />
    </>
  );
}
