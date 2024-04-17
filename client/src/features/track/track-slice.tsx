import { apiSplitSlice } from "../../features/api";

import { buildSearchQuery, isAPIErrorType } from "../../utils";
import { FilterFormValues, TrackMeta, APIResponseSuccess } from "../../types";
import { LOCAL_MUSIC_LIB_DIR, MUSIC_LIB_DIR } from "../../config/env";
import { replaceTempTrack } from "../playlist/temp-playlist-slice"; // remove tehe word "temp" from this

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
        return rawResult.results.map((track) => {
          return {
            ...track,
            filePath: (LOCAL_MUSIC_LIB_DIR + track.filePath).replace(
              MUSIC_LIB_DIR,
              "",
            ),
          };
        });
      },
    }),

    replaceTrack: builder.query<
      null,
      {
        trackId: number;
        formValues: FilterFormValues;
        excludedTracks: number[];
      }
    >({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          const queryArgs = {
            excludedTracks: arg.excludedTracks,
            formValues: arg.formValues,
          };

          const track: TrackMeta[] = await api
            .dispatch(extendedAPIslice.endpoints.findTrack.initiate(queryArgs))
            .unwrap();

          api.dispatch(
            replaceTempTrack({ trackId: arg.trackId, newTrack: track[0] }),
          );
          console.log("*** REACHED ***");
          return { data: null };
        } catch (error) {
          return isAPIErrorType(error)
            ? { error: { status: error.status, data: error.message } }
            : { error: { status: 400, data: error } };
        }
      },
    }),
  }),
});

export const { useLazyFindTrackQuery, useLazyReplaceTrackQuery } =
  extendedAPIslice;
