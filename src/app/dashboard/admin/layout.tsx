import React from 'react';

// This layout is now handled by the role-based logic in /dashboard/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
