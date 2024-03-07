import React from "react";
import { FaDownload, FaFileImport } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { useSavedFilters } from "../../hooks/use-saved-filters";
import { SavedFilter } from "./saved-filter/saved-filter";
import { exportSavedFiltersToJSON } from "../../utils/misc";
import { useGlobalState } from "../../hooks/use-global-state";
import { Header } from "../../lib/header/header1";
import { CreateFilterForm } from "../../lib/create-filter-form/create-filter-form";
import {
  CREATE_FILTER_FORM_ID,
  EDIT_FILTER_FORM_ID,
} from "../../config/constants";

import "./filters-page.scss";

export function FiltersPage() {
  const savedFilters = useSavedFilters();
  const { playlist } = useGlobalState();

  const [showCreateFilter, setShowCreateFilter] = React.useState(false);

  const [editableFilter, setEditableFilter] = React.useState<null | {
    filterId: string;
    isEditable: boolean;
  }>(null);

  return (
    <div className="filters-page">
      <Header>Saved Filters</Header>

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
          className="btn btn_type_secondary"
          onClick={() => setShowCreateFilter(true)}
        >
          <IoMdAddCircle className="icon" />
          <span>Create a New Filter</span>
        </button>
      </div>

      {showCreateFilter && (
        <CreateFilterForm
          formId={CREATE_FILTER_FORM_ID}
          handleCancel={() => setShowCreateFilter(false)}
        />
      )}

      <div className="filters-page__saved-list">
        {Object.entries(savedFilters.state).map(([id, inputs]) => {
          if (editableFilter && editableFilter.filterId === id) {
            return (
              <CreateFilterForm
                formId={EDIT_FILTER_FORM_ID}
                className="filters-page__create-filter-form"
                key={id}
                defaultValues={savedFilters.state[id]}
                handleCancel={() => setEditableFilter(null)}
              />
            );
          }

          return (
            <SavedFilter
              key={id}
              filterId={id}
              name={inputs.name}
              filter={savedFilters.state[`${id}`]}
              handleEdit={() =>
                setEditableFilter({ filterId: id, isEditable: true })
              }
              handleDestroy={() => savedFilters.handleDestroy(id)}
              handleRename={savedFilters.handleRename}
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
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
}
