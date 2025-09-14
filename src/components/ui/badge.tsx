// src/components/ui/badge.tsx
import React from 'react';

export const Badge: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-800 ${className}`}>
    {children}
  </span>
);

export default Badge;
