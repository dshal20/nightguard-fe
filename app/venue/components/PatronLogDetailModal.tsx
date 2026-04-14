"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import dayjs from "dayjs";
import type { PatronLogResponse } from "@/lib/api";
import { useVenueContext } from "../context/VenueContext";
import CreateOffenderModal from "./CreateOffenderModal";

const LABEL = "mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <p className="text-sm text-[#E2E2E2]">{value}</p>
    </div>
  );
}

interface Props {
  log: PatronLogResponse | null;
  onClose: () => void;
}

export default function PatronLogDetailModal({ log, onClose }: Props) {
  const { selectedVenue } = useVenueContext();
  const [createOffenderOpen, setCreateOffenderOpen] = useState(false);

  if (!log) return null;

  const admitted = log.decision === "ADMITTED";
  const fullName = [log.firstName, log.middleName, log.lastName].filter(Boolean).join(" ") || "Unknown";
  const dob = log.dateOfBirth ? dayjs(log.dateOfBirth).format("MM/DD/YYYY") : null;
  const expiry = log.expirationDate ? dayjs(log.expirationDate).format("MM/DD/YYYY") : null;
  const recordedByName = log.recordedBy
    ? [log.recordedBy.firstName, log.recordedBy.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#2A2A34] bg-[#0F0F19] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E1E2E] px-6 py-4">
            <div>
              <p className="text-base font-bold text-[#E2E2E2]">{fullName}</p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  admitted
                    ? "border border-[#75FB94]/30 bg-[#75FB94]/10 text-[#75FB94]"
                    : "border border-[#E84868]/30 bg-[#E84868]/10 text-[#E84868]"
                }`}
              >
                {admitted ? "Admitted" : "Denied"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6B7D] transition hover:bg-[#1E1E2E] hover:text-[#DDDBDB]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="First Name" value={log.firstName} />
              <Field label="Last Name" value={log.lastName} />
              {log.middleName && <Field label="Middle Name" value={log.middleName} />}
              <Field label="Date of Birth" value={dob} />
              <Field label="License #" value={log.driversLicenseId} />
              <Field label="Expires" value={expiry} />
              <Field label="State" value={log.state} />
              <Field label="Gender" value={log.gender} />
              <Field label="Eye Color" value={log.eyeColor} />
            </div>

            {(log.streetAddress || log.city || log.postalCode) && (
              <div>
                <p className={LABEL}>Address</p>
                {log.streetAddress && <p className="text-sm text-[#E2E2E2]">{log.streetAddress}</p>}
                {(log.city || log.state || log.postalCode) && (
                  <p className="text-sm text-[#E2E2E2]">
                    {[log.city, log.state, log.postalCode].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-[#1E1E2E] pt-4 grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className={LABEL}>Logged</p>
                <p className="text-sm text-[#E2E2E2]">{dayjs(log.createdAt).fromNow()}</p>
              </div>
              {recordedByName && (
                <div>
                  <p className={LABEL}>Recorded By</p>
                  <p className="text-sm text-[#E2E2E2]">{recordedByName}</p>
                </div>
              )}
            </div>

            {/* Create Offender Profile button */}
            {selectedVenue && (
              <button
                onClick={() => setCreateOffenderOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E84868]/30 bg-[#E84868]/10 py-3 text-sm font-bold text-[#E84868] transition hover:bg-[#E84868]/20"
              >
                <UserPlus className="h-4 w-4" />
                Create Offender Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedVenue && (
        <CreateOffenderModal
          open={createOffenderOpen}
          venueId={selectedVenue.id}
          initialValues={{
            firstName: log.firstName ?? "",
            lastName: log.lastName ?? "",
          }}
          onClose={() => setCreateOffenderOpen(false)}
          onCreated={() => {
            setCreateOffenderOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
