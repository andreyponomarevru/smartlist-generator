import React from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  FormProvider,
} from "react-hook-form";
import Select, { StylesConfig } from "react-select";

import { Field } from "./field-component";
import { upsertFilter } from "../../filters";
import { Message } from "../../../ui/message";
import { FilterFormValues, TrackMeta, OptionsList } from "../../../../types";
import { useAppDispatch } from "../../../../hooks/redux-ts-helpers";
import { usePlaylist } from "../hooks/use-playlist";
import { DEFAULT_FILTER_VALUES, OPERATORS } from "../constants";
import { Loader } from "../../../ui/loader";
import { Track } from "../../../track";
import { Subplaylist } from "../../../ui/subplaylist";
import { getRTKQueryErr } from "../../../../utils";

import "./edit-filter-form.scss";

export const EDIT_FILTER_FORM_ID = "create-filter-form";

export function createSingleSelectStyles(
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

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  filterId: string;
  defaultValues?: FilterFormValues;
  onCancelClick: () => void;
}

export function EditFilterForm(props: Props) {
  const dispatch = useAppDispatch();

  const {
    tracks,
    handleTrackAdd,
    handleTrackRemove,
    handleTrackReorder,
    handleTrackReplace,
    handleTracksReset,
    findTrackResult,
  } = usePlaylist();

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

  function handleTrackResubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    trackId: number,
  ) {
    form.handleSubmit((formValues) => {
      function resubmit(formValues: FilterFormValues, trackId: number) {
        handleTrackReplace({ formValues, trackId });
      }

      return resubmit(formValues, trackId);
    })(e);
  }

  // If the filter has been updated - hide playlist
  React.useEffect(() => {
    if (form.formState.isDirty) {
      handleTracksReset();
      form.reset(watchedFilters, { keepValues: true, keepDirty: false });
    }
  }, [form, watchedFilters]);

  async function handleFilterSubmit(formValues: FilterFormValues) {
    handleTrackAdd(formValues);
    form.reset(formValues, { keepValues: true, keepDirty: false });
  }

  function handleFilterSave(formValues: FilterFormValues) {
    if (props.filterId === EDIT_FILTER_FORM_ID) {
      dispatch(upsertFilter({ inputs: watchedFilters }));
    } else {
      dispatch(upsertFilter({ id: props.filterId, inputs: watchedFilters }));
    }
    form.reset(formValues, { keepValues: true, keepDirty: false });
    props.onCancelClick();
  }

  return (
    <div className="edit-filter-form">
      <form
        onSubmit={form.handleSubmit(handleFilterSubmit)}
        id={props.filterId}
        className={`edit-filter-form__form ${props.className || ""}`}
      >
        <div>
          <button
            type="button"
            className="btn btn_type_secondary"
            onClick={(e) => {
              e.preventDefault();
              form.reset(props.defaultValues || DEFAULT_FILTER_VALUES, {
                keepValues: false,
                keepDirty: false,
              });
              form.clearErrors();
              handleTracksReset();
            }}
          >
            Reset
          </button>
        </div>

        <div className="edit-filter-form__title">
          <input
            {...form.register("name", { required: true })}
            className={`input edit-filter-form__input ${
              form.formState.errors.name ? "input_error" : ""
            }`}
          />
          {form.formState.errors.name && (
            <Message type="danger" className="edit-filter-form__error">
              {form.formState.errors.name.message}
            </Message>
          )}
        </div>

        <div className="edit-filter-form__row edit-filter-form__operator-row">
          <label htmlFor={props.filterId}>Match</label>
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

        <FormProvider {...form}>
          {fields.map((field, index) => (
            <Field
              fieldsCount={fields.length}
              field={field}
              index={index}
              remove={remove}
              insert={insert}
              key={JSON.stringify(field) + index + Date.now()}
            />
          ))}
        </FormProvider>

        <div className="edit-filter-form__controls">
          <button
            type="button"
            className="btn btn_type_primary"
            onClick={form.handleSubmit(handleFilterSave)}
          >
            Save Filter
          </button>

          <div className="edit-filter-form__row">
            <button
              type="button"
              className="btn btn_type_secondary"
              onClick={props.onCancelClick}
            >
              Cancel
            </button>
            <button
              name="findtrack"
              type="submit"
              disabled={findTrackResult.isFetching}
              form={props.filterId}
              className="btn btn_type_primary"
            >
              {findTrackResult.isLoading && (
                <Loader className="btn_loader-color_white" />
              )}
              Add Track
            </button>
          </div>
        </div>
        {findTrackResult.error && (
          <Message type="danger">
            {getRTKQueryErr(findTrackResult.error)}
          </Message>
        )}
      </form>

      {tracks.length > 0 && (
        <Subplaylist className="edit-filter-form__playlist">
          {tracks.map((trackMeta: TrackMeta, index) => (
            <Track
              key={JSON.stringify(trackMeta) + props.filterId}
              formId={props.filterId}
              meta={trackMeta}
              index={index}
              onRemoveTrack={handleTrackRemove}
              onReorderTracks={handleTrackReorder}
              onResubmit={handleTrackResubmit}
              tracksTotal={tracks.length}
            />
          ))}
        </Subplaylist>
      )}
    </div>
  );
}
