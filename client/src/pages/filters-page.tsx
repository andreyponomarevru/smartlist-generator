import React from "react";
import { FaDownload, FaFileImport } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { useAppSelector } from "../hooks/redux-ts-helpers";
import {
  selectFilters,
  destroyFilter,
  updateFilter,
  thunkImportFilters,
} from "../features/filters/";
import { SavedFilter } from "../features/filters/saved-filter/saved-filter-component";
import { exportSavedFiltersToJSON } from "../utils";
import { CreateFilterForm } from "../features/create-filter-form";

import {
  CREATE_FILTER_FORM_ID,
  EDIT_FILTER_FORM_ID,
} from "../config/constants";
import { FilterFormValues } from "../types";

import "./filters-page.scss";

export function FiltersPage() {
  const savedFilters = useAppSelector(selectFilters);

  const [showCreateFilter, setShowCreateFilter] = React.useState(false);
  const [editableFilter, setEditableFilter] = React.useState<null | {
    filterId: string;
    isEditable: boolean;
  }>(null);

  const savedFiltersList = Object.entries(savedFilters).map(
    ([id, inputs]: [string, FilterFormValues]) => {
      if (editableFilter && editableFilter.filterId === id) {
        return (
          <CreateFilterForm
            key={id}
            formId={EDIT_FILTER_FORM_ID}
            savedFormId={id}
            className="filters-page__create-filter-form"
            defaultValues={inputs}
            onEditingCancel={() => setEditableFilter(null)}
          />
        );
      }

      return (
        <SavedFilter
          key={id}
          filter={savedFilters[`${id}`]}
          onEdit={() => setEditableFilter({ filterId: id, isEditable: true })}
          onDestroy={() => destroyFilter({ formId: id })}
          onRename={() => updateFilter({ formId: id, inputs })}
        />
      );
    },
  );

  return (
    <div className="filters-page">
      <header className="header1">Saved Filters</header>

      <div className="filters-page__btns-group">
        <label htmlFor="importsavedfilters">
          <input
            id="importsavedfilters"
            type="file"
            onChange={(e) => thunkImportFilters(e)}
            multiple
            hidden
          />
          <div className="btn btn_type_secondary">
            <FaFileImport className="icon" />
            Import Filters from JSON
          </div>
        </label>
        <button
          type="button"
          className="btn btn_type_primary"
          onClick={() => setShowCreateFilter(true)}
          disabled={showCreateFilter}
        >
          <IoMdAddCircle className="icon" />
          Create a New Filter
        </button>
      </div>

      <div></div>

      {showCreateFilter && (
        <CreateFilterForm
          formId={CREATE_FILTER_FORM_ID}
          onEditingCancel={() => setShowCreateFilter(false)}
        />
      )}

      <div className="filters-page__saved-list">{savedFiltersList}</div>

      <div className="filters-page__controls">
        <span></span>
        <button
          type="button"
          onClick={() => exportSavedFiltersToJSON(savedFilters)}
          className="btn btn_type_secondary"
          disabled={Object.keys(savedFilters).length === 0}
        >
          <FaDownload className="icon" />
          Export All As JSON
        </button>
      </div>
    </div>
  );
}
