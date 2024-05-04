import React from "react";
import { FaRegTrashAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";

import "./filter-header.scss";

interface Props extends React.HTMLAttributes<HTMLElement> {
  name: string;
  isOpen: boolean;
  onOpenClick: () => void;
  onEditClick: () => void;
  onDestroyClick: () => void;
}

export function FilterHeader(props: Props) {
  return (
    <header
      className="filter-header"
      onClick={props.onOpenClick}
      role="presentation"
    >
      <span className="filter-header__name">{props.name}</span>
      <div className="filter-header__toggle-btn">
        {props.isOpen ? (
          <FaChevronUp className="icon" />
        ) : (
          <FaChevronDown className="icon" />
        )}
      </div>
      <div className="filter-header__btns">
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-70"
          onClick={(e) => {
            e.stopPropagation();
            props.onEditClick();
          }}
        >
          <MdModeEdit className="icon" style={{ fill: "white" }} />
        </button>
        <button
          type="button"
          className="filter-header__btn"
          onClick={(e) => {
            e.stopPropagation();
            props.onDestroyClick();
          }}
        >
          <FaRegTrashAlt className="icon" style={{ fill: "white" }} />
        </button>
      </div>
    </header>
  );
}
