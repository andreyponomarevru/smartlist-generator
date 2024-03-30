import React from "react";

import { FilterFormValues } from "../types";
import { readFileAsString } from "../utils";

export type State = Record<string, FilterFormValues>;

type Action =
  | { type: "SAVE"; payload: { formId: string; inputs: FilterFormValues } }
  | { type: "DELETE"; payload: { formId: string } }
  | { type: "UPDATE"; payload: { formId: string; inputs: FilterFormValues } }
  | { type: "IMPORT"; payload: State };

function savedFiltersReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SAVE": {
      return { ...state, [`${action.payload.formId}`]: action.payload.inputs };
    }
    case "DELETE": {
      const { [`${action.payload.formId}`]: _, ...filters } = state;
      return filters;
    }
    case "UPDATE": {
      return { ...state, [`${action.payload.formId}`]: action.payload.inputs };
    }
    case "IMPORT": {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

function useSavedFilters() {
  const initialState: State = {};

  function getInitialState() {
    const saved = localStorage.getItem("filters");
    return saved !== null ? JSON.parse(saved) : initialState;
  }

  const [state, dispatch] = React.useReducer(
    savedFiltersReducer,
    initialState,
    getInitialState,
  );

  React.useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(state));
  }, [state]);

  function save(formId: string, inputs: FilterFormValues) {
    dispatch({ type: "SAVE", payload: { formId, inputs } });
  }

  function destroy(formId: string) {
    dispatch({ type: "DELETE", payload: { formId } });
  }

  function rename(formId: string, inputs: FilterFormValues) {
    dispatch({ type: "UPDATE", payload: { formId, inputs } });
  }

  async function importAsJSON(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !(e.target.files.length > 0)) {
      throw new Error("No file(s)");
    }

    const files = Array.from(e.target.files);
    const isValidExtension = files.every((file) => {
      return file.name.split(".").pop()?.toLowerCase() === "json";
    });
    if (!isValidExtension) {
      throw new Error("Only JSON files are allowed.");
    }

    const stringifiedFiles = await Promise.all(files.map(readFileAsString));
    let importedFilters: State = {};
    stringifiedFiles.forEach((str) => {
      const state: State = JSON.parse(str);
      importedFilters = { ...importedFilters, ...state };
    });
    dispatch({ type: "IMPORT", payload: importedFilters });
  }

  return {
    state,
    handleSave: save,
    handleDestroy: destroy,
    handleRename: rename,
    handleImportAsJSON: importAsJSON,
  };
}

type Context = ReturnType<typeof useSavedFilters>;

const SavedFiltersContext = React.createContext<Context>({
  state: {},
  handleSave: () => {},
  handleDestroy: () => {},
  handleRename: () => {},
  handleImportAsJSON: async () => {},
});

function SavedFiltersProvider({ children }: { children: React.ReactNode }) {
  const savedFilters = useSavedFilters();
  return (
    <SavedFiltersContext.Provider value={savedFilters}>
      {children}
    </SavedFiltersContext.Provider>
  );
}

function SavedFiltersConsumer(): Context {
  return React.useContext(SavedFiltersContext);
}

export { SavedFiltersProvider, SavedFiltersConsumer as useSavedFilters };
