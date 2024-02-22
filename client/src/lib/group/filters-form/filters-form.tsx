import React from "react";
import {
  Controller,
  UseFormHandleSubmit,
  Control,
  UseFormResetField,
  UseFormRegister,
  UseFieldArrayRemove,
  UseFieldArrayInsert,
  UseFormSetValue,
} from "react-hook-form";
import Select from "react-select";
import { FaPlus, FaMinus } from "react-icons/fa";

import { FormValues, OptionsList } from "../../../types";
import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
} from "../../../config/constants";
import { ConditionSelect } from "./condition-select";
import { YearValueSelect } from "./year-value-select";
import { GenreValueSelect } from "./genre-value-select";
import { defaultValues } from "../../../config/constants";

import "./filters-form.scss";

interface FiltersFormProps extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
  handleSubmit: UseFormHandleSubmit<FormValues, undefined>;
  onGetTrack: (groupId: number, formValues: FormValues) => void;
  control: Control<FormValues, any>;
  resetField: UseFormResetField<FormValues>;
  register: UseFormRegister<FormValues>;
  fields: Record<"id", string>[];
  remove: UseFieldArrayRemove;
  insert: UseFieldArrayInsert<FormValues, "filters">;
  setValue: UseFormSetValue<FormValues>;
  stats: {
    years: OptionsList<number>[];
    genres: OptionsList<number>[];
  };
}

function FiltersForm(props: FiltersFormProps) {
  function onSubmit(groupId: number, formValues: FormValues) {
    props.onGetTrack(groupId, formValues);
  }

  return (
    <form
      noValidate
      onSubmit={props.handleSubmit((e) => onSubmit(props.groupId, e))}
      id={`filter-form-${props.groupId}`}
      className={`filters-form ${props.className || ""}`}
    >
      <div className="filters-form__row">
        <label htmlFor={`filter-form-${props.groupId}`}>Match</label>

        <Controller
          name="operator"
          control={props.control}
          render={({ field }) => (
            <Select
              {...field}
              options={OPERATORS}
              defaultValue={defaultValues.operator}
            />
          )}
        />
        <div>of the following rules:</div>
      </div>

      {props.fields.map((filter, index) => {
        return (
          <div
            key={filter.id}
            className="filters-form__row filters-form__row_filter"
          >
            <div className="filters-form__row-controls">
              <Controller
                name={`filters.${index}.name`}
                control={props.control}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      options={FILTER_NAMES}
                      defaultValue={defaultValues.filters[0].name}
                    />
                  );
                }}
              />
              <ConditionSelect
                name="genre"
                control={props.control}
                index={index}
                resetField={props.resetField}
                options={GENRE_CONDITIONS}
                defaultValue={GENRE_CONDITIONS[1]}
              />
              <ConditionSelect
                name="year"
                control={props.control}
                index={index}
                resetField={props.resetField}
                options={YEAR_CONDITIONS}
                defaultValue={YEAR_CONDITIONS[0]}
              />
              <GenreValueSelect
                name="genre"
                control={props.control}
                index={index}
                resetField={props.resetField}
                options={props.stats.genres}
              />
              <YearValueSelect
                name="year"
                control={props.control}
                index={index}
                resetField={props.resetField}
                options={props.stats.years}
              />
            </div>

            <div className="filters-form__btns">
              <button
                disabled={props.fields.length === 1}
                type="button"
                onClick={() => props.remove(index)}
                className="btn btn_theme_transparent-black filters-form__btn"
              >
                <FaMinus />
              </button>
              <button
                type="button"
                onClick={() => {
                  props.insert(index + 1, defaultValues.filters);
                }}
                className="btn btn_theme_transparent-black filters-form__btn"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        );
      })}

      <button
        name="a"
        type="submit"
        form={`filter-form-${props.groupId}`}
        disabled={false}
        className="btn btn_theme_black filters-form__find-track-btn"
      >
        Find a track
      </button>
    </form>
  );
}

// When we add multiple rows of filters, they are stored in an array which is then rendered. When you delete a filter - you delete an item from this array, hence all filters in array are rerendered which causes older filters to reset to default values. Using React.memo allows us to prevent rerendering of array items when one of array items gets deleted.
// https://stackoverflow.com/a/67954696/13156302
const FiltersFormMemoized = React.memo(FiltersForm);

export { FiltersFormMemoized };
