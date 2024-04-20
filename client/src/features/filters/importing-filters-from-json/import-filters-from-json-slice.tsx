import type { AppThunk } from "../../../app/store";
import { parseFileToStrings } from "../../../utils";
import { importFilters, FiltersState } from "../filters";

//
// Middlewares
//

// Thunks

export function thunkImportFilters(
  e: React.ChangeEvent<HTMLInputElement>,
): AppThunk {
  return async function (dispatch, getState) {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("No file(s)");
      }

      const files = Array.from(e.target.files);
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
