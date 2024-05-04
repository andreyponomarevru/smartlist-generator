import React from "react";
import { FaArrowDown, FaArrowUp, FaRegTrashAlt } from "react-icons/fa";
import { GrCircleInformation } from "react-icons/gr";

import { useAppDispatch } from "../../../../hooks/redux-ts-helpers";
import { FilterFormValues } from "../../../../types";
import { Modal, useModal } from "../../../ui/modal";
import { FilterDetails } from "../../../filters/filters";
import { reorderGroup, destroyGroup } from "../playlist-slice";
import { Btn } from "../../../ui/btn";

import "./group-controls.scss";

export function GroupControls(props: {
  groupName: string;
  details: FilterFormValues;
  groupIndex: number;
  groupId: string;
}) {
  const { setState: setModalState } = useModal();

  const dispatch = useAppDispatch();

  return (
    <div
      className="group-controls"
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <Btn
        onClick={() => setModalState({ isVisible: true })}
        className="btn_type_icon btn_hover_grey-20"
      >
        <GrCircleInformation className="icon" />
      </Btn>
      <Modal title={props.groupName}>
        <FilterDetails filter={props.details} />
      </Modal>

      <Btn
        onClick={() => dispatch(destroyGroup({ groupId: props.groupId }))}
        className="btn_type_icon btn_hover_grey-20"
      >
        <FaRegTrashAlt className="icon" />
      </Btn>

      <Btn
        onClick={() =>
          dispatch(reorderGroup({ index: props.groupIndex, direction: "UP" }))
        }
        className="btn_type_icon btn_hover_grey-20 group__sort-btn"
      >
        <FaArrowUp className="icon" />
      </Btn>

      <Btn
        onClick={() => {
          dispatch(
            reorderGroup({ index: props.groupIndex, direction: "DOWN" }),
          );
        }}
        className="btn_type_icon btn_hover_grey-20 group__sort-btn"
      >
        <FaArrowDown className="icon" />
      </Btn>
    </div>
  );
}
