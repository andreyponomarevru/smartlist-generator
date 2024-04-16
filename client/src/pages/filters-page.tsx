import React from "react";
import { FaDownload, FaFileImport } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { useAppSelector, useAppDispatch } from "../hooks/redux-ts-helpers";
import { selectFilters, thunkImportFilters } from "../features/filters/";
import { Filter } from "../features/filters/filter/filter-component";
import { EditFilterForm } from "../features/edit-filter-form";
import { EDIT_FILTER_FORM_ID } from "../features/edit-filter-form";
import { FilterFormValues } from "../types";
import { FiltersState } from "../features/filters";
import { Message } from "../features/ui/message";

import "./filters-page.scss";

function exportSavedFiltersToJSON(filters: FiltersState) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(filters, null, 2),
  )}`;
  link.download = "filters-backup.json";
  link.click();
}

export function FiltersPage() {
  const dispatch = useAppDispatch();
  const savedFilters = useAppSelector(selectFilters);
  const [showCreateFilterForm, setShowCreateFilterForm] = React.useState(false);
  const [importError, setImportError] = React.useState<string>("");

  async function handleImportFilters(e: React.ChangeEvent<HTMLInputElement>) {
    if (importError) setImportError("");
    try {
      await dispatch(thunkImportFilters(e));
    } catch (err) {
      if (err instanceof Error) setImportError(err.message);
      setTimeout(() => setImportError(""), 1000);
    }
  }

  return (
    <div className="filters-page">
      <header className="header1">Saved Filters</header>

      <div className="filters-page__btns-group">
        <label htmlFor="importsavedfilters">
          <input
            id="importsavedfilters"
            type="file"
            onChange={handleImportFilters}
            onClick={() => setImportError("")}
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
          onClick={() => setShowCreateFilterForm(true)}
          disabled={showCreateFilterForm}
        >
          <IoMdAddCircle className="icon" />
          Create a New Filter
        </button>
      </div>

      <div></div>

      {importError && <Message type="danger">{importError}</Message>}

      {showCreateFilterForm && (
        <EditFilterForm
          filterId={EDIT_FILTER_FORM_ID}
          onCancelClick={() => setShowCreateFilterForm(false)}
        />
      )}

      <div className="filters-page__saved-list">
        {Object.entries(savedFilters).map(
          ([id]: [string, FilterFormValues]) => (
            <Filter key={id} filterId={id} />
          ),
        )}
      </div>

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
