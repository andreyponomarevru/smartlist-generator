import React from "react";

import { ProcessName } from "../../types";

export function useSSE<T>(url: string, eventName: ProcessName) {
  const [sseData, setSSEdata] = React.useState<T | null>(null);

  React.useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.addEventListener("message", (event) => {
      console.log("[SSE onmessage]", event.data);
    });
    eventSource.addEventListener("open", () => console.log("[SSE onopen]"));
    eventSource.addEventListener("error", (err) => {
      console.log("[SSE onerror]", err);
      eventSource.close();
    });
    eventSource.addEventListener(eventName, (event: MessageEvent<string>) => {
      setSSEdata(JSON.parse(event.data));
    });

    return () => eventSource.close();
  }, []);

  return [sseData, setSSEdata] as const;
}
