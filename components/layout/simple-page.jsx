import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SimplePage({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Placeholder({ title, lines = [] }) {
  return (
    <SimplePage title={title}>
      <Card className="space-y-3 p-5">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">This section is coming soon.</p>
        ) : (
          lines.map((l, i) => <p key={i} className="text-sm text-muted-foreground">{l}</p>)
        )}
      </Card>
    </SimplePage>
  );
}
