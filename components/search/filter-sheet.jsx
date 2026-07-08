"use client";

import * as React from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { services } from "@/services/api";

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function FilterSheet({ open, onOpenChange, filters, onChange }) {
  const [categories, setCategories] = React.useState([]);
  const local = React.useRef(filters);

  React.useEffect(() => {
    services.categories.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    local.current = filters;
  }, [filters]);

  const toggleCat = (id) => {
    const has = local.current.category === id;
    local.current = { ...local.current, category: has ? null : id };
  };

  const apply = () => onChange(local.current);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Filters & Sort</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="overflow-y-auto px-5 py-4">
          <h4 className="mb-2 text-sm font-semibold">Sort by</h4>
          <div className="mb-5 flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => (local.current = { ...local.current, sort: s.value })}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  local.current.sort === s.value
                    ? "border-primary bg-primary-soft text-primary-soft-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <h4 className="mb-2 text-sm font-semibold">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  local.current.category === c.id
                    ? "border-primary bg-primary-soft text-primary-soft-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border p-4">
          <Button fullWidth variant="gradient" onClick={apply}>
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
