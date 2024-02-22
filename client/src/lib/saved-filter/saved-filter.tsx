import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { FormValues } from "../../types";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  filtersGroup: FormValues;
  handleDelete: () => void;
}

export function SavedFilter(props: SavedFilterProps) {
  return (
    <div className="saved-filter">
      <span className="saved-filter__name">{props.name}</span>
      <div className="saved-filter__operator">
        {props.filtersGroup.operator.value.toUpperCase()}
      </div>
      <div className="saved-filter__body">
        {props.filtersGroup.filters.map((f) => {
          return (
            <div key={JSON.stringify(f)} className="saved-filter__row">
              <span>{f.name.label}</span>
              <span>{f.condition?.label}</span>
              <span>
                {Array.isArray(f.value) ? (
                  f.value.map((v) => v.label).join(", ")
                ) : (
                  <span>{f.value?.label}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <button className="saved-filter__delete-btn" onClick={props.handleDelete}>
        <FaRegTrashAlt className="icon" />
      </button>
    </div>
  );
}
