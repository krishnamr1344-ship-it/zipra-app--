"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-fade-in",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef(
  ({ className, children, side = "bottom", hideClose, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-xl outline-none data-[state=open]:animate-slide-up",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t border-border",
          side === "top" && "inset-x-0 top-0 rounded-b-3xl border-b border-border",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border" />
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="sr-only">Close</DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = "SheetContent";

function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-5 py-4",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-lg font-semibold", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
};
