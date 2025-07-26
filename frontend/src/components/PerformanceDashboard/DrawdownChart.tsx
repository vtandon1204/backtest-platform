'use client' // Marks this component as a client component in Next.js

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { motion } from 'framer-motion'

// Type representing each drawdown point
interface DrawdownData {
  timestamp: string // Time identifier (e.g., date, label)
  drawdown: number  // Drawdown percentage
}

// Props accepted by the DrawdownChart component
interface DrawdownChartProps {
  data: DrawdownData[] // Array of drawdown data points
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ data }) => {
  // Use fallback sample data if no real data is provided
  const sampleData = data.length > 0 ? data : [
    { timestamp: '2024-01', drawdown: 0 },
    { timestamp: '2024-02', drawdown: -2.5 },
    { timestamp: '2024-03', drawdown: -1.2 },
    { timestamp: '2024-04', drawdown: -5.8 },
    { timestamp: '2024-05', drawdown: -3.1 },
    { timestamp: '2024-06', drawdown: -0.8 },
    { timestamp: '2024-07', drawdown: -4.2 },
    { timestamp: '2024-08', drawdown: -2.3 },
    { timestamp: '2024-09', drawdown: -1.5 },
    { timestamp: '2024-10', drawdown: -3.7 },
    { timestamp: '2024-11', drawdown: -0.9 },
    { timestamp: '2024-12', drawdown: -2.1 }
  ]

  // Calculate maximum and average drawdown from the dataset
  const maxDrawdown = Math.min(...sampleData.map(d => d.drawdown))
  const avgDrawdown = sampleData.reduce((sum, d) => sum + d.drawdown, 0) / sampleData.length

  // Tooltip component to show drawdown values on hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Date: ${label}`}</p>
          <p className="text-red-400 font-semibold">
            {`Drawdown: ${payload[0].value.toFixed(2)}%`}
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
      {/* Header and metrics */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Drawdown Analysis</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400">Max Drawdown: </span>
            <span className="text-red-400 font-semibold">{maxDrawdown.toFixed(2)}%</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400">Avg Drawdown: </span>
            <span className="text-orange-400 font-semibold">{avgDrawdown.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Area chart for drawdown */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            {/* Gradient fill for the area below the line */}
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            {/* Grid and axes */}
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              domain={['dataMin', 0]} // y-axis limited to negative drawdown
            />

            {/* Tooltip interaction */}
            <Tooltip content={<CustomTooltip />} />

            {/* Area plot representing drawdown over time */}
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              dot={{ fill: '#ef4444', strokeWidth: 0.1, r: 2 }}
              activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1, fill: '#1f2937' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote */}
      <div className="mt-4 text-xs text-gray-500">
        <p>* Drawdown represents the peak-to-trough decline in portfolio value</p>
      </div>
    </motion.div>
  )
}

export default DrawdownChart
