'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBarIcon,
  CogIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

/**
 * Represents a single navigation item in the header.
 */
const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/strategy-builder', label: 'Strategy Builder', icon: CogIcon },
  { href: '/performance-dashboard', label: 'Performance', icon: ChartBarIcon },
]

/**
 * Header component provides sticky top navigation for the app.
 */
const Header = () => {
  const pathname = usePathname()

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">TradeMind IQ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-green-500 text-black'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu (non-functional placeholder) */}
          <div className="md:hidden">
            <button
              className="text-gray-400 hover:text-white p-2"
              aria-label="Open mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
