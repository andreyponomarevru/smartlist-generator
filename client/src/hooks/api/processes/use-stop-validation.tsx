import { useMutation } from "react-query";

import { APIError } from "../../../types";
import { API_ROOT_URL } from "../../../config/env";

async function stopValidation(): Promise<void | APIError> {
  const response = await fetch(`${API_ROOT_URL}/processes/validation`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return (await response.json()) as APIError;
  }
}

export function useStopValidationProcess() {
  const mutation = useMutation({
    mutationFn: () => stopValidation(),
    onError: (err) => console.log("[react-query error handler]", err),
  });
  return mutation;
}
