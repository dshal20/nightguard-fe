"use client";

import { useState } from "react";
import { X, Plus, ChevronsUpDown } from "lucide-react";
import type { OffenderResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import CreateOffenderModal from "./CreateOffenderModal";

const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";

interface Props {
  venueId: string;
  allOffenders: OffenderResponse[];
  selected: OffenderResponse[];
  onChange: (offenders: OffenderResponse[]) => void;
}

export default function OffenderPicker({ venueId, allOffenders, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const selectedIds = new Set(selected.map((o) => o.id));
  const unselected = allOffenders.filter((o) => !selectedIds.has(o.id));

  function handleSelect(offender: OffenderResponse) {
    onChange([...selected, offender]);
    setOpen(false);
  }

  function handleRemove(id: string) {
    onChange(selected.filter((o) => o.id !== id));
  }

  function handleCreated(offender: OffenderResponse) {
    onChange([...selected, offender]);
  }

  return (
    <div className="space-y-2">
      <label className={labelClass}>Offenders</label>

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

      <Popover open={open} onOpenChange={setOpen}>
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
                  onSelect={() => { setOpen(false); setCreateOpen(true); }}
                  className="cursor-pointer text-[#5B6AFF] aria-selected:bg-white/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create new offender
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateOffenderModal
        open={createOpen}
        venueId={venueId}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
