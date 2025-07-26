"""
Module: schema.py

Defines the request schema for strategy backtesting using Pydantic models.

This includes:
- Basic conditional expressions (`Condition`)
- Complex logical expressions (`Logic`)
- Strategy logic container (`StrategyLogic`)
- Execution configuration (`ExecutionParams`)
- Full backtest request schema (`StrategyRequest`)

These schemas ensure structured and validated data exchange between the frontend and backend.
"""

from pydantic import BaseModel
from typing import List, Union, Literal, Optional

class Condition(BaseModel):
    """
    Represents a basic conditional expression used in strategy logic.
    
    For example:
        - SMA > EMA
        - RSI < 30
    
    Attributes:
        left (Union[str, float, int]): Left operand (indicator name or constant)
        op (Literal): Comparison operator, one of: "<", ">", "<=", ">=", "=", "!="
        right (Union[str, float, int]): Right operand (indicator name or constant)
    """  
    left: Union[str, float, int]
    op: Literal["<", ">", "<=", ">=", "=", "!="]
    right: Union[str, float, int]




class ExecutionParams(BaseModel):
    """
    Configuration for how trades are simulated during the backtest.

    Includes slippage, fees, order type, and risk controls.

    Attributes:
        order_type (Literal): "market" or "limit" order
        quantity_pct (float): Capital allocation per trade (percent)
        fee_bps (float): Fee in basis points (bps)
        slippage_bps (float): Slippage in basis points (bps)
        stop_loss_pct (float): Maximum allowed loss (percent)
        take_profit_pct (float): Profit target (percent)
    """
    order_type: Literal["market", "limit"] = "market"
    quantity_pct: float = 100.0
    fee_bps: float = 10.0
    slippage_bps: float = 5.0
    stop_loss_pct: float = 2.0
    take_profit_pct: float = 2.0

class Logic(BaseModel):
    """
    Represents a recursive logical structure to compose complex strategy expressions.

    Logic can include:
        - Multiple conditions joined with AND
        - Multiple conditions joined with OR
        - A single negated condition using NOT

    Attributes:
        and_ (Optional[List[Union[Condition, Logic]]]): All conditions must be true
        or_ (Optional[List[Union[Condition, Logic]]]): At least one condition must be true
        not_ (Optional[Union[Condition, Logic]]): Negation of a single condition or logic group
    """
    and_: Optional[List[Union["Condition", "Logic"]]] = None
    or_: Optional[List[Union["Condition", "Logic"]]] = None
    not_: Optional[Union["Condition", "Logic"]] = None

    class Config:
        # Field renaming to avoid conflict with Python keywords
        fields = {
            "and_": "and",
            "or_": "or",
            "not_": "not"
        }

class StrategyLogic(BaseModel):
    """
    Encapsulates the entry and exit logic of a trading strategy.

    Each logic block can be a simple Condition or a nested Logic structure.

    Attributes:
        entry (Union[Condition, Logic, dict]): Entry condition for trades
        exit (Union[Condition, Logic, dict]): Exit condition for trades
    """
    entry: Union[Condition, dict, Logic]
    exit: Union[Condition, dict, Logic]
    
class StrategyRequest(BaseModel):
    """
    Schema for submitting a backtest strategy request.

    Defines what symbols to trade, on what interval, using what logic and execution settings.

    Attributes:
        symbols (List[str]): List of symbols to backtest, e.g., ["BTCUSDT"]
        interval (str): Timeframe to run the backtest on, e.g., "1h"
        strategy (StrategyLogic): Strategy entry and exit logic
        execution (Optional[ExecutionParams]): Trade execution config (default values used if omitted)
    """
    symbols: List[str]
    interval: str
    strategy: StrategyLogic
    execution: Optional[ExecutionParams] = ExecutionParams()

# Resolve forward references for recursive models
StrategyLogic.update_forward_refs()
Logic.update_forward_refs()
