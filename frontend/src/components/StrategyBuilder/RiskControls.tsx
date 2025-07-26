'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  risk: number;
  setRisk: (risk: number) => void;
}

/**
 * RiskControls component lets users define their strategy's risk appetite using
 * a slider with real-time feedback on labels, visuals, and computed values.
 */
const RiskControls: React.FC<Props> = ({ risk, setRisk }) => {
  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = (level: number) => {
    if (level <= 3) return 'Conservative';
    if (level <= 7) return 'Moderate';
    return 'Aggressive';
  };

  const maxPosition = risk <= 3 ? Math.round(risk * 2)
                     : risk <= 7 ? Math.round(risk * 3)
                     : Math.round(risk * 5);

  const maxConcurrent = risk <= 3 ? 1 : risk <= 7 ? 3 : 5;
  const maxDrawdown = risk <= 3 ? '5%' : risk <= 7 ? '10%' : '20%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Risk Management</h3>

      {/* Risk Slider */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Risk Level</label>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${getRiskColor(risk)}`}>
                {getRiskLabel(risk)}
              </span>
              <span className="text-gray-400 text-sm">({risk}/10)</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>

        {/* Risk Metrics Display */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-green-400 text-lg font-bold">{maxPosition}%</div>
            <div className="text-xs text-gray-400">Max Position</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-yellow-400 text-lg font-bold">{maxConcurrent}</div>
            <div className="text-xs text-gray-400">Max Concurrent</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-red-400 text-lg font-bold">{maxDrawdown}</div>
            <div className="text-xs text-gray-400">Max Drawdown</div>
          </div>
        </div>

        {/* High-Risk Warning */}
        {risk > 7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-700 rounded-lg"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-300">High Risk Warning</h4>
              <p className="text-xs text-red-400 mt-1">
                Aggressive risk settings may result in significant losses. Ensure you understand the risks involved.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Range Thumb Styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default RiskControls;
