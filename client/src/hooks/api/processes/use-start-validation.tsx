import { useMutation } from "react-query";

import { Process, ValidationQuery } from "../../../types";
import { API_ROOT_URL } from "../../../config/env";

async function startValidation(reqBody: ValidationQuery): Promise<Process> {
  const response = await fetch(`${API_ROOT_URL}/processes/validation`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(reqBody),
  });

  if (!response.ok) {
    throw new Error(
      `Failed starting validation process. Response: ${response}`,
    );
  }

  const parsedRes: { results: Process } = await response.json();

  return parsedRes.results;
}

export function useStartValidationProcess() {
  const mutation = useMutation({
    mutationFn: (reqBody: ValidationQuery) => startValidation(reqBody),
    onError: (err) => console.log("[react-query error handler]", err),
  });
  return mutation;
}
