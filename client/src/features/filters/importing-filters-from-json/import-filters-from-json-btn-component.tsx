import React from "react";
import { FaFileImport } from "react-icons/fa";

import { useAppDispatch } from "../../../hooks/redux-ts-helpers";
import { thunkImportFilters } from "./import-filters-from-json-slice";
import { Message } from "../../ui/message";
import { UploadFileBtn } from "../../ui/upload-file-btn";

export function ImportFiltersFromJSONBtn() {
  const dispatch = useAppDispatch();
  const [importError, setImportError] = React.useState<string>("");

  async function handleImportFilters(e: React.ChangeEvent<HTMLInputElement>) {
    if (importError) setImportError("");

    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("No file(s)");
      }
      await dispatch(thunkImportFilters(e.target.files));
    } catch (err) {
      if (err instanceof Error) setImportError(err.message);
      setTimeout(() => setImportError(""), 1000);
    }
  }

  if (importError) return <Message type="danger">{importError}</Message>;

  return (
    <UploadFileBtn
      id="importsavedfilters"
      onClick={() => setImportError("")}
      onChange={handleImportFilters}
      multiple={true}
      className="btn_type_secondary"
    >
      <FaFileImport className="icon" />
      Import Filters from JSON
    </UploadFileBtn>
  );
}
