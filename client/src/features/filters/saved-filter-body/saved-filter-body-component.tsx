import React from "react";

import { FilterFormValues } from "../../../types";

import "./saved-filter-body.scss";

interface SavedFilterBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  filter: FilterFormValues;
}

export function SavedFilterBody(props: SavedFilterBodyProps) {
  const filters = props.filter.filters.map((f, index) => {
    return (
      <li
        key={index + f.name.value + (f.condition ? f.condition.value : "")}
        className="saved-filter-body__row"
      >
        <span className="saved-filter-body__col1">{f.name.label}</span>
        <span className="saved-filter-body__col2">{f.condition?.label}</span>
        <span className="saved-filter-body__col3">
          {Array.isArray(f.value) ? (
            f.value.map((v, index) => (
              <span key={v.label + index} className="saved-filter-body__genre">
                {v.label}
              </span>
            ))
          ) : (
            <span>{f.value?.label}</span>
          )}
        </span>
      </li>
    );
  });

  return (
    <div className={`saved-filter-body ${props.className || ""}`}>
      <ul className="saved-filter-body__details-list">
        <div className="saved-filter__operator">
          Match
          <span className="saved-filter-body__operator-name">
            {props.filter.operator.label}
          </span>
          of the following rules:
        </div>
        {filters}
      </ul>
    </div>
  );
}
