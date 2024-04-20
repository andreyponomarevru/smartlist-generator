import * as RTK from "@reduxjs/toolkit";

import { NODE_ENV } from "../config/env";
import { filtersReducer } from "../features/filters/filters";
import { listenerMiddleware } from "../app/listener-middleware";
import { playlistReducer } from "../features/playlist/playlist/playlist-slice";
import { excludedTracksReducer } from "../features/excluded-tracks/excluded-tracks-slice";
import { apiSplitSlice } from "../features/api/api-slice";

export const store = RTK.configureStore({
  reducer: {
    filters: filtersReducer,
    excludedTracks: excludedTracksReducer,
    playlist: playlistReducer,
    [apiSplitSlice.reducerPath]: apiSplitSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().prepend(
      listenerMiddleware.middleware,
      apiSplitSlice.middleware,
    );
  },
  devTools: NODE_ENV !== "production",
});

// Typescript helpers for typing
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type AppThunk<ReturnType = void> = RTK.ThunkAction<
  ReturnType,
  RootState,
  unknown,
  RTK.UnknownAction
>;
