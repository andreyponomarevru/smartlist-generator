import EventEmitter from "events";

import { Request, Response, NextFunction } from "express";

import { SSEname } from "../types";

export class SSE extends EventEmitter {
  #initialMessage: object;

  constructor(initial: object) {
    super();

    this.#initialMessage = initial;

    this.init = this.init.bind(this);
  }

  init(req: Request, res: Response, next: NextFunction) {
    let id = 0;
    res.writeHead(200, {
      "cache-control": "no-cache",
      "content-type": "text/event-stream",
      "access-control-allow-origin": "*",
      connection: "keep-alive",
    });

    const dataListener = (data: { data: unknown; event?: SSEname }) => {
      if (data.event) res.write(`event: ${data.event}\n`);
      res.write(`data: ${JSON.stringify(data.data)}\n`);
      res.write(`id: ${id}\n\n`);
      id++;
      res.flushHeaders();
    };
    this.on("data", dataListener);

    req.on("close", () => this.removeListener("data", dataListener));

    this.send(this.#initialMessage, "test");

    // If client closes connection, stop sending events
    res.on("close", () => {
      console.log("[close] Client closed the connection");
      res.end();
    });
    res.on("error", (err) => {
      console.log("[error]", err);
      res.end();
    });

    next();
  }

  send(data: object | null, event: SSEname) {
    console.log("[SSE middleware | send]", event, data);
    this.emit("data", { data, event });
  }
}
