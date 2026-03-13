"use client";

import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle2, RotateCcw, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "../../src/lib/firebase";
import { setCapacity, addHeadcount } from "@/lib/api";
import {
  useCapacityQuery,
  useHeadcountsQuery,
  useAuthToken,
} from "@/lib/queries";
import { useVenueContext } from "../context/VenueContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getCapacityStatus(count: number, max: number) {
  const pct = count / max;
  if (pct >= 1)
    return {
      label: "OVER CAPACITY",
      color: "#E84868",
      bg: "bg-[#E84868]/10",
      border: "border-[#E84868]",
      bar: "#E84868",
    };
  if (pct >= 0.9)
    return {
      label: "NEAR CAPACITY",
      color: "#DBA940",
      bg: "bg-[#DBA940]/10",
      border: "border-[#DBA940]",
      bar: "#DBA940",
    };
  return {
    label: "WITHIN CAPACITY",
    color: "#75FB94",
    bg: "bg-[#75FB94]/10",
    border: "border-[#75FB94]",
    bar: "#75FB94",
  };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleDateString([], { month: "short" });
  const day = d.getDate();
  const weekday = d.toLocaleDateString([], { weekday: "long" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${month} ${day} ${weekday} ${time}`;
}

function SetCapacityPrompt({
  venueId,
  onSaved,
}: {
  venueId: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!num || num <= 0) return;
    setError(null);
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      await setCapacity(token, venueId, num);
      onSaved();
    } catch {
      setError("Failed to set capacity. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111D]">
            <Users className="h-6 w-6 text-[#8B8B9D]" />
          </div>
          <h2 className="text-xl font-bold text-[#E2E2E2]">Set Max Capacity</h2>
          <p className="mt-1.5 text-sm text-[#8B8B9D]">
            Enter the maximum number of guests allowed at this venue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="number"
            min={1}
            placeholder="e.g. 300"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border-[#2A2A34] bg-[#11111D] text-center text-2xl font-bold text-[#E2E2E2] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !value || parseInt(value) <= 0}
            className="w-full bg-[#262B75] text-white hover:bg-[#2e3490] disabled:opacity-40"
          >
            {loading ? "Saving…" : "Save Capacity"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CapacityPage() {
  const { selectedVenue } = useVenueContext();
  const venueId = selectedVenue?.id ?? null;
  const queryClient = useQueryClient();
  const token = useAuthToken();

  const { data: capacityData, isLoading: capacityLoading } =
    useCapacityQuery(venueId);
  const { data: headcounts = [], isLoading: headcountsLoading } =
    useHeadcountsQuery(venueId);

  const maxCapacity = capacityData?.capacity ?? null;
  const latest =
    headcounts.length > 0 ? headcounts[headcounts.length - 1] : null;

  const [count, setCount] = useState(0);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(false);

  // Seed count from latest headcount when it loads
  useEffect(() => {
    if (latest != null) {
      setCount(latest.headcount);
    }
  }, [latest?.id]);

  function handleCapacitySaved() {
    queryClient.invalidateQueries({ queryKey: ["capacity", venueId] });
    setEditingCapacity(false);
  }

  async function handleLog() {
    if (!venueId) return;
    setLogging(true);
    setLogError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      await addHeadcount(token, venueId, count);
      queryClient.invalidateQueries({ queryKey: ["headcounts", venueId] });
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), 3000);
    } catch {
      setLogError("Failed to log count. Please try again.");
    } finally {
      setLogging(false);
    }
  }

  if (!token || capacityLoading || headcountsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#8B8B9D]">Loading…</p>
      </div>
    );
  }

  // No capacity set yet
  if (!maxCapacity || editingCapacity) {
    return (
      <div className="min-h-screen bg-[#101018]">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#8B8B9D]" />
            <h1 className="text-2xl font-black text-[#E2E2E2]">Headcount</h1>
          </div>
          {selectedVenue && (
            <p className="mt-0.5 text-sm text-[#8B8B9D]">
              {selectedVenue.name}
            </p>
          )}
        </div>
        <SetCapacityPrompt venueId={venueId!} onSaved={handleCapacitySaved} />
      </div>
    );
  }

  const status = getCapacityStatus(count, maxCapacity);
  const pct = Math.min(count / maxCapacity, 1);

  return (
    <div className="min-h-screen bg-[#101018] px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#8B8B9D]" />
            <h1 className="text-2xl font-black text-[#E2E2E2]">Headcount</h1>
          </div>
          {selectedVenue && (
            <p className="mt-0.5 text-sm text-[#8B8B9D]">
              {selectedVenue.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditingCapacity(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2A34] bg-[#11111B] px-2.5 py-1.5 text-[11px] font-medium text-[#8B8B9D] transition hover:text-[#DDDBDB]"
        >
          <Settings className="h-3 w-3" />
          Edit limit
        </button>
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.bg} ${status.border}`}
        style={{ color: status.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: status.color }}
        />
        {status.label}
      </div>

      {/* Count display */}
      <div className="mt-4 rounded-2xl border border-[#2A2A34] bg-[#11111B] p-6">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8B8B9D]">
          Current Count
        </div>
        <div className="flex items-end gap-3">
          <span className="text-[72px] font-black leading-none text-white">
            {count}
          </span>
          <span className="mb-2 text-2xl font-bold text-[#4A4A5A]">
            / {maxCapacity}
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1E1E2E]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct * 100}%`, background: status.bar }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#6B6B7D]">
          <span>0</span>
          <span>{Math.round(pct * 100)}% full</span>
          <span>{maxCapacity}</span>
        </div>
      </div>

      {/* +/- controls */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setCount((c) => Math.max(0, c - 1));
            setJustLogged(false);
          }}
          disabled={count === 0}
          className="flex h-20 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111B] text-5xl font-bold text-[#DDDBDB] transition active:scale-95 disabled:opacity-30"
        >
          −
        </button>
        <button
          onClick={() => {
            setCount((c) => c + 1);
            setJustLogged(false);
          }}
          className="flex h-20 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111B] text-5xl font-bold text-[#DDDBDB] transition active:scale-95"
        >
          +
        </button>
      </div>

      {/* Log button */}
      <button
        onClick={handleLog}
        disabled={logging || justLogged}
        className={`mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-95 ${
          justLogged
            ? "border border-[#75FB94]/30 bg-[#75FB94]/10 text-[#75FB94]"
            : "bg-[#262B75] text-white hover:bg-[#2e3490] active:bg-[#1d2060]"
        } disabled:opacity-60`}
      >
        {logging ? (
          "Logging…"
        ) : justLogged ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Count Logged
          </>
        ) : (
          "Log Count"
        )}
      </button>

      {logError && (
        <p className="mt-2 text-center text-xs text-red-400">{logError}</p>
      )}

      {/* Log */}
      {headcounts.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8B8B9D]">
            Log
          </p>
          <div className="rounded-xl border border-[#2A2A34] bg-[#11111B] divide-y divide-[#2A2A34]">
            {[...headcounts].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#8B8B9D]" />
                <span className="text-sm font-bold text-[#DDDBDB]">
                  {entry.headcount}
                </span>
                <span className="text-xs text-[#8B8B9D]">
                  {formatTime(entry.createdAt)}
                </span>
                {entry.recordedBy && (
                  <div className="ml-auto">
                    <span className="text-[10px] mr-2 text-[#6B6B7D] uppercase font-bold">
                      Reported By
                    </span>
                    <span className="ml-auto text-xs text-white">
                      {entry.recordedBy.firstName} {entry.recordedBy.lastName}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => {
          setCount(0);
          setJustLogged(false);
        }}
        className="mt-6 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#6B6B7D] transition hover:text-[#8B8B9D]"
      >
        <RotateCcw className="h-3 w-3" />
        Reset count
      </button>
    </div>
  );
}
