import { useEffect } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { queryClient } from "./query-client";
import { router } from "./router";

import { useAuthStore } from "@/stores/auth.store";

export function AppProviders() {
  const initialize =
    useAuthStore(
      (state) => state.initialize,
    );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
