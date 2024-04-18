import { apiSplitSlice } from ".";
import { Process, ProcessName, LibPathInput } from "../../types";
import { API_ROOT_URL } from "../../config/env";

//
// Endpoints
//

export type Message = Process;

export const extendedAPIslice = apiSplitSlice.injectEndpoints({
  endpoints: (builder) => ({
    streamSSEs: builder.query<Message[], ProcessName>({
      // The query is not relevant here as the data will be provided via
      // streaming updates. A queryFn returning an empty array is used, with
      // contents being populated via streaming updates below as they are
      // received.
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        processName,
        { updateCachedData, cacheEntryRemoved, cacheDataLoaded },
      ) {
        function handleMessage(event: MessageEvent<string>) {
          console.log("[SSE] Raw event data: ", event.data);
          // populate the array with messages as they are received from the SSE
          updateCachedData((draft) => {
            draft.push(JSON.parse(event.data));
          });
        }

        function handleOpen() {
          console.log(
            `[SSE] open (Connection for the event type "${processName}" is opened)`,
          );
        }

        function handleError(err: Event) {
          console.error("[SSE] error", err);
          eventSource.close();
        }

        function handleBeforeunload() {
          if (eventSource !== null) eventSource.close();
        }

        await cacheDataLoaded;

        const url = `${API_ROOT_URL}/processes/${processName}`;
        const eventSource = new EventSource(url);
        if (!eventSource) return;

        eventSource.addEventListener("message", (e) => console.log(e.data));
        eventSource.addEventListener("open", handleOpen);
        eventSource.addEventListener("error", handleError);
        eventSource.addEventListener(processName, handleMessage);

        window.addEventListener("beforeunload", handleBeforeunload);

        await cacheEntryRemoved;
        eventSource.close();
      },
    }),

    startProcess: builder.mutation<
      void,
      { processName: ProcessName } & LibPathInput
    >({
      query: (arg) => ({
        url: `/processes/${arg.processName}`,
        method: "POST",
        body: { libPath: arg.libPath },
      }),
    }),

    stopProcess: builder.mutation<void, { processName: ProcessName }>({
      query: (arg) => ({
        url: `/processes/${arg.processName}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useStreamSSEsQuery,
  useStartProcessMutation,
  useStopProcessMutation,
} = extendedAPIslice;
