// src/components/StrategyBuilder/ExecutionParams.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Props interface for ExecutionParams component.
 * @property params - Object containing all trade execution parameters.
 * @property setParams - Function to update the execution parameters state.
 */
interface Props {
  params: {
    order_type: string             // Type of order to execute: 'market' or 'limit'
    quantity_pct: number          // Position size as a percentage of total capital
    fee_bps: number               // Trading fee in basis points (1 bps = 0.01%)
    slippage_bps: number          // Expected slippage in basis points
    take_profit_pct: number       // Take profit level in percentage
    stop_loss_pct: number         // Stop loss level in percentage
  }
  setParams: (params: any) => void // Setter function to update the parameters
}

/**
 * ExecutionParams component allows users to configure key execution and risk-related parameters
 * such as order type, position size, fees, slippage, take profit, and stop loss.
 */
const ExecutionParams: React.FC<Props> = ({ params, setParams }) => {
  /**
   * Updates a single execution parameter in the state.
   * @param key - The key in the `params` object to update.
   * @param value - The new value to assign to the key.
   */
  const updateParam = (key: string, value: string | number) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6"
    >
      {/* Section title */}
      <h3 className="text-lg font-semibold text-white mb-4">Execution Parameters</h3>

      {/* Parameter form grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Order Type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
          <select
            value={params.order_type}
            onChange={(e) => updateParam('order_type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Quantity Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Position Size (%)</label>
          <input
            type="number"
            value={params.quantity_pct}
            onChange={(e) => updateParam('quantity_pct', Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
            min="1"
            max="100"
          />
        </div>

        {/* Trading Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trading Fee (bps)</label>
          <input
            type="number"
            value={params.fee_bps}
            onChange={(e) => updateParam('fee_bps', Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
            step="0.1"
          />
        </div>

        {/* Slippage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slippage (bps)</label>
          <input
            type="number"
            value={params.slippage_bps}
            onChange={(e) => updateParam('slippage_bps', Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
            step="0.1"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit (%)</label>
          <input
            type="number"
            value={params.take_profit_pct}
            onChange={(e) => updateParam('take_profit_pct', Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
            step="0.1"
          />
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss (%)</label>
          <input
            type="number"
            value={params.stop_loss_pct}
            onChange={(e) => updateParam('stop_loss_pct', Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500"
            step="0.1"
          />
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Info</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• bps = basis points (1 bps = 0.01%)</p>
          <p>• Position size is percentage of total portfolio</p>
          <p>• Take profit and stop loss are percentages from entry price</p>
        </div>
      </div>
    </motion.div>
  )
}

export default ExecutionParams
