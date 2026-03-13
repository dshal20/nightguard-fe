"use client";

import { useState } from "react";
import { Ban, ShieldX } from "lucide-react";
import type { OffenderResponse, IncidentSeverity } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOffenderIncidentsQuery } from "@/lib/queries";

const severityStyle: Record<IncidentSeverity, string> = {
  LOW:    "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH:   "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

type ActionType = "ban" | "trespass";

interface IssueActionDialogProps {
  open: boolean;
  type: ActionType;
  offenderName: string;
  onConfirm: (expiresAt: string | null) => void;
  onCancel: () => void;
}

function IssueActionDialog({ open, type, offenderName, onConfirm, onCancel }: IssueActionDialogProps) {
  const [expiresAt, setExpiresAt] = useState("");

  const label = type === "ban" ? "Ban" : "Trespass";
  const description =
    type === "ban"
      ? "This will issue a ban for this offender. They will not be permitted entry."
      : "This will issue a trespass notice for this offender. This is a formal legal notice.";

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#E2E2E2]">
            Issue {label} — {offenderName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#8B8B9D]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-1">
          <label className={labelClass}>Expiration Date (optional)</label>
          <Input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] [color-scheme:dark] focus-visible:ring-[#3B3B5A]"
          />
          <p className="mt-1 text-[10px] text-[#6B6B7D]">Leave blank for an indefinite {label.toLowerCase()}.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(expiresAt || null)}
            className={
              type === "ban"
                ? "bg-[#E84868] text-white hover:bg-[#c73355]"
                : "bg-[#DBA940] text-black hover:bg-[#c49535]"
            }
          >
            Confirm {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface Props {
  offender: OffenderResponse | null;
  onClose: () => void;
}

export default function OffenderDetailModal({ offender, onClose }: Props) {
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const { data: incidents = [], isLoading: incidentsLoading } = useOffenderIncidentsQuery(offender?.id);

  function handleConfirmAction(expiresAt: string | null) {
    // No backend connection yet — just close
    console.log(`${pendingAction} issued for ${offender?.id}, expires: ${expiresAt ?? "never"}`);
    setPendingAction(null);
  }

  const initials = offender
    ? `${offender.firstName[0] ?? ""}${offender.lastName[0] ?? ""}`.toUpperCase()
    : "";

  const fullName = offender ? `${offender.firstName} ${offender.lastName}` : "";

  return (
    <>
      <Dialog open={!!offender} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#E2E2E2]">
              Offender Profile
            </DialogTitle>
          </DialogHeader>

          {offender && (
            <div className="space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-lg font-bold text-[#8B8B9D]">
                  {initials}
                </div>
                <div>
                  <p className="text-base font-bold text-white">{fullName}</p>
                  {offender.currentStatus && (
                    <span className="mt-1 inline-block rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]">
                      {offender.currentStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                <div>
                  <p className={labelClass}>Risk Score</p>
                  <p className="text-sm text-[#DDDBDB]">
                    {offender.riskScore != null ? offender.riskScore : "—"}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Added</p>
                  <p className="text-sm text-[#DDDBDB]">{formatDate(offender.createdAt)}</p>
                </div>
                <div>
                  <p className={labelClass}>Last Updated</p>
                  <p className="text-sm text-[#DDDBDB]">{formatDate(offender.updatedAt)}</p>
                </div>
                <div>
                  <p className={labelClass}>Global ID</p>
                  <p className="truncate font-mono text-[11px] text-[#6B6B7D]">
                    {offender.globalId ?? "—"}
                  </p>
                </div>
              </div>

              {offender.physicalMarkers && (
                <div>
                  <p className={labelClass}>Physical Markers</p>
                  <p className="text-sm text-[#DDDBDB]">{offender.physicalMarkers}</p>
                </div>
              )}

              {offender.notes && (
                <div>
                  <p className={labelClass}>Notes</p>
                  <p className="text-sm text-[#DDDBDB]">{offender.notes}</p>
                </div>
              )}

              {/* Incidents */}
              <div>
                <p className={labelClass}>Linked Incidents</p>
                {incidentsLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                        <Skeleton className="h-3 w-24 rounded bg-[#26262F]" />
                        <Skeleton className="h-4 w-14 rounded-md bg-[#26262F]" />
                        <Skeleton className="ml-auto h-3 w-16 rounded bg-[#1E1E2C]" />
                      </div>
                    ))}
                  </div>
                ) : incidents.length === 0 ? (
                  <p className="text-sm text-[#4A4A5A]">No incidents linked.</p>
                ) : (
                  <div className="space-y-2">
                    {incidents.map((inc) => (
                      <div key={inc.id} className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] px-3 py-2.5">
                        <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#DDDBDB]">
                          {formatType(inc.type)}
                        </p>
                        <span className={`shrink-0 rounded-[6px] border px-2 py-0.5 text-[10px] font-medium leading-[18px] ${severityStyle[inc.severity]}`}>
                          {inc.severity}
                        </span>
                        <span className="shrink-0 text-[10px] text-[#4A4A5A]">
                          {formatDate(inc.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-[#2A2A34] pt-4">
                <Button
                  type="button"
                  onClick={() => setPendingAction("ban")}
                  className="flex-1 gap-2 border border-[#6B2233] bg-[#E84868]/10 text-[#E84868] hover:border-[#E84868]/50 hover:bg-[#E84868]/20 hover:text-[#E84868]"
                >
                  <Ban className="h-4 w-4" />
                  Issue Ban
                </Button>
                <Button
                  type="button"
                  onClick={() => setPendingAction("trespass")}
                  className="flex-1 gap-2 border border-[#6B5320] bg-[#DBA940]/10 text-[#DBA940] hover:border-[#DBA940]/50 hover:bg-[#DBA940]/20 hover:text-[#DBA940]"
                >
                  <ShieldX className="h-4 w-4" />
                  Issue Trespass
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {offender && pendingAction && (
        <IssueActionDialog
          open
          type={pendingAction}
          offenderName={fullName}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}
