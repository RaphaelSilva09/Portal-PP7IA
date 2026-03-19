"use client";

/**
 * Providers Component (Presentation Layer - Client-Side Only)
 *
 * React Query provider wrapper with browser-specific optimizations.
 *
 * Features:
 * - Client-side cache with configurable staleTime
 * - Automatic retry with exponential backoff
 * - BfCache (back-forward cache) invalidation on browser back
 * - DevTools only in develop branch (via NEXT_PUBLIC_GIT_BRANCH env var)
 *
 * Usage in layout.tsx:
 * ```tsx
 * import Providers from "@/components/Providers";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * Principles applied:
 * - SRP: Responsible only for React Query configuration and bfcache handling
 * - Client-Only: "use client" directive (Next.js 13+ App Router)
 * - Performance: Configured staleTime reduces unnecessary network requests
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    // Initialize QueryClient once per component instance (stable across renders)
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Cache configuration
                        staleTime: 1000 * 30, // 30s de cache - reduz refetches desnecessários

                        // Força revalidação ao focar a aba ou montar o componente
                        refetchOnWindowFocus: true,
                        refetchOnMount: true,

                        // Retry configuration
                        retry: 1, // Reduzido de 3 para 1 tentativa (diminui tempo de tela branca em falha)
                        retryDelay: 1000, // Delay fixo de 1s ao invés de exponencial

                        // Disable background refetch while window is not visible
                        // Reduces unnecessary network activity
                        refetchOnReconnect: false,
                    },
                },
            }),
    );

    // BfCache (Back-Forward Cache) handling
    // When user uses browser back button, cached queries may be stale
    // Solution: Invalidate all queries on pageshow event with persisted=true
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            // event.persisted = true means page was restored from bfcache
            if (event.persisted) {
                queryClient.invalidateQueries();
            }
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [queryClient]);

    // Show DevTools only in develop branch (not production, not other branches)
    // Requires NEXT_PUBLIC_GIT_BRANCH env var in .env.local or Vercel settings
    const showDevTools = process.env.NEXT_PUBLIC_GIT_BRANCH === "develop";

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {showDevTools && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
        </QueryClientProvider>
    );
}
