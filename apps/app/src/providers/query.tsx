"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { PropsWithChildren } from "react";

/**
 * Query client.
 */
const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 600_000, gcTime: 6_000_000 } },
});

/**
 * Query provider.
 */
const QueryProvider = ({ children }: PropsWithChildren) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export { QueryProvider, queryClient };
