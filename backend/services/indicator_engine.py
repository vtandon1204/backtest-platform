"""
Module: indicator_engine.py

Provides functions to compute technical indicators used in strategy logic and signal generation.

Uses the `ta` (Technical Analysis) Python package to calculate:
- Exponential Moving Averages (EMA)
- Relative Strength Index (RSI)
- MACD and MACD Signal Line

This module is intended to be applied to OHLCV data prior to rule-based logic evaluation.
"""

import pandas as pd
import ta  # type: ignore
from ta.trend import EMAIndicator, MACD  # type: ignore
from ta.momentum import RSIIndicator     # type: ignore

def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add commonly used technical indicators to the DataFrame.

    Indicators included:
        - EMA 20 (Trend)
        - EMA 50 (Trend)
        - RSI 14 (Momentum)
        - MACD and MACD Signal Line (Trend/Momentum crossover)

    Args:
        df (pd.DataFrame): Input DataFrame with at least a 'close' column.

    Returns:
        pd.DataFrame: A new DataFrame with additional indicator columns:
            - 'ema_20', 'ema_50'
            - 'rsi_14'
            - 'macd', 'macd_signal'

    Note:
        Some rows may contain NaNs due to indicator window lookbacks. Consider
        using `df.dropna()` downstream to clean data before use.
    """
    df = df.copy()  # Avoid mutating original input

    # --- Trend Indicators ---
    df['ema_20'] = EMAIndicator(close=df['close'], window=20).ema_indicator()
    df['ema_50'] = EMAIndicator(close=df['close'], window=50).ema_indicator()

    # --- Momentum Indicator ---
    df['rsi_14'] = RSIIndicator(close=df['close'], window=14).rsi()

    # --- MACD (Trend/Momentum Crossover) ---
    macd = MACD(close=df['close'])
    df['macd'] = macd.macd()
    df['macd_signal'] = macd.macd_signal()

    # Optional: Drop NaNs caused by indicator lookback periods
    # df.dropna(inplace=True)

    return df
