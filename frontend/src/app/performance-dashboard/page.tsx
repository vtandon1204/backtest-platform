// File: src/app/performance-dashboard/page.tsx
/**
 * This is the main page for the Performance Dashboard.
 *
 * It loads and visualizes trading performance data using charts and metric cards.
 * The dashboard includes return heatmaps, drawdown charts, PnL histograms, trade durations,
 * and risk metrics.
 *
 * Features:
 * - Filter state (timeframe, strategy, symbol, trade size)
 * - Strategy logic descriptions and mappings
 * - API data fetching (trades and metrics)
 * - Data transformation for heatmap and drawdown
 * - View toggling (overview vs detailed)
 * - Auto-refresh support
 *
 * Libraries used:
 * - framer-motion (animation)
 * - dayjs (date formatting)
 * - heroicons (icons)
 * - axios (API calls)
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trade } from "@/types/types";
import PerformanceDashboard from "@/components/PerformanceDashboard/PerformanceDashboard";
import ReturnHeatmap from "@/components/PerformanceDashboard/ReturnHeatmap";
import DrawdownChart from "@/components/PerformanceDashboard/DrawdownChart";
import PnLHistogram from "@/components/PerformanceDashboard/PnLHistogram";
import TradeDurationChart from "@/components/PerformanceDashboard/TradeDurationChart";
import RiskMetricCards from "@/components/PerformanceDashboard/RiskMetricCards";
import axios from "axios";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  CogIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

dayjs.extend(isoWeek); // Add ISO week plugin for calendar heatmap grouping

// ---------------- Interfaces ----------------

/**
 * Represents the current loading state of the dashboard.
 */
interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
}

/**
 * Represents the complete performance dataset.
 */
interface PerformanceData {
  trades: Trade[];
  metrics: Record<string, number>;
  heatmapData: { x: string; y: string; value: number }[];
  drawdownData: { timestamp: string; drawdown: number }[];
  lastUpdated: Date;
}

/**
 * Represents user-selected filters for data visualization.
 */
interface FilterState {
  timeframe: string;
  strategy: string;
  symbol: string;
  minTradeSize: number;
}

// ---------------- Main Component ----------------

