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
  Controller,
} from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import uniqWith from "lodash/uniqWith";
import mergeWith from "lodash/mergeWith";
import { Btn } from "../btn/btn";
import { Stats, FormValues, TrackMeta, OptionsList } from "../../types";
import { Player } from "../player/player";
import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
  DEFAULT_INPUTS,
} from "../../config/constants";
import { ConditionSelect } from "./condition-select";
import { ValueSelect } from "./value-select";

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

let renderCount = 0;

export function Group(props: GroupProps) {
  const genres: OptionsList<number>[] = [...props.stats.genres]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((g) => ({ value: g.id as number, label: g.name }));

  const years: OptionsList<number>[] = [...props.stats.years]
    .sort((a, b) => parseInt(b.name) - parseInt(a.name))
    .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

  const defaultValues: FormValues = {
    operator: OPERATORS[0],
    filters: [
      {
        name: DEFAULT_INPUTS.filterName,
        condition: DEFAULT_INPUTS.genre.condition,
        value: genres[0],
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

            <Controller
              name="operator"
              control={control}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    options={OPERATORS}
                    defaultValue={OPERATORS[0]}
                  />
                );
              }}
            />
            <div>of the following rules:</div>
          </div>

          {fields.map((filter, index) => {
            return (
              <div key={filter.id} className="group__row group__row_filter">
                <div className="group__row-controls">
                  <Controller
                    name={`filters.${index}.name`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          options={FILTER_NAMES}
                          defaultValue={DEFAULT_INPUTS.filterName}
                        />
                      );
                    }}
                  />
                  <ConditionSelect
                    name="genre"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    options={GENRE_CONDITIONS}
                    defaultValue={DEFAULT_INPUTS.genre.condition}
                    setValue={setValue}
                  />
                  <ConditionSelect
                    name="year"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    options={YEAR_CONDITIONS}
                    defaultValue={DEFAULT_INPUTS.year.condition}
                    setValue={setValue}
                  />

                  <ValueSelect
                    name="genre"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    options={genres}
                    defaultValue={genres[0]}
                    setValue={setValue}
                  />
                  <ValueSelect
                    name="year"
                    control={control}
                    register={register}
                    index={index}
                    resetField={resetField}
                    options={years}
                    defaultValue={years[0]}
                    setValue={setValue}
                  />
                </div>

                <div className="group__btns">
                  <button
                    type="button"
                    onClick={() =>
                      insert(index + 1, [{ name: FILTER_NAMES[1] }])
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
                key={track.trackId}
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
