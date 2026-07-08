"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = React.useCallback(
    (opts) => {
      const id = Math.random().toString(36).slice(2);
      const t = { id, variant: "default", duration: 3200, ...opts };
      setToasts((prev) => [...prev, t]);
      if (t.duration) setTimeout(() => dismiss(id), t.duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-primary" />,
    default: <Info className="h-5 w-5 text-primary" />,
  };
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-slide-up",
        toast.variant === "error" && "border-destructive/30"
      )}
    >
      {icons[toast.variant] || icons.default}
      <div className="flex-1 text-sm">
        {toast.title && <p className="font-semibold text-card-foreground">{toast.title}</p>}
        {toast.description && (
          <p className="text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded-md p-1 text-muted-foreground transition hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return { toast: () => {}, dismiss: () => {} };
  return ctx;
};
