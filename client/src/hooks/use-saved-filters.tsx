import React from "react";

import { FilterFormValues } from "../types";
import { readFileAsString } from "../utils/misc";

export type Filter = { id: string; name: string; settings: FilterFormValues };

export type State = {
  ids: string[];
  names: Record<string, string>;
  settings: Record<string, FilterFormValues>;
};

type Action =
  | {
      type: "SAVE";
      payload: { id: string; name: string; settings: FilterFormValues };
    }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "RENAME"; payload: { id: string; newName: string } }
  | { type: "RESET_TO_IMPORTED"; payload: State };

function savedFiltersReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SAVE": {
      // If the user haven't changed the form but clicks "Save" again - do nothing
      if (state.ids.includes(action.payload.id)) return state;

      return {
        ids: [...state.ids, action.payload.id],
        names: {
          ...state.names,
          [`${action.payload.id}`]: action.payload.name,
        },
        settings: {
          ...state.settings,
          [`${action.payload.id}`]: action.payload.settings,
        },
      };
    }
    case "DELETE": {
      const { [`${action.payload.id}`]: _, ...updatedNames } = state.names;
      const {
        [`${action.payload.id}`]: __,
        ...updatedSettings
      } = state.settings;

      return {
        ids: state.ids.filter((id) => id != action.payload.id),
        names: updatedNames,
        settings: updatedSettings,
      };
    }
    case "RENAME": {
      return {
        ...state,
        names: {
          ...state.names,
          [`${action.payload.id}`]: action.payload.newName,
        },
      };
    }
    case "RESET_TO_IMPORTED": {
      return action.payload;
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

function useSavedFilters() {
  const initialState: State = { ids: [], names: {}, settings: {} };

  function getInitialState() {
    const saved = localStorage.getItem("filters");
    return saved !== null ? JSON.parse(saved) : initialState;
  }

  const [state, dispatch] = React.useReducer(
    savedFiltersReducer,
    initialState,
    getInitialState
  );

  React.useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(state));
  }, [state]);

  function save({ id, name, settings }: Filter) {
    dispatch({ type: "SAVE", payload: { id, name, settings } });
  }

  function destroy(id: string) {
    dispatch({ type: "DELETE", payload: { id } });
  }

  function rename(id: string, newName: string) {
    dispatch({ type: "RENAME", payload: { id, newName } });
  }

  async function handleImportAsJSON(e: React.ChangeEvent<HTMLInputElement>) {
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
    const newState: State = { ids: [], names: {}, settings: {} };
    stringifiedFiles.forEach((str) => {
      const state: State = JSON.parse(str);
      newState.ids = [...newState.ids, ...state.ids];
      newState.names = { ...newState.names, ...state.names };
      newState.settings = { ...newState.settings, ...state.settings };
    });
    dispatch({ type: "RESET_TO_IMPORTED", payload: newState });
  }

  return {
    state,
    handleSave: save,
    handleDestroy: destroy,
    handleRename: rename,
    handleImportAsJSON,
  };
}

type Context = ReturnType<typeof useSavedFilters>;

const SavedFiltersContext = React.createContext<Context>({
  state: { ids: [], names: {}, settings: {} },
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