const PerformanceDashboardPage: React.FC = () => {
  // Filter state used to fetch and filter performance data
  const [filters, setFilters] = useState<FilterState>({
    timeframe: "all",
    strategy: "momentum",
    symbol: "BTCUSDT",
    minTradeSize: 0,
  });

  // State to store all metrics and chart data
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    trades: [],
    metrics: {},
    heatmapData: [],
    drawdownData: [],
    lastUpdated: new Date(),
  });

  // UI-related states
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  /**
   * Maps each strategy name to its entry/exit rule and a short description.
   */
  type StrategyLogic = {
    entry: { left: string; op: string; right: string | number };
    exit: { left: string; op: string; right: string | number };
    description: string;
  };

  const strategyMap: Record<string, StrategyLogic> = {
    momentum: {
      entry: { left: "SMA", op: ">", right: "EMA" },
      exit: { left: "SMA", op: "<", right: "EMA" },
      description: "Trend following strategy using moving averages",
    },
    mean_reversion: {
      entry: { left: "RSI", op: "<", right: 30 },
      exit: { left: "RSI", op: ">", right: 50 },
      description: "Counter-trend strategy based on RSI oversold conditions",
    },
    breakout: {
      entry: { left: "Price", op: ">", right: "UpperBand" },
      exit: { left: "Price", op: "<", right: "LowerBand" },
      description: "Momentum strategy trading breakouts from consolidation",
    },
    scalping: {
      entry: { left: "MACD", op: ">", right: "Signal" },
      exit: { left: "MACD", op: "<", right: "Signal" },
      description: "High-frequency strategy using MACD crossovers",
    },
    all: {
      entry: { left: "Close", op: ">", right: 0 },
      exit: { left: "Close", op: ">", right: 0 },
      description: "Combined view of all strategies",
    },
  };

  /**
   * Maps each timeframe to a corresponding data granularity interval.
   */
  const intervalMap: Record<string, string> = {
    all: "1d",
    "1y": "1d",
    "6m": "4h",
    "3m": "1h",
    "1m": "30m",
    "1w": "15m",
  };

  // Options shown in symbol filter dropdown
  const symbolOptions = [
    { value: "BTCUSDT", label: "Bitcoin (BTC/USDT)" },
    { value: "ETHUSDT", label: "Ethereum (ETH/USDT)" },
    { value: "ADAUSDT", label: "Cardano (ADA/USDT)" },
    { value: "DOTUSDT", label: "Polkadot (DOT/USDT)" },
    { value: "LINKUSDT", label: "Chainlink (LINK/USDT)" },
  ];

  // To handle hydration mismatch when using `use client`
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /**
   * Aggregates PnL by weekday and ISO week for heatmap visualization.
   */
  const processHeatmapData = useCallback((trades: Trade[]) => {
    const heatmapMap = new Map<string, number>();

    trades.forEach((trade) => {
      if (!trade.entry_time) return;

      const ts = dayjs(trade.entry_time);
      const weekday = ts.format("ddd");
      const week = `Week ${ts.isoWeek()}-${ts.year()}`;
      const key = `${weekday}|${week}`;

      heatmapMap.set(key, (heatmapMap.get(key) || 0) + (trade.pnl_pct ?? 0));
    });

    return Array.from(heatmapMap.entries()).map(([key, value]) => {
      const [weekday, week] = key.split("|");
      return {
        x: weekday,
        y: week,
        value: parseFloat(value.toFixed(2)),
      };
    });
  }, []);

  /**
   * Calculates cumulative drawdown over time for drawdown chart.
   */
  const processDrawdownData = useCallback((trades: Trade[]) => {
    let equity = 100;
    let peak = 100;

    return trades
      .filter((trade) => trade.exit_time)
      .sort((a, b) => (a.exit_time || "").localeCompare(b.exit_time || ""))
      .map((trade) => {
        equity *= 1 + (trade.pnl_pct || 0) / 100;
        peak = Math.max(peak, equity);
        const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;

        return {
          timestamp: trade.exit_time?.split("T")[0] || "",
          drawdown: parseFloat(drawdown.toFixed(2)),
        };
      });
  }, []);

  // ----------------- Data Loading & Reactive Effects -----------------

  /**
   * Loads performance data from the backend with optional progress feedback.
   *
   * Simulates step-by-step loading progress for better UX.
   * Filters trades by minTradeSize and prepares visualization datasets.
   */
  const loadPerformanceData = useCallback(
    async (showProgress = true) => {
      if (showProgress) {
        setLoadingState({
          isLoading: true,
          message: "Initializing backtest...",
          progress: 0,
        });
      }

      setError(null); // Reset errors

      try {
        // Simulated progress updates
        if (showProgress) {
          setTimeout(
            () =>
              setLoadingState((prev) => ({
                ...prev,
                message: "Fetching market data...",
                progress: 25,
              })),
            500
          );
          setTimeout(
            () =>
              setLoadingState((prev) => ({
                ...prev,
                message: "Running strategy...",
                progress: 50,
              })),
            1000
          );
          setTimeout(
            () =>
              setLoadingState((prev) => ({
                ...prev,
                message: "Calculating metrics...",
                progress: 75,
              })),
            1500
          );
        }

        const requestData = {
          symbols: [filters.symbol],
          interval: intervalMap[filters.timeframe] || "1d",
          strategy: strategyMap[filters.strategy] || strategyMap["all"],
          execution: {
            slippage: 0.1,
            fees: 0.05,
            capital: 10000,
            order_type: "market",
          },
        };

        const response = await axios.post(
          "http://localhost:8000/strategy/backtest",
          requestData
        );
        const allData = response.data || {};

        // Flatten and filter trades
        const combinedTrades = Object.values(allData)
          .flatMap((s: any) => (Array.isArray(s.trades) ? s.trades : []))
          .filter(
            (trade: Trade) =>
              Math.abs(trade.pnl_pct || 0) >= filters.minTradeSize
          );

        // Merge all strategy metrics into one object
        const combinedMetrics = Object.values(allData)
          .map((s: any) => s.metrics || {})
          .reduce((acc, curr) => ({ ...acc, ...curr }), {});

        const heatmapData = processHeatmapData(combinedTrades);
        const drawdownData = processDrawdownData(combinedTrades);

        setPerformanceData({
          trades: combinedTrades,
          metrics: combinedMetrics,
          heatmapData,
          drawdownData,
          lastUpdated: new Date(),
        });

        // Finalize loading
        if (showProgress) {
          setLoadingState((prev) => ({
            ...prev,
            message: "Complete!",
            progress: 100,
          }));
          setTimeout(
            () => setLoadingState({ isLoading: false, message: "" }),
            500
          );
        }
      } catch (error: any) {
        console.error("Failed to load performance data:", error);
        setError(
          error.response?.data?.detail ||
            "Failed to load performance data. Please check your connection and try again."
        );
        setLoadingState({ isLoading: false, message: "" });
      }
    },
    [filters, processHeatmapData, processDrawdownData]
  );

  /**
   * Automatically refreshes performance data at regular intervals (every 30s)
   * if `autoRefresh` is enabled.
   */
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPerformanceData(false);
      }, 30000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh, loadPerformanceData]);

  /**
   * Triggers data load when filter changes.
   */
  useEffect(() => {
    loadPerformanceData();
  }, [filters.timeframe, filters.strategy, filters.symbol]);

  /**
   * Filters trades based on `minTradeSize` with 500ms debounce.
   * Regenerates heatmap and drawdown data after filtering.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (performanceData.trades.length > 0) {
        const filteredTrades = performanceData.trades.filter(
          (trade: Trade) => Math.abs(trade.pnl_pct || 0) >= filters.minTradeSize
        );

        if (filteredTrades.length !== performanceData.trades.length) {
          setPerformanceData((prev) => ({
            ...prev,
            trades: filteredTrades,
            heatmapData: processHeatmapData(filteredTrades),
            drawdownData: processDrawdownData(filteredTrades),
          }));
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.minTradeSize, processHeatmapData, processDrawdownData]);

  /**
   * Computes key summary statistics such as total return, win rate,
   * average return, Sharpe ratio, and max drawdown.
   */
  const summaryStats = useMemo(() => {
    const { trades, metrics } = performanceData;
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => (t.pnl_pct ?? 0) > 0).length;
    const totalReturn = trades.reduce((sum, t) => sum + (t.pnl_pct ?? 0), 0);

    return {
      totalTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalReturn,
      avgReturn: totalTrades > 0 ? totalReturn / totalTrades : 0,
      sharpeRatio: metrics.sharpe_ratio || 0,
      maxDrawdown: metrics.max_drawdown || 0,
    };
  }, [performanceData]);

  // ----------------- Filter Options -----------------

  const timeframeOptions = [
    { value: "all", label: "All Time", icon: "∞" },
    { value: "1y", label: "Last Year", icon: "1Y" },
    { value: "6m", label: "Last 6 Months", icon: "6M" },
    { value: "3m", label: "Last 3 Months", icon: "3M" },
    { value: "1m", label: "Last Month", icon: "1M" },
    { value: "1w", label: "Last Week", icon: "1W" },
  ];

  const strategyOptions = [
    {
      value: "momentum",
      label: "Momentum Strategy",
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "mean_reversion",
      label: "Mean Reversion",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "breakout",
      label: "Breakout Strategy",
      color: "from-orange-500 to-red-500",
    },
    {
      value: "scalping",
      label: "Scalping Strategy",
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "all",
      label: "All Strategies",
      color: "from-gray-500 to-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black border-b border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500   to-purple-500 rounded-xl">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Performance Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                  Advanced trading analytics and risk assessment
                </p>
                {mounted && performanceData.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated:{" "}
                    {new Date(performanceData.lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    autoRefresh
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title={
                    autoRefresh ? "Auto-refresh enabled" : "Enable auto-refresh"
                  }
                >
                  <ArrowPathIcon
                    className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  onClick={() =>
                    setViewMode(
                      viewMode === "overview" ? "detailed" : "overview"
                    )
                  }
                  className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-all duration-200"
                  title={`Switch to ${
                    viewMode === "overview" ? "detailed" : "overview"
                  } view`}
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadPerformanceData()}
                disabled={loadingState.isLoading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  loadingState.isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                }`}
              >
                {loadingState.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{loadingState.message}</span>
                  </>
                ) : (
                  <>
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    <span>Refresh Data</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Stats Bar */}
          {summaryStats.totalTrades > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {[
                {
                  label: "Total Trades",
                  value: summaryStats.totalTrades,
                  color: "text-blue-400",
                },
                {
                  label: "Win Rate",
                  value: `${summaryStats.winRate.toFixed(1)}%`,
                  color: "text-green-400",
                },
                {
                  label: "Total Return",
                  value: `${summaryStats.totalReturn.toFixed(2)}%`,
                  color:
                    summaryStats.totalReturn >= 0
                      ? "text-green-400"
                      : "text-red-400",
                },
                {
                  label: "Avg Return",
                  value: `${summaryStats.avgReturn.toFixed(2)}%`,
                  color:
                    summaryStats.avgReturn >= 0
                      ? "text-green-400"
                      : "text-red-400",
                },
                {
                  label: "Sharpe Ratio",
                  value: summaryStats.sharpeRatio.toFixed(2),
                  color:
                    summaryStats.sharpeRatio >= 1
                      ? "text-green-400"
                      : "text-yellow-400",
                },
                {
                  label: "Max DD",
                  value: `${Math.abs(summaryStats.maxDrawdown).toFixed(2)}%`,
                  color: "text-red-400",
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
                >
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <CogIcon className="w-5 h-5" />
              <span>Analysis Filters</span>
            </h3>
            <div className="text-sm text-gray-400">
              Strategy: {strategyMap[filters.strategy]?.description}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Timeframe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        timeframe: option.value,
                      }))
                    }
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.timeframe === option.value
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-bold">{option.icon}</div>
                    <div className="text-xs">{option.label.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Strategy
              </label>
              <select
                value={filters.strategy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, strategy: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {strategyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Trading Pair
              </label>
              <select
                value={filters.symbol}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, symbol: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {symbolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Trade Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Min Trade Size (%)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filters.minTradeSize}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minTradeSize: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span className="text-blue-400 font-medium">
                  {filters.minTradeSize.toFixed(1)}%
                </span>
                <span>5%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State with Progress */}
        <AnimatePresence>
          {loadingState.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-8 shadow-xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {loadingState.message}
                </h3>
                {loadingState.progress !== undefined && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingState.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <p className="text-gray-400">
                  Analyzing your trading performance...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-900/20 border border-red-700 rounded-2xl p-6 mb-8 backdrop-blur-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Unable to Load Performance Data
                  </h3>
                  <p className="text-red-300 mb-4">{error}</p>
                  <button
                    onClick={() => loadPerformanceData()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Content */}
        {performanceData.trades.length > 0 &&
          Object.keys(performanceData.metrics).length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {viewMode === "overview" ? (
                  /* Overview Mode - Integrated Dashboard */
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white">
                        Performance Overview
                      </h2>
                    </div>
                    <div className="p-6">
                      <PerformanceDashboard
                        metrics={performanceData.metrics}
                        trades={performanceData.trades}
                      />
                    </div>
                  </div>
                ) : (
                  /* Detailed Mode - Individual Components */
                  <div className="space-y-8">
                    {/* Risk Metrics */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                          <InformationCircleIcon className="w-5 h-5" />
                          <span>Risk Analysis</span>
                        </h2>
                      </div>
                      <div className="p-0">
                        <RiskMetricCards metrics={performanceData.metrics} />
                      </div>
                    </motion.div>

                    {/* Charts Grid */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                      >
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                          <h3 className="text-lg font-bold text-white">
                            Performance Heatmap
                          </h3>
                        </div>
                        <div className="p-0">
                          <ReturnHeatmap data={performanceData.heatmapData} />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                      >
                        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                          <h3 className="text-lg font-bold text-white">
                            Drawdown Analysis
                          </h3>
                        </div>
                        <div className="p-0">
                          <DrawdownChart data={performanceData.drawdownData} />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                      >
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                          <h3 className="text-lg font-bold text-white">
                            P&L Distribution
                          </h3>
                        </div>
                        <div className="p-0">
                          <PnLHistogram trades={performanceData.trades} />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                      >
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                          <h3 className="text-lg font-bold text-white">
                            Trade Duration Analysis
                          </h3>
                        </div>
                        <div className="p-0">
                          <TradeDurationChart trades={performanceData.trades} />
                        </div>
                      </motion.div>
                    </div>
                    {/* Detailed Performance Dashboard */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                    >
                      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">
                          Detailed Performance Metrics
                        </h2>
                      </div>
                      <div className="p-6">
                        <PerformanceDashboard
                          metrics={performanceData.metrics}
                          trades={performanceData.trades}
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

        {/* Empty State */}
        {!loadingState.isLoading &&
          !error &&
          performanceData.trades.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center shadow-xl"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                No Performance Data Available
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start by configuring your analysis parameters and clicking
                "Refresh Data" to load your trading performance metrics.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadPerformanceData()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Load Performance Data
              </motion.button>
            </motion.div>
          )}

        {/* Performance Summary Footer */}
        {performanceData.trades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 mt-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Analysis Summary
                </h3>
                <p className="text-gray-400 text-sm">
                  Based on {performanceData.trades.length} trades using{" "}
                  {strategyMap[filters.strategy]?.description.toLowerCase()}
                  for {filters.symbol} over{" "}
                  {filters.timeframe === "all"
                    ? "all available time"
                    : `the last ${filters.timeframe}`}
                  .
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>

                {autoRefresh && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Auto-refreshing</span>
                  </div>
                )}

                <div className="text-gray-500">
                  Updated: {performanceData.lastUpdated.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => loadPerformanceData()}
          disabled={loadingState.isLoading}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            loadingState.isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {loadingState.isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default PerformanceDashboardPage;
