import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";

export function NotFoundPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-4 p-8 text-center shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">404</p>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or may have moved.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Back to dashboard" : "Go to login"}
          </Link>
        </Button>
      </Card>
    </div>
  );
}
