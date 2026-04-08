"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, AlertCircle, FolderOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { productImagesService } from "@/services/product-images.service";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = "idle" | "uploading" | "success" | "error";

interface FileEntry {
  id: string;
  file: File;
  /** Blob URL — must be revoked when entry is removed or component unmounts */
  preview: string;
  progress: number;
  status: FileStatus;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);
const ACCEPT_ATTR = ".jpg,.jpeg,.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Only JPG, JPEG, and PNG files are allowed";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 3 MB.`;
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface ProductImageUploadProps {
  productId: number;
  /** Called after a successful upload batch with the newly created ProductImage entries */
  onUploadComplete?: (uploaded: import("@/types").ProductImage[]) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductImageUpload({
  productId,
  onUploadComplete,
  className,
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  /**
   * Mirrors the backend's `firstIsMain` param (default: true).
   * When true, the FIRST file of each upload batch is set as the main product image.
   */
  const [firstIsMain, setFirstIsMain] = useState(true);

  // Revoke all blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      setFiles((prev) => {
        prev.forEach((f) => URL.revokeObjectURL(f.preview));
        return [];
      });
    };
  }, []);

  // ─── File management ────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const next: FileEntry[] = Array.from(incoming).map((file) => {
      const validationError = validateFile(file);
      return {
        id: genId(),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: validationError ? "error" : "idle",
        error: validationError ?? undefined,
      };
    });

    setFiles((prev) => {
      // Deduplicate by name + size to prevent double-adding the same file
      const seen = new Set(prev.map((f) => `${f.file.name}::${f.file.size}`));
      return [...prev, ...next.filter((e) => !seen.has(`${e.file.name}::${e.file.size}`))];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "idle", error: undefined, progress: 0 } : f)),
    );
  }, []);

  const clearUploaded = useCallback(() => {
    setFiles((prev) => {
      prev.filter((f) => f.status === "success").forEach((f) => URL.revokeObjectURL(f.preview));
      return prev.filter((f) => f.status !== "success");
    });
  }, []);

  // ─── Input / Drag events ────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = ""; // reset so the same file can be re-selected
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
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === "idle");
    if (!pending.length || isUploading) return;

    setIsUploading(true);
    const allUploaded: import("@/types").ProductImage[] = [];

    /**
     * Upload files one by one for per-file progress tracking.
     *
     * firstIsMain semantics:
     *   - First file  → firstIsMain = <user toggle>
     *   - Every other → firstIsMain = false
     *
     * This matches the backend's behaviour where "firstIsMain" applies to
     * the first entry in the `files` list for that specific request.
     */
    const results = await Promise.allSettled(
      pending.map(async (entry, index) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading", progress: 0 } : f)),
        );

        const uploaded = await productImagesService.upload(productId, entry.file, {
          firstIsMain: index === 0 ? firstIsMain : false,
          onProgress: (percent) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === entry.id ? { ...f, progress: percent } : f)),
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "success", progress: 100 } : f)),
        );

        allUploaded.push(...uploaded);
      }),
    );

    let succeeded = 0;
    let failed = 0;

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        succeeded++;
      } else {
        failed++;
        const axiosError = result.reason as AxiosError<ApiError>;
        const message = axiosError.response?.data?.detail ?? axiosError.message ?? "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pending[i].id ? { ...f, status: "error", error: message, progress: 0 } : f,
          ),
        );
      }
    });

    if (succeeded > 0) {
      toast.success(`${succeeded} image${succeeded !== 1 ? "s" : ""} uploaded`);
      onUploadComplete?.(allUploaded);
    }
    if (failed > 0) {
      toast.error(`${failed} image${failed !== 1 ? "s" : ""} failed — check errors below`);
    }

    setIsUploading(false);
  };

  // ─── Derived counts ──────────────────────────────────────────────────────────

  const pendingCount = files.filter((f) => f.status === "idle").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images — click or drag and drop"
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
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer",
          "outline-none transition-all duration-200 select-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.005]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        <motion.div
          animate={{ scale: isDragging ? 1.15 : 1, rotate: isDragging ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {isDragging ? <FolderOpen className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        </motion.div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragging ? "Drop your images here" : "Click to browse or drag & drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, JPEG, PNG &mdash; up to 3 MB per file
          </p>
        </div>
      </div>

      {/* firstIsMain toggle — only relevant when there are files ready */}
      {files.some((f) => f.status === "idle") && (
        <div className="flex items-center gap-2.5 px-1">
          <Switch
            id="first-is-main"
            checked={firstIsMain}
            onCheckedChange={setFirstIsMain}
            disabled={isUploading}
          />
          <Label htmlFor="first-is-main" className="flex items-center gap-1.5 cursor-pointer">
            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
            <span className="text-sm">Set first image as main</span>
          </Label>
        </div>
      )}

      {/* File list */}
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
            role="list"
            aria-label="Selected files"
          >
            <AnimatePresence initial={false}>
              {files.map((entry, index) => (
                <FileRow
                  key={entry.id}
                  entry={entry}
                  isFirst={index === 0}
                  showMainBadge={firstIsMain && index === 0 && entry.status !== "error"}
                  onRemove={removeFile}
                  onRetry={retryFile}
                  disableRemove={isUploading && entry.status === "uploading"}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Footer */}
      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {pendingCount > 0 && <span>{pendingCount} ready</span>}
            {uploadingCount > 0 && (
              <span className="text-primary ml-2">{uploadingCount} uploading&hellip;</span>
            )}
            {successCount > 0 && <span className="text-success ml-2">{successCount} done</span>}
            {errorCount > 0 && <span className="text-destructive ml-2">{errorCount} failed</span>}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {successCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearUploaded}
                disabled={isUploading}
              >
                Clear done
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={uploadAll}
              disabled={pendingCount === 0 || isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading…" : `Upload${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── File Row ─────────────────────────────────────────────────────────────────

interface FileRowProps {
  entry: FileEntry;
  isFirst: boolean;
  showMainBadge: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  disableRemove: boolean;
}

function FileRow({ entry, showMainBadge, onRemove, onRetry, disableRemove }: FileRowProps) {
  const isValidationError = entry.error?.includes("Only") || entry.error?.includes("too large");

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border bg-card",
        entry.status === "error" ? "border-destructive/30" : "border-border",
        entry.status === "success" && "border-success/30",
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-11 h-11 rounded-md overflow-hidden bg-muted border border-border shrink-0">
        <img src={entry.preview} alt="" aria-hidden="true" className="w-full h-full object-cover" />

        {/* Main badge */}
        {showMainBadge && entry.status !== "uploading" && (
          <div className="absolute bottom-0 left-0 right-0 bg-warning/80 flex items-center justify-center py-0.5">
            <Star className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        )}

        {/* Uploading overlay */}
        <AnimatePresence>
          {entry.status === "uploading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <span className="text-white text-[10px] font-bold tabular-nums">
                {entry.progress}%
              </span>
            </motion.div>
          )}
          {entry.status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-success/60"
            >
              <CheckCircle2 className="h-5 w-5 text-white drop-shadow" />
            </motion.div>
          )}
          {entry.status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-destructive/50"
            >
              <AlertCircle className="h-5 w-5 text-white drop-shadow" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate leading-none">{entry.file.name}</p>
          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {formatBytes(entry.file.size)}
          </span>
        </div>

        {entry.status === "uploading" && <Progress value={entry.progress} className="h-1.5" />}
        {entry.status === "idle" && (
          <p className="text-xs text-muted-foreground leading-none">Ready</p>
        )}
        {entry.status === "success" && (
          <p className="text-xs text-success font-medium leading-none">Uploaded</p>
        )}
        {entry.status === "error" && entry.error && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-destructive leading-none flex-1 truncate">{entry.error}</p>
            {!isValidationError && (
              <button
                type="button"
                onClick={() => onRetry(entry.id)}
                className="text-xs text-primary hover:underline shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        disabled={disableRemove}
        aria-label={`Remove ${entry.file.name}`}
        className={cn(
          "shrink-0 flex items-center justify-center w-7 h-7 rounded-md",
          "text-muted-foreground transition-colors",
          "hover:text-destructive hover:bg-destructive/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.li>
  );
}
