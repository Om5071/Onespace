import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none tracking-[0.01em]';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-[0_12px_28px_rgba(59,130,246,0.28)] hover:shadow-[0_14px_30px_rgba(59,130,246,0.32)] hover:brightness-110 focus:ring-blue-500 border border-blue-400/20',
    secondary: 'bg-[#1A243B] hover:bg-[#23304E] text-slate-200 focus:ring-blue-500 border border-slate-700/70 shadow-sm hover:border-slate-600',
    outline: 'border border-slate-700 text-slate-300 hover:bg-[#1A243B] hover:text-white focus:ring-blue-500',
    purple: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-[0_12px_28px_rgba(168,85,247,0.25)] hover:brightness-110 focus:ring-purple-500 border border-purple-400/20',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_12px_28px_rgba(244,63,94,0.25)] hover:brightness-110 focus:ring-rose-500 border border-rose-400/20',
    ghost: 'text-slate-300 hover:bg-[#1A243B] hover:text-white focus:ring-slate-500'
  };

  const sizes = {
    xs: 'px-2 py-1 text-[10px] gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' || size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
};
