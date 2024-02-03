import React, { useState, useEffect } from "react";
import {
  useForm,
  UseFormRegister,
  FieldValues,
  useFieldArray,
  Control,
  useWatch,
  UseFormResetField,
  UseFormUnregister,
} from "react-hook-form";
import uniqWith from "lodash/uniqWith";
import mergeWith from "lodash/mergeWith";
import { Btn } from "../btn/btn";
import { Stats, FormValues, TrackMeta } from "../../types";
import { Player } from "../player/player";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: { years: Stats[]; genres: Stats[] };
  name: string;
  tracks: TrackMeta[];
  isDeleteGroupBtnDisabled: boolean;

  onPlayBtnClick: () => void;
  isPlaying: boolean;
  handleSubmit: (data: FormValues) => void;
  handleAddGroup: () => void;
  handleDeleteGroup: () => void;
}
type SelectProps<T> = {
  name: string;
  control: Control<FormValues>;
  index: number;
  register: UseFormRegister<FormValues>;
  resetField: UseFormResetField<FormValues>;
  optionsList: T;
  unregister?: UseFormUnregister<FormValues>;
};
type OptionsList = { [key: string]: { name: string; value: string } };
const OPERATORS: OptionsList = {
  or: { name: "any", value: "or" },
  and: { name: "all", value: "and" },
};
const FILTER_NAMES: OptionsList = {
  year: { name: "Year", value: "year" },
  genre: { name: "Genre", value: "genre" },
  any: { name: "Any", value: "any" },
  all: { name: "All", value: "all" },
};
const GENRE_CONDITIONS: OptionsList = {
  contains: { name: "contains", value: "contains" },
  notcontains: { name: "does not contain", value: "does not contain" },
};
const YEAR_CONDITIONS: OptionsList = {
  is: { name: "is", value: "is" },
  isNot: { name: "is not", value: "is not" },
  gte: { name: "greater than or equal", value: "greater than or equal" },
  lte: { name: "less than or equal", value: "less than or equal" },
};

function ConditionSelect(props: SelectProps<OptionsList>) {
  const defaultValue = Object.values(props.optionsList)[0].value;
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (filtersWatch[props.index]?.name === props.name) {
      props.resetField(`filters.${props.index}.condition`, { defaultValue });
    }
  }, [filtersWatch[props.index]?.name]);

  return filtersWatch[props.index]?.name === props.name ? (
    <select
      {...props.register(`filters.${props.index}.condition`)}
      defaultValue={defaultValue}
    >
      {Object.values(props.optionsList).map((el) => (
        <option key={el.value} value={el.value} children={el.name} />
      ))}
    </select>
  ) : null;
}

function ValueSelect(props: SelectProps<Stats[]>) {
  const defaultValue = props.optionsList[0].id || props.optionsList[0].name;
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (filtersWatch[props.index]?.name === props.name) {
      props.resetField(`filters.${props.index}.value`, { defaultValue });
    }
  }, [filtersWatch[props.index]?.name]);

  return filtersWatch[props.index]?.name === props.name ? (
    <select
      {...props.register(`filters.${props.index}.value`)}
      defaultValue={defaultValue}
    >
      {props.optionsList.map((el) => (
        <option key={el.id || el.name} value={el.id || el.name}>
          {el.name}
        </option>
      ))}
    </select>
  ) : null;
}

function FilterSelect(props: SelectProps<OptionsList>) {
  const defaultValue = props.optionsList.year.name;
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (
      filtersWatch[props.index]?.name === "any" ||
      filtersWatch[props.index]?.name === "all"
    ) {
      if (props.unregister) {
        props.unregister(`filters.${props.index}.value`);
        props.unregister(`filters.${props.index}.condition`);
      }
    }
  }, [filtersWatch[props.index]?.name]);

  return (
    <>
      <select
        {...props.register(`filters.${props.index}.name`)}
        defaultValue={defaultValue}
      >
        {...Object.values(FILTER_NAMES).map((el) => (
          <option key={el.value} value={el.value}>
            {el.name}
          </option>
        ))}
      </select>

      {filtersWatch[props.index]?.name === "any" ||
      filtersWatch[props.index]?.name === "all"
        ? "of the following are true"
        : null}
    </>
  );
}

let renderCount = 0;

