import React from "react";
import { FaDownload } from "react-icons/fa";

import { FiltersState } from "../filters";
import { Btn } from "../../ui/btn";
import { exportData } from "../../../utils";

export function ExportSavedFiltersToJSONBtn(props: { filters: FiltersState }) {
  return (
    <Btn
      onClick={() => exportData(props.filters, "saved-filters")}
      isDisabled={Object.keys(props.filters).length === 0}
      className="btn_type_secondary"
    >
      <FaDownload className="icon" />
      Export All As JSON
    </Btn>
  );
}
