// src/components/PerformanceDashboard/RiskMetricCards.tsx
"use client"; // Enables use of React hooks and client-side rendering in Next.js

import React from "react";
import { motion } from "framer-motion";

// Props interface for risk metrics component
interface RiskMetricCardsProps {
  metrics: Record<string, number>; // key-value pairs for risk metric name and its numeric value
}

const RiskMetricCards: React.FC<RiskMetricCardsProps> = ({ metrics }) => {
  /**
   * Configuration object for mapping raw metric keys to
   * display labels, formatting functions, and dynamic color classes.
   */
  const metricDisplayConfig: Record<
    string,
    {
      label: string; // Human-readable label
      format: (value: number) => string; // Formatting logic
      colorClass: (value: number) => string; // Color logic based on value
    }
  > = {
    sharpe_ratio: {
      label: "Sharpe Ratio",
      format: (value) => value.toFixed(2),
      colorClass: (value) =>
        value >= 1
          ? "text-green-400"
          : value >= 0.5
          ? "text-yellow-400"
          : "text-red-400",
    },
    sortino_ratio: {
      label: "Sortino Ratio",
      format: (value) => value.toFixed(2),
      colorClass: (value) =>
        value >= 1
          ? "text-green-400"
          : value >= 0.5
          ? "text-yellow-400"
          : "text-red-400",
    },
    max_drawdown: {
      label: "Max Drawdown",
      format: (value) => `${Math.abs(value).toFixed(2)}%`,
      colorClass: () => "text-red-400", // Always red
    },
    volatility: {
      label: "Volatility",
      format: (value) => `${value.toFixed(2)}%`,
      colorClass: (value) =>
        value <= 10
          ? "text-green-400"
          : value <= 20
          ? "text-yellow-400"
          : "text-red-400",
    },
    profit_factor: {
      label: "Profit Factor",
      format: (value) => value.toFixed(2),
      colorClass: (value) =>
        value >= 1.5
          ? "text-green-400"
          : value >= 1
          ? "text-yellow-400"
          : "text-red-400",
    },
    calmar_ratio: {
      label: "Calmar Ratio",
      format: (value) => value.toFixed(2),
      colorClass: (value) =>
        value >= 0.5
          ? "text-green-400"
          : value >= 0.2
          ? "text-yellow-400"
          : "text-red-400",
    },
    var_95: {
      label: "VaR (95%)",
      format: (value) => `${Math.abs(value).toFixed(2)}%`,
      colorClass: () => "text-orange-400", // Fixed orange color
    },
    beta: {
      label: "Beta",
      format: (value) => value.toFixed(2),
      colorClass: (value) =>
        value <= 1 ? "text-green-400" : "text-yellow-400",
    },
  };

  // Filter metrics to remove null/undefined/NaN values
  const validMetrics = Object.entries(metrics).filter(
    ([_, value]) => value !== undefined && value !== null && !isNaN(value)
  );

  // Fallback when no valid metrics are available
  if (validMetrics.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
        <div className="text-gray-400 text-center py-8">
          No risk metrics available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Risk Metrics</h3>

      {/* Grid of cards showing each risk metric */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {validMetrics.map(([key, value], index) => {
          // Lookup configuration or fallback
          const config = metricDisplayConfig[key];
          const label =
            config?.label ||
            key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const formattedValue = config?.format
            ? config.format(value)
            : value.toFixed(2);
          const colorClass = config?.colorClass
            ? config.colorClass(value)
            : "text-blue-400";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors duration-200"
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                {label}
              </div>
              <div className={`text-lg font-bold ${colorClass}`}>
                {formattedValue}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskMetricCards;
