export * from "./query-builder";

import path from "path";
import fs from "fs/promises";

import { SUPPORTED_CODEC } from "../config/env";

export function wrapResponse<T>(data: T) {
  return { results: data };
}

export function logDBError(msg: string, originalErr: unknown) {
  if (originalErr instanceof Error) {
    console.error(
      process.env.NODE_ENV === "development"
        ? `${msg} - ${originalErr.stack}`
        : "",
    );
  } else {
    console.error(`${msg} - ${originalErr}`);
  }
}

export async function isFileExist(path: string) {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

export async function traverseDirs(
  dirpath: string,
  callback: (nodePath: string) => Promise<void>,
) {
  const fileSystemNodes = await fs.readdir(dirpath);

  for (const fileSystemNode of fileSystemNodes) {
    const nodeFullPath = path.join(dirpath, fileSystemNode);
    const nodeStats = await fs.stat(nodeFullPath);

    if (nodeStats.isDirectory()) {
      await traverseDirs(nodeFullPath, callback);
    } else if (SUPPORTED_CODEC.includes(getExtensionName(nodeFullPath))) {
      try {
        await callback(nodeFullPath);
      } catch (err) {
        if (err instanceof Error) {
          console.error(
            `[Error. Skip file ${nodeFullPath}] ${err}, ${err.stack}`,
          );
        } else {
          console.error(err);
        }
      }
    }
  }
}

export function getExtensionName(nodePath: string): string {
  if (nodePath === "") throw new Error("Can't be an empty string");

  return path.extname(nodePath).slice(1).toLowerCase();
}

export class HttpError extends Error {
  status: number;
  message: string;
  moreInfo: string;

  constructor({
    code,
    message,
    moreInfo = "https://github.com/ponomarevandrey/",
  }: {
    code: number;
    message: string;
    moreInfo?: string;
  }) {
    super();

    this.status = code;
    this.message = message;
    this.moreInfo = moreInfo;
  }
}

export function parseID3V2Array(arr: string[] = []): string[] {
  return arr.length > 0
    ? [...new Set(arr.filter((str) => str.trim()).map((str) => str.trim()))]
    : [];
}
