"use client";

import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle2, RotateCcw, Settings, TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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

dayjs.extend(relativeTime);

function getCapacityStatus(count: number, max: number) {
  const pct = count / max;
  if (pct >= 1)
    return {
      label: "OVER CAPACITY",
      color: "#E84868",
      bg: "bg-[#E84868]/10",
      border: "border-[#E84868]",
      bar: "#E84868",
      glow: "rgba(232,72,104,0.15)",
      pulse: true,
    };
  if (pct >= 0.9)
    return {
      label: "NEAR CAPACITY",
      color: "#DBA940",
      bg: "bg-[#DBA940]/10",
      border: "border-[#DBA940]",
      bar: "#DBA940",
      glow: "rgba(219,169,64,0.12)",
      pulse: true,
    };
  return {
    label: "WITHIN CAPACITY",
    color: "#75FB94",
    bg: "bg-[#75FB94]/10",
    border: "border-[#75FB94]",
    bar: "#75FB94",
    glow: "rgba(117,251,148,0.08)",
    pulse: false,
  };
}

function fromNow(iso: string) {
  return dayjs(iso).fromNow();
}

function SegmentedBar({ pct, color }: { pct: number; color: string }) {
  const total = 20;
  const filled = Math.round(pct * total);
  return (
    <div className="flex gap-0.75">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-sm transition-all duration-300"
          style={{
            background: i < filled ? color : "#1E1E2E",
            opacity: i < filled ? (0.5 + (i / total) * 0.5) : 1,
            boxShadow: i < filled && i === filled - 1 ? `0 0 6px ${color}` : undefined,
          }}
        />
      ))}
    </div>
  );
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
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111D]"
            style={{ boxShadow: "0 0 24px rgba(38,43,117,0.3)" }}>
            <Users className="h-7 w-7 text-[#5B6AFF]" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-[#E2E2E2]">Set Max Capacity</h2>
          <p className="mt-2 text-sm text-[#8B8B9D]">
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
            className="border-[#2A2A34] bg-[#11111D] text-center text-3xl font-black text-[#E2E2E2] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A] h-16"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !value || parseInt(value) <= 0}
            className="w-full h-12 bg-[#262B75] text-white font-bold hover:bg-[#2e3490] disabled:opacity-40"
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
  }, [latest]);

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
  const remaining = Math.max(maxCapacity - count, 0);

  return (
    <div className="min-h-screen bg-[#101018] px-4 py-6">
      <div className="mx-auto w-full max-w-150">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#E2E2E2]">Headcount</h1>
            {selectedVenue && (
              <p className="mt-0.5 text-xs text-[#6B6B7D]">{selectedVenue.name}</p>
            )}
          </div>
          <button
            onClick={() => setEditingCapacity(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2A34] bg-[#11111B] px-2.5 py-1.5 text-[11px] font-medium text-[#6B6B7D] transition hover:border-[#3A3A4A] hover:text-[#DDDBDB]"
          >
            <Settings className="h-3 w-3" />
            Edit limit
          </button>
        </div>

        {/* Status pill */}
        <div
          className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black tracking-widest ${status.bg} ${status.border}`}
          style={{ color: status.color }}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.pulse ? "animate-pulse" : ""}`}
            style={{ background: status.color }}
          />
          {status.label}
        </div>

        {/* Main counter card */}
        <div
          className="rounded-2xl border border-[#2A2A34] bg-[#11111B] p-6"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${status.glow} 0%, #11111B 65%)`,
          }}
        >
          {/* Count number */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6B6B7D]">
                Inside Now
              </p>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[80px] font-black leading-none tabular-nums"
                  style={{ color: status.color }}
                >
                  {count}
                </span>
                <span className="mb-1 text-3xl font-bold text-[#3A3A4A]">
                  / {maxCapacity}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B7D]">
                Remaining
              </p>
              <p className="text-3xl font-black text-[#DDDBDB]">{remaining}</p>
            </div>
          </div>

          {/* Segmented progress bar */}
          <SegmentedBar pct={pct} color={status.bar} />

          <div className="mt-2 flex justify-between text-[10px] font-medium text-[#4A4A5A]">
            <span>0</span>
            <span style={{ color: status.color }}>{Math.round(pct * 100)}%</span>
            <span>{maxCapacity}</span>
          </div>
        </div>

        {/* +/- controls */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setCount((c) => Math.max(0, c - 1)); setJustLogged(false); }}
            disabled={count === 0}
            className="group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-[#2A2A34] bg-[#11111B] transition-all duration-150 active:scale-95 active:bg-[#0E0E17] disabled:opacity-25"
          >
            <span className="text-6xl font-thin text-[#DDDBDB] transition-colors group-hover:text-white group-active:text-white select-none">
              −
            </span>
          </button>
          <button
            onClick={() => { setCount((c) => c + 1); setJustLogged(false); }}
            className="group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-[#2A2A34] bg-[#11111B] transition-all duration-150 active:scale-95 active:bg-[#0E0E17]"
          >
            <span className="text-6xl font-thin text-[#DDDBDB] transition-colors group-hover:text-white group-active:text-white select-none">
              +
            </span>
          </button>
        </div>

        {/* Log button */}
        <button
          onClick={handleLog}
          disabled={logging || justLogged}
          className={`mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.98] ${
            justLogged
              ? "border border-[#75FB94]/20 bg-[#75FB94]/10 text-[#75FB94]"
              : "bg-[#262B75] text-white hover:bg-[#2e3490] active:bg-[#1d2060]"
          } disabled:opacity-60`}
          style={
            !justLogged
              ? { boxShadow: "0 4px 20px rgba(38,43,117,0.4)" }
              : undefined
          }
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
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#6B6B7D]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B7D]">
                Log
              </p>
            </div>
            <div className="divide-y divide-[#1E1E2E] rounded-xl border border-[#2A2A34] bg-[#11111B] overflow-hidden">
              {[...headcounts].reverse().slice(0, 10).map((entry, i) => (
                <div key={entry.id} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? "bg-[#13131E]" : ""}`}>
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: i === 0 ? "#75FB94" : "#2A2A34" }}
                  />
                  <span className="w-10 shrink-0 text-sm font-black tabular-nums text-[#DDDBDB]">
                    {entry.headcount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#6B6B7D]">
                    <Clock className="h-3 w-3" />
                    {fromNow(entry.createdAt)}
                  </span>
                  {entry.recordedBy && (
                    <span className="ml-auto text-[10px] text-[#4A4A5A]">
                      {entry.recordedBy.firstName} {entry.recordedBy.lastName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        <button
          onClick={() => { setCount(0); setJustLogged(false); }}
          className="mt-5 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#4A4A5A] transition hover:text-[#6B6B7D]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset count
        </button>
      </div>
    </div>
  );
}
