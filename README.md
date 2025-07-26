# TradeMind IQ- Trading Strategy Backtesting Platform Documentation

A comprehensive backtesting platform for trading strategies built with FastAPI backend and Next.js frontend. Test your trading strategies across multiple timeframes and symbols with advanced performance analytics.

## UI Screenshots

### Dashboard Overview
![Dashboard Overview](frontend\public\assets\snap1.png)

### Strategy Builder
![Strategy Builder](frontend\public\assets\snap3.png)

### Backtesting Results
![Backtesting Results](frontend\public\assets\snap2.png)

### Risk Metrics
![Risk Metrics](frontend\public\assets\snap4.png)


## Features

- Multi-timeframe backtesting (1d, 4h, 1h, 15m)
- Visual strategy builder with drag-and-drop interface
- Comprehensive performance metrics (Sharpe ratio, CAGR, Max Drawdown, etc.)
- Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, and more)
- Risk management with slippage and fee simulation
- Interactive dashboards with real-time visualizations
- Custom indicator support

## Setup Instructions

### Backend (FastAPI + Python)

- Indicator Engine: Computes technical indicators
- Rule Engine: Evaluates trading logic
- Execution Engine: Simulates order execution with realistic constraints
- Performance Engine: Calculates comprehensive trading metrics

**Requirements:**

- Python 3.9+
- `venv` or `pipenv`
- CSV data files (`btcusdt_1d.csv`, `btcusdt_1h.csv`, `btcusdt_4h.csv`, `btcusdt_15m.csv`) in the `data/` folder

**Installation:**

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI app
uvicorn main:app --reload
```

### Frontend (Next.js + TypeScript + MUI)

- Strategy Builder: Visual interface for creating trading strategies
- Performance Dashboard: Interactive charts and metrics
- Risk Analytics: Detailed risk assessment tools
- Real-time Updates: Smooth animations and responsive UI

**Requirements:**

- Node.js
- npm or yarn

**Installation:**

```bash
# Install frontend dependencies
npm install

# Run development server
npm run dev
```

By default, the frontend expects the FastAPI server to be running at http://localhost:8000

## API Reference

### POST /strategy/backtest

```json
Request Body:

{
  "symbols": ["BTCUSDT"],
  "interval": "1h",
  "strategy": {
    "entry": { "left": "SMA", "op": ">", "right": "EMA" },
    "exit": { "left": "SMA", "op": "<", "right": "EMA" }
  },
  "execution": {
    "slippage": 0.1,
    "fees": 0.05,
    "capital": 10000,
    "order_type": "market"
  }
}
```

```json
Response:

{
  "BTCUSDT": {
    "trades": [...],
    "metrics": {
      "totalReturnPct": -170.2,
      "sharpeRatio": 0.75,
      ...
    }
  }
}
```

## Strategy Building Guide

### Strategy Format

```json
{
  "entry": { "left": "SMA", "op": ">", "right": "EMA" },
  "exit": { "left": "SMA", "op": "<", "right": "EMA" }
}
```

### Supported Operators

<, >, >=, <=, ==, !=

### Built-in Technical Indicators

- Moving Averages: SMA, EMA, WMA
- Oscillators: RSI, Stochastic, Williams %R
- Trend Indicators: MACD, ADX, Parabolic SAR
- Volatility: Bollinger Bands, ATR
- Volume: OBV, Volume SMA

## Performance Metrics
The platform calculates comprehensive performance metrics:

- Return Metrics: Total Return, CAGR, Annualized Return
- Risk Metrics: Sharpe Ratio, Sortino Ratio, Maximum Drawdown
- Trade Analytics: Win Rate, Average Win/Loss, Profit Factor
- Statistical Measures: Standard Deviation, Skewness, Kurtosis

## Future Improvements

### Backend

- Add PostgreSQL or SQLite persistence
- Live data WebSocket feed
- Strategy optimization (grid or Bayesian search)
- Portfolio-wide strategy testing
- User uploadable strategies

### Frontend

- Drag-and-drop visual builder
- Real-time paper trading simulator
- Save/export strategies
- Export reports to PDF or CSV
- Auth & session management
