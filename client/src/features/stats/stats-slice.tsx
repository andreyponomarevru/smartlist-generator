import { apiSplitSlice } from "../../features/api";
import { APIResponseSuccess, Stats } from "../../types";

//
// Endpoints
//

export const extendedAPIslice = apiSplitSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<Stats, number[]>({
      query: (excludedTracksIds = []) => {
        const excluded =
          excludedTracksIds.length > 0
            ? `?excluded=${excludedTracksIds.join("&excluded=")}`
            : "";
        return { url: `/stats${excluded}` };
      },
      transformResponse: (rawResult: APIResponseSuccess<Stats>, meta, arg) => {
        return rawResult.results;
      },
    }),
  }),
});

export const { useGetStatsQuery } = extendedAPIslice;
