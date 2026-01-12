// apps/web/components/analytics/AnalyticsNav.tsx
// Navigation dropdown for analytics pages

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ANALYTICS_LINKS = [
  { href: '/analytics/economic', label: 'Economic Analytics' },
  { href: '/analytics/geospatial', label: 'Geospatial Analytics' },
];

export default function AnalyticsNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentPage = ANALYTICS_LINKS.find(link => pathname === link.href);
  const otherPages = ANALYTICS_LINKS.filter(link => pathname !== link.href);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
      >
        {currentPage?.label || 'Analytics'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
            {otherPages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
