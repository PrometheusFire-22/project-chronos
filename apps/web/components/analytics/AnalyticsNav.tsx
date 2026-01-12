// apps/web/components/analytics/AnalyticsNav.tsx
// Navigation component for analytics pages

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ANALYTICS_LINKS = [
  { href: '/analytics/economic', label: 'Economic' },
  { href: '/analytics/geospatial', label: 'Geospatial' },
];

export default function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Analytics:</span>
      {ANALYTICS_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
