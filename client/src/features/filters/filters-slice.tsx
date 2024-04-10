import * as RTK from "@reduxjs/toolkit";

import type { AppThunk, RootState } from "../../app/store";
import { FilterFormValues } from "../../types";
import { readFileAsString } from "../../utils";
import { startAppListening } from "../../app/listener-middleware";

export interface FiltersState {
  [key: string]: FilterFormValues;
}

export const LOCAL_STORAGE_KEY = "filters";

const initialState: FiltersState = (() => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved !== null ? JSON.parse(saved) : {};
})();

export const filtersSlice = RTK.createSlice({
  name: "filters",
  initialState,
  reducers: {
    saveFilter: (
      state,
      action: RTK.PayloadAction<{ filterId: string; inputs: FilterFormValues }>,
    ) => {
      return { ...state, [action.payload.filterId]: action.payload.inputs };
    },
    destroyFilter: (state, action: RTK.PayloadAction<{ filterId: string }>) => {
      delete state[action.payload.filterId];
    },
    importFilters: (state, action: RTK.PayloadAction<FiltersState>) => {
      return { ...state, ...action.payload };
    },
  },
});
export const { saveFilter, destroyFilter, importFilters } =
  filtersSlice.actions;

// Selectors

export function selectFilters(state: RootState) {
  return state.filters;
}

export function selectFilterById(state: RootState, filterId: string) {
  return state.filters[filterId];
}

// Thunks

export function thunkImportFilters(
  e: React.ChangeEvent<HTMLInputElement>,
): AppThunk {
  return async function (dispatch, getState) {
    try {
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
      let importedFilters: FiltersState = {};
      stringifiedFiles.forEach((str) => {
        const state: FiltersState = JSON.parse(str);
        importedFilters = { ...importedFilters, ...state };
      });

      dispatch(importFilters(importedFilters));
    } catch (err) {
      console.log(err);
    }
  };
}

// Middlewares

startAppListening({
  matcher: RTK.isAnyOf(saveFilter, destroyFilter, importFilters),
  effect: (action, listenerApi) => {
    console.log("LOCAL STORAGE THUNK", listenerApi.getState());
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(listenerApi.getState().filters),
    );
  },
});

export const filtersReducer = filtersSlice.reducer;
