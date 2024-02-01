import React, { useState, useEffect } from "react";
import { useForm, UseFormRegister, FieldValues, Path } from "react-hook-form";
import { Btn } from "../btn/btn";
import { Stats } from "../../types";

import "./group.scss";

const operators = [
  { name: "And", value: "AND" },
  { name: "Or", value: "OR" },
];
const filterNames = ["Year", "Genre", "Any", "All"];
const yearConditions = [
  "is",
  "is not",
  "greater than or equal",
  "less than or equal",
];
const genreConditions = ["contains", "does not contain"];

interface FormInputs {
  operator: string;
  name: string;
  genreRule?: string;
  yearRule?: string;
  validOptions: string;
}

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  stats: { years: Stats[]; genres: Stats[] };
  group: any;

  onPlayBtnClick: () => void;
  isPlaying: boolean;
}

export function Group(props: GroupProps) {
  const {
    register,
    handleSubmit,
    watch,
    resetField,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      operator: "AND",
      name: "Genre",
    },
  });
  const watchInputs = watch();

  React.useEffect(() => {
    const subscription = watch((value: any, { name, type }: any) => {
      console.log(
        "[subscription] value:",
        value,
        " | name:",
        name,
        "| type:",
        type
      );

      if (name === "name") {
        resetField("yearRule");
        resetField("genreRule");
        resetField("validOptions");
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  function onSubmit(data: unknown) {
    console.log("[onSubmit]", data);
    console.log("---", watchInputs);
  }

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <span className="group__name">Opener</span>
          <Btn className="group__btn" name="Delete" theme="transparent-red" />
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          id="filter-form"
          className={`group__form ${props.className || ""}`}
        >
          <div className="group__row">
            <label htmlFor="filter-form">Match</label>
            <select {...register("operator")}>
              {operators.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.name}
                </option>
              ))}
            </select>
            <div>of the following rules:</div>
          </div>

          <div className="group__row group__row_filter">
            <div className="group__row-controls">
              <select {...register("name")}>
                {...filterNames.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>

              {watchInputs.name === "Genre" && (
                <select
                  {...register("genreRule")}
                  defaultValue={genreConditions[0]}
                >
                  {genreConditions.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              )}

              {watchInputs.name === "Year" && (
                <select
                  {...register("yearRule")}
                  defaultValue={yearConditions[0]}
                >
                  {yearConditions.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              )}

              {watchInputs.name === "Genre" && (
                <select
                  {...register("validOptions")}
                  defaultValue={props.stats.genres[0].name}
                >
                  {props.stats.genres.map((el) => (
                    <option key={el.name} value={el.name}>
                      {el.name}
                    </option>
                  ))}
                </select>
              )}

              {watchInputs.name === "Year" && (
                <select
                  {...register("validOptions")}
                  defaultValue={props.stats.years[0].name}
                >
                  {props.stats.years.map((el) => (
                    <option key={el.name} value={el.name}>
                      {el.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="group__btns">
              <span className="btn btn_theme_transparent-black group__btn">
                +
              </span>
              <span className="btn btn_theme_transparent-black group__btn">
                −
              </span>
            </div>
          </div>
        </form>

        <div className="group__playlist">
          {props.group.tracks.map((track: any) => {
            return (
              <li key={track.trackId} className="group__track">
                <span className="group__year">{track.year}</span>
                <span className="group__artist">{track.artist}</span>
                <span className="group__title">{track.title}</span>
                <div className="group__player">
                  <div
                    className="group__toggle-play-btn"
                    onClick={() => props.onPlayBtnClick()}
                  >
                    {props.isPlaying ? "S" : "P"}
                  </div>
                  <div className="group__progressbar"></div>
                  <div className="group__duration">08:12</div>
                </div>
                <Btn name="Pick another" className="group__btn" theme="black" />
                <span className="btn btn_theme_black group__btn">−</span>
                <button
                  type="submit"
                  form="filter-form"
                  disabled={false}
                  className="btn btn_theme_black group_btn"
                >
                  +
                </button>
              </li>
            );
          })}
        </div>
      </div>
      <div className="add-section-btn">Add new section</div>
    </>
  );
}
