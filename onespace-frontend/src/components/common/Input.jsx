import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'block w-full rounded-xl border border-slate-700/80 bg-[#131D31] px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner',
                Icon && 'pl-9',
                error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
                className
              )
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
