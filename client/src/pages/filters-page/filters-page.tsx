import React from "react";
import { FaDownload, FaFileImport } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { useSavedFilters } from "../../hooks/use-saved-filters";
import { SavedFilter } from "./saved-filter/saved-filter";
import { exportSavedFiltersToJSON } from "../../utils/misc";
import { CreateFilterForm } from "../../lib/create-filter-form/create-filter-form";
import {
  CREATE_FILTER_FORM_ID,
  EDIT_FILTER_FORM_ID,
} from "../../config/constants";

import "./filters-page.scss";

export function FiltersPage() {
  const savedFilters = useSavedFilters();
  // const { playlist } = useGlobalState();

  const [showCreateFilter, setShowCreateFilter] = React.useState(false);

  const [editableFilter, setEditableFilter] = React.useState<null | {
    filterId: string;
    isEditable: boolean;
  }>(null);

  return (
    <div className="filters-page">
      <header className="header1">Saved Filters</header>

      <div className="filters-page__btns-group">
        <label htmlFor="importsavedfilters">
          <input
            id="importsavedfilters"
            type="file"
            onChange={savedFilters.handleImportAsJSON}
            multiple
            hidden
          />
          <div className="btn btn_type_secondary">
            <FaFileImport className="icon" />
            <span>Import Filters from JSON</span>
          </div>
        </label>
        <button
          className="btn btn_type_primary"
          onClick={() => setShowCreateFilter(true)}
          disabled={showCreateFilter}
        >
          <IoMdAddCircle className="icon" />
          <span>Create a New Filter</span>
        </button>
      </div>

      <div></div>

      {showCreateFilter && (
        <CreateFilterForm
          formId={CREATE_FILTER_FORM_ID}
          onEditingCancel={() => setShowCreateFilter(false)}
        />
      )}

      <div className="filters-page__saved-list">
        {Object.entries(savedFilters.state).map(([id, inputs]) => {
          if (editableFilter && editableFilter.filterId === id) {
            return (
              <CreateFilterForm
                key={id}
                formId={EDIT_FILTER_FORM_ID}
                savedFormId={id}
                className="filters-page__create-filter-form"
                defaultValues={savedFilters.state[id]}
                onEditingCancel={() => setEditableFilter(null)}
              />
            );
          }

          return (
            <SavedFilter
              key={id}
              filterId={id}
              name={inputs.name}
              filter={savedFilters.state[`${id}`]}
              onEdit={() =>
                setEditableFilter({ filterId: id, isEditable: true })
              }
              onDestroy={() => savedFilters.handleDestroy(id)}
              onRename={savedFilters.handleRename}
            />
          );
        })}
      </div>

      <div className="filters-page__controls">
        <span></span>
        <button
          onClick={() =>
            exportSavedFiltersToJSON("Playlist name", savedFilters.state)
          }
          className="btn btn_type_secondary"
          disabled={Object.keys(savedFilters).length === 0}
        >
          <FaDownload className="icon" />
          <span>Export All As JSON</span>
        </button>
      </div>
    </div>
  );
}
