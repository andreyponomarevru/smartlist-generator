import * as RTK from "@reduxjs/toolkit";

import { NODE_ENV } from "../config/env";
import { filtersReducer } from "../features/filters";
import { listenerMiddleware } from "../app/listener-middleware";

// Typescript helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type AppThunk<ReturnType = void> = RTK.ThunkAction<
  ReturnType,
  RootState,
  unknown,
  RTK.UnknownAction
>;

export const store = RTK.configureStore({
  reducer: {
    filters: filtersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  devTools: NODE_ENV !== "production",
});
