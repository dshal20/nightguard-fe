"use client";

import { Building, Copy, Check, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import type { Venue } from "@/lib/api";

export default function VenueCard({ venue }: { venue: Venue }) {
  const [copied, setCopied] = useState(false);

  const fullAddress = [venue.streetAddress, venue.city, venue.state, venue.postalCode]
    .filter(Boolean)
    .join(", ");

  function copyInviteCode() {
    navigator.clipboard.writeText(venue.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#2A2A34] bg-[#131319] p-5 transition hover:border-blue-500/50">
      <div
        className="absolute right-0 bottom-0 h-14 w-14 mix-blend-screen blur-[46px]"
        style={{ background: "#2B36CD" }}
        aria-hidden
      />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-lg font-bold text-white group-hover:text-blue-400">
            {venue.name}
          </p>
          <Building className="h-5 w-5 shrink-0 text-[#8B8B9D]" />
        </div>

        {fullAddress && (
          <div className="flex items-start gap-2 text-sm text-[#8B8B9D]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{fullAddress}</span>
          </div>
        )}

        {venue.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-[#8B8B9D]">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{venue.phoneNumber}</span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-[#2A2A34] bg-[#1a1a28] px-3 py-2">
          <div>
            <p className="text-[10px] font-medium tracking-wider text-[#555566] uppercase">
              Invite Code
            </p>
            <p className="font-mono text-sm font-bold text-[#5B6AFF]">
              {venue.inviteCode}
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className="rounded-md p-1.5 text-[#8B8B9D] transition hover:bg-white/5 hover:text-white"
            title="Copy invite code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#75FB94]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
