"use client";

type Accent = "red" | "amber" | "green" | "blue";

const accents: Record<
  Accent,
  { border: string; subtitle?: string; blurColor: string }
> = {
  red: { border: "border-t-[#E84868]", subtitle: "text-[#E84868]", blurColor: "#E84868" },
  amber: { border: "border-t-[#DBA940]", subtitle: "text-[#75FB94]", blurColor: "#DBA940" },
  green: { border: "border-t-[#75FB94]", subtitle: "text-[#838395]", blurColor: "#75FB94" },
  blue: { border: "border-t-[#2B36CD]", subtitle: "text-[#838395]", blurColor: "#2B36CD" },
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
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] border border-[#2A2A34] bg-[#131319] pt-0.5 ${style.border}`}
    >
      <div
        className="absolute right-0 bottom-0 h-14 w-14 mix-blend-screen blur-[46px]"
        style={{ background: style.blurColor }}
        aria-hidden
      />
      <div className="relative p-5">
        <p className="text-xs font-bold text-[#DDDBDB]">{title}</p>
        {meta && (
          <p className="mt-1 text-[8px] font-bold uppercase leading-[18px] text-[#8B8B9D]">
            {meta}
          </p>
        )}
        <p className="mt-2 text-[36px] font-bold leading-[18px] text-white">
          {value}
        </p>
        {subtitle && (
          <p
            className={`mt-3 text-xs font-medium leading-[18px] ${style.subtitle}`}
          >
            {subtitle}
          </p>
        )}
        {progress != null && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#1E1E2E]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 1) * 100}%`, background: style.blurColor }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
