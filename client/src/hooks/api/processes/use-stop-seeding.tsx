import { useMutation } from "react-query";

import { APIError } from "../../../utils";
import { API_ROOT_URL } from "../../../config/env";

async function stopSeeding() {
  const response = await fetch(`${API_ROOT_URL}/processes/seeding`, {
    method: "DELETE",
  });

  if (!response.ok) throw new APIError(await response.json());
}

export function useStopSeedingProcess() {
  const mutation = useMutation({ mutationFn: () => stopSeeding() });
  return mutation;
}
