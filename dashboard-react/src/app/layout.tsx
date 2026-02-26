import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECIDS Readiness Risk Index | Early Warning System',
  description: 'Early Childhood Integrated Data System - Kindergarten Readiness Risk Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header with Navigation */}
          <Navigation />

          {/* Main Content */}
          <main className="py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
              <p>ECIDS Readiness Risk Index Dashboard</p>
              <p className="mt-1">⚠️ Synthetic Data for Demonstration Purposes Only</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
