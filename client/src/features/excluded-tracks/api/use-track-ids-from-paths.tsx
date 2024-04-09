import { useMutation } from "react-query";

import { API_ROOT_URL } from "../../../config/env";
import { APIResponseSuccess } from "../../../types";
import { APIError } from "../../../utils";

async function getTrackIdsByFilePaths(filePaths: string[]) {
  const response = await fetch(`${API_ROOT_URL}/tracks/ids`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ filePaths }),
  });

  if (!response.ok) throw new APIError(await response.json());

  const { results } = (await response.json()) as APIResponseSuccess<
    { trackId: number; filePath: string }[]
  >;
  return results;
}

export function useTrackIdsFromPaths() {
  const mutation = useMutation({
    mutationFn: (filePaths: string[]) => getTrackIdsByFilePaths(filePaths),
  });
  return mutation;
}