export function Group(props: GroupProps) {
  const genres = [...props.stats.genres].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const years = [...props.stats.years]
    .map((y) => ({ ...y, name: parseInt(y.name) }))
    .sort((a, b) => b.name - a.name)
    .map((y) => ({ ...y, name: String(y.name) }));

  const defaultValues = {
    operator: "and",
    filters: [
      {
        name: FILTER_NAMES.genre.value,
        condition: GENRE_CONDITIONS.contains.value,
        value: String(genres[0].id),
      },
    ],
  };

  const {
    control,
    register,
    unregister,
    handleSubmit,
    watch,
    resetField,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onSubmit",
    shouldUnregister: false,
  });
  const inputsWatch = watch();

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "filters",
  });

  const operatorWatch = useWatch({ name: "operator", control });

  function onSubmit(data: FormValues) {
    console.log("[onSubmit]", data);
    props.handleSubmit(data);
  }

  //React.useEffect(() => {}, [inputsWatch.filters]);

  console.log(renderCount++);

  return (
    <div>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <span className="group__name">{props.name}</span>
          <button
            onClick={props.handleDeleteGroup}
            className={`btn btn_theme_transparent-red group__btn ${
              props.isDeleteGroupBtnDisabled ? "btn_disabled" : ""
            }`}
            disabled={props.isDeleteGroupBtnDisabled}
          >
            <span>Delete</span>
          </button>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          id="filter-form"
          className={`group__form ${props.className || ""}`}
        >
          <div className="group__row">
            <label htmlFor="filter-form">Match</label>
            <select {...register("operator")}>
              {Object.values(OPERATORS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.name}
                </option>
              ))}
            </select>
            <div>of the following rules:</div>
          </div>

          {fields.map((filter, index) => {
            return (
              <div key={filter.id} className="group__row group__row_filter">
                <div className="group__row-controls">
                  <FilterSelect
                    name="name"
                    control={control}
                    register={register}
                    unregister={unregister}
                    index={index}
                    resetField={resetField}
                    optionsList={FILTER_NAMES}
                  />
                  <ConditionSelect
                    name="genre"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    optionsList={GENRE_CONDITIONS}
                  />
                  <ConditionSelect
                    name="year"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    optionsList={YEAR_CONDITIONS}
                  />
                  <ValueSelect
                    name="genre"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    optionsList={genres}
                  />
                  <ValueSelect
                    name="year"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    optionsList={years}
                  />
                </div>

                <div className="group__btns">
                  <button
                    type="button"
                    onClick={() =>
                      insert(index + 1, [{ name: FILTER_NAMES.genre.value }])
                    }
                    className="btn btn_theme_transparent-black group__btn"
                  >
                    +
                  </button>
                  <button
                    disabled={fields.length === 1}
                    type="button"
                    onClick={() => remove(index)}
                    className="btn btn_theme_transparent-black group__btn"
                  >
                    −
                  </button>
                </div>
              </div>
            );
          })}
        </form>

        <div className="group__playlist">
          {props.tracks.length === 0 ? (
            <button
              type="submit"
              form="filter-form"
              disabled={false}
              className="btn btn_theme_black group__btn"
            >
              +
            </button>
          ) : null}

          {props.tracks.map((track: TrackMeta) => {
            return (
              <Player
                {...track}
                isPlaying={props.isPlaying}
                onPlayBtnClick={props.onPlayBtnClick}
              />
            );
          })}
        </div>
      </div>

      <div onClick={props.handleAddGroup} className="add-section-btn">
        Add new section
      </div>
    </div>
  );
}

const arr = [
  {
    name: "genre",
    rule: "contains",
    value: 29,
  },
  {
    name: "genre",
    rule: "does not contain",
    value: 4,
  },
  {
    name: "genre",
    rule: "contains",
    value: 18,
  },
  {
    name: "year",
    rule: "greater than or equal",
    value: 1996,
  },
  {
    name: "year",
    rule: "is",
    value: 2023,
  },
  {
    name: "year",
    rule: "greater than or equal",
    value: 2001,
  },
  {
    name: "year",
    rule: "is",
    value: 2017,
  },
];

function buildQuery(
  arr: {
    name: string;
    rule: string;
    value: number | string;
  }[]
) {
  const withUniqueYearRules = uniqWith(arr, (a, b) => {
    if (a.name === "year") return a.name === b.name && a.rule === b.rule;
    else return false;
  });

  const withAggregatedGenres = uniqWith(withUniqueYearRules, (a, b) => {
    if (a.name === "genre") {
      if (a.rule === b.rule) {
        a.value = b.value = [].concat(a.value as any, b.value as any) as any;
        return true;
      } else return false;
    } else return true;
  });
  console.log("!!!!!!!", withAggregatedGenres);

  return withAggregatedGenres;
}

buildQuery(arr);
