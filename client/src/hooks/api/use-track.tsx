import { useMutation } from "react-query";

import { TrackMeta, GetTrackRes, SearchQuery } from "../../types";
import { LOCAL_MUSIC_LIB_DIR, API_ROOT_URL } from "../../config/env";

async function findTrack(reqBody: SearchQuery): Promise<TrackMeta[]> {
  const response = await fetch(`${API_ROOT_URL}/tracks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(reqBody),
  });

  if (!response.ok) {
    throw new Error(`Failed finding a track. Response: ${response}`);
  }

  const parsedRes: GetTrackRes = await response.json();

  return parsedRes.results.map((track) => {
    return {
      ...track,
      filePath: (LOCAL_MUSIC_LIB_DIR + track.filePath).replace("/tracks", ""),
    };
  });
}

export function useTrack() {
  const mutation = useMutation({
    mutationFn: (reqBody: SearchQuery) => findTrack(reqBody),
  });
  return mutation;
}
