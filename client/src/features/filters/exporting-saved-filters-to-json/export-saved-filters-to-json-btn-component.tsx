import React from "react";
import { FaDownload } from "react-icons/fa";

import { FiltersState } from "../filters";
import { Btn } from "../../ui/btn";

interface Props {
  savedFilters: FiltersState;
}

export function ExportSavedFiltersToJSONBtn(props: Props) {
  function exportFilters(filters: FiltersState) {
    const link = document.createElement("a");
    link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(filters, null, 2),
    )}`;
    link.download = "filters-backup.json";
    link.click();
  }

  return (
    <Btn
      onClick={() => exportFilters(props.savedFilters)}
      isDisabled={Object.keys(props.savedFilters).length === 0}
      className="btn_type_secondary"
    >
      <FaDownload className="icon" />
      Export All As JSON
    </Btn>
  );
}
