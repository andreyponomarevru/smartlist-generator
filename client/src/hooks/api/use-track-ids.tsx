import { useMutation } from "react-query";

import { API_ROOT_URL } from "../../config/env";
import { FindTrackIdsRes } from "../../types";

async function getTrackIds(filePaths: string[]): Promise<number[]> {
  const response = await fetch(`${API_ROOT_URL}/tracks/ids`, {
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

  const parsedRes: FindTrackIdsRes = await response.json();

  return parsedRes.results;
}

export function useTrackIds() {
  const mutation = useMutation({
    mutationFn: (filePaths: string[]) => getTrackIds(filePaths),
  });
  return mutation;
}
