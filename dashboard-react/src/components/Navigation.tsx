'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '📍 Overview', exact: true },
  { href: '/risk', label: '📊 Risk Distribution' },
  { href: '/domains', label: '🎯 Domain Decomposition' },
  { href: '/participation', label: '📅 Participation & Stability' },
  { href: '/developmental', label: '🏥 Developmental Signals' },
  { href: '/geography', label: '🌎 Geographic & Context' },
  { href: '/cohort', label: '👥 Cohort Explorer' },
  { href: '/simulation', label: '🔮 Predictive Simulation' },
  { href: '/methodology', label: '📚 Data Methodology' },
  { href: '/use-cases', label: '💡 Use Cases' },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href;
  };

  return (
    <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title Section */}
        <div className="py-6 text-center border-b border-cyan-500/30">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <h1 className="text-4xl font-bold">
              🎯 ECIDS Readiness Risk Index
            </h1>
            <p className="text-cyan-100 mt-2">
              Early Childhood Integrated Data System
            </p>
          </Link>
          <p className="text-xs text-yellow-100 mt-3">
            ⚠️ SYNTHETIC DATA - This dashboard uses artificially generated data for demonstration purposes only.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href, item.exact)
                    ? 'bg-white text-cyan-700 shadow-md'
                    : 'text-cyan-50 hover:bg-cyan-500 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
