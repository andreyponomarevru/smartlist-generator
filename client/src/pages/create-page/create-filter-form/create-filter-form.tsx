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

import { Message } from "../../../lib/message/message";
import {
  FilterFormValues,
  OptionsList,
  SelectProps,
  TrackMeta,
} from "../../../types";
import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
} from "../../../config/constants";
import { useSavedFilters } from "../../../hooks/use-saved-filters";
import { useGlobalState } from "../../../hooks/use-global-state";
import { useTempPlaylist } from "../../../hooks/use-temp-playlist";
import { toHourMinSec } from "../../../utils/misc";
import { useUUID } from "../../../hooks/use-uuid";

import "./create-filter-form.scss";

interface NewFiltersFormProps extends React.HTMLAttributes<HTMLFormElement> {}

type Stats = { years: OptionsList<number>[]; genres: OptionsList<number>[] };

const ERROR_MESSAGES = {
  name: "Filter name is required",
  condition: "Select a condition",
  value: "Select a value",
};

const FORM_ID = "new-filter-form";

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
): StylesConfig<OptionsList<number>, true> {
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

export function NewFiltersForm(props: NewFiltersFormProps) {
  const { statsQuery, player } = useGlobalState();
  const savedFilters = useSavedFilters();
  const tempPlaylist = useTempPlaylist();

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

  const form = useForm<FilterFormValues>({
    defaultValues: DEFAULT_FILTER_VALUES,
    mode: "onSubmit",
  });
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: "filters",
  });
  const watchedNewFilters = form.watch();

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

  // If (form has been changed) reset all tracks
  React.useEffect(() => {
    if (form.formState.isDirty) {
      tempPlaylist.handleReset();
      setIsBtnDisabled(false);
      console.log("IS DIRTY TRIGGERED", "dirty", form.formState.dirtyFields);
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
        id={FORM_ID}
        className={`create-filter-form ${props.className || ""}`}
      >
        <div className="create-filter-form__top-controls">
          <button
            className="btn btn_type_secondary"
            onClick={() => {
              form.reset(DEFAULT_FILTER_VALUES, {
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
          <label htmlFor={FORM_ID}>Match</label>
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

        {fields.map((filter, index) => {
          return (
            <div
              key={filter.id}
              className="create-filter-form__row create-filter-form__addable-row"
            >
              <div className="create-filter-form__select-boxes">
                <Controller
                  name={`filters.${index}.name`}
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={Object.values(FILTER_NAMES)}
                      styles={createSingleSelectStyles()}
                    />
                  )}
                />
                <ConditionSelect
                  name="genre"
                  control={form.control}
                  index={index}
                  options={Object.values(GENRE_CONDITIONS)}
                  defaultValue={GENRE_CONDITIONS.containsAll}
                  resetField={form.resetField}
                />
                <ConditionSelect
                  name="year"
                  control={form.control}
                  index={index}
                  options={Object.values(YEAR_CONDITIONS)}
                  defaultValue={YEAR_CONDITIONS.is}
                  resetField={form.resetField}
                />
                <ValueSelect
                  name="genre"
                  control={form.control}
                  index={index}
                  options={stats.genres}
                  resetField={form.resetField}
                  isMulti={true}
                />
                <ValueSelect
                  name="year"
                  control={form.control}
                  index={index}
                  options={stats.years}
                  resetField={form.resetField}
                />
              </div>
              <div></div>
              <div className="create-filter-form__btns">
                <button
                  disabled={fields.length === 1}
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn_type_icon create-filter-form__btn"
                >
                  <FaMinus className="icon" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insert(index + 1, [DEFAULT_FILTER_VALUES.filters[0]]);
                  }}
                  className="btn btn_type_icon create-filter-form__btn"
                >
                  <FaPlus className="icon" />
                </button>
              </div>
            </div>
          );
        })}

        <SubmitFormBtn className="create-filter-form__find-track-btn" />
      </form>

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
                  onClick={() => tempPlaylist.handleRemoveTrack(track.trackId)}
                  className="btn btn_type_icon track__btn"
                >
                  <FaMinus className="icon" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function ConditionSelect(props: SelectProps<string>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  const { index, resetField } = props;
  const selectedFilterName = filtersWatch[index]?.name.value;
  React.useEffect(() => {
    if (resetField) {
      resetField(`filters.${index}.condition`);
    }
  }, [selectedFilterName, index, resetField]);

  return filtersWatch[props.index]?.name.value === props.name ? (
    <Controller
      name={`filters.${props.index}.condition`}
      control={props.control}
      rules={{ required: ERROR_MESSAGES.condition }}
      render={({ field, fieldState: { error }, formState: { isDirty } }) => {
        return (
          <div className="create-filter-form__select-wrapper">
            <Select
              {...field}
              className="error"
              options={props.options}
              styles={createSingleSelectStyles(error && isDirty)}
              defaultValue={null}
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

export function ValueSelect(props: SelectProps<number>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  const { index, resetField } = props;
  const selectedFilterName = filtersWatch[index]?.name.value;
  React.useEffect(() => {
    if (resetField) {
      resetField(`filters.${index}.value`);
    }
  }, [selectedFilterName, index, resetField]);

  // If the  name of this component (props.name) matches the value selected in dropdowb
  return filtersWatch[props.index]?.name.value === props.name ? (
    <Controller
      name={`filters.${props.index}.value`}
      control={props.control}
      rules={{ required: ERROR_MESSAGES.value }}
      render={({ field, fieldState: { error }, formState: { isDirty } }) => {
        return (
          <div className="create-filter-form__select-wrapper">
            <Select
              {...field}
              closeMenuOnSelect={false}
              isMulti={props.isMulti}
              options={props.options}
              styles={createMultiSelectStyles(error && isDirty)}
              defaultValue={null}
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

interface SubmitFormBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SubmitFormBtn(props: SubmitFormBtnProps) {
  return (
    <button
      name="findtrack"
      type="submit"
      disabled={false}
      form={FORM_ID}
      className={`btn btn_type_primary ${props.className || ""}`}
    >
      Find track
    </button>
  );
}
