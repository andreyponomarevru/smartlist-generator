import React, { useState, useEffect } from "react";
import {
  useForm,
  UseFormRegister,
  FieldValues,
  Path,
  useFieldArray,
  Control,
  useWatch,
} from "react-hook-form";
import { Btn } from "../btn/btn";
import { Stats } from "../../types";

import "./group.scss";

const operators = [
  { name: "any", value: "AND" },
  { name: "all", value: "OR" },
];
const filterNames = ["Year", "Genre", "Any", "All"];
const yearConditions = [
  "is",
  "is not",
  "greater than or equal",
  "less than or equal",
];
const genreConditions = ["contains", "does not contain"];

interface FormValues {
  operator: string;
  filter: {
    name: string;
    genreRule?: string;
    yearRule?: string;
    validOptions?: string;
  }[];
}

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  stats: { years: Stats[]; genres: Stats[] };
  group: any;

  onPlayBtnClick: () => void;
  isPlaying: boolean;
}

function GenreSelect({
  control,
  index,
  register,
}: {
  control: Control<FormValues>;
  index: number;
  register: any;
}) {
  const output = useWatch({
    name: "filter",
    control,
    //defaultValue: { name: "Genre"},
  });

  return output[index]?.name === "Genre" ? (
    <select
      {...register(`filter.${index}.genreRule`)}
      defaultValue={genreConditions[0]}
    >
      {genreConditions.map((el) => (
        <option key={el} value={el}>
          {el}
        </option>
      ))}
    </select>
  ) : null;
}

function YearSelect({
  control,
  index,
  register,
}: {
  control: Control<FormValues>;
  index: number;
  register: any;
}) {
  const output = useWatch({
    name: "filter",
    control,
    //defaultValue: { name: "Genre"},
  });

  return output[index]?.name === "Year" ? (
    <select
      {...register(`filter.${index}.yearRule`)}
      defaultValue={yearConditions[0]}
    >
      {yearConditions.map((el) => (
        <option key={el} value={el}>
          {el}
        </option>
      ))}
    </select>
  ) : null;
}

function ValidYearOptionsSelect({
  control,
  index,
  register,
  options,
}: {
  control: Control<FormValues>;
  index: number;
  register: any;
  options: number[];
}) {
  const output = useWatch({
    name: "filter",
    control,
    //defaultValue: { name: "Genre"},
  });

  return output[index]?.name === "Year" ? (
    <select
      {...register(`filter.${index}.validOptions`)}
      defaultValue={options[0]}
    >
      {options.map((el) => (
        <option key={el} value={el}>
          {el}
        </option>
      ))}
    </select>
  ) : null;
}

function ValidGenreOptionsSelect({
  control,
  index,
  register,
  options,
}: {
  control: Control<FormValues>;
  index: number;
  register: any;
  options: Stats[];
}) {
  const output = useWatch({
    name: "filter",
    control,
    //defaultValue: { name: "Genre"},
  });

  return output[index]?.name === "Genre" ? (
    <select
      {...register(`filter.${index}.validOptions`)}
      defaultValue={options[0].name}
    >
      {options.map((el) => (
        <option key={el.id} value={el.id}>
          {el.name}
        </option>
      ))}
    </select>
  ) : null;
}

let renderCount = 0;

export function Group(props: GroupProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    resetField,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { operator: "AND", filter: [{ name: "Genre" }] },
    mode: "onSubmit",
    shouldUnregister: false,
  });
  // const watchInputs = watch();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "filter",
    }
  );

  function onSubmit(data: FormValues) {
    console.log("[onSubmit]", data);
    // console.log("---", watchInputs);
  }

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
        //resetField("yearRule");
        //resetField("genreRule");
        //resetField("validOptions");
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  console.log(renderCount++);

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <span className="group__name">Opener</span>
          <Btn className="group__btn" name="Delete" theme="transparent-red" />
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
              {operators.map((o) => (
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
                  <select {...register(`filter.${index}.name`)}>
                    {...filterNames.map((el) => (
                      <option key={el} value={el}>
                        {el}
                      </option>
                    ))}
                  </select>

                  <GenreSelect
                    control={control}
                    register={register}
                    index={index}
                  />

                  <YearSelect
                    control={control}
                    register={register}
                    index={index}
                  />

                  <ValidYearOptionsSelect
                    control={control}
                    register={register}
                    index={index}
                    options={props.stats.years.map((y) => y.name)}
                  />

                  <ValidGenreOptionsSelect
                    control={control}
                    register={register}
                    index={index}
                    options={props.stats.genres}
                  />
                </div>

                <div className="group__btns">
                  <button
                    type="button"
                    onClick={() => append([{ name: "Genre" }])}
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
