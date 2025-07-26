"""
Module: data_loader.py

This module provides functionality to load OHLCV (Open-High-Low-Close-Volume) 
data for a given trading symbol and interval from CSV files stored in the 
backend/data directory.

It includes caching to avoid re-reading the same files repeatedly, and ensures 
column names are standardized for further processing in the pipeline.
"""

import os
import pandas as pd

# In-memory cache for loaded DataFrames to reduce file I/O
_cache = {}

def load_ohlcv(symbol: str, interval: str) -> pd.DataFrame:
    """
    Load OHLCV data for a given symbol and interval from the local CSV file.

    Parameters:
        symbol (str): Trading symbol, e.g., "BTCUSDT"
        interval (str): Time interval, e.g., "1h", "5m", etc.

    Returns:
        pd.DataFrame: Cleaned OHLCV data with standardized column names and sorted timestamps.

    Raises:
        FileNotFoundError: If no matching CSV file is found in the backend/data directory.

    Example:
        df = load_ohlcv("BTCUSDT", "1h")
    """
    key = f"{symbol}_{interval}"
    
    # Return from cache if already loaded
    if key in _cache:
        return _cache[key]

    # Normalize to lowercase to match file naming convention
    filename_prefix = f"{symbol.lower()}_{interval.lower()}"

    # Look for matching file in data directory
    files = os.listdir("backend/data")
    matched = [f for f in files if f.startswith(filename_prefix) and f.endswith(".csv")]

    if not matched:
        raise FileNotFoundError(f"No file found for {symbol}_{interval}")

    file_path = os.path.join("backend/data", matched[0])

    # Read CSV into DataFrame
    df = pd.read_csv(file_path)

    # Rename columns to standard format expected by the pipeline
    df.rename(columns={
        "Open time": "timestamp",
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Volume": "volume"
    }, inplace=True)

    # Convert timestamp to datetime and sort
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")

    # Cache for future use
    _cache[key] = df

    return df
