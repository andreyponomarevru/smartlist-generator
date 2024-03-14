import { useMutation } from "react-query";

import { API_ROOT_URL } from "../../config/env";
import { GetTrackIdsByFilePaths } from "../../types";

async function getTracksByFilePaths(
  filePaths: string[],
): Promise<GetTrackIdsByFilePaths["results"]> {
  const response = await fetch(`${API_ROOT_URL}/tracks/searches`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ filePaths }),
  });

  if (!response.ok) {
    throw new Error(`Failed finding track ids. Response: ${response}`);
  }

  const parsedRes: GetTrackIdsByFilePaths = await response.json();
  return parsedRes.results;
}

export function useTracksSearch() {
  const mutation = useMutation({
    mutationFn: (filePaths: string[]) => getTracksByFilePaths(filePaths),
    onError: (err) => console.log("[react-query error handler]", err),
  });
  return mutation;
}
