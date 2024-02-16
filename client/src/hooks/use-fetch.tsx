import React, { useEffect } from "react";

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

function dataFetchReducer<T>(state: State<T>, action: Action<T>): State<T> {
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
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useFetch<ResponseBody>() {
  const initialState: State<ResponseBody> = {
    isLoading: false,
    error: null,
    response: null,
  };

  const [state, dispatch] = React.useReducer<
    React.Reducer<State<ResponseBody>, Action<ResponseBody>>
  >(dataFetchReducer, initialState);

  function resetState() {
    dispatch({ type: "RESET_STATE" });
  }

  //

  let abortController: AbortController | undefined;
  let res: Response | undefined;

  async function fetchNow(url: RequestInfo, request?: RequestInit) {
    abortController = new AbortController();
    const signal = abortController.signal;

    dispatch({ type: "FETCH_INIT" });
    console.log("[useFetch] Dispatched 'FETCH_INIT'");

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
      // was unmounted), then stop executing the function:
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
  }

  useEffect(() => {
    return () => abortController && abortController.abort();
  }, []);

  return { state, resetState, fetchNow };
}
