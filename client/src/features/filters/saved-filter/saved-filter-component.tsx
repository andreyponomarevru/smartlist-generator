import React from "react";
import { FaRegTrashAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";

import { MdModeEdit } from "react-icons/md";
import { FilterFormValues } from "../../../types";
import { SavedFilterBody } from "../saved-filter-body";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  filter: FilterFormValues;
  onEdit: () => void;
  onDestroy: () => void;
  onRename: (id: string, inputs: FilterFormValues) => void;
}

export function SavedFilter(props: SavedFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="saved-filter">
      <Header
        name={props.filter.name}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onEdit={props.onEdit}
        onDestroy={props.onDestroy}
      />
      {isOpen && (
        <SavedFilterBody
          className="saved-filter__saved-filter-body"
          filter={props.filter}
        />
      )}
    </div>
  );
}

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: () => void;
  onDestroy: () => void;
}

function Header(props: HeaderProps) {
  return (
    <header
      className="saved-filter__header"
      onClick={() => props.setIsOpen((prev) => !prev)}
      role="presentation"
    >
      <span className="saved-filter__filter-name">{props.name}</span>
      <div className="saved-filter__toggle-btn">
        {props.isOpen ? (
          <FaChevronUp className="icon" />
        ) : (
          <FaChevronDown className="icon" />
        )}
      </div>
      <div className="saved-filter__btns">
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-70"
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit();
          }}
        >
          <MdModeEdit className="icon" style={{ fill: "white" }} />
        </button>
        <button
          type="button"
          className="saved-filter__btn"
          onClick={(e) => {
            e.stopPropagation();
            props.onDestroy();
          }}
        >
          <FaRegTrashAlt className="icon" style={{ fill: "white" }} />
        </button>
      </div>
    </header>
  );
}
