'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  indicators: Record<string, boolean>;
  setIndicators: (indicators: Record<string, boolean>) => void;
}

const IND_LIST = [
  { key: 'rsi', label: 'RSI (14)', description: 'Relative Strength Index' },
  { key: 'macd', label: 'MACD', description: 'Moving Average Convergence Divergence' },
  { key: 'sma_50', label: 'SMA 50', description: 'Simple Moving Average 50' },
  { key: 'ema_20', label: 'EMA 20', description: 'Exponential Moving Average 20' },
  { key: 'ema_50', label: 'EMA 50', description: 'Exponential Moving Average 50' },
  { key: 'bb', label: 'Bollinger Bands', description: 'Bollinger Bands (20, 2)' },
  { key: 'stoch', label: 'Stochastic', description: 'Stochastic Oscillator' },
  { key: 'adx', label: 'ADX', description: 'Average Directional Index' },
];

const IndicatorConfigurator: React.FC<Props> = ({ indicators, setIndicators }) => {
  const toggle = useCallback((key: string) => {
    setIndicators({ ...indicators, [key]: !indicators[key] });
  }, [indicators, setIndicators]);

  const clearAll = () => {
    const cleared = Object.fromEntries(IND_LIST.map(ind => [ind.key, false]));
    setIndicators(cleared);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>

      <div className="space-y-3">
        {IND_LIST.map(({ key, label, description }) => {
          const isSelected = !!indicators[key];
          return (
            <motion.label
              key={key}
              className="flex items-start cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(key)}
                className="sr-only"
                aria-label={label}
              />
              <div className={`relative w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 transition-all ${
                isSelected
                  ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-gray-600 group-hover:border-gray-500 group-hover:shadow'
              }`}>
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-black absolute top-0.5 left-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </motion.svg>
                )}
              </div>
              <div className="ml-3">
                <span className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-green-400' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {label}
                </span>
                {description && (
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                )}
              </div>
            </motion.label>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
        <span>Selected: {Object.values(indicators).filter(Boolean).length}</span>
        <button
          onClick={clearAll}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>
    </motion.div>
  );
};

export default IndicatorConfigurator;
