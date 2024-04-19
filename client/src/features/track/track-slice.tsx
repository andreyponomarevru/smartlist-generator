import { apiSplitSlice } from "../../features/api";

import { buildSearchQuery } from "../../utils";
import { FilterFormValues, TrackMeta, APIResponseSuccess } from "../../types";
import { LOCAL_MUSIC_LIB_DIR, MUSIC_LIB_DIR } from "../../config/env";

function parseTracksResponse(track: TrackMeta): TrackMeta {
  return {
    ...track,
    filePath: (LOCAL_MUSIC_LIB_DIR + track.filePath).replace(MUSIC_LIB_DIR, ""),
  };
}

export const extendedAPIslice = apiSplitSlice.injectEndpoints({
  endpoints: (builder) => ({
    findTrack: builder.query<
      TrackMeta[],
      { formValues: FilterFormValues; excludedTracks: number[] }
    >({
      query: (arg) => ({
        url: "/tracks/search",
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(
          buildSearchQuery(arg.formValues, arg.excludedTracks),
        ),
      }),
      transformResponse: (
        rawResult: APIResponseSuccess<TrackMeta[]>,
        meta,
        arg,
      ) => {
        return rawResult.results.map(parseTracksResponse);
      },
    }),
  }),
});

export const { useLazyFindTrackQuery } = extendedAPIslice;
