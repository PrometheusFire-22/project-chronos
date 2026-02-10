'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@chronos/ui';
import { LayoutDashboard, User, Shield, CreditCard } from 'lucide-react';

const settingsLinks = [
  {
    name: 'Overview',
    href: '/settings/overview',
    icon: LayoutDashboard,
  },
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    name: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {settingsLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
              isActive
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
            )}
          >
            <link.icon className={cn('w-4 h-4', isActive ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground')} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
