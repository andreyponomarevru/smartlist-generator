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
  useForm,
  useFieldArray,
} from "react-hook-form";
import Select from "react-select";
import { FaPlus, FaMinus } from "react-icons/fa";

import { SubmitFormBtn } from "../submit-form-btn/submit-form-btn";
import { FilterFormValues, OptionsList, TrackMeta } from "../../../types";
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
import { Stats as StatsType } from "../../../types";
import { Filter } from "../../../hooks/use-saved-filters";
import { Playlist } from "../../playlist/playlist";
import { TrackToReorder, TrackToReplace } from "../../../hooks/use-playlist";

import "./filters-form.scss";

interface FiltersFormProps extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
  onGetTrack: (groupId: number, formValues: FilterFormValues) => void;
  years?: StatsType[];
  genres?: StatsType[];
  onFiltersChange: (groupId: number) => void;
  saveFilter: ({ id, name, settings }: Filter) => void;
  name: string;

  // Playlist props
  setPlayingIndex: ({
    groupId,
    index,
  }: {
    groupId: number;
    index: number;
  }) => void;
  tracks: Record<string, TrackMeta[]>;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: ({ groupId, trackId, formValues }: TrackToReplace) => void;
  onReorderTrack: ({ index, direction, groupId }: TrackToReorder) => void;
}

type Stats = {
  years: OptionsList<number>[];
  genres: OptionsList<number>[];
};

export function FiltersForm(props: FiltersFormProps) {
  const {
    formState,
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
  } = useForm<FilterFormValues>({
    defaultValues,
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
    if (!props.genres || !props.years) return;

    const genres: OptionsList<number>[] = [...props.genres]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name }));

    const years: OptionsList<number>[] = [...props.years]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

    setStats({ genres, years });
  }, [props.genres, props.years]);

  // Reset "filter constructor" mode's state on form update

  // If (form has been changed) reset all tracks
  const [isFiltersChanged, setIsFiltersChanged] = React.useState(false);
  React.useEffect(() => {
    if (formState.isDirty) {
      setIsFiltersChanged(true);
      props.onFiltersChange(props.groupId);
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
    props.onGetTrack(groupId, formValues);
  }

  return (
    <>
      <div className="group__tabs group__btns">
        <button
          className="btn btn_theme_transparent-black group__save-filter-btn"
          onClick={() => {
            props.saveFilter({
              id: JSON.stringify(watchedNewFilters),
              name: props.name,
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
                defaultValue={defaultValues.operator}
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
                        defaultValue={defaultValues.filters[0].name}
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
                    insert(index + 1, defaultValues.filters);
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
        tracks={props.tracks}
        groupId={props.groupId}
        setPlayingIndex={props.setPlayingIndex}
        onReorderTrack={props.onReorderTrack}
        onReplaceTrack={props.onReplaceTrack}
        onRemoveTrack={props.onRemoveTrack}
      />
    </>
  );
}
