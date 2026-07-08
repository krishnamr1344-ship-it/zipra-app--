import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in",
        className
      )}
    >
      {Icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
          <Icon className="h-9 w-9" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, onRetry, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title || "Something went wrong"}
      </h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Try again
        </button>
      )}
    </div>
  );
}
