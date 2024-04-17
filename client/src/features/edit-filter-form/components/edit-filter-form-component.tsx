import React from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  FormProvider,
} from "react-hook-form";
import Select from "react-select";

import { Field } from "./field/field-component";
import { upsertFilter } from "../../filters";
import { Message } from "../../ui/message";
import { FilterFormValues } from "../../../types";
import { Subplaylist } from "../../subplaylist/components/subplaylist-component";
import { createSingleSelectStyles } from "./react-select-styles";
import { useAppDispatch } from "../../../hooks/redux-ts-helpers";
import { usePlaylist } from "../hooks/use-playlist";
import { DEFAULT_FILTER_VALUES, OPERATORS } from "../constants";
import { Loader } from "../../ui/loader";
import { APIErrorMessage } from "../../ui/api-error-msg";

export const EDIT_FILTER_FORM_ID = "create-filter-form";

import "./edit-filter-form.scss";

interface EditFilterFormProps extends React.HTMLAttributes<HTMLFormElement> {
  filterId: string;
  defaultValues?: FilterFormValues;
  onCancelClick: () => void;
}

export function EditFilterForm(props: EditFilterFormProps) {
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

  function handleResubmit(formValues: FilterFormValues, trackId: number) {
    handleTrackReplace({ trackId, formValues });
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
              key={field.toString() + index}
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
          <APIErrorMessage
            error={{ status: 400, message: "Request error", moreInfo: "" }}
          />
        )}
      </form>
      <FormProvider {...form}>
        <Subplaylist
          formId={props.filterId}
          onReorderTracks={handleTrackReorder}
          onRemoveTrack={handleTrackRemove}
          onResubmit={handleResubmit}
          tracks={tracks}
          className="subplaylist_create-form-playlist"
        />
      </FormProvider>
    </div>
  );
}
