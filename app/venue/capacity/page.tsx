"use client";

import { useState } from "react";
import { Users, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { useVenueContext } from "../context/VenueContext";

const MAX_CAPACITY = 300; // TODO: pull from venue settings

function getCapacityStatus(count: number, max: number) {
  const pct = count / max;
  if (pct >= 1) return { label: "OVER CAPACITY", color: "#E84868", bg: "bg-[#E84868]/10", border: "border-[#E84868]", bar: "#E84868" };
  if (pct >= 0.9) return { label: "NEAR CAPACITY", color: "#DBA940", bg: "bg-[#DBA940]/10", border: "border-[#DBA940]", bar: "#DBA940" };
  return { label: "WITHIN CAPACITY", color: "#75FB94", bg: "bg-[#75FB94]/10", border: "border-[#75FB94]", bar: "#75FB94" };
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CapacityPage() {
  const { selectedVenue } = useVenueContext();
  const [count, setCount] = useState(0);
  const [lastLogged, setLastLogged] = useState<{ count: number; time: Date } | null>(null);
  const [logged, setLogged] = useState(false);

  const status = getCapacityStatus(count, MAX_CAPACITY);
  const pct = Math.min(count / MAX_CAPACITY, 1);

  function increment() {
    setCount((c) => c + 1);
    setLogged(false);
  }

  function decrement() {
    setCount((c) => Math.max(0, c - 1));
    setLogged(false);
  }

  function handleLog() {
    setLastLogged({ count, time: new Date() });
    setLogged(true);
  }

  function handleReset() {
    setCount(0);
    setLogged(false);
  }

  return (
    <div className="min-h-screen bg-[#101018] px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#8B8B9D]" />
          <h1 className="text-2xl font-black text-[#E2E2E2]">Headcount</h1>
        </div>
        {selectedVenue && (
          <p className="mt-0.5 text-sm text-[#8B8B9D]">{selectedVenue.name}</p>
        )}
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
      <div className="mt-6 rounded-2xl border border-[#2A2A34] bg-[#11111B] p-6">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8B8B9D]">
          Current Count
        </div>
        <div className="flex items-end gap-3">
          <span className="text-[72px] font-black leading-none text-white">
            {count}
          </span>
          <span className="mb-2 text-2xl font-bold text-[#4A4A5A]">
            / {MAX_CAPACITY}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1E1E2E]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct * 100}%`, background: status.bar }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#6B6B7D]">
          <span>0</span>
          <span>{Math.round(pct * 100)}% full</span>
          <span>{MAX_CAPACITY}</span>
        </div>
      </div>

      {/* +/- controls */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={decrement}
          disabled={count === 0}
          className="flex h-20 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111B] text-5xl font-bold text-[#DDDBDB] transition active:scale-95 disabled:opacity-30"
        >
          −
        </button>
        <button
          onClick={increment}
          className="flex h-20 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111B] text-5xl font-bold text-[#DDDBDB] transition active:scale-95"
        >
          +
        </button>
      </div>

      {/* Log button */}
      <button
        onClick={handleLog}
        disabled={logged}
        className={`mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-95 ${
          logged
            ? "border border-[#75FB94]/30 bg-[#75FB94]/10 text-[#75FB94]"
            : "bg-[#262B75] text-white hover:bg-[#2e3490] active:bg-[#1d2060]"
        }`}
      >
        {logged ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Count Logged
          </>
        ) : (
          "Log Count"
        )}
      </button>

      {/* Last logged */}
      {lastLogged && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#2A2A34] bg-[#11111B] px-4 py-3">
          <Clock className="h-4 w-4 shrink-0 text-[#8B8B9D]" />
          <p className="text-xs text-[#8B8B9D]">
            Last logged{" "}
            <span className="font-bold text-[#DDDBDB]">{lastLogged.count}</span>{" "}
            at{" "}
            <span className="font-bold text-[#DDDBDB]">
              {formatTime(lastLogged.time)}
            </span>
          </p>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        className="mt-6 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#6B6B7D] transition hover:text-[#8B8B9D]"
      >
        <RotateCcw className="h-3 w-3" />
        Reset count
      </button>
    </div>
  );
}
