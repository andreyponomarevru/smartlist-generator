import React from "react";
import {
  Controller,
  useFieldArray,
  useWatch,
  useForm,
  FormProvider,
} from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import { FaMinus, FaPlus } from "react-icons/fa";

import { Message } from "../message/message";
import { FilterFormValues, OptionsList, SelectProps } from "../../types";
import {
  FILTER_NAMES,
  FILTER_CONDITIONS,
  OPERATORS,
} from "../../config/constants";
import { useSavedFilters } from "../../hooks/use-saved-filters";
import { useGlobalState } from "../../hooks/use-global-state";
import { useUUID } from "../../hooks/use-uuid";
import { Playlist } from "../playlist/playlist";
import { usePlaylist } from "../../hooks/use-playlist";

import "./create-filter-form.scss";

const ERROR_MESSAGE = "Required";

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

interface CreateFilterFormProps extends React.HTMLAttributes<HTMLFormElement> {
  formId: string;
  savedFormId?: string;
  defaultValues?: FilterFormValues;
  onEditingCancel: () => void;
}

type Stats = Record<string, OptionsList<number>[]>;

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
  const { statsQuery } = useGlobalState();
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

  //

  const savedFilters = useSavedFilters();
  const playlist = usePlaylist();

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
  const watchedFilters = form.watch();

  //

  // If the filter has been updated - hide playlist
  React.useEffect(() => {
    if (form.formState.isDirty) {
      playlist.handleReset();
      setSaveBtnDisabled(false);
    }
  }, [form.formState.isDirty]);

  function handleFilterSubmit(formValues: FilterFormValues) {
    playlist.handleTrackAdd(formValues);
    form.reset(formValues, { keepValues: true, keepDirty: false });
  }

  function handleResubmit(formValues: FilterFormValues, trackId: number) {
    playlist.handleTrackReplace({ trackId, formValues });
  }

  function handleFilterSave(formValues: FilterFormValues) {
    savedFilters.handleSave(props.savedFormId || savedFormId, watchedFilters);
    form.reset(formValues, { keepValues: true, keepDirty: false });
    setSaveBtnDisabled(true);
    props.onEditingCancel();
  }

  // Change filter/form ID (for storing in state) every time we update the filter title (watchedFilters.name). If name is untouched, filter is just
  // resaved
  const [savedFormId] = useUUID(1, [watchedFilters.name]);

  const [isSaveBtnDisabled, setSaveBtnDisabled] = React.useState(false);

  return (
    <FormProvider {...form}>
      <div className="create-filter-form">
        <form
          onSubmit={form.handleSubmit(handleFilterSubmit)}
          id={props.formId}
          className={`create-filter-form__form ${props.className || ""}`}
        >
          <div>
            <button
              className="btn btn_type_secondary"
              onClick={(e) => {
                e.preventDefault();
                form.reset(props.defaultValues || DEFAULT_FILTER_VALUES, {
                  keepValues: false,
                  keepDirty: false,
                });
                form.clearErrors();
                setSaveBtnDisabled(false);
                playlist.handleReset();
              }}
            >
              Reset
            </button>
          </div>
          <div className="create-filter-form__title">
            <input
              {...form.register("name", { required: ERROR_MESSAGE })}
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
                    name={watchedFilters.filters[index].name.value}
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
                        watchedFilters.filters[index].name.value
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
                    className="btn btn_type_icon btn_hover_grey-20"
                  >
                    <FaMinus className="icon" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      insert(index + 1, [DEFAULT_FILTER_VALUES.filters[0]]);
                      form.reset(form.getValues());
                    }}
                    className="btn btn_type_icon btn_hover_grey-20"
                  >
                    <FaPlus className="icon" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="create-filter-form__controls">
            <button
              className="btn btn_type_primary"
              onClick={form.handleSubmit(handleFilterSave)}
              disabled={isSaveBtnDisabled}
            >
              {isSaveBtnDisabled ? "Saved" : "Save Filter"}
            </button>

            <div className="create-filter-form__row">
              <button
                className="btn btn_type_secondary"
                onClick={props.onEditingCancel}
              >
                Cancel
              </button>
              <button
                name="findtrack"
                type="submit"
                disabled={false}
                form={props.formId}
                className={`btn btn_type_primary ${props.className || ""}`}
              >
                Add Track
              </button>
            </div>
          </div>
        </form>
        <Playlist
          formId={props.formId}
          onReorderTracks={playlist.handleTrackReorder}
          onRemoveTrack={playlist.handleTrackRemove}
          onResubmit={handleResubmit}
          tracks={playlist.tracks}
          className="playlist_create-form-playlist"
        />
      </div>
    </FormProvider>
  );
}

export function ConditionSelect(props: SelectProps<string | number>) {
  const { isDirty, index, resetField } = props;
  const filtersWatch = useWatch({ name: "filters", control: props.control });
  const selectedFilterName = filtersWatch[index]?.name.value;

  React.useEffect(() => {
    if (resetField && isDirty) {
      resetField(`filters.${index}.condition`, {
        keepDirty: false,
        defaultValue: null,
      });
      resetField(`filters.${index}.value`, {
        keepDirty: false,
        defaultValue: null,
      });
    }
  }, [isDirty, selectedFilterName, index, resetField]);

  React.useEffect(() => {
    if (resetField) {
      resetField(`filters.${index}.condition`, { keepDirty: true });
      resetField(`filters.${index}.value`, { keepDirty: true });
    }
  }, [isDirty, index, resetField]);

  return (
    <>
      <Controller
        name={`filters.${props.index}.condition`}
        defaultValue={null}
        control={props.control}
        rules={{ required: ERROR_MESSAGE }}
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
        rules={{ required: ERROR_MESSAGE }}
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
