"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { useLanguageStore } from "@/store/language.store";
import i18n from "@/i18n/config";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

export function Providers({ children }: { children: ReactNode }) {
  const locale = useLanguageStore((state) => state.locale);

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
        {import.meta.env.DEV ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
