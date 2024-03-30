import path from "path";
import fs from "fs-extra";

import { SUPPORTED_CODEC } from "../config/env";

export function logDBError(msg: string, err: unknown) {
  if (err instanceof Error) {
    console.error(
      `${__filename}: ${msg}\n${
        process.env.NODE_ENV === "development" ? err.stack : ""
      }`,
    );
  } else {
    console.error(err);
  }
}

export async function traverseDirs(
  dirpath: string,
  callback: (nodePath: string) => Promise<void>,
) {
  const fileSystemNodes = await fs.readdir(dirpath);

  for (const fileSystemNode of fileSystemNodes) {
    const nodePath = path.join(dirpath, fileSystemNode);
    const nodeStats = await fs.stat(nodePath);

    if (nodeStats.isDirectory()) {
      await traverseDirs(nodePath, callback);
    } else if (SUPPORTED_CODEC.includes(getExtensionName(nodePath))) {
      try {
        await callback(nodePath);
      } catch (err) {
        if (err instanceof Error) {
          console.error(`[Error. Skip file ${nodePath}] ${err}, ${err.stack}`);
        }
      }
    }
  }
}

export function hyphenToUpperCase(str: string): string {
  function format(match: string, offset: number, string: string) {
    return offset > 0 ? string[offset + 1].toUpperCase() : "";
  }
  return str.replace(/-[a-z0-9]{0,1}/g, format);
}

export function getExtensionName(nodePath: string): string {
  return path.extname(nodePath).slice(1).toLowerCase();
}

export function parseFilterIDs(arr: unknown): number[] | null {
  if (Array.isArray(arr)) return arr.map((id) => parseInt(id));
  else return null;
}

export function filterByExtension(filepath: string) {
  return new RegExp(`\\.(${SUPPORTED_CODEC.join("|")})$`).test(
    filepath.toLowerCase(),
  );
}
