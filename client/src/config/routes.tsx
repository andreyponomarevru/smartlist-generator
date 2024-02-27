import React from "react";

import { FiltersPage } from "../pages/filters-page";
import { LibPage } from "../pages/lib-page";
import { PlaylistBuilderPage } from "../pages/playlist-builder-page/playlist-builder-page";
import { SavedFiltersProvider } from "../hooks/use-saved-filters";

export const PATHS = {
  index: "/",
  playlistBuilder: "/playlist",
  lib: "/lib",
  filters: "/filters",
};

export const ROUTES = [
  { path: PATHS.index, element: <LibPage /> },
  { path: PATHS.playlistBuilder, element: <PlaylistBuilderPage /> },
  {
    path: PATHS.filters,
    element: (
      <SavedFiltersProvider>
        <FiltersPage />
      </SavedFiltersProvider>
    ),
  },
  { path: PATHS.lib, element: <LibPage /> },
];
