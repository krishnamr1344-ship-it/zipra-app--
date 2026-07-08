"use client";

import * as React from "react";
import { MapPin, Crosshair, Search, Navigation, Loader2 } from "lucide-react";
import { getCurrentPosition, reverseGeocode, searchLocations } from "@/services/location";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function LocationPicker({ open, onOpenChange }) {
  const deliveryAddress = useStore((s) => s.deliveryAddress);
  const setDeliveryAddress = useStore((s) => s.setDeliveryAddress);
  const setCurrentLocation = useStore((s) => s.setCurrentLocation);

  const [detecting, setDetecting] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const timer = React.useRef(null);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentPosition();
      setCurrentLocation(pos);
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setDeliveryAddress(addr);
      onOpenChange(false);
    } catch {
      alert("Could not detect location. Please search manually.");
    } finally {
      setDetecting(false);
    }
  };

  const onSearch = (val) => {
    setQuery(val);
    clearTimeout(timer.current);
    if (val.length < 3) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchLocations(val);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const selectLocation = (loc) => {
    setCurrentLocation({ lat: loc.lat, lng: loc.lng });
    setDeliveryAddress(loc);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Choose your location</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-5 pb-8 pt-4">
          <Button
            variant="gradient"
            fullWidth
            size="lg"
            onClick={detectLocation}
            disabled={detecting}
            className="gap-2"
          >
            {detecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Crosshair className="h-5 w-5" />
            )}
            {detecting ? "Detecting…" : "Use current location"}
          </Button>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search for area, street, city…"
              className="flex h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-muted"
                >
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.displayName.split(",").slice(0, 3).join(",")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {r.city}{r.pincode ? ` - ${r.pincode}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && !searching && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No locations found</p>
          )}

          {deliveryAddress && !query && (
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Current delivery area</p>
              <p className="text-sm font-medium mt-0.5">
                {deliveryAddress.city}{deliveryAddress.pincode ? ` - ${deliveryAddress.pincode}` : ""}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
