import { APIError, ParsedResponse } from "../types";

async function handleResponseErr(err: Response): Promise<APIError | Error> {
  const contentType = err.headers.get("content-type");

  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json: APIError = await err.json();
    return json;
  } else {
    const parsedErr = new Error(`${err.status} — ${err.statusText}`);
    return parsedErr;
  }
}

async function parseResponse<T>(
  response: Response
): Promise<ParsedResponse<T>> {
  const contentType = response.headers.get("content-type");

  console.log("[parseResponse] ", response);

  if (contentType && contentType.indexOf("application/json") !== -1) {
    if (response.ok) {
      return { body: await response.json(), status: response.status };
    } else {
      throw response;
    }
  } else {
    if (response.ok) {
      return { body: null, status: response.status };
    } else {
      throw response;
    }
  }
}

export { handleResponseErr, parseResponse };
