// File: src/app/strategy-builder/page.tsx

'use client' // Enables client-side interactivity in Next.js app directory

import React, { useState } from 'react'
import { motion } from 'framer-motion' // For animations
import axios from 'axios'

// Icons
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline'

// Type definitions
import { Trade, Condition, BacktestResponse } from '@/types/types'

// Component Imports
import AssetSelector from '@/components/StrategyBuilder/AssetSelector'
import IndicatorConfigurator from '@/components/StrategyBuilder/IndicatorConfigurator'
import LogicBuilder from '@/components/StrategyBuilder/LogicBuilder'
import ExecutionParams from '@/components/StrategyBuilder/ExecutionParams'
import RiskControls from '@/components/StrategyBuilder/RiskControls'
import PerformanceDashboard from '@/components/PerformanceDashboard/PerformanceDashboard'

const StrategyBuilderPage: React.FC = () => {
  // === State Management ===
  const [exchange, setExchange] = useState('binance')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1d')

  const [indicators, setIndicators] = useState<Record<string, boolean>>({
    rsi: true,
    macd: false,
    sma_50: false,
    ema_20: true,
    ema_50: false,
    bb: false,
    stoch: false,
    adx: false,
  })

  const [entryLogic, setEntryLogic] = useState<Condition[]>([])
  const [exitLogic, setExitLogic] = useState<Condition[]>([])

  const [params, setParams] = useState({
    order_type: 'market',
    quantity_pct: 100,
    fee_bps: 10,
    slippage_bps: 5,
    take_profit_pct: 2,
    stop_loss_pct: 1,
  })

  const [risk, setRisk] = useState(1)

  const [trades, setTrades] = useState<Trade[]>([])
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [isRunning, setIsRunning] = useState(false)

  // === Run Backtest Handler ===
  const runBacktest = async () => {
    setIsRunning(true)
    try {
      const payload = {
        symbols: [symbol],
        interval,
        strategy: {
          entry: { and: entryLogic },
          exit: { and: exitLogic },
        },
        execution: params,
      }

      // Send payload to FastAPI backend
      const res = await axios.post<BacktestResponse>(
        'http://localhost:8000/strategy/backtest',
        payload
      )

      const result = res.data[symbol]
      if (result) {
        if (result.trades) setTrades(result.trades)
        if (result.metrics) setMetrics(result.metrics)
      }
    } catch (e) {
      console.error('Backtest failed:', e)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ======= Header Section ======= */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Strategy Builder</h1>
              <p className="text-gray-400">
                Design and test your algorithmic trading strategies
              </p>
            </div>

            {/* Run Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runBacktest}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <StopIcon className="w-5 h-5" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Run Backtest</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ======= Strategy Builder Body ======= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* === Config UI === */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Asset + Indicators + Risk */}
          <div className="space-y-6">
            <AssetSelector
              exchange={exchange}
              symbol={symbol}
              interval={interval}
              setExchange={setExchange}
              setSymbol={setSymbol}
              setInterval={setInterval}
            />
            <IndicatorConfigurator
              indicators={indicators}
              setIndicators={setIndicators}
            />
            <RiskControls risk={risk} setRisk={setRisk} />
          </div>

          {/* Right Column: Logic + Execution */}
          <div className="space-y-6">
            <LogicBuilder
              entryLogic={entryLogic}
              exitLogic={exitLogic}
              setEntryLogic={setEntryLogic}
              setExitLogic={setExitLogic}
            />
            <ExecutionParams params={params} setParams={setParams} />
          </div>
        </div>

        {/* === Results View === */}
        {trades.length > 0 && Object.keys(metrics).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Backtest Results</h2>
              </div>
              <div className="p-6">
                <PerformanceDashboard metrics={metrics} trades={trades} />
              </div>
            </div>
          </motion.div>
        )}

        {/* === Empty State Fallback === */}
        {trades.length === 0 && !isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to Test Your Strategy
              </h3>
              <p className="text-gray-400 mb-6">
                Configure your strategy parameters and click "Run Backtest" to see the results
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default StrategyBuilderPage
