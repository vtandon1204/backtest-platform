// src/components/PerformanceDashboard/TradeDurationChart.tsx

"use client"; // Enables React server components to use client-side features

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"; // Recharts components for building the chart
import dayjs from "dayjs"; // Date library
import duration from "dayjs/plugin/duration"; // Plugin for duration parsing

dayjs.extend(duration); // Attach duration plugin to dayjs

import type { Trade } from "@/types/types"; // TypeScript type for trade data

// Props for the TradeDurationChart component
interface TradeDurationChartProps {
  trades: Trade[];
}

// Shape of processed data for the chart
interface DurationBucket {
  range: string;
  count: number;
  avgReturn: number;
  color: string;
}

const TradeDurationChart: React.FC<TradeDurationChartProps> = ({ trades }) => {
  // Compute chart data only when 'trades' changes
  const durationData = useMemo(() => {
    // Step 1: Filter trades with both entry and exit times and compute durations
    const tradesWithDuration = trades
      .filter((trade) => trade.entry_time && trade.exit_time)
      .map((trade) => {
        const entryTime = dayjs(trade.entry_time);
        const exitTime = dayjs(trade.exit_time);
        const durationMinutes = exitTime.diff(entryTime, "minute");
        return {
          ...trade,
          durationMinutes,
        };
      });

    if (tradesWithDuration.length === 0) return [];

    // Step 2: Define duration buckets
    const buckets = [
      { min: 0, max: 5, label: "0-5m", color: "#60A5FA" },
      { min: 5, max: 15, label: "5-15m", color: "#34D399" },
      { min: 15, max: 30, label: "15-30m", color: "#FBBF24" },
      { min: 30, max: 60, label: "30-60m", color: "#F87171" },
      { min: 60, max: 180, label: "1-3h", color: "#A78BFA" },
      { min: 180, max: 480, label: "3-8h", color: "#F472B6" },
      { min: 480, max: Infinity, label: "8h+", color: "#9CA3AF" },
    ];

    // Step 3: Group trades into duration buckets
    const bucketData: DurationBucket[] = buckets
      .map((bucket) => {
        const tradesInBucket = tradesWithDuration.filter(
          (trade) =>
            trade.durationMinutes >= bucket.min &&
            trade.durationMinutes < bucket.max
        );

        // Compute average return (pnl_pct) for the bucket
        const avgReturn =
          tradesInBucket.length > 0
            ? tradesInBucket.reduce(
                (sum, trade) => sum + (trade.pnl_pct ?? 0),
                0
              ) / tradesInBucket.length
            : 0;

        return {
          range: bucket.label,
          count: tradesInBucket.length,
          avgReturn: parseFloat(avgReturn.toFixed(2)),
          color: bucket.color,
        };
      })
      .filter((bucket) => bucket.count > 0); // Remove empty buckets

    return bucketData;
  }, [trades]);

  // Tooltip component to display on hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Duration: ${label}`}</p>
          <p className="text-blue-400">{`Trades: ${data.count}`}</p>
          <p
            className={`font-semibold ${
              data.avgReturn >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {`Avg Return: ${data.avgReturn}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Label to render above each bar
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload || typeof payload.count !== "number") return <g />;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        fill="#9CA3AF"
        fontSize="12"
        fontWeight="500"
      >
        {payload.count}
      </text>
    );
  };

  // If no valid data, return a fallback UI
  if (durationData.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-white mb-4">
          Trade Duration Distribution
        </h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No trade duration data available</p>
          <p className="text-sm mt-1">
            Trades need both entry_time and exit_time
          </p>
        </div>
      </div>
    );
  }

  // Summary statistics
  const totalTrades = durationData.reduce(
    (sum, bucket) => sum + bucket.count,
    0
  );
  const bestPerformingDuration = durationData.reduce((best, current) =>
    current.avgReturn > best.avgReturn ? current : best
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">
        Trade Duration Distribution
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-400">Total Analyzed</div>
          <div className="text-lg font-semibold text-white">
            {totalTrades} trades
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-400">Best Duration</div>
          <div className="text-lg font-semibold text-green-400">
            {bestPerformingDuration.range} (
            {bestPerformingDuration.avgReturn.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={durationData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="range"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickLine={{ stroke: "#4B5563" }}
              axisLine={{ stroke: "#4B5563" }}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickLine={{ stroke: "#4B5563" }}
              axisLine={{ stroke: "#4B5563" }}
              label={{
                value: "Number of Trades",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#9CA3AF" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              label={renderCustomLabel}
            >
              {durationData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.avgReturn >= 0 ? "#4ADE80" : "#F87171"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom insights (most frequent, best performing durations) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Most Common Duration
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">
              {
                durationData.reduce((max, current) =>
                  current.count > max.count ? current : max
                ).range
              }
            </span>
            <span className="text-blue-400">
              {
                durationData.reduce((max, current) =>
                  current.count > max.count ? current : max
                ).count
              }{" "}
              trades
            </span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Avg Return by Duration
          </h4>
          <div className="space-y-1">
            {durationData
              .sort((a, b) => b.avgReturn - a.avgReturn)
              .slice(0, 3)
              .map((bucket, index) => (
                <div
                  key={bucket.range}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400">{bucket.range}</span>
                  <span
                    className={
                      bucket.avgReturn >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {bucket.avgReturn.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDurationChart;
