"use client"; // Enables client-side interactivity in Next.js

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Represents a single cell in the heatmap: x = weekday, y = week label, value = return %
interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

// Props passed into the ReturnHeatmap component
interface ReturnHeatmapProps {
  data: HeatmapDataPoint[];
}

// Structure used to show tooltip when user hovers over a cell
interface TooltipData {
  weekday: string;
  week: string;
  value: number;
  x: number;
  y: number;
}

const ReturnHeatmap: React.FC<ReturnHeatmapProps> = ({ data }) => {
  // Tooltip state for hover interactions
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Precompute axis labels, color scales, and lookup map
  const { weekdays, weeks, dataMap, minValue, maxValue, absMax } = useMemo(() => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeks = Array.from(new Set(data.map(d => d.y))).sort();

    const dataMap = new Map<string, number>();
    data.forEach(d => {
      dataMap.set(`${d.x}|${d.y}`, d.value);
    });

    const values = data.map(d => d.value);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 0);
    const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));

    return { weekdays, weeks, dataMap, minValue, maxValue, absMax };
  }, [data]);

  // Maps a return value to a background color with alpha transparency
  const getColor = (value: number | undefined): string => {
    if (value === undefined) return "#374151"; // gray-700 for missing
    if (Math.abs(value) < 0.01) return "#4B5563"; // gray-600 for neutral

    const intensity = Math.min(Math.abs(value) / Math.max(absMax, 1), 1);
    const baseAlpha = 0.3;
    const alpha = Math.min(intensity * 0.7 + baseAlpha, 1);

    // Return green/red color with calculated opacity
    if (value > 0) {
      const greenIntensity = Math.min(intensity * 255, 255);
      return `rgba(34, ${Math.floor(150 + greenIntensity * 0.3)}, 94, ${alpha})`;
    } else {
      const redIntensity = Math.min(intensity * 255, 255);
      return `rgba(${Math.floor(200 + redIntensity * 0.2)}, 68, 68, ${alpha})`;
    }
  };

  // Determines the border color on hover
  const getBorderColor = (cellKey: string, value: number | undefined): string => {
    if (hoveredCell === cellKey) {
      return value !== undefined && Math.abs(value) > 0.01
        ? (value > 0 ? "#10B981" : "#EF4444") // green or red
        : "#9CA3AF"; // gray
    }
    return "#374151"; // default
  };

  // Hover handlers to track and show tooltip
  const handleMouseEnter = (
    weekday: string,
    week: string,
    value: number | undefined,
    event: React.MouseEvent
  ) => {
    if (value !== undefined) {
      const rect = (event.target as Element).getBoundingClientRect();
      const containerRect = (event.currentTarget as Element).closest('.heatmap-container')?.getBoundingClientRect();

      if (containerRect) {
        setTooltip({
          weekday,
          week,
          value,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10
        });
      }
    }
    setHoveredCell(`${week}-${weekday}`);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredCell(null);
  };

  // Responsive grid sizing
  const cellSize = Math.max(Math.min(45, window.innerWidth / (weekdays.length + 3)), 30);
  const marginLeft = 100;
  const marginTop = 50;
  const totalWidth = Math.max(weekdays.length * cellSize + marginLeft + 50, 600);
  const totalHeight = weeks.length * cellSize + marginTop + 100;

  // Aggregate return statistics for display
  const stats = useMemo(() => {
    const values = data.map(d => d.value).filter(v => Math.abs(v) > 0.01);
    const positiveCount = values.filter(v => v > 0).length;
    const negativeCount = values.filter(v => v < 0).length;
    const avgReturn = values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : 0;

    const bestDay = weekdays.reduce((best, day) => {
      const dayValues = data.filter(d => d.x === day).map(d => d.value);
      const dayAvg = dayValues.length > 0
        ? dayValues.reduce((sum, v) => sum + v, 0) / dayValues.length
        : 0;
      return dayAvg > best.avg ? { day, avg: dayAvg } : best;
    }, { day: '', avg: -Infinity });

    return { positiveCount, negativeCount, avgReturn, bestDay: bestDay.day || 'N/A' };
  }, [data, weekdays]);

  // Fallback UI for empty data
  if (data.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-white mb-4">Return Heatmap</h3>
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">No trading data available</div>
          <div className="text-sm text-gray-500">Start trading to see your return patterns</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header and top summary */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Return Heatmap</h3>
        <div className="text-xs text-gray-400">
          Best day: <span className="text-green-400 font-medium">{stats.bestDay}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-green-400 font-semibold">{stats.positiveCount}</div>
          <div className="text-gray-400">Positive</div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-red-400 font-semibold">{stats.negativeCount}</div>
          <div className="text-gray-400">Negative</div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className={`font-semibold ${stats.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.avgReturn.toFixed(2)}%
          </div>
          <div className="text-gray-400">Avg</div>
        </div>
      </div>

      {/* Heatmap SVG grid */}
      <div className="heatmap-container relative overflow-x-auto bg-gray-800 rounded-lg p-4">
        <motion.svg 
          width={totalWidth} 
          height={totalHeight}
          className="w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Y-axis labels */}
          {weeks.map((week, weekIndex) => (
            <text
              key={week}
              x={marginLeft - 15}
              y={marginTop + weekIndex * cellSize + cellSize / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-gray-400 text-xs font-medium"
            >
              {week.replace('Week ', 'W')}
            </text>
          ))}

          {/* X-axis labels */}
          {weekdays.map((day, dayIndex) => (
            <text
              key={day}
              x={marginLeft + dayIndex * cellSize + cellSize / 2}
              y={marginTop - 15}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-xs font-medium"
            >
              {day}
            </text>
          ))}

          {/* Heatmap cells */}
          {weeks.map((week, weekIndex) =>
            weekdays.map((day, dayIndex) => {
              const value = dataMap.get(`${day}|${week}`);
              const color = getColor(value);
              const cellKey = `${week}-${day}`;
              const borderColor = getBorderColor(cellKey, value);

              return (
                <motion.g 
                  key={cellKey}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: (weekIndex * weekdays.length + dayIndex) * 0.02,
                    ease: "easeOut"
                  }}
                >
                  <rect
                    x={marginLeft + dayIndex * cellSize + 3}
                    y={marginTop + weekIndex * cellSize + 3}
                    width={cellSize - 6}
                    height={cellSize - 6}
                    fill={color}
                    stroke={borderColor}
                    strokeWidth={hoveredCell === cellKey ? 2 : 1}
                    rx={4}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) => handleMouseEnter(day, week, value, e)}
                    onMouseLeave={handleMouseLeave}
                  />

                  {/* Show return value if large enough */}
                  {value !== undefined && Math.abs(value) > 1 && (
                    <text
                      x={marginLeft + dayIndex * cellSize + cellSize / 2}
                      y={marginTop + weekIndex * cellSize + cellSize / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-xs font-bold pointer-events-none"
                      style={{ 
                        fontSize: `${Math.min(cellSize / 4, 10)}px`,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                      }}
                    >
                      {Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value)}
                    </text>
                  )}
                </motion.g>
              );
            })
          )}

          {/* Color Legend */}
          <g transform={`translate(${marginLeft}, ${marginTop + weeks.length * cellSize + 30})`}>
            <text x={0} y={0} className="fill-gray-300 text-sm font-medium">Returns:</text>
            <rect x={80} y={-10} width={20} height={15} fill="rgba(239, 68, 68, 0.7)" rx={3} />
            <text x={105} y={0} className="fill-gray-300 text-xs">Loss</text>
            <rect x={150} y={-10} width={20} height={15} fill="#4B5563" rx={3} />
            <text x={175} y={0} className="fill-gray-300 text-xs">Flat</text>
            <rect x={220} y={-10} width={20} height={15} fill="rgba(34, 197, 94, 0.7)" rx={3} />
            <text x={245} y={0} className="fill-gray-300 text-xs">Gain</text>
            {absMax > 0 && (
              <text x={290} y={0} className="fill-gray-400 text-xs">
                Range: ±{absMax.toFixed(1)}%
              </text>
            )}
          </g>
        </motion.svg>

        {/* Tooltip shown on hover */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute z-10 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
              <div className="text-white font-medium text-sm mb-1">
                {tooltip.weekday} - {tooltip.week}
              </div>
              <div className={`font-bold text-lg ${tooltip.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tooltip.value > 0 ? '+' : ''}{tooltip.value.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {tooltip.value >= 0 ? 'Profitable day' : 'Loss day'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReturnHeatmap;
