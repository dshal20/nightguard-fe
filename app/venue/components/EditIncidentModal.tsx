"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "../../src/lib/firebase";
import { updateIncident } from "@/lib/api";
import type { IncidentResponse, IncidentType, IncidentSeverity, IncidentStatus, OffenderResponse } from "@/lib/api";
import { useOffendersQuery } from "@/lib/queries";
import OffenderPicker from "./OffenderPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INCIDENT_TYPES: IncidentType[] = [
  "VERBAL_HARASSMENT", "SEXUAL_HARASSMENT", "PHYSICAL_ASSAULT",
  "THREAT", "STALKING", "THEFT", "DRUG_RELATED",
  "TRESPASSING", "DISORDERLY_CONDUCT", "VANDALISM", "OTHER",
];

function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

const fieldClass = "border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A]";
const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";
const selectClass = `w-full rounded-md border border-[#2A2A34] bg-[#0F0F19] px-3 py-2 text-sm text-[#E2E2E2] focus:outline-none focus:ring-1 focus:ring-[#3B3B5A]`;

interface Props {
  incident: IncidentResponse | null;
  onClose: () => void;
}

export default function EditIncidentModal({ incident, onClose }: Props) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<IncidentType>("OTHER");
  const [severity, setSeverity] = useState<IncidentSeverity>("LOW");
  const [status, setStatus] = useState<IncidentStatus>("ACTIVE");
  const [description, setDescription] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [offenders, setOffenders] = useState<OffenderResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const { data: allOffenders = [] } = useOffendersQuery(incident?.venueId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      setType(incident.type);
      setSeverity(incident.severity);
      setStatus(incident.status);
      setDescription(incident.description);
      setKeywordsInput(incident.keywords.join(", "));
      const ids = new Set(incident.offenderIds ?? []);
      setOffenders(allOffenders.filter((o) => ids.has(o.id)));
      setError(null);
    }
  }, [incident]);

  async function handleSave() {
    if (!incident) return;
    setSaving(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      await updateIncident(token, incident.id, {
        type,
        severity,
        status,
        description,
        keywords: keywordsInput.split(",").map((k) => k.trim()).filter(Boolean),
        offenderIds: offenders.map((o) => o.id),
      });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!incident} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#E2E2E2]">
            Edit Incident
          </DialogTitle>
        </DialogHeader>

        {incident && (
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className={selectClass}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>{formatType(t)}</option>
                ))}
              </select>
            </div>

            {/* Severity + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className={selectClass}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className={selectClass}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full resize-none rounded-md border border-[#2A2A34] bg-[#0F0F19] px-3 py-2 text-sm text-[#E2E2E2] placeholder:text-[#4A4A5A] focus:outline-none focus:ring-1 focus:ring-[#3B3B5A]`}
                placeholder="Describe the incident..."
              />
            </div>

            {/* Keywords */}
            <div>
              <label className={labelClass}>Keywords</label>
              <Input
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g. aggressive, intoxicated, exit B"
                className={fieldClass}
              />
              <p className="mt-1 text-[10px] text-[#6B6B7D]">Comma-separated</p>
            </div>

            {/* Offenders */}
            <OffenderPicker
              venueId={incident.venueId}
              allOffenders={allOffenders}
              selected={offenders}
              onChange={setOffenders}
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#262B75] text-white hover:bg-[#2e3490] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
