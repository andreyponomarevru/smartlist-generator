import React from "react";
import {
  Controller,
  FieldArrayWithId,
  useFormContext,
  UseFieldArrayRemove,
  UseFieldArrayInsert,
} from "react-hook-form";
import Select from "react-select";
import { FaMinus, FaPlus } from "react-icons/fa";

import { FilterFormValues, Stats } from "../../../../types";
import { createSingleSelectStyles } from "./react-select-styles";
import { ConditionSelect } from "./condition-select-component";
import { useAppSelector } from "../../../../hooks/redux-ts-helpers";
import { useGetStatsQuery } from "../../../stats";
import {
  FILTER_NAMES,
  DEFAULT_FILTER_VALUES,
  FILTER_CONDITIONS,
} from "../constants";
import { selectExcludedTracksIds } from "../../../excluded-tracks";

function parseToOptionsList(stats: Stats) {
  return {
    genre: [...stats.genres]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name })),
    year: [...stats.years]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) })),
  };
}

interface Props {
  field: FieldArrayWithId<FilterFormValues, "filters", "id">;
  fieldsCount: number;
  index: number;
  remove: UseFieldArrayRemove;
  insert: UseFieldArrayInsert<FilterFormValues, "filters">;
}

export function Field(props: Props) {
  const form = useFormContext<FilterFormValues>();
  const watchedFilters = form.watch();

  const excludedTrackIds = useAppSelector(selectExcludedTracksIds);
  const stats = useGetStatsQuery(excludedTrackIds);

  const isFilterNameChanged = Boolean(
    form.formState.dirtyFields.filters &&
      form.formState.dirtyFields.filters[props.index] &&
      form.formState.dirtyFields.filters[props.index].name,
  );

  function handleInsertField() {
    props.insert(props.index + 1, [DEFAULT_FILTER_VALUES.filters[0]]);
    // Prevent reseting previous/following fields to empty inputs
    form.reset(form.getValues());
  }

  function handleRemoveField() {
    props.remove(props.index);
    // Prevent reseting previous/following fields to empty inputs
    form.reset(form.getValues());
  }

  return (
    <div
      key={props.field.id}
      className="edit-filter-form__row edit-filter-form__addable-row"
    >
      <div className="edit-filter-form__select-boxes">
        <Controller
          name={`filters.${props.index}.name`}
          control={form.control}
          render={({ field }) => {
            return (
              <Select
                {...field}
                options={Object.values(FILTER_NAMES)}
                styles={createSingleSelectStyles()}
              />
            );
          }}
        />
        <ConditionSelect
          name={watchedFilters.filters[props.index].name.value}
          control={form.control}
          index={props.index}
          resetField={form.resetField}
          isDirty={isFilterNameChanged}
          conditionOptionsList={Object.values(
            FILTER_CONDITIONS[watchedFilters.filters[props.index].name.value],
          )}
          valueOptionsList={stats.data ? parseToOptionsList(stats.data) : {}}
        />
      </div>
      <div></div>
      <div className="edit-filter-form__btns">
        <button
          disabled={props.fieldsCount === 1}
          type="button"
          onClick={handleRemoveField}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaMinus className="icon" />
        </button>
        <button
          type="button"
          onClick={handleInsertField}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaPlus className="icon" />
        </button>
      </div>
    </div>
  );
}
