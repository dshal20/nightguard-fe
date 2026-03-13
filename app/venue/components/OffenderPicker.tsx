"use client";

import { useState } from "react";
import { X, Plus, ChevronsUpDown, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/app/src/lib/firebase";
import { createOffender } from "@/lib/api";
import type { OffenderResponse, CreateOffenderRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";
const fieldClass = "border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A]";

interface Props {
  venueId: string;
  allOffenders: OffenderResponse[];
  selected: OffenderResponse[];
  onChange: (offenders: OffenderResponse[]) => void;
}

export default function OffenderPicker({ venueId, allOffenders, selected, onChange }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CreateOffenderRequest, "venueId">>({
    firstName: "",
    lastName: "",
    physicalMarkers: "",
    notes: "",
  });

  const selectedIds = new Set(selected.map((o) => o.id));
  const unselected = allOffenders.filter((o) => !selectedIds.has(o.id));

  function handleSelect(offender: OffenderResponse) {
    onChange([...selected, offender]);
    setOpen(false);
  }

  function handleRemove(id: string) {
    onChange(selected.filter((o) => o.id !== id));
  }

  async function handleCreate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const newOffender = await createOffender(token, {
        venueId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        physicalMarkers: form.physicalMarkers?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["offenders", venueId] });
      onChange([...selected, newOffender]);
      setForm({ firstName: "", lastName: "", physicalMarkers: "", notes: "" });
      setShowCreate(false);
      setOpen(false);
    } catch {
      setCreateError("Failed to create offender. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className={labelClass}>Offenders</label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <Badge
              key={o.id}
              variant="outline"
              className="gap-1.5 border-[#2A2A34] bg-[#1a1a28] text-[#DDDBDB] hover:bg-[#1a1a28]"
            >
              {o.firstName} {o.lastName}
              <button
                type="button"
                onClick={() => handleRemove(o.id)}
                className="ml-0.5 rounded-sm text-[#8B8B9D] hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setShowCreate(false); }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between border-[#2A2A34] bg-[#0F0F19] text-sm text-[#8B8B9D] hover:bg-white/5 hover:text-white"
          >
            {selected.length === 0 ? "Add offender…" : "Add another offender…"}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] border-[#2A2A34] bg-[#11111D] p-0"
          align="start"
        >
          {!showCreate ? (
            <Command className="bg-transparent">
              <CommandInput
                placeholder="Search offenders…"
                className="border-b border-[#2A2A34] text-[#E2E2E2] placeholder:text-[#4A4A5A]"
              />
              <CommandList>
                <CommandEmpty className="py-4 text-center text-sm text-[#8B8B9D]">
                  No offenders found.
                </CommandEmpty>
                {unselected.length > 0 && (
                  <CommandGroup>
                    {unselected.map((o) => (
                      <CommandItem
                        key={o.id}
                        value={`${o.firstName} ${o.lastName}`}
                        onSelect={() => handleSelect(o)}
                        className="cursor-pointer text-[#DDDBDB] aria-selected:bg-white/5 aria-selected:text-white"
                      >
                        <span className="font-medium">{o.firstName} {o.lastName}</span>
                        {o.physicalMarkers && (
                          <span className="ml-2 truncate text-xs text-[#6B6B7D]">{o.physicalMarkers}</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandSeparator className="bg-[#2A2A34]" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setShowCreate(true)}
                    className="cursor-pointer text-[#5B6AFF] aria-selected:bg-white/5"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new offender
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="space-y-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B8B9D]">New Offender</p>
              <div className="grid grid-cols-2 gap-2">
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
              <div>
                <label className={labelClass}>Physical Markers</label>
                <Input
                  value={form.physicalMarkers}
                  onChange={(e) => setForm((f) => ({ ...f, physicalMarkers: e.target.value }))}
                  placeholder="e.g. tattoo on left arm, red jacket"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional notes"
                  className={fieldClass}
                />
              </div>
              {createError && <p className="text-xs text-red-400">{createError}</p>}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!form.firstName.trim() || !form.lastName.trim() || creating}
                  onClick={handleCreate}
                  className="flex-1 bg-[#262B75] text-white hover:bg-[#2e3490] disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Add"}
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
