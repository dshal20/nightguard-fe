"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { auth } from "@/app/src/lib/firebase";
import { getOffender } from "@/lib/api";
import type { IncidentResponse, OffenderResponse } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Building2, ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ColorTag, severityVariant } from "@/components/ui/color-tag";

// Looser shape so the modal works with both IncidentResponse (has reporter)
// and notification activity incidents (no reporter, has sourceVenueName instead).
export type IncidentModalData = Omit<IncidentResponse, "reporter" | "venueId"> & {
  reporter?: IncidentResponse["reporter"];
  venueId?: string;
};

function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function OffenderRow({ id, onClose }: { id: string; onClose: () => void }) {
  const [offender, setOffender] = useState<OffenderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const data = await getOffender(token, id);
        if (!cancelled) setOffender(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-[#26262F]" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28 rounded bg-[#26262F]" />
          <Skeleton className="h-2.5 w-40 rounded bg-[#1E1E2C]" />
        </div>
      </div>
    );
  }

  if (!offender) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
        {offender.firstName[0]}{offender.lastName[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#DDDBDB]">
          {offender.firstName} {offender.lastName}
        </p>
        {offender.physicalMarkers && (
          <p className="mt-0.5 text-[11px] text-[#6B6B7D]">{offender.physicalMarkers}</p>
        )}
      </div>
      <Link
        href={`/venue/offenders?id=${offender.id}`}
        onClick={onClose}
        className="flex shrink-0 items-center gap-1 rounded-md border border-[#2A2A34] bg-transparent px-2.5 py-1.5 text-[10px] font-medium text-[#8B8B9D] transition hover:bg-white/5 hover:text-white"
      >
        View Profile
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

interface Props {
  incident: IncidentModalData | null;
  onClose: () => void;
  /** When provided, renders a venue source row instead of the reporter row. */
  sourceVenueName?: string;
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url);
}

export default function IncidentDetailModal({ incident, onClose, sourceVenueName }: Props) {
  const reporter = incident?.reporter;
  const reporterName = [reporter?.firstName, reporter?.lastName].filter(Boolean).join(" ");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const imageUrls = (incident?.mediaUrls ?? []).filter((u) => !isVideoUrl(u));

  useEffect(() => {
    setLightboxIndex(null);
  }, [incident?.id]);

  const lb = lightboxIndex;

  return (
    <>
    <Dialog open={!!incident} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base font-bold text-[#DDDBDB]">
              {incident ? formatType(incident.type) : ""}
            </DialogTitle>
            {incident && (
              <ColorTag variant={severityVariant[incident.severity]}>{incident.severity}</ColorTag>
            )}
          </div>
          {incident && (
            <p className="text-[11px] text-[#8B8B9D]">{formatDateTime(incident.createdAt)}</p>
          )}
        </DialogHeader>

        {incident && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase text-[#8B8B9D]">Description</p>
              <p className="text-sm text-[#DDDBDB]">{incident.description}</p>
            </div>

            {incident.keywords?.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {incident.keywords.map((kw, i) => (
                    <span key={i} className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {incident.offenderIds && incident.offenderIds.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">
                  Offenders ({incident.offenderIds.length})
                </p>
                <div className="space-y-2">
                  {incident.offenderIds.map((id) => (
                    <OffenderRow key={id} id={id} onClose={onClose} />
                  ))}
                </div>
              </div>
            )}

            {/* Media */}
            {incident.mediaUrls?.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">
                  Media ({incident.mediaUrls.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {incident.mediaUrls.map((url, i) =>
                    isVideoUrl(url) ? (
                      <video
                        key={i}
                        src={url}
                        controls
                        className="max-h-40 rounded-md border border-[#2A2A34]"
                      />
                    ) : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIndex(imageUrls.indexOf(url))}
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#2A2A34] hover:opacity-80 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Reporter row — shown for own-venue incidents */}
            {!sourceVenueName && reporter && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">Reported By</p>
                <div className="flex items-center gap-2.5 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#262B75]">
                    <User className="h-3.5 w-3.5 text-[#8B8B9D]" />
                  </div>
                  <div>
                    {reporterName && <p className="text-xs font-bold text-[#DDDBDB]">{reporterName}</p>}
                    <p className="text-[11px] text-[#8B8B9D]">{reporter.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Source venue row — shown for network notifications */}
            {sourceVenueName && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8B8B9D]">Reported by Venue</p>
                <div className="flex items-center gap-2.5 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#262B75]">
                    <Building2 className="h-3.5 w-3.5 text-[#8B8B9D]" />
                  </div>
                  <p className="text-xs font-semibold text-[#DDDBDB]">{sourceVenueName}</p>
                </div>
              </div>
            )}

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

    {lb !== null &&
      imageUrls.length > 0 &&
      createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
          {imageUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! - 1 + imageUrls.length) % imageUrls.length);
                }}
                className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! + 1) % imageUrls.length);
                }}
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
                {lb + 1} / {imageUrls.length}
              </p>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrls[lb]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}
