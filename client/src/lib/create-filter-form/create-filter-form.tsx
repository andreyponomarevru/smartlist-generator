import React from "react";
import { Controller, useForm, useFieldArray, useWatch } from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import {
  FaMinus,
  FaRedo,
  FaPlus,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import { IoCopy, IoPlaySharp } from "react-icons/io5";

import { Message } from "../message/message";
import {
  FilterFormValues,
  OptionsList,
  SelectProps,
  TrackMeta,
} from "../../types";
import {
  FILTER_NAMES,
  FILTER_CONDITIONS,
  OPERATORS,
} from "../../config/constants";
import { useSavedFilters } from "../../hooks/use-saved-filters";
import { useGlobalState } from "../../hooks/use-global-state";
import { useTempPlaylist } from "../../hooks/use-temp-playlist";
import { toHourMinSec } from "../../utils/misc";
import { useUUID } from "../../hooks/use-uuid";

import "./create-filter-form.scss";

interface CreateFilterFormProps extends React.HTMLAttributes<HTMLFormElement> {
  formId: string;
  defaultValues?: FilterFormValues;
  handleCancel?: () => void;
}

type Stats = Record<string, OptionsList<number>[]>;

const ERROR_MESSAGES = {
  name: "Filter name is required",
  condition: "Select a condition",
  value: "Select a value",
};

const DEFAULT_FILTER_VALUES: FilterFormValues = {
  name: "New Filter Name ...",
  operator: OPERATORS.any,
  filters: [
    {
      name: FILTER_NAMES.genre,
      condition: null,
      value: null,
    },
  ],
};

function createSingleSelectStyles(
  hasError?: boolean,
): StylesConfig<OptionsList<string | number>, false> {
  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      border: `1px solid ${
        state.isFocused ? (hasError ? "#d45d47" : "#afc6e9") : "#cccccc"
      }`,
      boxShadow: state.isFocused
        ? hasError
          ? "0 0 0.6rem #d45d47"
          : "0 0 0.6rem #afc6e9"
        : "",
      minHeight: "2.75rem",
      fontSize: "16px",
      borderRadius: "6px",
      minWidth: "fit-content",
    }),
    option: (baseStyles) => ({
      ...baseStyles,
      fontSize: "16px",
    }),
  };
}

function createMultiSelectStyles(
  hasError?: boolean,
): StylesConfig<OptionsList<string | number>, true> {
  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      border: `1px solid ${
        state.isFocused ? (hasError ? "#d45d47" : "#afc6e9") : "#cccccc"
      }`,
      boxShadow: state.isFocused
        ? hasError
          ? "0 0 0.6rem #d45d47"
          : "0 0 0.6rem #afc6e9"
        : "",
      minHeight: "2.75rem",
      maxWidth: "24rem",
      fontSize: "16px",
      borderRadius: "6px",
    }),
    option: (baseStyles) => ({
      ...baseStyles,
      fontSize: "16px",
    }),
    multiValue: (baseStyles) => ({
      ...baseStyles,
      fontSize: "14px",
    }),
  };
}

