"""
Module: strategy_engine.py

Utility functions for multi-asset strategy loading and backtesting.
Wraps individual services like data loading, indicator generation,
and rule-based signal creation into higher-level workflows.

Functions:
- load_selected_data(): Load OHLCV data for specified exchanges, symbols, and intervals.
- backtest_strategy(): Apply indicators and signal logic to a single DataFrame.
"""

import os
from backend.services.data_loader import load_ohlcv
from backend.services.indicator_engine import add_indicators
from backend.services.rule_engine import generate_signals

def load_selected_data(exchanges, symbols, intervals):
    """
    Loads OHLCV data for a combination of exchanges, symbols, and intervals.

    Looks for CSV files in 'backend/data/' using the naming pattern:
        {exchange}_{symbol}_{interval}.csv

    Args:
        exchanges (list[str]): List of exchange names (e.g., ["binance", "coinbase"])
        symbols (list[str]): List of trading pairs (e.g., ["BTCUSDT", "ETHUSDT"])
        intervals (list[str]): List of intervals (e.g., ["1d", "4h"])

    Returns:
        dict[str, pd.DataFrame]: Dictionary mapping keys like 'binance_BTCUSDT_1d' to OHLCV DataFrames.
                                 Missing files are skipped with warnings.
    """
    data_map = {}
    files = os.listdir("backend/data")

    for exchange in exchanges:
        for symbol in symbols:
            for interval in intervals:
                filename = f"{exchange}_{symbol}_{interval}.csv"
                if filename in files:
                    key = f"{exchange}_{symbol}_{interval}"
                    data_map[key] = load_ohlcv(exchange, symbol, interval)
                else:
                    print(f"[WARN] File not found: {filename}")
    return data_map

def backtest_strategy(df, entry_rule, exit_rule):
    """
    Applies indicators and logic rules to a DataFrame to simulate signals.

    Args:
        df (pd.DataFrame): OHLCV data with 'close' column.
        entry_rule (dict): Entry logic as per schema format.
        exit_rule (dict): Exit logic as per schema format.

    Returns:
        pd.DataFrame: DataFrame with added 'entry_signal' and 'exit_signal' columns.
    """
    df = add_indicators(df)
    df = generate_signals(df, entry_rule, exit_rule)
    return df
