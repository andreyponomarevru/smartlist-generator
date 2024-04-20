import * as RTK from "@reduxjs/toolkit";

import type { RootState } from "../../../app/store";
import { FilterFormValues } from "../../../types";
import { startAppListening } from "../../../app/listener-middleware";

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
