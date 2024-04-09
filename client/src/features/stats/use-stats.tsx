import { useQuery } from "react-query";

import { APIResponseSuccess, Stats } from "../../types";
import { API_ROOT_URL } from "../../config/env";
import { APIError } from "../../utils";

async function getStats(excludedTracks: number[]) {
  const excluded =
    excludedTracks.length > 0
      ? `?excluded=${excludedTracks.join("&excluded=")}`
      : "";
  const [yearsRes, genresRes] = await Promise.all([
    fetch(`${API_ROOT_URL}/stats/years${excluded}`),
    fetch(`${API_ROOT_URL}/stats/genres${excluded}`),
  ]);

  if (!yearsRes.ok) throw new APIError(await yearsRes.json());
  if (!genresRes.ok) throw new APIError(await genresRes.json());

  const [genres, years] = (await Promise.all([
    genresRes.json(),
    yearsRes.json(),
  ])) as [APIResponseSuccess<Stats[]>, APIResponseSuccess<Stats[]>];

  return { genres: genres.results, years: years.results };
}

export function useStats(excludedTracks: number[]) {
  const statsQuery = useQuery({
    queryKey: ["stats", excludedTracks],
    queryFn: () => getStats(excludedTracks),
  });

  return statsQuery;
}
