import React from "react";

import { FiltersPage } from "../pages/filters-page/filters-page";
import { SettingsPage } from "../pages/settings-page/settings-page";
import { PlaylistPage } from "../pages/playlist-page/playlist-page";
import { SavedFiltersProvider } from "../hooks/use-saved-filters";
import { StatsPage } from "../pages/stats-page/stats-page";

export const PATHS = {
  index: "/",
  playlist: "/playlist",
  settings: "/settings",
  filters: "/filters",
  stats: "/stats",
};

export const ROUTES = [
  {
    path: PATHS.index,
    element: (
      <SavedFiltersProvider>
        <FiltersPage />
      </SavedFiltersProvider>
    ),
  },
  { path: PATHS.playlist, element: <PlaylistPage /> },
  {
    path: PATHS.filters,
    element: (
      <SavedFiltersProvider>
        <FiltersPage />
      </SavedFiltersProvider>
    ),
  },
  { path: PATHS.settings, element: <SettingsPage /> },
  { path: PATHS.stats, element: <StatsPage /> },
];
