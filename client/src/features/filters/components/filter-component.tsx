import React from "react";

import { FilterDetails } from "./filter-details/filter-details-component";
import { FilterHeader } from "./filter-header/filter-header-component";
import { useAppSelector } from "../../../hooks/redux-ts-helpers";
import { selectFilterById } from "../filters-slice";
import { EditFilterForm } from "../../edit-filter-form";
import { destroyFilter } from "../filters-slice";
import { useAppDispatch } from "../../../hooks/redux-ts-helpers";

import "./filter.scss";

interface FilterProps extends React.HTMLAttributes<HTMLDivElement> {
  filterId: string;
}

export function Filter(props: FilterProps) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) =>
    selectFilterById(state, props.filterId),
  );

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [showEditFilterForm, setShowEditFilterForm] = React.useState(false);

  if (showEditFilterForm) {
    return (
      <EditFilterForm
        key={props.filterId}
        filterId={props.filterId}
        defaultValues={filter}
        onCancelClick={() => setShowEditFilterForm(false)}
      />
    );
  } else {
    return (
      <div className="filter">
        <FilterHeader
          name={filter.name}
          isOpen={isFilterOpen}
          onOpenClick={() => setIsFilterOpen((prev) => !prev)}
          onEditClick={() => setShowEditFilterForm(true)}
          onDestroyClick={() => dispatch(destroyFilter({ id: props.filterId }))}
        />
        {isFilterOpen && (
          <FilterDetails
            className="filter__filter-details"
            filterId={props.filterId}
          />
        )}
      </div>
    );
  }
}
