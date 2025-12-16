import React from 'react';

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout already handles header/footer rendering
  // This layout just wraps frontend pages
  return <>{children}</>;
}
