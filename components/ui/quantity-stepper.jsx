"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function QuantityStepper({
  value = 0,
  min = 0,
  max = 99,
  onChange,
  size = "md",
  className,
}) {
  const dec = (e) => {
    e.stopPropagation();
    onChange?.(Math.max(min, value - 1));
  };
  const inc = (e) => {
    e.stopPropagation();
    onChange?.(Math.min(max, value + 1));
  };

  const dims = size === "sm" ? "h-8" : "h-10";

  if (value <= 0) {
    return (
      <Button
        size="sm"
        variant="gradient"
        onClick={(e) => {
          e.stopPropagation();
          onChange?.(1);
        }}
        className={cn("rounded-full px-4", className)}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft/40 p-1",
        dims,
        className
      )}
    >
      <button
        aria-label="Decrease quantity"
        onClick={dec}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-primary shadow-sm transition active:scale-90"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-foreground">
        {value}
      </span>
      <button
        aria-label="Increase quantity"
        onClick={inc}
        disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition active:scale-90 disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
