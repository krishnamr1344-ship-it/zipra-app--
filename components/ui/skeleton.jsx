import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
