import React from "react";

import { useAppSelector } from "../hooks/redux-ts-helpers";
import { selectFilters, Filter } from "../features/filters/filters";
import {
  EditFilterForm,
  EDIT_FILTER_FORM_ID,
} from "../features/filters/filter-editing";
import { FilterFormValues } from "../types";
import { ImportFiltersFromJSONBtn } from "../features/filters/importing-filters-from-json";
import { ExportSavedFiltersToJSONBtn } from "../features/filters/exporting-saved-filters-to-json";
import { CreateNewFilterBtn } from "../features/filters/filter-creation";

import "./filters-page.scss";

export function FiltersPage() {
  const savedFilters = useAppSelector(selectFilters);
  const [showCreateFilterForm, setShowCreateFilterForm] = React.useState(false);

  return (
    <div className="filters-page">
      <header className="header1">Saved Filters</header>

      <div className="filters-page__btns-group">
        <ImportFiltersFromJSONBtn />
        <CreateNewFilterBtn
          onClick={() => setShowCreateFilterForm(true)}
          isDisabled={showCreateFilterForm}
        />
      </div>

      <div></div>

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
        <ExportSavedFiltersToJSONBtn filters={savedFilters} />
      </div>
    </div>
  );
}
