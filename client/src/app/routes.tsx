import React from "react";

import { FiltersPage } from "../pages/filters-page";
import { SettingsPage } from "../pages/settings-page";
import { PlaylistPage } from "../pages/playlist-page";
import { StatsPage } from "../pages/stats-page";

export const PATHS = {
  index: "/",
  playlist: "/playlist",
  settings: "/settings",
  filters: "/filters",
  stats: "/stats",
};

export const ROUTES = [
  { path: PATHS.index, element: <FiltersPage /> },
  { path: PATHS.playlist, element: <PlaylistPage /> },
  { path: PATHS.filters, element: <FiltersPage /> },
  { path: PATHS.settings, element: <SettingsPage /> },
  { path: PATHS.stats, element: <StatsPage /> },
];
