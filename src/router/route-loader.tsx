import { Loader2 } from "lucide-react";

export function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}
