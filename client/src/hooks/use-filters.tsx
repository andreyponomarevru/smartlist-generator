import React from "react";

import { FormValues } from "../types";
import { useLocalStorage } from "./use-local-storage";

export type Filter = { id: string; name: string; settings: FormValues };

type State = {
  ids: string[];
  names: Record<string, string>;
  settings: Record<string, FormValues>;
};

type Action =
  | {
      type: "SAVE";
      payload: { id: string; name: string; settings: FormValues };
    }
  | { type: "DELETE"; payload: { id: string } };

function filtersReducer(state: State, action: Action): State {
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
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useFilters() {
  const initialState: State = {
    ids: [],
    names: {},
    settings: {},
  };

  function getInitialState() {
    const saved = localStorage.getItem("filters");
    return saved !== null ? JSON.parse(saved) : initialState;
  }

  const [state, dispatch] = React.useReducer(
    filtersReducer,
    initialState,
    getInitialState
  );

  function saveFilter({ id, name, settings }: Filter) {
    dispatch({ type: "SAVE", payload: { id, name, settings } });
  }

  function deleteFilter(id: string) {
    dispatch({ type: "DELETE", payload: { id } });
  }

  React.useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(state));
  }, [state]);

  return {
    state,
    save: saveFilter,
    delete: deleteFilter,
  };
}
