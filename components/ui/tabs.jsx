"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.active === value;
  return (
    <button
      onClick={() => ctx?.setActive(value)}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.active !== value) return null;
  return <div className={cn("animate-fade-in", className)}>{children}</div>;
}
