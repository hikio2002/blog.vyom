'use client';
import { useState } from 'react';

interface DataPoint { month: string; label: string; views: number; }

interface Props { data: DataPoint[]; }

export default function MonthlyViewsChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No view data yet</div>;
  }

  const max = Math.max(...data.map(d => d.views), 1);
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGap = 8;
  const barWidth = (chartWidth - barGap * (data.length - 1)) / data.length;

  // Gridlines at 0%, 25%, 50%, 75%, 100% of max
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Gridlines */}
        {gridLines.map(g => {
          const y = padding.top + chartHeight * (1 - g);
          return (
            <line
              key={g}
              x1={padding.left} y1={y} x2={width - padding.right} y2={y}
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
              strokeWidth={1}
            />
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.views / max) * chartHeight : 0;
          const x = padding.left + i * (barWidth + barGap);
          const y = padding.top + chartHeight - barHeight;
          const isHovered = hover === i;
          const isCurrent = i === data.length - 1;

          return (
            <g key={d.month}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              {/* Invisible full-height hit area for easier hover */}
              <rect x={x} y={padding.top} width={barWidth} height={chartHeight} fill="transparent" />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.views > 0 ? 2 : 0)}
                rx={4}
                className={
                  isHovered
                    ? 'fill-indigo-500'
                    : isCurrent
                      ? 'fill-indigo-400'
                      : 'fill-indigo-200 dark:fill-indigo-900'
                }
              />

              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-gray-400 text-[10px]"
              >
                {d.label}
              </text>

              {/* Value tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 24}
                    y={y - 28}
                    width={48}
                    height={22}
                    rx={6}
                    className="fill-gray-900 dark:fill-gray-100"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 13}
                    textAnchor="middle"
                    className="fill-white dark:fill-gray-900 text-[11px] font-semibold"
                  >
                    {d.views.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
