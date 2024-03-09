import React from "react";
import { FaRegTrashAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";

import { MdModeEdit } from "react-icons/md";
import { FilterFormValues } from "../../../types";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  filterId: string;
  filter: FilterFormValues;
  onEdit: () => void;
  onDestroy: () => void;
  onRename: (id: string, inputs: FilterFormValues) => void;
}

export function SavedFilter(props: SavedFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="saved-filter">
      <header
        className="saved-filter__header"
        onClick={() => setIsOpen((prev) => !prev)}
        role="presentation"
      >
        <span>{props.name}</span>
        <div className="saved-filter__toggle-btn">
          {isOpen ? (
            <FaChevronUp className="icon" />
          ) : (
            <FaChevronDown className="icon" />
          )}
        </div>
        <div className="saved-filter__btns">
          <button
            className="saved-filter__btn"
            onClick={(e) => {
              e.stopPropagation();
              props.onEdit();
            }}
          >
            <MdModeEdit className="icon" style={{ fill: "white" }} />
          </button>
          <button
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

      {isOpen && (
        <div className="saved-filter__body">
          <ul className="saved-filter__details-list">
            <div className="saved-filter__operator">
              Match
              <span className="saved-filter__operator-name">
                {props.filter.operator.label}
              </span>
              of the following rules:
            </div>
            {props.filter.filters.map((f, index) => {
              return (
                <li
                  key={
                    index +
                    f.name.value +
                    (f.condition ? f.condition.value : "")
                  }
                  className="saved-filter__row"
                >
                  <span className="saved-filter__col1">{f.name.label}</span>
                  <span className="saved-filter__col2">
                    {f.condition?.label}
                  </span>
                  <span className="saved-filter__col3">
                    {Array.isArray(f.value) ? (
                      f.value.map((v, index) => (
                        <span
                          key={v.label + index}
                          className="saved-filter__genre"
                        >
                          {v.label}
                        </span>
                      ))
                    ) : (
                      <span>{f.value?.label}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
