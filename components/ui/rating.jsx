"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value = 0, count, size = "sm", className }) {
  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className={cn(sizes[size], "fill-warning text-warning")} />
      <span className="text-sm font-semibold text-foreground">
        {value ? value.toFixed(1) : "—"}
      </span>
      {count != null && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
