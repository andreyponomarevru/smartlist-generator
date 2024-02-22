import { useQuery } from "react-query";

import { GetStatsRes } from "../../types";
import { API_ROOT_URL } from "../../config/env";

async function getStats(
  excludedTracks: number[]
): Promise<{ genres: GetStatsRes; years: GetStatsRes }> {
  const excluded =
    excludedTracks.length > 0
      ? `?excluded=${excludedTracks.join("&excluded=")}`
      : "";
  const [yearsResponse, genresResponse] = await Promise.all([
    fetch(`${API_ROOT_URL}/lib/stats/years${excluded}`),
    fetch(`${API_ROOT_URL}/lib/stats/genres${excluded}`),
  ]);

  if (!yearsResponse.ok || !genresResponse.ok) {
    throw new Error(
      `Failed to fetch stats. Years response: ${yearsResponse}, Genres res: ${genresResponse}`
    );
  }

  const genres = await genresResponse.json();
  const years = await yearsResponse.json();
  return { genres, years };
}

export function useStats(excludedTracks: number[]) {
  const statsQuery = useQuery({
    queryKey: ["stats", excludedTracks],
    queryFn: () => getStats(excludedTracks),
  });

  return statsQuery;
}
