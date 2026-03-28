"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, FolderOpen, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);
const ACCEPT_ATTR = ".jpg,.jpeg,.png";
const TARGET_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.05;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns true if the image's aspect ratio is within tolerance of 16:9 */
async function isRatio16x9(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = img.naturalWidth / img.naturalHeight;
      resolve(Math.abs(ratio - TARGET_RATIO) <= RATIO_TOLERANCE);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(true); // don't block on load error
    };
    img.src = url;
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PosterUploadProps {
  /**
   * When true the link field is hidden and only an image is required.
   * Used for the "Replace image" (PUT) flow.
   */
  imageOnly?: boolean;
  /** Existing banner shown in preview before the user picks a new file */
  existingUrl?: string;
  /** Called when the user submits. `link` is empty string when imageOnly. */
  onSubmit: (image: File, link: string) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PosterUpload({ imageOnly = false, existingUrl, onSubmit, onCancel }: PosterUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [ratioWarning, setRatioWarning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Blob URL lifecycle
  useEffect(() => {
    if (!imageFile) { setBlobPreview(null); return; }
    const url = URL.createObjectURL(imageFile);
    setBlobPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const processFile = useCallback(async (file: File) => {
    setValidationError(null);
    setRatioWarning(false);

    if (!ALLOWED_MIME.has(file.type)) {
      setValidationError("Only JPG, JPEG, and PNG files are allowed");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File too large (${formatBytes(file.size)}). Max 3 MB.`);
      return;
    }

    setImageFile(file);
    const ok = await isRatio16x9(file);
    setRatioWarning(!ok);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
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
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleRemove = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setImageFile(null);
    setValidationError(null);
    setRatioWarning(false);
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setIsSubmitting(true);
    setProgress(0);

    // Simulate indeterminate progress while the real upload runs
    const ticker = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 120);

    try {
      await onSubmit(imageFile, link.trim());
      setProgress(100);
    } finally {
      clearInterval(ticker);
      setIsSubmitting(false);
    }
  };

  const displayPreview = blobPreview ?? existingUrl ?? null;
  const canSubmit = !!imageFile && !isSubmitting;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* 16:9 image zone */}
      {displayPreview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-border bg-black">
          {/* 16:9 container */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPreview}
              alt="Banner preview"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 16:9 rule-of-thirds grid overlay — subtle guide lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "33.333% 33.333%",
              }}
            />

            {/* Remove / Replace buttons */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black/80 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* File info strip */}
            {imageFile && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 px-3 py-1.5">
                <span className="text-xs text-white truncate max-w-[65%]">{imageFile.name}</span>
                <span className="text-xs text-white/70 tabular-nums">{formatBytes(imageFile.size)}</span>
              </div>
            )}
          </div>

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
      ) : (
        /* Drop zone — maintains 16:9 via padding trick */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload banner — click or drag and drop"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
          }}
          className={cn(
            "relative w-full rounded-xl border-2 border-dashed cursor-pointer select-none outline-none",
            "transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging
              ? "border-primary bg-primary/5"
              : validationError
                ? "border-destructive/50 hover:border-destructive"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          {/* Maintain 16:9 ratio */}
          <div style={{ paddingBottom: "56.25%" }} />
          {/* Centered content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {isDragging ? <FolderOpen className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-sm font-medium">
                {isDragging ? "Drop banner here" : "Click or drag & drop"}
              </p>
              <p className="text-xs text-muted-foreground">JPG, JPEG, PNG — max 3 MB · 16:9 recommended</p>
            </div>
          </div>

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
      )}

      {/* Aspect ratio warning */}
      {ratioWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
          <p className="text-xs text-warning leading-relaxed">
            This image doesn&apos;t appear to be 16:9. Banners display best at 16:9 — it may appear cropped or stretched.
          </p>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{validationError}</p>
        </div>
      )}

      {/* Link input — hidden in imageOnly (replace) mode */}
      {!imageOnly && (
        <div className="space-y-1.5">
          <Label htmlFor="poster-link" className="flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            Link
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="poster-link"
            type="url"
            placeholder="https://example.com/sale"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
      )}

      {/* Upload progress */}
      {isSubmitting && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground tabular-nums text-right">{progress}%</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          <Upload className="h-4 w-4" />
          {isSubmitting ? "Uploading…" : imageOnly ? "Replace Image" : "Upload Poster"}
        </Button>
      </div>
    </div>
  );
}
