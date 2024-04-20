import React from "react";

import { FilterFormValues } from "../../../../types";

import "./filter-details.scss";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  filter: Omit<FilterFormValues, "name">;
}

export function FilterDetails(props: Props) {
  const filtersRows = props.filter.filters.map((f, index) => {
    return (
      <li
        key={index + f.name.value + (f.condition ? f.condition.value : "")}
        className="filter-details__row"
      >
        <span className="filter-details__col1">{f.name.label}</span>
        <span className="filter-details__col2">{f.condition?.label}</span>
        <span className="filter-details__col3">
          {Array.isArray(f.value) ? (
            f.value.map((v, index) => (
              <span key={v.label + index} className="filter-details__genre">
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
    <div className={`filter-details ${props.className || ""}`}>
      <ul className="filter-details__details-list">
        <div className="filter-details__operator">
          Match
          <span className="filter-details__operator-name">
            {props.filter.operator.label}
          </span>
          of the following rules:
        </div>
        {filtersRows}
      </ul>
    </div>
  );
}
