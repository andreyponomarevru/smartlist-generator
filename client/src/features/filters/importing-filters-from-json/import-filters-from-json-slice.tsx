import type { AppThunk } from "../../../app/store";
import { parseFileToStrings } from "../../../utils";
import { importFilters, FiltersState } from "../filters";

//
// Middlewares
//

// Thunks

export function thunkImportFilters(fileList: FileList): AppThunk {
  return async function (dispatch, getState) {
    try {
      const files = Array.from(fileList);
      const isValidExtension = files.every((file) => {
        return file.name.split(".").pop()?.toLowerCase() === "json";
      });
      if (!isValidExtension) {
        throw new Error("Only JSON files are allowed.");
      }

      const stringifiedFiles = (
        await Promise.all(files.map(parseFileToStrings))
      ).flat();
      let importedFilters: FiltersState = {};
      stringifiedFiles.forEach((str) => {
        const newFilter: FiltersState = JSON.parse(str);
        importedFilters = { ...importedFilters, ...newFilter };
      });

      dispatch(importFilters(importedFilters));
    } catch (err) {
      // Rethrow to make available in UI layer
      throw err;
    }
  };
}
