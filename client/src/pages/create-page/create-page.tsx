import React from "react";

import { Header } from "../../lib/header/header1";
import { NewFiltersForm } from "./create-filter-form/create-filter-form";
import { SavedFiltersProvider } from "../../hooks/use-saved-filters";

export function CreatePage() {
  return (
    <div className="create-page">
      <Header>Create a New Filter</Header>
      <SavedFiltersProvider>
        <NewFiltersForm />
      </SavedFiltersProvider>
    </div>
  );
}
