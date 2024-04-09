import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "../features/ui/error-boundary";

import { ROUTES } from "./routes";
import { Layout } from "../features/layout";
import { Page404 } from "../pages/404-page";
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
