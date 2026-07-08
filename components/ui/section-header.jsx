import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, subtitle, actionHref, actionLabel, icon: Icon, className }) {
  return (
    <div className={cn("flex items-end justify-between gap-3 px-1", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="flex items-center gap-0.5 text-sm font-semibold text-primary transition hover:gap-1"
        >
          {actionLabel || "See all"} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
