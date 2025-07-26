"use client"; // Enables client-side rendering in Next.js

import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek); // Enable ISO week plugin to compute week numbers

// Component imports
import ReturnHeatmap from "./ReturnHeatmap";
import DrawdownChart from "./DrawdownChart";
import PnLHistogram from "./PnLHistogram";
import TradeDurationChart from "./TradeDurationChart";
import RiskMetricCards from "./RiskMetricCards";

// Type import
import type { Trade } from "@/types/types";

// Props definition
interface PerformanceDashboardProps {
  metrics: Record<string, number>; // Precomputed risk metrics
  trades: Trade[]; // Array of trade records
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ metrics, trades }) => {
  // ---- Drawdown Series Calculation ----
  let cumulativePnl = 0;
  let peak = 0;
  const drawdownSeries = trades.map((trade, idx) => {
    cumulativePnl += trade.pnl_pct ?? 0;
    peak = Math.max(peak, cumulativePnl);
    const drawdown = peak > 0 ? ((cumulativePnl - peak) / peak) * 100 : 0;
    return {
      timestamp: trade.timestamp || `T${idx + 1}`, // Fallback to index if no timestamp
      drawdown: isFinite(drawdown) ? drawdown : 0,
    };
  });

  // ---- Heatmap Data Generation ----
  const heatmapMap = new Map<string, number>();
  trades.forEach((trade) => {
    const ts = dayjs(trade.timestamp);
    const weekday = ts.format("ddd"); // Short form of weekday, e.g., "Mon"
    const week = `Week ${ts.isoWeek()}-${ts.year()}`; // ISO week and year format
    const key = `${weekday}|${week}`;
    heatmapMap.set(key, (heatmapMap.get(key) || 0) + (trade.pnl_pct ?? 0));
  });

  const heatmapData = Array.from(heatmapMap.entries()).map(([key, value]) => {
    const [weekday, week] = key.split("|");
    return {
      x: weekday,
      y: week,
      value: parseFloat(value.toFixed(2)), // Round to 2 decimals
    };
  });

  // ---- Summary Statistics ----
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => (t.pnl_pct ?? 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalReturn = trades.reduce((sum, t) => sum + (t.pnl_pct ?? 0), 0);
  const avgReturn = totalTrades > 0 ? totalReturn / totalTrades : 0;

  console.log("Metrics:", metrics); // Debug log

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-8"
    >
      {/* ---- Summary Stat Cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalTrades}</div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Win Rate</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalReturn.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">Total Return</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgReturn.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">Avg Return</div>
        </div>
      </div>

      {/* ---- Risk Metric Cards ---- */}
      <div className="mb-8">
        <RiskMetricCards metrics={metrics} />
      </div>

      {/* ---- Performance Charts Grid ---- */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Return Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <ReturnHeatmap data={heatmapData} />
        </motion.div>

        {/* Drawdown Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <DrawdownChart data={drawdownSeries} />
        </motion.div>

        {/* PnL Histogram */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <PnLHistogram trades={trades} />
        </motion.div>

        {/* Trade Duration Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <TradeDurationChart trades={trades} />
        </motion.div>
      </div>

      {/* ---- Additional Trading Insights ---- */}
      {trades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Trading Insights</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400">Best Trade</div>
              <div className="text-green-400 font-semibold text-lg">
                +{Math.max(...trades.map(t => t.pnl_pct ?? 0)).toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400">Worst Trade</div>
              <div className="text-red-400 font-semibold text-lg">
                {Math.min(...trades.map(t => t.pnl_pct ?? 0)).toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400">Profit Factor</div>
              <div className="text-blue-400 font-semibold text-lg">
                {metrics.profit_factor?.toFixed(2) ?? 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PerformanceDashboard;
