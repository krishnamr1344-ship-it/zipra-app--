"use client";

import * as React from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { uploadService } from "@/services/api";
import { Button } from "@/components/ui/button";

export function ImageUpload({ label, value, onChange, onUploadingChange, aspect = "16/9" }) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const res = await uploadService.upload(file);
      onChange(res.url);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      )}
      <div
        className="relative overflow-hidden rounded-xl border border-dashed border-input bg-muted/40"
        style={{ aspectRatio: aspect }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded image is an arbitrary (often http) URL */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition hover:text-primary"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
            <span className="text-xs">{uploading ? "Uploading…" : "Tap to upload image"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
