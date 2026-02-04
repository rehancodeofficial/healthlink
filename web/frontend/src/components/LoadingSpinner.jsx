// FILE: src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000]/90 gap-4">
      <div className="h-12 w-12 border-4 border-[var(--brand-green, #027906)]/20 border-t-[var(--brand-green, #027906)] rounded-full animate-spin"></div>
      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-soft, #a0aec0)] animate-pulse">
        Initializing Secure Access...
      </p>
    </div>
  );
};

export default LoadingSpinner;
