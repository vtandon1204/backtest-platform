// === Trade Interface ===
// Represents a single executed trade in a backtest
export interface Trade {
  id: string;                         // Unique identifier for the trade
  symbol: string;                    // Asset symbol (e.g., "BTCUSDT")
  pnl_pct: number;                   // Profit or loss percentage of the trade
  side: 'buy' | 'sell';              // Trade direction
  quantity: number;                 // Quantity of asset traded
  price: number;                    // Entry or average price
  timestamp?: string;               // Optional timestamp (ISO format)
  market?: string;                  // Optional market/exchange name
  entry_index?: number;            // Index of entry in price array
  exit_index?: number;             // Index of exit in price array
  duration?: number;               // Duration (in time units, e.g., minutes, bars)
  entry_time?: string;             // ISO timestamp of entry
  exit_time?: string;              // ISO timestamp of exit
  fee?: number;                    // Trading fee in asset units
}

// === MarketComparison Interface ===
// Used for comparing performance across markets
export interface MarketComparison {
  market: string;                   // Market or exchange name (e.g., "Binance")
  avg_return: number;              // Average return in %
  sharpe_ratio: number;            // Sharpe ratio for risk-adjusted performance
}

// === Condition Interface ===
// Represents a logical condition for strategy logic builder
export interface Condition {
  left: string;                    // Left-hand expression (e.g., "rsi_14")
  op: string;                      // Operator (e.g., ">", "<=", "crosses")
  right: string;                   // Right-hand value/expression (e.g., "30", "sma_50")
}

// === BacktestResponse Interface ===
// Server response after running a strategy backtest
export interface BacktestResponse {
  [symbol: string]: {
    trades?: Trade[];             // Array of executed trades
    metrics?: Record<string, number>; // Dictionary of performance metrics (e.g., sharpe, winrate)
  };
}