export function CreateFilterForm(props: CreateFilterFormProps) {
  const { statsQuery, player } = useGlobalState();
  const savedFilters = useSavedFilters();
  const tempPlaylist = useTempPlaylist();

  const form = useForm<FilterFormValues>({
    defaultValues: props.defaultValues || DEFAULT_FILTER_VALUES,
    resetOptions: {
      keepValues: false,
      keepDirtyValues: false,
      keepDefaultValues: true,
    },
    mode: "onSubmit",
  });
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: "filters",
  });
  const watchedNewFilters = form.watch();

  //

  const [stats, setStats] = React.useState<Stats>({ year: [], genre: [] });

  React.useEffect(() => {
    if (!statsQuery.data?.genres || !statsQuery.data?.years) return;

    const genre: OptionsList<number>[] = [...statsQuery.data.genres.results]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name }));

    const year: OptionsList<number>[] = [...statsQuery.data.years.results]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

    setStats({ genre, year });
  }, [statsQuery.data]);

  // If (form has been changed) reset all tracks
  React.useEffect(() => {
    if (form.formState.isDirty) {
      tempPlaylist.handleReset();
      setIsBtnDisabled(false);
    }
  }, [form.formState.isDirty]);

  function onSubmit(inputs: FilterFormValues) {
    tempPlaylist.handleAddTrack(inputs);
    // This line is for resetting "isDirty" back to "false"
    form.reset(inputs, { keepValues: true, keepDirty: false });
  }

  function onSaveFilter(inputs: FilterFormValues) {
    savedFilters.handleSave(savedFormId, watchedNewFilters);
    form.reset(inputs, { keepValues: true, keepDirty: false });
    setIsBtnDisabled(true);
  }

  // Change filter/form ID (for storing in state) every time we update the filter title (watchedNewFilters.name).
  const [savedFormId] = useUUID(1, [watchedNewFilters.name]);

  const [isBtnDisabled, setIsBtnDisabled] = React.useState(false);

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={props.formId}
        className={`create-filter-form ${props.className || ""}`}
      >
        <div>
          <button
            className="btn btn_type_secondary"
            onClick={(e) => {
              e.preventDefault();
              if (props.handleCancel) props.handleCancel();
            }}
          >
            Cancel
          </button>
        </div>
        <div className="create-filter-form__title">
          <input
            {...form.register("name", { required: ERROR_MESSAGES.name })}
            className={`input create-filter-form__input ${
              form.formState.errors.name ? "input_error" : ""
            }`}
          />
          {form.formState.errors.name && (
            <Message type="danger" className="create-filter-form__error">
              {form.formState.errors.name.message}
            </Message>
          )}
        </div>

        <div className="create-filter-form__row create-filter-form__operator-row">
          <label htmlFor={props.formId}>Match</label>
          <Controller
            name="operator"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                options={Object.values(OPERATORS)}
                styles={createSingleSelectStyles()}
              />
            )}
          />
          <div>of the following rules:</div>
        </div>

        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className="create-filter-form__row create-filter-form__addable-row"
            >
              <div className="create-filter-form__select-boxes">
                <Controller
                  name={`filters.${index}.name`}
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
                  name={watchedNewFilters.filters[index].name.value}
                  control={form.control}
                  index={index}
                  resetField={form.resetField}
                  defaultValue={null}
                  isDirty={
                    !!(
                      form.formState.dirtyFields.filters &&
                      form.formState.dirtyFields.filters[index] &&
                      form.formState.dirtyFields.filters[index].name
                    )
                  }
                  conditionOptions={Object.values(
                    FILTER_CONDITIONS[
                      watchedNewFilters.filters[index].name.value
                    ],
                  )}
                  valueOptions={{ year: stats.year, genre: stats.genre }}
                />
              </div>
              <div></div>
              <div className="create-filter-form__btns">
                <button
                  disabled={fields.length === 1}
                  type="button"
                  onClick={() => {
                    remove(index);
                    form.reset(form.getValues());
                  }}
                  className="btn btn_type_icon create-filter-form__btn"
                >
                  <FaMinus className="icon" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insert(index + 1, [DEFAULT_FILTER_VALUES.filters[0]]);
                    form.reset(form.getValues());
                  }}
                  className="btn btn_type_icon create-filter-form__btn"
                >
                  <FaPlus className="icon" />
                </button>
              </div>
            </div>
          );
        })}

        <div className="create-filter-form__controls">
          <button
            name="findtrack"
            type="submit"
            disabled={false}
            form={props.formId}
            className={`btn btn_type_primary ${props.className || ""}`}
          >
            Find track
          </button>
          <div className="create-filter-form__row">
            <button
              className="btn btn_type_secondary"
              onClick={(e) => {
                e.preventDefault();
                form.reset(props.defaultValues || DEFAULT_FILTER_VALUES, {
                  keepValues: false,
                  keepDirty: false,
                });
                form.clearErrors();
                setIsBtnDisabled(false);
                tempPlaylist.handleReset();
              }}
            >
              Reset
            </button>
            <button
              className="btn btn_type_primary"
              onClick={form.handleSubmit(onSaveFilter)}
              disabled={isBtnDisabled}
            >
              {isBtnDisabled ? "Saved" : "Save filter"}
            </button>
          </div>
        </div>
      </form>

      {tempPlaylist.tracks.length > 0 && (
        <ol className="playlist">
          {tempPlaylist.tracks.map((track: TrackMeta, index) => {
            return (
              <li
                key={track.trackId + track.duration}
                className="track"
                onClick={(e) => {
                  e.stopPropagation();
                  if ((e.target as HTMLLIElement).nodeName === "SPAN") {
                    player.setPlayingIndex({ index });
                  }
                }}
                role="presentation"
              >
                <div className="track__sort-buttons">
                  <button
                    className="btn btn_type_icon"
                    onClick={() =>
                      tempPlaylist.handleReorderTracks({
                        index,
                        direction: "UP",
                      })
                    }
                    disabled={index === 0 || tempPlaylist.tracks.length === 1}
                  >
                    <FaArrowUp className="icon" />
                  </button>
                  <button
                    className="btn btn_type_icon"
                    onClick={() =>
                      tempPlaylist.handleReorderTracks({
                        index,
                        direction: "DOWN",
                      })
                    }
                    disabled={
                      tempPlaylist.tracks.length - 1 === index ||
                      tempPlaylist.tracks.length === 1
                    }
                  >
                    <FaArrowDown className="icon" />
                  </button>
                </div>
                <span className="track__year">{track.year}</span>
                <span className="track__artist-title-genre">
                  <span className="track__artists">
                    {track.artist.join(", ")}
                  </span>
                  <span className="track__title">{track.title}</span>
                  <span className="track__genres">
                    {track.genre.map((name) => (
                      <span key={name} className="track__genre">
                        {name}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="track__duration">
                  {toHourMinSec(track.duration)}
                </span>
                <div className="track__controls">
                  <span className="btn btn_type_icon track__btn">
                    <IoPlaySharp className="icon" />
                  </span>
                  <span className="btn btn_type_icon track__btn">
                    <IoCopy className="icon" />
                  </span>
                  <button
                    name="redo"
                    onClick={form.handleSubmit((e: FilterFormValues) => {
                      tempPlaylist.handleReplaceTrack({
                        trackId: track.trackId,
                        formValues: e,
                      });
                    })}
                    type="submit"
                    form="filter-form"
                    disabled={false}
                    className="btn btn_type_icon track__btn"
                  >
                    <FaRedo className="icon" />
                  </button>
                  <button
                    onClick={() =>
                      tempPlaylist.handleRemoveTrack(track.trackId)
                    }
                    className="btn btn_type_icon track__btn"
                  >
                    <FaMinus className="icon" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

export function ConditionSelect(props: SelectProps<string | number>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (props.resetField && props.isDirty) {
      //console.log("reset condition", "DIRTY");
      props.resetField(`filters.${props.index}.condition`, {
        keepDirty: false,
        defaultValue: null,
      });
      props.resetField(`filters.${props.index}.value`, {
        keepDirty: false,
        defaultValue: null,
      });
    }
  }, [props.isDirty, filtersWatch[props.index]?.name.value]);

  React.useEffect(() => {
    if (props.resetField) {
      //console.log("reset condition", "DIRTY");
      props.resetField(`filters.${props.index}.condition`, {
        keepDirty: true,
      });
      props.resetField(`filters.${props.index}.value`, {
        keepDirty: true,
      });
    }
  }, [props.isDirty]);

  return (
    <>
      <Controller
        name={`filters.${props.index}.condition`}
        defaultValue={null}
        control={props.control}
        rules={{ required: ERROR_MESSAGES.condition }}
        render={({ field, fieldState: { error }, formState: { isDirty } }) => {
          return (
            <div className="create-filter-form__select-wrapper">
              <Select
                {...field}
                className="error"
                options={props.conditionOptions!}
                styles={createSingleSelectStyles(error && isDirty)}
              />
              {error && isDirty && (
                <Message type="danger" className="create-filter-form__error">
                  {error.message}
                </Message>
              )}
            </div>
          );
        }}
      />
      <Controller
        name={`filters.${props.index}.value`}
        defaultValue={null}
        control={props.control}
        rules={{ required: ERROR_MESSAGES.value }}
        render={({ field, fieldState: { error }, formState: { isDirty } }) => {
          return (
            <div className="create-filter-form__select-wrapper">
              <Select
                {...field}
                closeMenuOnSelect={props.name === "year"}
                isMulti={props.name === "genre" || undefined}
                options={props.valueOptions![props.name!]!}
                styles={createMultiSelectStyles(error && isDirty)}
              />
              {error && isDirty && (
                <Message type="danger" className="create-filter-form__error">
                  {error.message}
                </Message>
              )}
            </div>
          );
        }}
      />
    </>
  );
}

export function ValueSelect(props: SelectProps<number>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (props.resetField /*&& props.isDirty*/) {
      console.log("SHOULD");
      /*props.resetField(`filters.${props.index}.value`, {
        keepDirty: false,
        defaultValue: null,
      });*/
    }
  }, [filtersWatch[props.index]?.name.value]);
  /*
  React.useEffect(() => {
    console.log("SHOULD KEEP DIRTY");
    if (props.resetField) {
      props.resetField(`filters.${props.index}.value`, {
        keepDirty: false,
        defaultValue: null,
      });
    }
  }, [props.isDirty]);*/

  return filtersWatch[props.index]?.name.value === props.name ? (
    <Controller
      name={`filters.${props.index}.value`}
      defaultValue={null}
      control={props.control}
      rules={{ required: ERROR_MESSAGES.value }}
      render={({ field, fieldState: { error }, formState: { isDirty } }) => {
        return (
          <div className="create-filter-form__select-wrapper">
            <Select
              {...field}
              closeMenuOnSelect={props.closeMenuOnSelect}
              isMulti={props.isMulti || undefined}
              options={props.options}
              styles={createMultiSelectStyles(error && isDirty)}
            />
            {error && isDirty && (
              <Message type="danger" className="create-filter-form__error">
                {error.message}
              </Message>
            )}
          </div>
        );
      }}
    />
  ) : null;
}
