"use client";

import type { IncidentResponse, IncidentSeverity } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

const severityStyle: Record<IncidentSeverity, string> = {
  LOW: "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH: "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Props {
  incident: IncidentResponse | null;
  onClose: () => void;
}

export default function IncidentDetailModal({ incident, onClose }: Props) {
  const reporter = incident?.reporter;
  const reporterName = [reporter?.firstName, reporter?.lastName].filter(Boolean).join(" ");

  return (
    <Dialog open={!!incident} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base font-bold text-[#DDDBDB]">
              {incident ? formatType(incident.type) : ""}
            </DialogTitle>
            {incident && (
              <span
                className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${severityStyle[incident.severity]}`}
              >
                {incident.severity}
              </span>
            )}
          </div>
          {incident && (
            <p className="text-[11px] text-[#8B8B9D]">
              {formatDateTime(incident.createdAt)}
            </p>
          )}
        </DialogHeader>

        {incident && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase text-[#8B8B9D]">Description</p>
              <p className="text-sm text-[#DDDBDB]">{incident.description}</p>
            </div>

            {incident.keywords.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {incident.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {incident.offenders && incident.offenders.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">
                  Offenders ({incident.offenders.length})
                </p>
                <div className="space-y-2">
                  {incident.offenders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-start gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
                        {o.firstName[0]}{o.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#DDDBDB]">
                          {o.firstName} {o.lastName}
                        </p>
                        {o.physicalMarkers && (
                          <p className="mt-0.5 text-[11px] text-[#6B6B7D]">{o.physicalMarkers}</p>
                        )}
                        {o.notes && (
                          <p className="mt-0.5 text-[11px] text-[#6B6B7D]">{o.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">Reported By</p>
              <div className="flex items-center gap-2.5 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#262B75]">
                  <User className="h-3.5 w-3.5 text-[#8B8B9D]" />
                </div>
                <div>
                  {reporterName && (
                    <p className="text-xs font-bold text-[#DDDBDB]">{reporterName}</p>
                  )}
                  <p className="text-[11px] text-[#8B8B9D]">{reporter?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#8B8B9D]">Reported</p>
                <p className="mt-0.5 text-xs text-[#DDDBDB]">{formatDateTime(incident.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#8B8B9D]">Last Updated</p>
                <p className="mt-0.5 text-xs text-[#DDDBDB]">{formatDateTime(incident.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
