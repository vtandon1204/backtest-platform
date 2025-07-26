'use client';

import React, { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import axios from 'axios';

import AssetSelector from './AssetSelector';
import IndicatorConfigurator from './IndicatorConfigurator';
import LogicBuilder from './LogicBuilder';
import ExecutionParams from './ExecutionParams';
import RiskControls from './RiskControls';
import PerformanceDashboard from '../PerformanceDashboard/PerformanceDashboard';

import { Trade } from '@/types/types';

interface Condition {
  left: string;
  op: string;
  right: string;
}

interface BacktestResponse {
  [symbol: string]: {
    trades?: Trade[];
    metrics?: Record<string, number>;
  };
}

/**
 * StrategyCanvas is the main layout component for building, configuring,
 * and backtesting an algorithmic trading strategy.
 */
const StrategyCanvas: React.FC = () => {
  // State: asset and exchange details
  const [exchange, setExchange] = useState('binance');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');

  // State: technical indicators and logic rules
  const [indicators, setIndicators] = useState<Record<string, boolean>>({
    rsi: true,
    macd: false,
    sma_50: false,
    ema_20: true,
    ema_50: false,
  });
  const [entryLogic, setEntryLogic] = useState<Condition[]>([]);
  const [exitLogic, setExitLogic] = useState<Condition[]>([]);

  // State: execution and risk parameters
  const [params, setParams] = useState({
    order_type: 'market',
    quantity_pct: 100,
    fee_bps: 10,
    slippage_bps: 5,
    take_profit_pct: 2,
    stop_loss_pct: 1,
  });
  const [risk, setRisk] = useState(1);

  // State: backtest results
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  /**
   * Runs the backtest by sending the strategy payload to the backend API.
   */
  const runBacktest = async () => {
    try {
      const payload = {
        symbols: [symbol],
        interval,
        strategy: {
          entry: { and: entryLogic },
          exit: { and: exitLogic },
        },
        execution: params,
      };

      const response = await axios.post<BacktestResponse>(
        'http://localhost:8000/strategy/backtest',
        payload
      );

      const result = response.data[symbol];
      if (result) {
        if (result.trades) setTrades(result.trades);
        if (result.metrics) setMetrics(result.metrics);
      }
    } catch (error) {
      console.error('Backtest error:', error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Strategy Builder
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Strategy Configuration */}
      <AssetSelector
        exchange={exchange}
        symbol={symbol}
        interval={interval}
        setExchange={setExchange}
        setSymbol={setSymbol}
        setInterval={setInterval}
      />
      <IndicatorConfigurator indicators={indicators} setIndicators={setIndicators} />
      <LogicBuilder
        entryLogic={entryLogic}
        exitLogic={exitLogic}
        setEntryLogic={setEntryLogic}
        setExitLogic={setExitLogic}
      />
      <ExecutionParams params={params} setParams={setParams} />
      <RiskControls risk={risk} setRisk={setRisk} />

      {/* Backtest Trigger */}
      <Box textAlign="center" mt={2}>
        <Button variant="contained" size="large" onClick={runBacktest}>
          Run Backtest
        </Button>
      </Box>

      {/* Results Display */}
      {trades.length > 0 && Object.keys(metrics).length > 0 && (
        <Box mt={4}>
          <PerformanceDashboard metrics={metrics} trades={trades} />
        </Box>
      )}
    </Box>
  );
};

export default StrategyCanvas;
