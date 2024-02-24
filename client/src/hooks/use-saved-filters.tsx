import React from "react";

import { FilterFormValues } from "../types";

export type Filter = { id: string; name: string; settings: FilterFormValues };

type State = {
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
  | { type: "RENAME"; payload: { id: string; newName: string } };

function savedFiltersReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SAVE": {
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
      console.log("*** RENAME ***", action.payload.newName);
      return {
        ...state,
        names: {
          ...state.names,
          [`${action.payload.id}`]: action.payload.newName,
        },
      };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useSavedFilters() {
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

  return {
    state,
    handleSave: save,
    handleDestroy: destroy,
    handleRename: rename,
  };
}
