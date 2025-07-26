'use client'; // Marks this as a Client Component for Next.js (App Router)

// === Imports ===
import React from 'react';
import { motion } from 'framer-motion'; // For animations
import Navigation from '@/components/ui/Navigation'; // Custom navigation component

// Heroicons used for feature icons
import {
  ChartBarIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// === Main Home Page Component ===
const HomePage = () => {
  // Feature cards data
  const features = [
    {
      icon: CpuChipIcon,
      title: 'Advanced Algorithms',
      description: 'Powered by sophisticated trading algorithms and machine learning models.'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Get instant insights with comprehensive performance metrics and visualizations.'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Strategy Optimization',
      description: 'Fine-tune your strategies with backtesting and forward testing capabilities.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Risk Management',
      description: 'Advanced risk controls and position sizing for capital preservation.'
    },
    {
      icon: BoltIcon,
      title: 'High Performance',
      description: 'Lightning-fast execution and analysis with optimized data processing.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Multi-Exchange',
      description: 'Connect to multiple exchanges and trade various asset classes.'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      
      {/* === Hero Section === */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          
          {/* Main Headline & Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              <span className="text-green-400">Trade</span>Mind IQ
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Professional-grade backtesting platform for algorithmic trading strategies. 
              Build, test, and optimize your trading systems with advanced analytics.
            </p>

            {/* Call-to-Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                Get Started Free
              </button>
              <button className="px-8 py-4 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-semibold rounded-lg transition-all duration-300">
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Animated Background Pulsing Dots */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-green-400 rounded-full animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* === Features Section === */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose TradeMind IQ?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to develop, test, and deploy successful trading strategies
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === Navigation CTA Section === */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your Trading Journey
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose your path to algorithmic trading success
            </p>
          </motion.div>

          {/* Custom Navigation Component */}
          <Navigation />
        </div>
      </section>

      {/* === Stats Section === */}
      <section className="py-16 bg-gradient-to-r from-green-900 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Stats Grid */}
            {[
              { value: '10K+', label: 'Active Traders' },
              { value: '$2B+', label: 'Volume Traded' },
              { value: '500+', label: 'Strategies Tested' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-green-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
