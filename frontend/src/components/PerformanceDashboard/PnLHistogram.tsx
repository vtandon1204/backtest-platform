'use client' // Enables client-side rendering in Next.js

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { motion } from 'framer-motion'
import type { Trade } from '@/types/types'

// Props interface for the histogram component
interface PnLHistogramProps {
  trades: Trade[] // Array of trade objects with pnl_pct
}

const PnLHistogram: React.FC<PnLHistogramProps> = ({ trades }) => {
  // Function to generate histogram bins from trades
  const createHistogramData = () => {
    if (trades.length === 0) {
      // Return sample demo data if no trades are provided
      return [
        { range: '< -5%', count: 2, color: '#dc2626' },
        { range: '-5% to -3%', count: 5, color: '#ea580c' },
        { range: '-3% to -1%', count: 8, color: '#f59e0b' },
        { range: '-1% to 0%', count: 12, color: '#fbbf24' },
        { range: '0% to 1%', count: 15, color: '#84cc16' },
        { range: '1% to 3%', count: 10, color: '#22c55e' },
        { range: '3% to 5%', count: 6, color: '#16a34a' },
        { range: '> 5%', count: 3, color: '#15803d' }
      ]
    }

    // Extract all P&L values from trades
    const pnlValues = trades.map(t => t.pnl_pct ?? 0)

    // Define bins for histogram
    const bins = [
      { min: -Infinity, max: -5, range: '< -5%', color: '#dc2626' },
      { min: -5, max: -3, range: '-5% to -3%', color: '#ea580c' },
      { min: -3, max: -1, range: '-3% to -1%', color: '#f59e0b' },
      { min: -1, max: 0, range: '-1% to 0%', color: '#fbbf24' },
      { min: 0, max: 1, range: '0% to 1%', color: '#84cc16' },
      { min: 1, max: 3, range: '1% to 3%', color: '#22c55e' },
      { min: 3, max: 5, range: '3% to 5%', color: '#16a34a' },
      { min: 5, max: Infinity, range: '> 5%', color: '#15803d' }
    ]

    // Count trades in each bin and return histogram-ready data
    return bins.map(bin => ({
      range: bin.range,
      count: pnlValues.filter(val => val > bin.min && val <= bin.max).length,
      color: bin.color
    }))
  }

  // Compute the histogram data
  const histogramData = createHistogramData()

  // Basic aggregate stats
  const totalTrades = histogramData.reduce((sum, bin) => sum + bin.count, 0)
  const winningTrades = histogramData.filter((_, index) => index >= 4).reduce((sum, bin) => sum + bin.count, 0)
  const losingTrades = histogramData.filter((_, index) => index < 4).reduce((sum, bin) => sum + bin.count, 0)
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 50

  // Tooltip to show info on hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const percentage = totalTrades > 0 ? ((payload[0].value / totalTrades) * 100).toFixed(1) : '0'
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Range: ${label}`}</p>
          <p className="text-white font-semibold">
            {`Trades: ${payload[0].value} (${percentage}%)`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header with win/loss summary */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">P&L Distribution</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400">Win Rate: </span>
            <span className="text-green-400 font-semibold">{winRate.toFixed(1)}%</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400">Winners: </span>
            <span className="text-green-400 font-semibold">{winningTrades}</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400">Losers: </span>
            <span className="text-red-400 font-semibold">{losingTrades}</span>
          </div>
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={histogramData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            {/* Grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            
            {/* X-axis with rotated labels */}
            <XAxis 
              dataKey="range"
              stroke="#9ca3af"
              fontSize={11}
              tick={{ fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            {/* Y-axis */}
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Bar series */}
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]} // rounded corners on top
              stroke="#1f2937" // gray-800 border
              strokeWidth={1}
            >
              {/* Assign colors per bin */}
              {histogramData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average winner & loser blocks */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Average Winner</div>
          <div className="text-green-400 font-semibold">
            {trades.length > 0 
              ? (
                trades.filter(t => (t.pnl_pct ?? 0) > 0)
                  .reduce((sum, t) => sum + (t.pnl_pct ?? 0), 0) /
                Math.max(1, trades.filter(t => (t.pnl_pct ?? 0) > 0).length)
              ).toFixed(2)
              : '2.1'
            }%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Average Loser</div>
          <div className="text-red-400 font-semibold">
            {trades.length > 0 
              ? (
                trades.filter(t => (t.pnl_pct ?? 0) < 0)
                  .reduce((sum, t) => sum + (t.pnl_pct ?? 0), 0) /
                Math.max(1, trades.filter(t => (t.pnl_pct ?? 0) < 0).length)
              ).toFixed(2)
              : '-1.8'
            }%
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 text-xs text-gray-500">
        <p>* Distribution shows frequency of trades across different P&L ranges</p>
      </div>
    </motion.div>
  )
}

export default PnLHistogram
