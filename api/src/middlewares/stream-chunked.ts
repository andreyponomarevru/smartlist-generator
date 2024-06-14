import fs from "fs";
import { NextFunction, Request, Response } from "express";

// Function implements streaming the file starting from any time point the
// client requests.
export async function streamChunked<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  if (
    !res.locals.trackFilePath ||
    typeof res.locals.trackFilePath !== "string"
  ) {
    next(new Error("res.locals.trackFilePath is required"));
    return;
  }

  let stat: fs.Stats;
  try {
    // TODO: cache `stat` variable to avoid I/O operation on each rewiding the
    // client does in player (write `getFileStat()` function)
    stat = await fs.promises.stat(res.locals.trackFilePath);
    // fs.stats returns an object providing information about the file.
  } catch (err) {
    next(err);
    return;
  }

  // Set chunk size to 1 MB
  // (1 MB is 1024 kilobytes, or 1048576 (1024 * 1024) bytes)
  let chunkSize = 1024 * 1024;
  // If the file size is bigger than 2 MB
  if (stat.size > chunkSize * 2) {
    // Give it back in 1/4 chunks
    chunkSize = Math.ceil(stat.size * 0.25);
  }

  // TODO rename this var to "requestedRange"
  const range = req.headers.range
    ? req.headers.range.replace(/bytes=/, "").split("-")
    : [];
  const rrange: number[] = [];
  rrange[0] = range[0] ? parseInt(range[0], 10) : 0;
  rrange[1] = range[1] ? parseInt(range[1], 10) : rrange[0] + chunkSize;
  // If the requested _end_ range is equal or bigger than the
  // file size - set the end range to "file size (in bytes) - 1"
  // Details: https://stackoverflow.com/questions/39697023/http-range-request-for-last-byte
  if (rrange[1] > stat.size - 1) rrange[1] = stat.size - 1;

  const newRange = { start: rrange[0], end: rrange[1] };

  const readStream = fs.createReadStream(res.locals.trackFilePath, newRange);
  res.writeHead(206, {
    "cache-control": "no-cache, no-store, must-revalidate",
    pragma: "no-cache",
    expires: "0",
    "content-type": "audio/mpeg",
    "accept-ranges": "bytes",
    "content-range": `bytes ${newRange.start}-${newRange.end}/${stat.size}`,
    // '+ 1' is explained in link above. In short, we need +/-1 cause the
    // range is zero based)
    "content-length": `${newRange.end - newRange.start + 1}`,
  });
  readStream.pipe(res);
}
