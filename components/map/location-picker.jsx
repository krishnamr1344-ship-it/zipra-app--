"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPin, Crosshair, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const DEFAULT_CENTER = [19.076, 72.877];

function DraggableMarker({ position, onMove }) {
  const markerRef = React.useRef(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onMove(lat, lng);
        }
      },
    }),
    [onMove],
  );
  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>Drag the pin to your location</Popup>
    </Marker>
  );
}

function LocationPickerMap({ onConfirm, onClose }) {
  const [center, setCenter] = React.useState(DEFAULT_CENTER);
  const [markerPos, setMarkerPos] = React.useState(DEFAULT_CENTER);
  const [icon, setIcon] = React.useState(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      const i = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      setIcon(i);
    }
  }, []);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCenter([latitude, longitude]);
          setMarkerPos([latitude, longitude]);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  };

  const handleConfirm = () => {
    onConfirm(markerPos[0], markerPos[1]);
    onClose();
  };

  if (typeof window === "undefined") return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-display text-lg font-semibold">Pin your location</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLocate}>
            <Crosshair className="h-4 w-4" /> Current
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
      <div className="relative flex-1">
        <MapContainer
          center={center}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {icon && (
            <DraggableMarker position={markerPos} onMove={(lat, lng) => setMarkerPos([lat, lng])} />
          )}
        </MapContainer>
      </div>
      <div className="border-t px-4 py-3">
        <Button variant="gradient" fullWidth size="lg" onClick={handleConfirm} className="gap-2">
          <Check className="h-5 w-5" /> Confirm Location
        </Button>
      </div>
    </div>
  );
}

export function LocationPicker({ onConfirm }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-input py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <MapPin className="h-4 w-4" /> Pick on Map
      </button>
      {open && (
        <LocationPickerMap
          onConfirm={(lat, lng) => {
            onConfirm(lat, lng);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
