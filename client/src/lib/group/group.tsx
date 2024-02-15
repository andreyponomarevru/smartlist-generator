import React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  FormState,
  Control,
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormResetField,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
  UseFieldArrayRemove,
  UseFieldArrayInsert,
} from "react-hook-form";
import Select from "react-select";

import {
  Stats,
  FormValues,
  TrackMeta,
  OptionsList,
  GetStatsRes,
  GetTrackRes,
  APIResponse,
} from "../../types";
import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
} from "../../config/constants";
import { ConditionSelect } from "./condition-select";
import { YearValueSelect } from "./year-value-select";
import { GenreValueSelect } from "./genre-value-select";
import { useEditableText } from "../../hooks/use-editable-text";
import { EditableText } from "../../lib/editable-text/editable-text";
import { Track } from "../track/track";
import { Btn } from "../btn/btn";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: number;
  name: string;
  years: APIResponse<GetStatsRes>;
  genres: APIResponse<GetStatsRes>;
  isOpenGroupId: Record<string, boolean>;
  onToggle: () => void;
  onAddGroup: () => void;
  onDeleteGroup: () => void;
  onRenameGroup: (groupId: number, newName: string) => void;
  onGetTrack: (groupId: number, formValues: FormValues) => void;
  onFiltersChange: (groupId: number) => void;

  tracks: Record<string, TrackMeta[]>;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: (
    groupId: number,
    trackId: number,
    formValues: FormValues
  ) => void;
}

let renderCount = 0;

export function Group(props: GroupProps) {
  // console.log(renderCount++);

  const groupName = useEditableText(props.name);
  React.useEffect(() => {
    props.onRenameGroup(props.groupId, groupName.state.text);
  }, [groupName.state.text]);

  //

  const defaultValues: FormValues = {
    operator: OPERATORS[0],
    filters: [
      {
        name: FILTER_NAMES[1],
        condition: GENRE_CONDITIONS[0],
        value: [],
      },
    ],
  };

  const {
    formState,
    control,
    register,
    handleSubmit,
    resetField,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "filters",
  });

  const watchedFields = watch();
  React.useEffect(() => {
    console.log(watchedFields);
    localStorage.setItem("filters", JSON.stringify({ filters: watchedFields }));
  }, [watchedFields]);

  const [stats, setStats] = React.useState<
    Record<string, OptionsList<number>[]>
  >({ years: [], genres: [] });
  React.useEffect(() => {
    if (!props.genres.response?.body?.results) return;
    if (!props.years.response?.body?.results) return;

    const genres: OptionsList<number>[] = [
      ...props.genres.response?.body?.results,
    ]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name }));

    const years: OptionsList<number>[] = [
      ...props.years.response?.body?.results!,
    ]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

    setStats({ genres, years });
    reset({
      operator: OPERATORS[0],
      filters: [
        {
          name: FILTER_NAMES[1],
          condition: GENRE_CONDITIONS[0],
          value: [genres[0]],
        },
      ],
    });
  }, [props.genres.response]);

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

  function onSubmit(groupId: number, formValues: FormValues) {
    props.onGetTrack(groupId, formValues);
  }

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <EditableText className="group__name" text={groupName} />
          <button
            onClick={props.onDeleteGroup}
            className="btn btn_theme_transparent-black"
          >
            <span>Delete</span>
          </button>
          <div className="group__toggle-group-btn" onClick={props.onToggle}>
            {props.isOpenGroupId[`${props.groupId}`] ? "–" : "+"}
          </div>
        </header>

        <div
          className={`group__body ${
            props.isOpenGroupId[`${props.groupId}`] ? "" : "group__body_hidden"
          }`}
        >
          <form
            noValidate
            onSubmit={handleSubmit((e) => onSubmit(props.groupId, e))}
            id={`filter-form-${props.groupId}`}
            className="group__form"
          >
            <div className="group__row">
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
                            defaultValue={defaultValues.filters[0].name}
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
                      defaultValue={GENRE_CONDITIONS[1]}
                      setValue={setValue}
                    />
                    <ConditionSelect
                      name="year"
                      control={control}
                      register={register}
                      index={index}
                      resetField={resetField}
                      options={YEAR_CONDITIONS}
                      defaultValue={YEAR_CONDITIONS[0]}
                      setValue={setValue}
                    />
                    <GenreValueSelect
                      name="genre"
                      control={control}
                      register={register}
                      index={index}
                      resetField={resetField}
                      options={stats.genres}
                      defaultValue={stats.genres[0]}
                      setValue={setValue}
                    />
                    <YearValueSelect
                      name="year"
                      control={control}
                      register={register}
                      index={index}
                      resetField={resetField}
                      options={stats.years}
                      defaultValue={stats.years[0]}
                      setValue={setValue}
                    />
                  </div>

                  <div className="group__btns">
                    <button
                      type="button"
                      onClick={() => {
                        insert(index + 1, [
                          { name: defaultValues.filters[0].name },
                        ]);
                      }}
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
          <ul className="group__playlist">
            {props.tracks[`${props.groupId}`].map((track: TrackMeta) => {
              return (
                <Track {...track} key={`${track.trackId}-${track.duration}`}>
                  <button
                    name="b"
                    onClick={handleSubmit((e) =>
                      props.onReplaceTrack(props.groupId, track.trackId, e)
                    )}
                    type="submit"
                    form={`filter-form-${props.groupId}`}
                    disabled={false}
                    className="btn btn_theme_black track__btn"
                  >
                    Pick another
                  </button>
                  <span
                    onClick={() =>
                      props.onRemoveTrack(props.groupId, track.trackId)
                    }
                    className="btn btn_theme_black track__btn"
                  >
                    −
                  </span>
                  <button
                    name="a"
                    type="submit"
                    form={`filter-form-${props.groupId}`}
                    disabled={false}
                    className="btn btn_theme_black track__btn"
                  >
                    +
                  </button>
                </Track>
              );
            })}
          </ul>
          {props.tracks[`${props.groupId}`].length === 0 ? (
            <button
              name="a"
              type="submit"
              form={`filter-form-${props.groupId}`}
              disabled={false}
              className="btn btn_theme_black group__find-track-btn"
            >
              Find a track
            </button>
          ) : null}
        </div>
      </div>

      <button
        className="btn btn_theme_transparent-black add-section-btn"
        onClick={props.onAddGroup}
      >
        Add new section
      </button>
    </>
  );
}
