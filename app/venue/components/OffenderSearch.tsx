"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOffendersQuery } from "@/lib/queries";
import { useVenueContext } from "../context/VenueContext";
import type { OffenderResponse } from "@/lib/api";

function getInitials(o: OffenderResponse) {
  return `${o.firstName[0] ?? ""}${o.lastName[0] ?? ""}`.toUpperCase();
}

export default function OffenderSearch() {
  const router = useRouter();
  const { selectedVenue } = useVenueContext();
  const { data: offenders = [] } = useOffendersQuery(selectedVenue?.id);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? offenders.filter((o) =>
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  function handleSelect(o: OffenderResponse) {
    setQuery("");
    setOpen(false);
    router.push(`/venue/offenders?id=${o.id}`);
  }

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch() {
    if (filtered.length === 1) {
      handleSelect(filtered[0]);
    } else {
      setOpen(true);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A4A5A]" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search offenders by name…"
          className="h-10 w-full rounded-lg border border-[#2A2A34] bg-[#0F0F19] pl-9 pr-8 text-sm text-[#E2E2E2] placeholder:text-[#4A4A5A] outline-none focus:border-[#3B3B5A] focus:ring-1 focus:ring-[#3B3B5A]"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4A4A5A] hover:text-[#8B8B9D]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-[#2A2A34] bg-[#11111D] shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#4A4A5A]">No offenders found.</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => handleSelect(o)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#26262F] text-xs font-bold text-[#8B8B9D]">
                      {getInitials(o)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#E2E2E2]">
                        {o.firstName} {o.lastName}
                      </p>
                      {(o.currentStatus || o.physicalMarkers) && (
                        <p className="truncate text-[11px] text-[#4A4A5A]">
                          {o.currentStatus ?? o.physicalMarkers}
                        </p>
                      )}
                    </div>
                    {o.riskScore != null && (
                      <span className={`ml-auto shrink-0 text-xs font-semibold ${
                        o.riskScore >= 8 ? "text-[#E84868]" :
                        o.riskScore >= 5 ? "text-[#DBA940]" : "text-[#5B6AFF]"
                      }`}>
                        {o.riskScore}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
