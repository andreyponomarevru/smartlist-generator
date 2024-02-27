import React from "react";
import { FaDownload, FaFileImport } from "react-icons/fa";

import { useSavedFilters } from "../hooks/use-saved-filters";
import { SavedFilter } from "../lib/saved-filter/saved-filter";
import { exportSavedFiltersToJSON } from "../utils/misc";
import { useGlobalState } from "../hooks/use-global-state";

export function FiltersPage() {
  const savedFilters = useSavedFilters();
  const { playlist } = useGlobalState();

  React.useEffect(() => {
    console.log(savedFilters.state);
  }, [savedFilters]);

  return (
    <section className="app__section">
      <header className="app__saved-filters-header">
        Saved filters ({savedFilters.state.ids.length})
      </header>
      {savedFilters.state.ids.map((id) => (
        <SavedFilter
          key={JSON.stringify(savedFilters.state.names[`${id}`]) + Date.now()}
          savedFilterId={id}
          name={savedFilters.state.names[id]}
          filter={savedFilters.state.settings[`${id}`]}
          handleDestroy={() => savedFilters.handleDestroy(id)}
          handleRename={savedFilters.handleRename}
        />
      ))}
      <div className="app__controls app__controls_bottom">
        <button
          onClick={() =>
            exportSavedFiltersToJSON(
              playlist.name.state.text,
              savedFilters.state
            )
          }
          className="app__btn btn btn_theme_transparent-black"
          disabled={savedFilters.state.ids.length === 0}
        >
          <FaDownload className="icon" />
          <span>Export as JSON</span>
        </button>
        <label htmlFor="importsavedfilters">
          <input
            id="importsavedfilters"
            type="file"
            onChange={savedFilters.handleImportAsJSON}
            multiple
            hidden
          />
          <div className="app__btn btn btn_theme_transparent-black">
            <FaFileImport className="icon" />
            <span>Import as JSON</span>
          </div>
        </label>
      </div>
    </section>
  );
}
