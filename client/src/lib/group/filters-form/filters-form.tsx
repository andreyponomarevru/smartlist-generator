import React from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import Select from "react-select";
import { FaPlus, FaMinus } from "react-icons/fa";

import { SubmitFormBtn } from "../submit-form-btn/submit-form-btn";
import { FilterFormValues, OptionsList } from "../../../types";
import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
} from "../../../config/constants";
import { ConditionSelect } from "./condition-select";
import { YearValueSelect } from "./year-value-select";
import { GenreValueSelect } from "./genre-value-select";
import { Playlist } from "../../playlist/playlist";
import { useSavedFilters } from "../../../hooks/use-saved-filters";
import { useGlobalState } from "../../../hooks/use-global-state";

import "./filters-form.scss";

export const DEFAULT_FILTER_VALUES: FilterFormValues = {
  operator: OPERATORS[0],
  filters: [
    {
      name: FILTER_NAMES[1],
      condition: GENRE_CONDITIONS[0],
      value: [],
    },
  ],
};

interface FiltersFormProps extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
}

type Stats = {
  years: OptionsList<number>[];
  genres: OptionsList<number>[];
};

export function FiltersForm(props: FiltersFormProps) {
  const { playlist, statsQuery } = useGlobalState();
  const savedFilters = useSavedFilters();

  const {
    formState,
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
  } = useForm<FilterFormValues>({
    defaultValues: DEFAULT_FILTER_VALUES,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "filters",
  });
  const watchedNewFilters = watch();

  //

  const [stats, setStats] = React.useState<Stats>({ years: [], genres: [] });

  React.useEffect(() => {
    if (!statsQuery.data?.genres || !statsQuery.data?.years) return;

    const genres: OptionsList<number>[] = [...statsQuery.data.genres.results]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name }));

    const years: OptionsList<number>[] = [...statsQuery.data.years.results]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

    setStats({ genres, years });
  }, [statsQuery.data]);

  // Reset "filter constructor" mode's state on form update

  // If (form has been changed) reset all tracks
  const [isFiltersChanged, setIsFiltersChanged] = React.useState(false);
  React.useEffect(() => {
    if (formState.isDirty) {
      setIsFiltersChanged(true);
      playlist.handleResetTracks(props.groupId);
    } else {
      setIsFiltersChanged(false);
    }
  }, [formState]);

  React.useEffect(() => {
    if (isFiltersChanged) {
      reset(undefined, { keepValues: true, keepDirty: false });
    }
  }, [formState]);

  //

  function onSubmit(groupId: number, formValues: FilterFormValues) {
    playlist.handleAddTrack(groupId, formValues);
  }

  return (
    <>
      <div className="group__tabs group__btns">
        <button
          className="btn btn_theme_transparent-black group__save-filter-btn"
          onClick={() => {
            savedFilters.handleSave({
              id: JSON.stringify(watchedNewFilters),
              name: playlist.groupNames[`${props.groupId}`],
              settings: watchedNewFilters,
            });
          }}
        >
          Save filter
        </button>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit((e) => onSubmit(props.groupId, e))}
        id={`filter-form-${props.groupId}`}
        className={`filters-form ${props.className || ""}`}
      >
        <div className="filters-form__row">
          <label htmlFor={`filter-form-${props.groupId}`}>Match</label>
          <Controller
            name="operator"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={OPERATORS}
                defaultValue={DEFAULT_FILTER_VALUES.operator}
              />
            )}
          />
          <div>of the following rules:</div>
        </div>

        {fields.map((filter, index) => {
          return (
            <div
              key={filter.id}
              className="filters-form__row filters-form__row_filter"
            >
              <div className="filters-form__row-controls">
                <Controller
                  name={`filters.${index}.name`}
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        options={FILTER_NAMES}
                        defaultValue={DEFAULT_FILTER_VALUES.filters[0].name}
                      />
                    );
                  }}
                />
                <ConditionSelect
                  name="genre"
                  control={control}
                  index={index}
                  resetField={resetField}
                  options={GENRE_CONDITIONS}
                  defaultValue={GENRE_CONDITIONS[1]}
                />
                <ConditionSelect
                  name="year"
                  control={control}
                  index={index}
                  resetField={resetField}
                  options={YEAR_CONDITIONS}
                  defaultValue={YEAR_CONDITIONS[0]}
                />
                <GenreValueSelect
                  name="genre"
                  control={control}
                  index={index}
                  resetField={resetField}
                  options={stats.genres}
                />
                <YearValueSelect
                  name="year"
                  control={control}
                  index={index}
                  resetField={resetField}
                  options={stats.years}
                />
              </div>

              <div className="filters-form__btns">
                <button
                  disabled={fields.length === 1}
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn_theme_transparent-black filters-form__btn"
                >
                  <FaMinus />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insert(index + 1, DEFAULT_FILTER_VALUES.filters);
                  }}
                  className="btn btn_theme_transparent-black filters-form__btn"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          );
        })}
        <SubmitFormBtn
          groupId={props.groupId}
          className="filters-form__find-track-btn"
        />
      </form>
      <Playlist
        className="group__playlist"
        handleSubmit={handleSubmit}
        groupId={props.groupId}
      />
    </>
  );
}
