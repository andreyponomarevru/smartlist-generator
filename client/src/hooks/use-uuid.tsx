import React from "react";
import { v4 as uuidv4 } from "uuid";

export function useUUID(arrayLength: number, deps: React.DependencyList = []) {
  const ids: string[] = [];
  for (let i = 0; i < arrayLength; i++) {
    ids.push(uuidv4());
  }

  return React.useMemo(() => ids, deps);
}
