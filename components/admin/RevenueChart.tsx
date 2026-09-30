"use client";

import { useMemo, useState } from "react";
import type { RevenuePoint } from "@/lib/db/client-types";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * Dependency-free revenue chart.
 *
 * Rendered as SVG so there is no charting library in the bundle — the admin
 * panel must stay light next to the 3D storefront. Hovering a day reveals that
 * day's revenue and order count.
 */
export default function RevenueChart({
  data,
  height = 240,
  title = "Revenue — last 30 days",
}: {
  data: RevenuePoint[];
  height?: number;
  title?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 720;
  const padding = { top: 20, right: 16, bottom: 34, left: 56 };

  const points = useMemo(() => data.length > 0 ? data : [], [data]);
  const max = Math.max(1, ...points.map((point) => point.revenue));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const toX = (index: number) => padding.left + index * stepX;
  const toY = (value: number) =>
    padding.top + innerHeight - (value / max) * innerHeight;

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${toX(index)},${toY(point.revenue)}`)
    .join(" ");
  const area =
    points.length > 0
      ? `${line} L${toX(points.length - 1)},${padding.top + innerHeight} L${toX(0)},${
          padding.top + innerHeight
        } Z`
      : "";

  const active = hovered !== null ? points[hovered] : null;
  const total = points.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
          {title}
        </h3>
        <span className="text-lg font-bold text-white tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={title}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid + y labels */}
          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + innerHeight * ratio;
            const value = max * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(120,113,108,0.18)"
                  strokeDasharray="3 5"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#78716c"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {points.length > 0 && (
            <>
              <path d={area} fill="url(#revenueFill)" />
              <path
                d={line}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Hover target bands */}
          {points.map((point, index) => (
            <rect
              key={point.date}
              x={toX(index) - stepX / 2}
              y={padding.top}
              width={Math.max(stepX, 8)}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
            />
          ))}

          {active && (
            <g>
              <line
                x1={toX(hovered ?? 0)}
                x2={toX(hovered ?? 0)}
                y1={padding.top}
                y2={padding.top + innerHeight}
                stroke="rgba(245,158,11,0.4)"
                strokeWidth="1"
              />
              <circle
                cx={toX(hovered ?? 0)}
                cy={toY(active.revenue)}
                r="4.5"
                fill="#F59E0B"
                stroke="#0c0a09"
                strokeWidth="2"
              />
            </g>
          )}

          {/* x labels */}
          {points.map((point, index) =>
            index % 7 === 0 ? (
              <text
                key={`label-${point.date}`}
                x={toX(index)}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#78716c"
              >
                {point.date.slice(5)}
              </text>
            ) : null,
          )}
        </svg>

        {active && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
            <div className="rounded-lg border border-stone-700 bg-stone-950/95 px-3 py-1.5 text-[11px] shadow-xl">
              <span className="text-stone-400">{formatDate(active.date)} · </span>
              <span className="font-semibold text-white">
                {formatCurrency(active.revenue)}
              </span>
              <span className="text-stone-500"> · {active.orders} orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
