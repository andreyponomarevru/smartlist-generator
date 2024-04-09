import { useMutation } from "react-query";

import { API_ROOT_URL } from "../../../config/env";
import { APIError } from "../../../utils";

async function stopValidation() {
  const response = await fetch(`${API_ROOT_URL}/processes/validation`, {
    method: "DELETE",
  });

  if (!response.ok) throw new APIError(await response.json());
}

export function useStopValidationProcess() {
  const mutation = useMutation({ mutationFn: () => stopValidation() });
  return mutation;
}
