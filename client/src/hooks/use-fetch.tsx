import React from "react";

import { parseResponse } from "../utils/api";
import { handleResponseErr } from "../utils/api";
import { APIResponse } from "../types";

type Action<T> =
  | { type: "FETCH_INIT" }
  | {
      type: "FETCH_SUCCESS";
      payload: APIResponse<T>["response"];
    }
  | {
      type: "FETCH_FAILURE";
      error: APIResponse<T>["error"];
    }
  | { type: "RESET_STATE" };
type State<T> = APIResponse<T>;

// We need this wrapping function only to pass the data type to the reducer
function createDataFetchReducer<T>() {
  // This is is the actual reducer function
  return function (state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
      case "FETCH_INIT": {
        return { ...state, isLoading: true, error: null };
      }
      case "FETCH_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          error: null,
          response: action.payload,
        };
      }
      case "FETCH_FAILURE": {
        return { ...state, isLoading: false, error: action.error };
      }
      case "RESET_STATE": {
        return { isLoading: false, error: null, response: null };
      }
      default: {
        throw new Error(`Unknown action`);
      }
    }
  };
}

function useFetch<ResponseBody>(url: RequestInfo, request?: RequestInit) {
  const initialState: State<ResponseBody> = {
    isLoading: false,
    error: null,
    response: null,
  };

  const dataFetchReducer = createDataFetchReducer<ResponseBody>();

  const [state, dispatch] = React.useReducer(dataFetchReducer, initialState);

  function resetState() {
    dispatch({ type: "RESET_STATE" });
  }

  //

  let res: Response;

  React.useEffect(() => {
    dispatch({ type: "FETCH_INIT" });
    console.log("[useFetch] Dispatched 'FETCH_INIT'");

    const abortController = new AbortController();
    const signal = abortController.signal;

    (async function performFetching() {
      try {
        res = await fetch(url, { ...request, signal });
      } catch {
        // if component is not unmounted
        if (!signal.aborted) {
          dispatch({
            type: "FETCH_FAILURE",
            error: new Error(
              "Something went wrong. Please check your connection."
            ),
          });
          console.log(`[useFetch] — ${url} — Dispatched 'FETCH_FAILURE'`);
        }
        // If the request was aborted by the cleanup function (i.e. component
        // was unmounted), then stop executing function:
        return;
      }

      try {
        const resBody = await parseResponse<ResponseBody>(res);
        console.log(`[useFetch] — ${url} — Response body:`, resBody);

        // if component is not unmounted
        if (!signal.aborted) {
          dispatch({ type: "FETCH_SUCCESS", payload: resBody });
          console.log(`[useFetch] — ${url} — Dispatched 'FETCH_SUCCESS'`);
        }
      } catch (err) {
        // if component is not unmounted
        if (!signal.aborted) {
          const parsedErr = await handleResponseErr(err as Response);
          dispatch({
            type: "FETCH_FAILURE",
            error: parsedErr,
          });
          console.log(`[useFetch] — ${url} — Dispatched 'FETCH_FAILURE'`);
        }
      }
    })();

    // Return the cleanup function
    return () => {
      // Cancel the fetch request when the component unmounts
      abortController.abort();
    };
    // empty array means "run 'useEffect' only once, after the initial render"
  }, [url]);

  return { state: state as APIResponse<ResponseBody>, resetState };
}

export { useFetch /*, useFetchNow*/ };
