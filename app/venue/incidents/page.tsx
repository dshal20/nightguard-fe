"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/src/lib/firebase";
import {
  getVenues,
  getIncidents,
  type IncidentResponse,
  type IncidentSeverity,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

const severityStyle: Record<IncidentSeverity, string> = {
  LOW: "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  MEDIUM: "border-[#DBA940] bg-[#DBA940]/10 text-[#DBA940]",
  HIGH: "border-[#EB4869] bg-[#EB4869]/10 text-[#E84868]",
};

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const venues = await getVenues(token);
        if (venues.length === 0) {
          setError("No venue found");
          setLoading(false);
          return;
        }
        const data = await getIncidents(token, venues[0].id);
        setIncidents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load incidents");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-auto max-w-[1172px] px-8 py-8">
      <h1 className="text-[28px] font-black leading-8 text-[#E2E2E2]">
        Incidents
      </h1>

      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B8B9D]" />
        </div>
      )}

      {error && (
        <p className="mt-8 text-sm text-[#E84868]">{error}</p>
      )}

      {!loading && !error && incidents.length === 0 && (
        <p className="mt-8 text-sm text-[#8B8B9D]">No incidents reported yet.</p>
      )}

      {!loading && incidents.length > 0 && (
        <div className="mt-6 rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-left text-[8px] font-bold uppercase leading-[18px] text-[#8B8B9D]">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Keywords</th>
                  <th className="pb-3 text-right">Severity</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-[#2A2A34] transition hover:bg-white/[0.02]"
                  >
                    <td className="py-4 pr-4 text-xs font-medium text-[#8B8B9D] whitespace-nowrap">
                      {formatDate(inc.createdAt)}
                    </td>
                    <td className="py-4 pr-4 text-xs font-bold text-white whitespace-nowrap">
                      {formatTime(inc.createdAt)}
                    </td>
                    <td className="py-4 pr-4 text-xs font-bold text-white whitespace-nowrap">
                      {formatType(inc.type)}
                    </td>
                    <td className="py-4 pr-4 text-xs font-medium text-[#8B8B9D] max-w-[260px] truncate">
                      {inc.description}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {inc.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-[#2A2A34] bg-[#1a1a28] px-1.5 py-0.5 text-[10px] text-[#DDDBDB]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`rounded-[7px] border px-2 py-0.5 text-[10px] font-bold leading-[18px] ${severityStyle[inc.severity]}`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
