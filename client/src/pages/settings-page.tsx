import React from "react";

import { LibPathInput } from "../types";
import { useLocalStorage } from "../hooks/use-local-storage";
import { ExcludedTracksSettings } from "../features/excluded-tracks";
import { LibPathSettings } from "../features/settings/lib-path";
import { ValidationSettings } from "../features/settings";
import { SeedingSettings } from "../features/settings/seeding-settings";

import "./settings-page.scss";

const LIBPATH_LOCAL_STORAGE_KEY = "libPath";

export function SettingsPage() {
  const [libPath] = useLocalStorage<LibPathInput>(LIBPATH_LOCAL_STORAGE_KEY, {
    libPath: "",
  });

  return (
    <div className="settings-page">
      <header className="header1">Database</header>
      <LibPathSettings />
      <ValidationSettings currentSettings={libPath} />
      <SeedingSettings currentSettings={libPath} />
      <ExcludedTracksSettings />
    </div>
  );
}
