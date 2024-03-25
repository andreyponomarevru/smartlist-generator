import { Request, Response, NextFunction } from "express";

import * as trackModel from "../../model/track/queries";
import { streamChunked } from "../../utils/stream-audio";
import { HttpError } from "../../utils/error";
import { SearchParams } from "../../utils/query-builder";
/*
function emitSSE(res: Response, data: string, id: string) {
  res.write(`data: ${JSON.stringify(data)}\nid: ${id}\n\n`);
  // flush the headers to establish SSE connection  with client
  res.flushHeaders();
}

export function handleSSE(req: Request, res: Response) {
  res.writeHead(200, {
    "cache-control": "no-cache",
    "content-type": "text/event-stream",
    "access-control-allow-origin": "*",
    connection: "keep-alive",
  });

  const messageId = new Date().toLocaleTimeString();

  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;
    if (counter >= 5) {
      clearInterval(intervalId);
      res.end(); // terminates SSE session
      return;
    }
    emitSSE(res, JSON.stringify({ newData: "some data" + counter }), messageId);
  }, 1000);

  // If client closes connection, stop sending events
  res.on("close", () => {
    console.log("Client closed connection");
    clearInterval(intervalId);
    res.end();
  });
  res.on("error", (err) => {
    console.log("[SSE error]", err);
    clearInterval(intervalId);
    res.end();
  });
}*/

export async function streamTrack(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const trackFilePath = await trackModel.findFilePathById(req.params.id);
    if (!trackFilePath) throw new HttpError({ code: 404 });
    await streamChunked(req, res, trackFilePath);
  } catch (err) {
    next(err);
  }
}

export async function findTrack(
  req: Request<unknown, unknown, SearchParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const searchParams = req.body;
    res.json({ results: await trackModel.find(searchParams) });
  } catch (err) {
    next(err);
  }
}

export async function getTrackIdsByFilePaths(
  req: Request<unknown, unknown, { filePaths: string[] }>,
  res: Response<{ results: { trackId: number; filePath: string }[] }>,
  next: NextFunction,
) {
  try {
    const { filePaths } = req.body;
    res.json({ results: await trackModel.findIdsByFilePaths(filePaths) });
  } catch (err) {
    next(err);
  }
}
