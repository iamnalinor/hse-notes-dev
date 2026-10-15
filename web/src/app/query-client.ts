import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: 1, throwOnError: true },
    },
  });
