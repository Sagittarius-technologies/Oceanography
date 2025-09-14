// src/components/ui/dialog.tsx
import React, { useEffect } from 'react';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
};

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
      aria-hidden
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const DialogTitle: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
);

export default Dialog;
