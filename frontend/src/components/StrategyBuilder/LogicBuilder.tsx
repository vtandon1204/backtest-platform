'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Condition } from '@/types/types';

interface Props {
  entryLogic: Condition[];
  exitLogic: Condition[];
  setEntryLogic: (logic: Condition[]) => void;
  setExitLogic: (logic: Condition[]) => void;
}

const OPERATORS = [
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '>=', label: 'Greater or equal (>=)' },
  { value: '<=', label: 'Less or equal (<=)' },
  { value: '==', label: 'Equal to (==)' },
  { value: 'cross_above', label: 'Cross above' },
  { value: 'cross_below', label: 'Cross below' },
];

const INDICATORS = [
  'rsi', 'macd_line', 'macd_signal', 'sma_50', 'ema_20', 'ema_50',
  'bb_upper', 'bb_lower', 'bb_middle', 'stoch_k', 'stoch_d', 'adx',
  'price', 'volume'
];

const LogicBuilder: React.FC<Props> = ({
  entryLogic, exitLogic, setEntryLogic, setExitLogic
}) => {
  // Add new default condition
  const addCondition = (type: 'entry' | 'exit') => {
    const newCondition: Condition = { left: 'rsi', op: '>', right: '70' };
    const setLogic = type === 'entry' ? setEntryLogic : setExitLogic;
    const currentLogic = type === 'entry' ? entryLogic : exitLogic;
    setLogic([...currentLogic, newCondition]);
  };

  // Remove condition by index
  const removeCondition = (type: 'entry' | 'exit', index: number) => {
    const setLogic = type === 'entry' ? setEntryLogic : setExitLogic;
    const currentLogic = type === 'entry' ? entryLogic : exitLogic;
    setLogic(currentLogic.filter((_, i) => i !== index));
  };

  // Update field in condition
  const updateCondition = (type: 'entry' | 'exit', index: number, field: keyof Condition, value: string) => {
    const setLogic = type === 'entry' ? setEntryLogic : setExitLogic;
    const logic = [...(type === 'entry' ? entryLogic : exitLogic)];
    logic[index] = { ...logic[index], [field]: value };
    setLogic(logic);
  };

  // Reusable UI component for condition group (entry or exit)
  const ConditionGroup = ({
    type, title, conditions, color
  }: {
    type: 'entry' | 'exit';
    title: string;
    conditions: Condition[];
    color: string;
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`text-md font-semibold ${color}`}>{title}</h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addCondition(type)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Condition</span>
        </motion.button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
          <p>No conditions set</p>
          <p className="text-xs mt-1">Click "Add Condition" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Left-hand side (indicator/field) */}
                <div className="col-span-4">
                  <select
                    value={condition.left}
                    onChange={(e) => updateCondition(type, index, 'left', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                  >
                    {INDICATORS.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div className="col-span-3">
                  <select
                    value={condition.op}
                    onChange={(e) => updateCondition(type, index, 'op', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                {/* Right-hand side (value/comparison) */}
                <div className="col-span-4">
                  <input
                    type="text"
                    value={condition.right}
                    onChange={(e) => updateCondition(type, index, 'right', e.target.value)}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                  />
                </div>

                {/* Delete button */}
                <div className="col-span-1">
                  <button
                    onClick={() => removeCondition(type, index)}
                    className="w-full p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logical AND connector */}
              {index < conditions.length - 1 && (
                <div className="text-center mt-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">AND</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Trading Logic</h3>

      <div className="space-y-8">
        <ConditionGroup
          type="entry"
          title="Entry Conditions"
          conditions={entryLogic}
          color="text-green-400"
        />
        <div className="border-t border-gray-700 pt-6">
          <ConditionGroup
            type="exit"
            title="Exit Conditions"
            conditions={exitLogic}
            color="text-red-400"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LogicBuilder;
