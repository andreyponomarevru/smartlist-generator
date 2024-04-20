import * as RTK from "@reduxjs/toolkit";

import { apiSplitSlice } from "../api";
import { startAppListening } from "../../app/listener-middleware";
import { RootState } from "../../app/store";
import { APIResponseSuccess } from "../../types";
import { MUSIC_LIB_DIR, LOCAL_MUSIC_LIB_DIR } from "../../config/env";
import { isAPIErrorType } from "../../utils";

function extractFilePathsFromM3U(m3u: string[]) {
  const filePaths: { valid: string[]; invalid: string[] } = {
    valid: [],
    invalid: [],
  };

  for (let i = 0; i < m3u.length; i++) {
    const str = m3u[i];

    if (/#EXT/.test(str) || str === "") continue;
    if (!new RegExp(MUSIC_LIB_DIR).test(str)) {
      filePaths.invalid.push(str);
      continue;
    }

    const filePath = decodeURIComponent(str).replace(
      `file://${LOCAL_MUSIC_LIB_DIR}`,
      MUSIC_LIB_DIR,
    );
    filePaths.valid.push(filePath);
  }

  return filePaths;
}

export type ImportedTrack = { trackId: number; filePath: string };
export interface ExcludedTracksState {
  tracks: ImportedTrack[];
}

const LOCAL_STORAGE_KEY = "excludedTracks";

function getInitialState(localStorageKey: string): ExcludedTracksState {
  const saved = localStorage.getItem(localStorageKey);
  return {
    tracks: saved !== null ? (JSON.parse(saved) as ImportedTrack[]) : [],
  };
}

const initialState = getInitialState(LOCAL_STORAGE_KEY);

const excludedTracksSlice = RTK.createSlice({
  name: "excludedTracks",
  initialState,
  reducers: {
    clearExcludedTracks: (state) => {
      state.tracks = [];
    },
    addExcludedTracks: (state, action: RTK.PayloadAction<ImportedTrack[]>) => {
      const newTracks = action.payload.filter((track, index, self) => {
        return !state.tracks.some((t) => t.trackId === track.trackId);
      });
      state.tracks.push(...newTracks);
    },
  },
});
export const { clearExcludedTracks, addExcludedTracks } =
  excludedTracksSlice.actions;
export const excludedTracksReducer = excludedTracksSlice.reducer;

//
// Selectors
//

export function selectExcludedTracks(state: RootState) {
  return state.excludedTracks.tracks;
}

export const selectExcludedTracksIds = RTK.createSelector(
  selectExcludedTracks,
  (excludedTracks) => excludedTracks.map((track) => track.trackId),
);

//
// Middlewares
//

// Listeners

startAppListening({
  matcher: RTK.isAnyOf(clearExcludedTracks, addExcludedTracks),
  effect: (action, listenerApi) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(listenerApi.getState().excludedTracks.tracks),
    );
  },
});

//
// Endpoints
//

export const extendedAPIslice = apiSplitSlice.injectEndpoints({
  endpoints: (builder) => ({
    findTrackIdByFilePath: builder.query<ImportedTrack[], string[]>({
      query: (filePaths) => ({
        url: "/tracks/ids",
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filePaths: filePaths }),
      }),
      transformResponse: (rawResult: APIResponseSuccess<ImportedTrack[]>) => {
        return rawResult.results;
      },
    }),

    importExcludedTracksFromM3U: builder.query<
      { notFoundTracks: string[]; invalidPaths: string[] },
      string[]
    >({
      queryFn: async (
        mergedM3UContent,
        { signal, dispatch, getState },
        extraOptions,
        baseQuery,
      ) => {
        try {
          const { valid, invalid } = extractFilePathsFromM3U(mergedM3UContent);
          const tracksFoundInDB: ImportedTrack[] = await dispatch(
            extendedAPIslice.endpoints.findTrackIdByFilePath.initiate(valid),
          ).unwrap();

          dispatch(addExcludedTracks(tracksFoundInDB));

          return {
            data: {
              notFoundTracks: tracksFoundInDB
                .map((track) => track.filePath)
                .filter((foundPath) => !valid.includes(foundPath)),
              invalidPaths: invalid,
            },
          };
        } catch (error) {
          return isAPIErrorType(error)
            ? { error: { status: error.status, data: error.message } }
            : { error: { status: 400, data: error } };
        }
      },
    }),
  }),
});

export const {
  useLazyFindTrackIdByFilePathQuery,
  useLazyImportExcludedTracksFromM3UQuery,
} = extendedAPIslice;
