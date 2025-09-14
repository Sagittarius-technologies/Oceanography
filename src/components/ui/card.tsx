// src/components/ui/card.tsx
import React from 'react';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

// Generic Card wrapper (use for surface / panels)
export const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/5 border border-slate-700 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

// Card header area (optional)
export const CardHeader: React.FC<Props> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 rounded-t-2xl ${className}`}>{children}</div>
);

// Card content area (padding + spacing)
export const CardContent: React.FC<Props> = ({ children, className = '' }) => (
  <div className={`px-6 py-6 ${className}`}>{children}</div>
);

// Card title (typography helper)
type TitleProps = {
  className?: string;
  children?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
};

export const CardTitle: React.FC<TitleProps> = ({ children, className = '', as: Component = 'h3' }) => {
  return (
    // use a semantic element (h3 by default) and allow overriding via `as` prop
    <Component className={`text-lg font-semibold ${className}`}>{children}</Component>
  );
};

export default Card;
