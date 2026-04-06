"use client";

type Accent = "red" | "amber" | "green" | "blue";

const accents: Record<Accent, { dot: string; bar: string; tint: string }> = {
  red:   { dot: "#E84868", bar: "#E84868", tint: "rgba(232,72,104,0.07)" },
  amber: { dot: "#DBA940", bar: "#DBA940", tint: "rgba(219,169,64,0.07)" },
  green: { dot: "#75FB94", bar: "#75FB94", tint: "rgba(117,251,148,0.05)" },
  blue:  { dot: "#4B7BF5", bar: "#4B7BF5", tint: "rgba(75,123,245,0.07)" },
};

export default function StatCard({
  title,
  value,
  meta,
  subtitle,
  accent,
  progress,
}: {
  title: string;
  value: string | number;
  meta?: string;
  subtitle?: string;
  accent: Accent;
  progress?: number; // 0–1
}) {
  const style = accents[accent];
  const isLive = accent === "red";

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] px-5 pt-5 pb-4"
      style={{ background: `radial-gradient(ellipse 80% 60% at 100% 0%, ${style.tint}, transparent 70%), #11111B` }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span
          className={`h-1.75 w-1.75 shrink-0 rounded-full ${isLive ? "animate-pulse" : ""}`}
          style={{ background: style.dot }}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555568]">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="mt-5 text-[42px] font-bold leading-none tracking-tight text-white">
        {value}
      </p>

      {/* Separator */}
      <div className="my-4 h-px w-full bg-white/6" />

      {/* Context */}
      <div className="flex-1 space-y-1">
        {subtitle && (
          <p className="text-xs font-medium text-[#6B6B80]">{subtitle}</p>
        )}
        {meta && (
          <p className="text-[10px] leading-relaxed text-[#44445A]">{meta}</p>
        )}
      </div>

      {/* Progress bar (capacity) */}
      {progress != null && (
        <div className="mt-4">
          <div className="relative h-0.75 w-full overflow-hidden rounded-full bg-white/6">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progress, 1) * 100}%`, background: style.bar }}
            />
          </div>
          <p
            className="mt-1.5 text-right text-[10px] font-semibold tabular-nums"
            style={{ color: style.dot }}
          >
            {Math.round(Math.min(progress, 1) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
