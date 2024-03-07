import React from "react";

import { Header } from "../../lib/header/header1";
import { CreateFilterForm } from "../../lib/create-filter-form/create-filter-form";
import { SavedFiltersProvider } from "../../hooks/use-saved-filters";
import { CREATE_FILTER_FORM_ID } from "../../config/constants";

export function CreatePage() {
  return (
    <div className="create-page">
      <Header>Create a New Filter</Header>
      <SavedFiltersProvider>
        <CreateFilterForm formId={CREATE_FILTER_FORM_ID} />
      </SavedFiltersProvider>
    </div>
  );
}
