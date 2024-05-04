import React from "react";

import { clearExcludedTracks } from "../excluded-tracks-slice";
import { useAppDispatch } from "../../../hooks/redux-ts-helpers";
import { Btn } from "../../ui/btn";

export function ClearExcludedTracksBtn(props: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();

  return (
    <Btn
      isDisabled={props.isDisabled}
      onClick={() => dispatch(clearExcludedTracks())}
      className="btn_type_danger"
    >
      Clear
    </Btn>
  );
}
