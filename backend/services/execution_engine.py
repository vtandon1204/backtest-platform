"""
Module: execution_engine.py

Simulates the execution of trades based on entry and exit signals, accounting for
slippage, fees, stop-loss, and take-profit constraints.

Core function:
- simulate_trades(df, exec_params): Generates trade records using configured execution parameters.

Used in:
- POST /strategy/backtest endpoint
"""

import pandas as pd
from backend.models.schema import ExecutionParams

def simulate_trades(df: pd.DataFrame, exec_params: ExecutionParams):
    """
    Simulate trades based on entry/exit signals and execution parameters.

    Trades are entered when `entry_signal` is True and exited either on:
        - exit signal (`exit_signal`)
        - hitting take profit (TP)
        - hitting stop loss (SL)

    Slippage and trading fees are applied to both entry and exit prices.

    Args:
        df (pd.DataFrame): DataFrame containing timestamped OHLCV data and entry/exit signals.
        exec_params (ExecutionParams): Parameters controlling order type, slippage, fees, TP/SL, etc.

    Returns:
        List[dict]: A list of executed trades with:
            - entry_time, entry_price
            - exit_time, exit_price
            - pnl_pct (net % return)
            - reason (tp/sl/exit_signal)
    """
    trades = []
    in_trade = False
    entry_price = None
    entry_time = None
    stop_price = None
    target_price = None

    for i, row in df.iterrows():
        if pd.isna(row["close"]) or pd.isna(row["timestamp"]):
            continue  # Skip rows with missing critical data

        price = row["close"]

        def apply_slippage(p: float, side: str) -> float:
            """
            Apply slippage to price based on trade side.

            Args:
                p (float): Raw price
                side (str): 'buy' or 'sell'

            Returns:
                float: Adjusted price after slippage
            """
            slip = (exec_params.slippage_bps / 10000) * p
            return p + slip if side == "buy" else p - slip

        # ---- Entry Logic ----
        if not in_trade and row.get("entry_signal", False):
            in_trade = True
            entry_price = apply_slippage(price, "buy")
            entry_time = row["timestamp"]

            stop_price = (
                entry_price * (1 - exec_params.stop_loss_pct / 100)
                if exec_params.stop_loss_pct else None
            )
            target_price = (
                entry_price * (1 + exec_params.take_profit_pct / 100)
                if exec_params.take_profit_pct else None
            )
            continue

        # ---- Exit Logic ----
        if in_trade:
            exit_signal = row.get("exit_signal", False)
            hit_tp = target_price is not None and price >= target_price
            hit_sl = stop_price is not None and price <= stop_price

            if exit_signal or hit_tp or hit_sl:
                exit_price = apply_slippage(price, "sell")
                exit_time = row["timestamp"]

                # Account for round-trip fees
                fee_pct = exec_params.fee_bps / 10000
                net_entry = entry_price * (1 + fee_pct)
                net_exit = exit_price * (1 - fee_pct)

                pnl_pct = ((net_exit - net_entry) / net_entry) * 100

                trades.append({
                    "entry_time": entry_time,
                    "entry_price": round(entry_price, 2),
                    "exit_time": exit_time,
                    "exit_price": round(exit_price, 2),
                    "pnl_pct": round(pnl_pct, 2),
                    "reason": "tp" if hit_tp else "sl" if hit_sl else "exit_signal"
                })

                # Reset trade state
                in_trade = False
                entry_price = None
                entry_time = None
                stop_price = None
                target_price = None

    return trades
