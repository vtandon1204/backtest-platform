"""
Module: data.py

FastAPI router for exposing endpoints related to OHLCV dataset access.

Includes:
- GET /ohlcv: Fetch OHLCV data for a given symbol and interval
- GET /datasets: List all available datasets in the backend/data directory

Uses:
- CSV files stored in backend/data
- Standardizes OHLCV fields for downstream use
"""

from fastapi import APIRouter
from backend.services.data_loader import load_ohlcv
import os
import pandas as pd

# Create a router instance to group dataset-related endpoints
router = APIRouter()

# Path to CSV file directory
DATA_DIR = "backend/data"

def parse_filename(file_name: str):
    """
    Parses filenames like: 'btc_1d_data_2018_to_2025.csv'

    Extracts:
        - Symbol (e.g., 'btc')
        - Interval (e.g., '1d')

    Args:
        file_name (str): The name of the CSV file.

    Returns:
        tuple: (symbol, interval) if parsed successfully, otherwise (None, None)
    """
    parts = file_name.split("_")
    if len(parts) >= 3:
        symbol = parts[0]
        interval = parts[1]
        return symbol, interval
    return None, None

@router.get("/ohlcv")
def get_ohlcv(symbol: str, interval: str):
    """
    API Endpoint: GET /ohlcv

    Retrieves OHLCV (Open-High-Low-Close-Volume) data for the specified symbol and interval.

    Args:
        symbol (str): Trading symbol (e.g., 'btc', 'eth')
        interval (str): Time interval (e.g., '1d', '4h')

    Returns:
        List[dict]: OHLCV data as a list of timestamped records.
        On failure, returns {"error": "File not found."}
    """
    file_name = f"{symbol}_{interval}_data_2018_to_2025.csv"
    path = os.path.join(DATA_DIR, file_name)

    # If the file is missing, return an error
    if not os.path.exists(path):
        return {"error": "File not found."}

    # Read the CSV and rename fields for consistency
    df = pd.read_csv(path)
    df["Open time"] = pd.to_datetime(df["Open time"])
    df = df.rename(columns={
        "Open time": "timestamp",
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Volume": "volume"
    })

    # Return data in JSON-compatible list of dicts
    return df.to_dict(orient="records")

@router.get("/datasets")
def list_datasets():
    """
    API Endpoint: GET /datasets

    Lists all available OHLCV datasets by parsing filenames in the backend/data directory.

    Returns:
        List[dict]: List of datasets with extracted 'symbol' and 'interval' keys.
    """
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]

    # Extract and return dataset metadata from filenames
    return [
        {"symbol": symbol, "interval": interval}
        for f in files
        if (symbol := parse_filename(f)[0]) and (interval := parse_filename(f)[1])
    ]
