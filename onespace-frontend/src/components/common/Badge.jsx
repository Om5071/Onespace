import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-[#1A243B] text-slate-300 border border-slate-700/60',
    brand: 'bg-blue-950/60 text-blue-300 border border-blue-800/60',
    purple: 'bg-purple-950/60 text-purple-300 border border-purple-800/60',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    danger: 'bg-rose-950/60 text-rose-300 border border-rose-800/60',
    info: 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs sm:text-sm'
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
