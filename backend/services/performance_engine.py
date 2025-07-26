"""
Module: performance_engine.py

Computes performance evaluation metrics and equity curves for trading strategy backtests.

Functions:
- generate_equity_curve(): Converts trades into a portfolio equity time series.
- calculate_metrics(): Aggregates detailed return, risk, and trade statistics.
- safe_float(): Utility to safely round and sanitize numerical results.
"""

import math
import pandas as pd
import numpy as np
from datetime import datetime

def generate_equity_curve(trades: list, start_value: float = 10000) -> pd.DataFrame:
    """
    Generates a time series of portfolio value based on the sequence of closed trades.

    Args:
        trades (list): List of trade dicts, each with 'exit_time' and 'pnl' keys.
        start_value (float): Starting capital for the portfolio.

    Returns:
        pd.DataFrame: DataFrame with:
            - timestamp: Exit time of each trade
            - portfolio_value: Updated capital after each trade
    """
    if not trades:
        return pd.DataFrame(columns=["timestamp", "portfolio_value"])

    df = pd.DataFrame(trades).sort_values("exit_time").reset_index(drop=True)

    equity = start_value
    equity_curve = []

    for trade in df.itertuples():
        equity += trade.pnl  # Add profit/loss to capital
        equity_curve.append((trade.exit_time, equity))

    return pd.DataFrame(equity_curve, columns=["timestamp", "portfolio_value"]).assign(
        timestamp=lambda x: pd.to_datetime(x["timestamp"])
    )

def safe_float(v):
    """
    Safely round a value to 2 decimal places, or return 0.0 if invalid.

    Args:
        v (float | int | None): Input value.

    Returns:
        float: Cleaned and rounded value.
    """
    return round(v, 2) if isinstance(v, (int, float)) and math.isfinite(v) else 0.0

def calculate_metrics(df: pd.DataFrame, trades: list) -> dict:
    """
    Compute key performance metrics from raw OHLCV data and executed trades.

    Args:
        df (pd.DataFrame): Full OHLCV data for the backtest (used for volatility, drawdown, etc.)
        trades (list): List of executed trades, with 'entry_time', 'exit_time', 'pnl_pct', etc.

    Returns:
        dict: Performance summary with:
            - totalReturnPct / totalReturnUsd
            - cagr
            - sharpeRatio / sortinoRatio / calmarRatio
            - maxDrawdownPct / maxDrawdownUsd
            - volatilityPct
            - var95 (95% Value at Risk)
            - winRate
            - totalTrades
            - avgTradeDuration
            - largestWin / largestLoss
            - turnover (capital cycled through)
    """
    if not trades:
        return {}

    trades_df = pd.DataFrame(trades)
    trades_df["entry_time"] = pd.to_datetime(trades_df["entry_time"])
    trades_df["exit_time"] = pd.to_datetime(trades_df["exit_time"])
    trades_df["duration_hrs"] = (trades_df["exit_time"] - trades_df["entry_time"]).dt.total_seconds() / 3600

    # --- Basic Return Metrics ---
    total_return_pct = trades_df["pnl_pct"].sum()
    total_return_usd = 1000 * (total_return_pct / 100)

    start = trades_df["entry_time"].min()
    end = trades_df["exit_time"].max()
    duration_years = max((end - start).days / 365.0, 1e-6)

    final_value = 1000 * (1 + total_return_pct / 100)
    cagr = ((final_value / 1000) ** (1 / duration_years) - 1) * 100

    # --- Volatility (Annualized Std Dev) ---
    daily_returns = df["close"].pct_change().dropna()
    volatility_pct = daily_returns.std() * np.sqrt(365) * 100

    # --- Max Drawdown ---
    df["cum_returns"] = df["close"] / df["close"].iloc[0]
    df["rolling_max"] = df["cum_returns"].cummax()
    df["drawdown"] = df["cum_returns"] / df["rolling_max"] - 1
    max_drawdown_pct = df["drawdown"].min() * 100
    max_drawdown_usd = 1000 * abs(df["drawdown"].min())

    # --- Risk Ratios ---
    avg_daily_return = daily_returns.mean()
    downside_std = daily_returns[daily_returns < 0].std()
    sharpe = (avg_daily_return / daily_returns.std()) * np.sqrt(365)
    sortino = (avg_daily_return / downside_std) * np.sqrt(365)
    calmar = total_return_pct / abs(max_drawdown_pct) if max_drawdown_pct != 0 else 0

    # --- Trade Statistics ---
    total_trades = len(trades_df)
    win_rate = (trades_df["pnl_pct"] > 0).mean() * 100
    avg_trade_duration = trades_df["duration_hrs"].mean()
    largest_win = trades_df["pnl_pct"].max()
    largest_loss = trades_df["pnl_pct"].min()
    turnover = trades_df["entry_price"].sum() / 1000 * 100  # normalized to initial capital

    # --- Value at Risk (VaR) @ 95% ---
    var_95 = np.percentile(daily_returns, 5) * 100 * 1000

    return {
        "totalReturnPct": safe_float(total_return_pct),
        "totalReturnUsd": safe_float(total_return_usd),
        "cagr": safe_float(cagr),
        "sharpeRatio": safe_float(sharpe),
        "sortinoRatio": safe_float(sortino),
        "calmarRatio": safe_float(calmar),
        "maxDrawdownPct": safe_float(max_drawdown_pct),
        "maxDrawdownUsd": safe_float(max_drawdown_usd),
        "volatilityPct": safe_float(volatility_pct),
        "var95": safe_float(var_95),
        "winRate": safe_float(win_rate),
        "totalTrades": total_trades,
        "avgTradeDuration": safe_float(avg_trade_duration),
        "largestWin": safe_float(largest_win),
        "largestLoss": safe_float(largest_loss),
        "turnover": safe_float(turnover),
    }
