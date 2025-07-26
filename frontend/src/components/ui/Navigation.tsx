'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'

/**
 * Props for a single navigation card.
 */
interface NavigationCardProps {
  href: string                                // Target route (URL)
  title: string                               // Title displayed on the card
  description: string                         // Subtitle/description below title
  icon: React.ComponentType<{ className?: string }> // Icon component
  gradient: string                            // Tailwind gradient class
}

/**
 * NavigationCard renders a single feature card with icon, title, and description.
 */
const NavigationCard: React.FC<NavigationCardProps> = ({
  href,
  title,
  description,
  icon: Icon,
  gradient
}) => {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`relative overflow-hidden rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl ${gradient}`}
      >
        {/* Foreground Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-center w-16 h-16 bg-black bg-opacity-20 rounded-lg mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-200 text-lg leading-relaxed">{description}</p>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 border border-white rounded-full"></div>
        </div>
      </motion.div>
    </Link>
  )
}

/**
 * Navigation lists and renders all main navigational cards for the app.
 */
const Navigation = () => {
  const navigationItems: NavigationCardProps[] = [
    {
      href: '/strategy-builder',
      title: 'Strategy Builder',
      description:
        'Create and configure advanced trading strategies with technical indicators and custom logic.',
      icon: CogIcon,
      gradient: 'bg-gradient-to-br from-green-600 to-green-800'
    },
    {
      href: '/performance-dashboard',
      title: 'Performance Dashboard',
      description:
        'Analyze your trading performance with comprehensive metrics and visualizations.',
      icon: ChartBarIcon,
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-800'
    }
  ]

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {navigationItems.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
        >
          <NavigationCard {...item} />
        </motion.div>
      ))}
    </div>
  )
}

export default Navigation
