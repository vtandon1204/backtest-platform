"""
Module: rule_engine.py

Evaluates rule-based trading logic on indicator-enhanced OHLCV data
to generate entry and exit signals.

Supports:
- Simple binary conditions (e.g., EMA > SMA)
- Logical combinations (AND, OR, NOT) via recursion
- Timestamp comparisons
- Fallback test signal injection (for debugging/demo)

Core functions:
- eval_condition(): Single rule evaluation
- eval_logic(): Recursive logic evaluation
- generate_signals(): Apply logic rules to DataFrame rows
"""

import pandas as pd
from typing import Union

def eval_condition(row: pd.Series, cond: dict) -> bool:
    """
    Evaluate a single binary condition on a DataFrame row.

    Args:
        row (pd.Series): Row of data (one timestamp's indicators/prices).
        cond (dict): A condition dict with keys:
            - left (str | float | int): LHS variable or constant
            - right (str | float | int): RHS variable or constant
            - op (str): One of ">", "<", "=", ">=", "<=", "!="

    Returns:
        bool: True if condition is satisfied, False otherwise
    """
    try:
        left = cond.get("left")
        right = cond.get("right")
        op = cond.get("op")

        # Extract left-side value from row (assumed to be a column name)
        left_val = row.get(left)

        # Handle timestamp comparison
        if "timestamp" in left.lower():
            left_val = pd.to_datetime(left_val)
            right = pd.to_datetime(right)

        if pd.isna(left_val) or pd.isna(right):
            return False

        return {
            ">": left_val > right,
            "<": left_val < right,
            "=": left_val == right,
            ">=": left_val >= right,
            "<=": left_val <= right,
            "!=": left_val != right,
        }.get(op, False)

    except Exception as e:
        print(f"[eval_condition ERROR] {e} | Condition: {cond}")
        return False

def eval_logic(row: pd.Series, rule: Union[dict, list]) -> bool:
    """
    Recursively evaluate a logical expression or tree on a row.

    Supports:
        - AND: all sub-rules must be True
        - OR: at least one sub-rule is True
        - NOT: inverse of the rule
        - Base case: simple condition dict

    Args:
        row (pd.Series): Single row from a DataFrame.
        rule (dict | list): A nested rule structure (see schema.py).

    Returns:
        bool: Result of evaluating the rule
    """
    try:
        if isinstance(rule, dict):
            if "and" in rule:
                return all(eval_logic(row, sub_rule) for sub_rule in rule["and"])
            elif "or" in rule:
                return any(eval_logic(row, sub_rule) for sub_rule in rule["or"])
            elif "not" in rule:
                return not eval_logic(row, rule["not"])
            else:
                return eval_condition(row, rule)
        return False
    except Exception as e:
        print(f"[eval_logic ERROR] {e} | Rule: {rule}")
        return False

def generate_signals(
    df: pd.DataFrame,
    entry_rule: dict,
    exit_rule: dict,
    inject_test: bool = True
) -> pd.DataFrame:
    """
    Generate entry and exit signal columns using logic rules.

    Applies user-defined strategy logic to each row in the DataFrame.
    Optionally injects fallback signals if no triggers occur (useful for testing).

    Args:
        df (pd.DataFrame): OHLCV + indicator DataFrame.
        entry_rule (dict): Rule defining when to enter trades.
        exit_rule (dict): Rule defining when to exit trades.
        inject_test (bool): If True and no entry/exit is found,
                            injects fake signals at row 10 and 20.

    Returns:
        pd.DataFrame: Original DataFrame with added:
            - entry_signal (bool)
            - exit_signal (bool)
    """
    df = df.copy()

    df["entry_signal"] = df.apply(lambda row: eval_logic(row, entry_rule), axis=1)
    df["exit_signal"] = df.apply(lambda row: eval_logic(row, exit_rule), axis=1)

    # Fallback signals for debugging/demo purposes
    if inject_test and not df["entry_signal"].any() and len(df) > 20:
        df.loc[10, "entry_signal"] = True
        df.loc[20, "exit_signal"] = True
        print("[DEBUG] Injected fallback entry/exit signals for test")

    print("Signal Preview (last 10 rows):")
    print(df[["timestamp", "entry_signal", "exit_signal"]].tail(10))

    return df
