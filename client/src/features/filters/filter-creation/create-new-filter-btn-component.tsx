import React from "react";
import { IoMdAddCircle } from "react-icons/io";

import { Btn } from "../../../features/ui/btn";

export function CreateNewFilterBtn(props: {
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <Btn
      onClick={props.onClick}
      isDisabled={props.isDisabled}
      className="btn btn_type_primary"
    >
      <IoMdAddCircle className="icon" />
      Create a New Filter
    </Btn>
  );
}
