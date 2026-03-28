"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, FolderOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);
const ACCEPT_ATTR = ".jpg,.jpeg,.png";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ImagePickerProps {
  /** Currently selected new file. null = no new file chosen. */
  value: File | null;
  onChange: (file: File | null) => void;
  /**
   * Existing image URL shown when value is null (edit mode).
   * Gives the user a preview of the current image without forcing them to re-upload it.
   */
  existingUrl?: string;
  /** External validation error (e.g. "Image is required") */
  error?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImagePicker({ value, onChange, existingUrl, error, className }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

  // Create/revoke blob URL when a new file is selected
  useEffect(() => {
    if (!value) {
      setBlobPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setBlobPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const processFile = useCallback(
    (file: File) => {
      setValidationError(null);
      if (!ALLOWED_MIME.has(file.type)) {
        setValidationError("Only JPG, JPEG, and PNG files are allowed");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setValidationError(`File too large (${formatBytes(file.size)}). Max 3 MB.`);
        return;
      }
      onChange(file);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setValidationError(null);
  };

  // The preview to display: new file takes priority over existing URL
  const displayPreview = blobPreview ?? existingUrl ?? null;

  // ─── Preview state ────────────────────────────────────────────────────────

  if (displayPreview) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden border border-border bg-muted", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayPreview}
          alt="Preview"
          className="w-full h-40 object-contain p-2"
        />

        {/* File size badge — only for newly selected files */}
        {value && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 px-3 py-1">
            <span className="text-xs text-white truncate max-w-[65%]">{value.name}</span>
            <span
              className={cn(
                "text-xs tabular-nums",
                value.size > MAX_SIZE_BYTES * 0.85 ? "text-warning font-medium" : "text-white/70"
              )}
            >
              {formatBytes(value.size)}
            </span>
          </div>
        )}

        {/* Replace button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white hover:bg-black/80 transition-colors"
        >
          Replace
        </button>

        {/* Remove button */}
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove image"
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    );
  }

  // ─── Drop zone state ──────────────────────────────────────────────────────

  const showError = validationError ?? error;

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — click or drag and drop"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer select-none",
          "outline-none transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : showError
              ? "border-destructive/50 hover:border-destructive"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {isDragging ? <FolderOpen className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {isDragging ? "Drop image here" : "Click or drag & drop"}
          </p>
          <p className="text-xs text-muted-foreground">JPG, JPEG, PNG — max 3 MB</p>
        </div>
      </div>

      {showError && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{showError}</p>
        </div>
      )}
    </div>
  );
}
