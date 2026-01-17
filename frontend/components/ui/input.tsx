"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
  onMax?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, suffix, onMax, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 border-border/50 bg-background/50 px-4 py-2 text-base text-foreground placeholder:text-muted-foreground",
              "backdrop-blur-sm transition-all duration-200",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              (suffix || onMax) && "pr-20",
              className
            )}
            ref={ref}
            {...props}
          />
          {(suffix || onMax) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {onMax && (
                <button
                  type="button"
                  onClick={onMax}
                  className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/30"
                >
                  MAX
                </button>
              )}
              {suffix && (
                <span className="text-sm font-medium text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
