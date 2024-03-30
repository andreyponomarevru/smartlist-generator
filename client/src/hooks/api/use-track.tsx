import { useMutation } from "react-query";

import { TrackMeta, SearchQuery, APIResponseSuccess } from "../../types";
import { LOCAL_MUSIC_LIB_DIR, API_ROOT_URL } from "../../config/env";
import { APIError } from "../../utils";

async function findTrack(reqBody: SearchQuery) {
  const response = await fetch(`${API_ROOT_URL}/tracks/search`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(reqBody),
  });

  if (!response.ok) throw new APIError(await response.json());

  const { results } = (await response.json()) as APIResponseSuccess<
    TrackMeta[]
  >;

  return results.map((track) => {
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
