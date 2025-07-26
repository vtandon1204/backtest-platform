"""
Module: strategy.py

FastAPI router for endpoints related to strategy definition, signal generation, and full backtesting.

Endpoints provided:
- POST /strategy/load-data: Preview OHLCV input data before strategy logic is applied
- POST /strategy/run: Apply indicators and logic to generate signals
- POST /strategy/backtest: Run full backtest pipeline including trade simulation and performance metrics

Depends on:
- schema.StrategyRequest for input validation
- services.* modules for data processing, signal generation, and evaluation
"""

import numpy as np
from fastapi import APIRouter
from backend.models.schema import StrategyRequest
from backend.services.data_loader import load_ohlcv
from backend.services.indicator_engine import add_indicators
from backend.services.rule_engine import generate_signals
from backend.services.execution_engine import simulate_trades
from backend.services.performance_engine import calculate_metrics

# Create FastAPI router for strategy-related routes
router = APIRouter()

@router.post("/strategy/load-data")
def get_strategy_data(req: StrategyRequest):
    """
    Endpoint: POST /strategy/load-data

    Load and return raw OHLCV data (as JSON) for each symbol and interval specified
    in the strategy request. Intended for previewing the input data before applying
    any indicators or strategy logic.

    Args:
        req (StrategyRequest): Request object containing symbols and interval.

    Returns:
        dict: A mapping from symbol to its raw OHLCV records or error messages.
    """
    result = {}
    for symbol in req.symbols:
        try:
            df = load_ohlcv(symbol, req.interval)
            result[symbol] = df.to_dict(orient="records")
        except FileNotFoundError:
            result[symbol] = {"error": f"File not found for {symbol}_{req.interval}"}
        except Exception as e:
            result[symbol] = {"error": str(e)}
    return result

@router.post("/strategy/run")
def run_strategy(req: StrategyRequest):
    """
    Endpoint: POST /strategy/run

    Runs the indicator calculation and signal generation logic without trade simulation.
    Useful for debugging or visualizing strategy signals before a full backtest.

    Args:
        req (StrategyRequest): Request object with symbols, interval, and logic.

    Returns:
        dict: A mapping from symbol to its signal preview or error message.
    """
    result = {}
    for symbol in req.symbols:
        try:
            df = load_ohlcv(symbol, req.interval)
            df = add_indicators(df)  # Calculate technical indicators
            df = df.dropna()         # Drop rows with missing indicator values
            df = generate_signals(df, req.strategy.entry, req.strategy.exit)  # Apply entry/exit logic
            df = df.replace([np.inf, -np.inf], np.nan).fillna(0)  # Replace invalid values

            result[symbol] = df[["timestamp", "entry_signal", "exit_signal"]].to_dict(orient="records")
        except Exception as e:
            result[symbol] = {"error": str(e)}
    return result

@router.post("/strategy/backtest")
def run_backtest(req: StrategyRequest):
    """
    Endpoint: POST /strategy/backtest

    Executes the full backtesting pipeline for each symbol:
        - Load OHLCV data
        - Add indicators
        - Apply strategy logic to generate signals
        - Simulate trades based on signals and execution params
        - Calculate performance metrics

    Args:
        req (StrategyRequest): Request object with strategy config, symbols, interval, logic, and execution params.

    Returns:
        dict: A mapping from symbol to:
            - preview: Entry/exit signals
            - trades: Executed trades list
            - metrics: Performance summary (e.g., Sharpe ratio, total return, win rate)
    """
    final_result = {}
    for symbol in req.symbols:
        try:
            df = load_ohlcv(symbol, req.interval)
            df = add_indicators(df)
            df = generate_signals(df, req.strategy.entry, req.strategy.exit)
            df = df.replace([np.inf, -np.inf], np.nan).fillna(0)

            # Simulate trades
            trades = simulate_trades(df, req.execution)

            # Compute performance
            metrics = calculate_metrics(df, trades)

            final_result[symbol] = {
                "preview": df[["timestamp", "entry_signal", "exit_signal"]].to_dict(orient="records"),
                "trades": trades,
                "metrics": metrics,
            }
        except Exception as e:
            final_result[symbol] = {"error": str(e)}
    return final_result
