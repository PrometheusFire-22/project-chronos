import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-slate-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
