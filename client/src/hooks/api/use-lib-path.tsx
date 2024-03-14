import React from "react";

import { useLocalStorage } from "../use-local-storage";
import { LibPathInput } from "../../types";

export function useLibPath(): [
  LibPathInput,
  React.Dispatch<React.SetStateAction<LibPathInput>>,
] {
  const [libPath, setLibpath] = useLocalStorage<LibPathInput>("libPath", {
    libPath: "",
  });

  return [libPath, setLibpath];
}
