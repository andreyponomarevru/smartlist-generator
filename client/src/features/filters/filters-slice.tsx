import * as RTK from "@reduxjs/toolkit";

import type { AppThunk, RootState } from "../../app/store";
import { FilterFormValues } from "../../types";
import { parseFileToStrings } from "../../utils";
import { startAppListening } from "../../app/listener-middleware";

export interface FiltersState {
  [key: string]: FilterFormValues;
}
type PayloadDestroyFilter = { id: string };
type PayloadUpdateFilter = { id: string; inputs: FilterFormValues };

export const LOCAL_STORAGE_KEY = "filters";

const initialState: FiltersState = (() => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved !== null ? JSON.parse(saved) : {};
})();

const filtersSlice = RTK.createSlice({
  name: "filters",
  initialState,
  reducers: {
    upsertFilter: {
      reducer: (
        state,
        action: RTK.PayloadAction<{ id: string; inputs: FilterFormValues }>,
      ) => {
        state[action.payload.id] = action.payload.inputs;
      },
      prepare: (payload: { id?: string; inputs: FilterFormValues }) => {
        if (payload.id) {
          return { payload: { id: payload.id, inputs: payload.inputs } };
        } else {
          return { payload: { id: RTK.nanoid(), inputs: payload.inputs } };
        }
      },
    },
    updateFilter: (state, action: RTK.PayloadAction<PayloadUpdateFilter>) => {
      state[action.payload.id] = action.payload.inputs;
    },
    destroyFilter: (state, action: RTK.PayloadAction<PayloadDestroyFilter>) => {
      delete state[action.payload.id];
    },
    importFilters: (state, action: RTK.PayloadAction<FiltersState>) => {
      return { ...state, ...action.payload };
    },
  },
});
export const { upsertFilter, destroyFilter, importFilters } =
  filtersSlice.actions;

//
// Selectors
//

export function selectFilters(state: RootState) {
  return state.filters;
}

export function selectFilterById(state: RootState, filterId: string) {
  return state.filters[filterId];
}

//
// Middlewares
//

// Thunks

export function thunkImportFilters(
  e: React.ChangeEvent<HTMLInputElement>,
): AppThunk {
  return async function (dispatch, getState) {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("No file(s)");
      }

      const files = Array.from(e.target.files);
      const isValidExtension = files.every((file) => {
        return file.name.split(".").pop()?.toLowerCase() === "json";
      });
      if (!isValidExtension) {
        throw new Error("Only JSON files are allowed.");
      }

      const stringifiedFiles = (
        await Promise.all(files.map(parseFileToStrings))
      ).flat();
      let importedFilters: FiltersState = {};
      stringifiedFiles.forEach((str) => {
        const newFilter: FiltersState = JSON.parse(str);
        importedFilters = { ...importedFilters, ...newFilter };
      });

      dispatch(importFilters(importedFilters));
    } catch (err) {
      // Rethrow to make available in UI layer
      throw err;
    }
  };
}

// Listeners

startAppListening({
  matcher: RTK.isAnyOf(upsertFilter, destroyFilter, importFilters),
  effect: (action, listenerApi) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(listenerApi.getState().filters),
    );
  },
});

export const filtersReducer = filtersSlice.reducer;
