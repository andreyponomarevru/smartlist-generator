import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "../lib/error-boundary/error-boundary";

import { ROUTES } from "../config/routes";
import { Layout } from "../lib/layout/laylout";
import { Page404 } from "../pages/404-page/404-page";
import { GlobalStateProvider } from "../hooks/use-global-state";

const queryClient = new QueryClient();

export function App() {
  const router = createBrowserRouter([
    { element: <Layout />, errorElement: <Page404 />, children: ROUTES },
  ]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GlobalStateProvider>
          <RouterProvider router={router} />
        </GlobalStateProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
