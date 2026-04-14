"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/app/src/lib/firebase";
import { createOffender, uploadFile } from "@/lib/api";
import type { OffenderResponse, CreateOffenderRequest } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";
const fieldClass = "border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A]";

interface Props {
  open: boolean;
  venueId: string;
  onClose: () => void;
  onCreated: (offender: OffenderResponse) => void;
  initialValues?: { firstName?: string; lastName?: string };
}

export default function CreateOffenderModal({ open, venueId, onClose, onCreated, initialValues }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<CreateOffenderRequest, "venueId">>({
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    physicalMarkers: "",
    notes: "",
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        firstName: initialValues?.firstName ?? "",
        lastName: initialValues?.lastName ?? "",
        physicalMarkers: "",
        notes: "",
      });
      setImages([]);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    setForm({ firstName: "", lastName: "", physicalMarkers: "", notes: "" });
    setImages([]);
    setError(null);
    onClose();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const entries = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...entries]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const photoUrls = await Promise.all(
        images.map(({ file }) => uploadFile(token, file))
      );

      const newOffender = await createOffender(token, {
        venueId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        physicalMarkers: form.physicalMarkers?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["offenders", venueId] });
      onCreated(newOffender);
      handleClose();
    } catch {
      setError("Failed to create offender. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canSave = form.firstName.trim() && form.lastName.trim();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#E2E2E2]">
            New Offender
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name *</label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="First"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Last"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Physical markers */}
          <div>
            <label className={labelClass}>Physical Markers</label>
            <Input
              value={form.physicalMarkers}
              onChange={(e) => setForm((f) => ({ ...f, physicalMarkers: e.target.value }))}
              placeholder="e.g. tattoo on left arm, red jacket, 6ft tall"
              className={fieldClass}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional context or history..."
              rows={3}
              className="w-full resize-none rounded-md border border-[#2A2A34] bg-[#0F0F19] px-3 py-2 text-sm text-[#E2E2E2] placeholder:text-[#4A4A5A] focus:outline-none focus:ring-1 focus:ring-[#3B3B5A]"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className={labelClass}>Photos</label>

            {images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {images.map(({ preview }, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#2A2A34]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#2A2A34] bg-[#0F0F19] py-6 text-[#4A4A5A] transition hover:border-[#3B3B5A] hover:bg-white/2 hover:text-[#8B8B9D]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A34] bg-[#1a1a28]">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="text-[#5B6AFF]">Click to upload</span> or drag and drop
                </p>
                <p className="mt-0.5 text-xs">PNG, JPG or WEBP</p>
              </div>
              <Upload className="sr-only" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSave || saving}
              onClick={handleSave}
              className="bg-[#262B75] text-white hover:bg-[#2e3490] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
