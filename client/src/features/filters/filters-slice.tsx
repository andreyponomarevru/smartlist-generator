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
      action: RTK.PayloadAction<{ formId: string; inputs: FilterFormValues }>,
    ) => {
      return { ...state, [action.payload.formId]: action.payload.inputs };
    },
    destroyFilter: (state, action: RTK.PayloadAction<{ formId: string }>) => {
      delete state[action.payload.formId];
    },
    updateFilter: (
      state,
      action: RTK.PayloadAction<{ formId: string; inputs: FilterFormValues }>,
    ) => {
      state[action.payload.formId] = action.payload.inputs;
    },
    importFilters: (state, action: RTK.PayloadAction<FiltersState>) => {
      return { ...state, ...action.payload };
    },
  },
});
export const { saveFilter, destroyFilter, updateFilter, importFilters } =
  filtersSlice.actions;

export function selectFilters(state: RootState) {
  return state.filters;
}

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

//,  importFilters

startAppListening({
  matcher: RTK.isAnyOf(saveFilter, updateFilter, destroyFilter, importFilters),
  effect: (action, listenerApi) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(listenerApi.getState().filters),
    );
  },
});

export const filtersReducer = filtersSlice.reducer;
