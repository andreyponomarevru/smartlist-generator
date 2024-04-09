import { useMutation } from "react-query";

import { APIResponseSuccess, Process, ValidationQuery } from "../../../types";
import { API_ROOT_URL } from "../../../config/env";
import { APIError } from "../../../utils";

async function startValidation(reqBody: ValidationQuery) {
  const response = await fetch(`${API_ROOT_URL}/processes/validation`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(reqBody),
  });

  if (!response.ok) throw new APIError(await response.json());
  const { results } = (await response.json()) as APIResponseSuccess<Process>;

  return results;
}

export function useStartValidationProcess() {
  const mutation = useMutation({
    mutationFn: (reqBody: ValidationQuery) => startValidation(reqBody),
  });
  return mutation;
}
