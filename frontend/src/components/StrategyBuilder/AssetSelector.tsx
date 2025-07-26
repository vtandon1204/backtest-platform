// src/components/StrategyBuilder/AssetSelector.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Props interface for the AssetSelector component.
 * @property exchange - Currently selected exchange name (e.g., 'binance')
 * @property symbol - Trading symbol selected by the user (e.g., 'BTCUSDT')
 * @property interval - Timeframe interval for OHLCV data (e.g., '1d', '4h')
 * @property setExchange - Function to update the selected exchange
 * @property setSymbol - Function to update the selected trading symbol
 * @property setInterval - Function to update the selected timeframe interval
 */
interface Props {
  exchange: string
  symbol: string
  interval: string
  setExchange: (v: string) => void
  setSymbol: (v: string) => void
  setInterval: (v: string) => void
}

/**
 * AssetSelector component allows users to choose the exchange, trading pair,
 * and time interval to backtest the strategy on. 
 * Used as the top section in the Strategy Builder UI.
 */
const AssetSelector: React.FC<Props> = ({
  exchange, symbol, interval, setExchange, setSymbol, setInterval,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-gray-900 rounded-lg border border-gray-800 p-6"
  >
    {/* Section title */}
    <h3 className="text-lg font-semibold text-white mb-4">Asset & Timeframe</h3>

    <div className="space-y-4">
      {/* Exchange Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
        <select
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="binance">Binance</option>
          <option value="coinbase">Coinbase</option>
          <option value="kraken">Kraken</option>
          <option value="bybit">Bybit</option>
        </select>
      </div>

      {/* Symbol Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="BTCUSDT">BTC / USDT</option>
          <option value="ETHUSDT">ETH / USDT</option>
          <option value="ADAUSDT">ADA / USDT</option>
          <option value="SOLUSDT">SOL / USDT</option>
          <option value="DOTUSDT">DOT / USDT</option>
          <option value="LINKUSDT">LINK / USDT</option>
        </select>
      </div>

      {/* Time Interval Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Interval</label>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="30m">30m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
        </select>
      </div>
    </div>
  </motion.div>
)

export default AssetSelector
