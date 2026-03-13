"use client";

import { useState, type FormEvent } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { auth } from "@/app/src/lib/firebase";
import {
  createIncident,
  type IncidentType,
  type IncidentSeverity,
  type OffenderResponse,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useOffendersQuery } from "@/lib/queries";
import OffenderPicker from "./OffenderPicker";

const INCIDENT_TYPES: IncidentType[] = [
  "VERBAL_HARASSMENT",
  "SEXUAL_HARASSMENT",
  "PHYSICAL_ASSAULT",
  "THREAT",
  "STALKING",
  "THEFT",
  "DRUG_RELATED",
  "TRESPASSING",
  "DISORDERLY_CONDUCT",
  "VANDALISM",
  "OTHER",
];

const SEVERITY_LEVELS: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH"];

const severityColors: Record<IncidentSeverity, { bg: string; border: string; text: string }> = {
  LOW: { bg: "bg-[#2B36CD]/10", border: "border-[#2B36CD]", text: "text-[#5B6AFF]" },
  MEDIUM: { bg: "bg-[#DBA940]/10", border: "border-[#DBA940]", text: "text-[#DBA940]" },
  HIGH: { bg: "bg-[#EB4869]/10", border: "border-[#EB4869]", text: "text-[#E84868]" },
};

function formatTypeLabel(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

const inputClasses =
  "w-full rounded-lg bg-[#1a1a28] border border-[#2A2A34] px-4 py-2.5 text-sm text-white placeholder-[#555566] outline-none transition focus:border-[#2B36CD] focus:ring-1 focus:ring-[#2B36CD]";

interface IncidentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
}

export default function IncidentReportDialog({
  open,
  onOpenChange,
  venueId,
}: IncidentReportDialogProps) {
  const [type, setType] = useState<IncidentType | "">("");
  const [severity, setSeverity] = useState<IncidentSeverity | "">("");
  const [description, setDescription] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [offenders, setOffenders] = useState<OffenderResponse[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { data: allOffenders = [] } = useOffendersQuery(venueId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  function resetForm() {
    setType("");
    setSeverity("");
    setDescription("");
    setKeywordInput("");
    setKeywords([]);
    setOffenders([]);
    setSubmitted(false);
    setSubmitting(false);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function addKeyword() {
    const word = keywordInput.trim();
    if (word && !keywords.includes(word)) {
      setKeywords((prev) => [...prev, word]);
    }
    setKeywordInput("");
  }

  function handleKeywordKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  }

  function removeKeyword(index: number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!type || !severity) return;

    setSubmitting(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be signed in to submit a report");

      const token = await user.getIdToken();
      await createIncident(token, {
        venueId,
        type,
        severity,
        description: description.trim(),
        keywords,
        offenderIds: offenders.map((o) => o.id),
      });

      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = type && severity && description.trim();

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="border-[#2A2A34] bg-[#11111B] sm:max-w-md"
          showCloseButton={false}
        >
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#75FB94]/10">
              <CheckCircle className="h-7 w-7 text-[#75FB94]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Submitted</h3>
              <p className="mt-1 text-sm text-[#8B8B9D]">
                Your incident report has been logged and a real-time alert has
                been triggered to on-duty staff.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-2 rounded-lg bg-[#2B36CD] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-[#2A2A34] bg-[#11111B] sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-black text-[#E2E2E2]">
            New Incident Report
          </DialogTitle>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9D] transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          {/* Incident Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Incident Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              className={`${inputClasses} appearance-none`}
            >
              <option value="" disabled>
                Select type...
              </option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Severity
            </label>
            <div className="flex gap-2">
              {SEVERITY_LEVELS.map((level) => {
                const active = severity === level;
                const colors = severityColors[level];
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? `${colors.bg} ${colors.border} ${colors.text}`
                        : "border-[#2A2A34] bg-[#1a1a28] text-[#8B8B9D] hover:border-[#3A3A44]"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Keywords
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Type a keyword and press Enter"
                className={inputClasses}
              />
              <button
                type="button"
                onClick={addKeyword}
                className="shrink-0 rounded-lg border border-[#2A2A34] bg-[#1a1a28] px-3 text-sm font-bold text-[#8B8B9D] transition hover:border-[#3A3A44] hover:text-white"
              >
                Add
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-1 text-xs text-[#DDDBDB]"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(i)}
                      className="ml-0.5 text-[#8B8B9D] hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Offenders */}
          <OffenderPicker
            venueId={venueId}
            allOffenders={allOffenders}
            selected={offenders}
            onChange={setOffenders}
          />

          {error && (
            <p className="rounded-lg border border-[#EB4869]/30 bg-[#EB4869]/10 px-4 py-2 text-sm text-[#E84868]">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2B36CD] py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
