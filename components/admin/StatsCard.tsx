import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";

/**
 * Metric tile used across the dashboard and analytics views.
 *
 * Pure presentational — data comes from `lib/analytics/getAnalytics.ts`, so the
 * numbers always match the orders table.
 */
export default function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "amber",
  prefix = "",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: "amber" | "emerald" | "sky" | "violet" | "rose";
  /** `currency` renders ৳, `number` renders a grouped integer. */
  prefix?: "currency" | "number" | "";
}) {
  const accents: Record<string, string> = {
    amber: "from-amber-400/15 to-amber-500/5 text-amber-500 ring-amber-500/20",
    emerald:
      "from-emerald-400/15 to-emerald-500/5 text-emerald-500 ring-emerald-500/20",
    sky: "from-sky-400/15 to-sky-500/5 text-sky-500 ring-sky-500/20",
    violet:
      "from-violet-400/15 to-violet-500/5 text-violet-500 ring-violet-500/20",
    rose: "from-rose-400/15 to-rose-500/5 text-rose-500 ring-rose-500/20",
  };

  const display =
    typeof value === "string"
      ? value
      : prefix === "currency"
        ? formatCurrency(value)
        : prefix === "number"
          ? formatNumber(value)
          : formatNumber(value);

  return (
    <div className="group rounded-2xl border border-stone-800 bg-stone-900/60 p-5 transition-all duration-300 hover:border-stone-700 hover:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {label}
          </p>
          <p className="mt-2 truncate font-heading text-3xl font-bold text-white tabular-nums">
            {display}
          </p>
          {hint && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-stone-500">
              {hint}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${accents[accent]}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/** Small up/down delta chip used next to revenue figures. */
export function TrendChip({ value, suffix = "vs last 30 days" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-rose-500/10 text-rose-400"
      }`}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value).toFixed(0)}% {suffix}
    </span>
  );
}
