import React from "react";

import { ProcessName } from "../types";

export function useSSE<T>(url: string, eventName: ProcessName) {
  const [sseData, setSSEdata] = React.useState<T | null>(null);

  React.useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.addEventListener("message", (event) => {
      console.log("[SSE] message", event.data);
    });
    eventSource.addEventListener("open", () => {
      console.log(
        `[SSE] open (Connection for the event type '${eventName}' is opened)`,
      );
    });
    eventSource.addEventListener("error", (err) => {
      console.error("[SSE] error", err);
      eventSource.close();
    });
    eventSource.addEventListener(eventName, (event: MessageEvent<string>) => {
      setSSEdata(JSON.parse(event.data));
    });

    // To prevent the error "The connection to (url) was interrupted while the page was loading"
    window.addEventListener("beforeunload", () => {
      if (eventSource !== null) eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return [sseData, setSSEdata] as const;
}
