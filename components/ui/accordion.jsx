"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({ type = "single", defaultValue, className, children }) {
  const [open, setOpen] = React.useState(
    type === "multiple" ? defaultValue || [] : defaultValue || null
  );
  const toggle = (val) => {
    if (type === "multiple") {
      setOpen((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
      );
    } else {
      setOpen((prev) => (prev === val ? null : val));
    }
  };
  return (
    <div className={cn("divide-y divide-border", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { isOpen: open?.includes?.(child.props.value) ?? open === child.props.value, onToggle: () => toggle(child.props.value) })
          : child
      )}
    </div>
  );
}

export function AccordionItem({ value, title, children, isOpen, onToggle }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
