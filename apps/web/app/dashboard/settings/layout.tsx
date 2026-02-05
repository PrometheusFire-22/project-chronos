'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SettingsNav } from '@/components/layout/SettingsNav';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 py-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <SettingsNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
