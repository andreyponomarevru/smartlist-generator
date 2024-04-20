import React from "react";
import {
  Controller,
  useWatch,
  Control,
  UseFormResetField,
} from "react-hook-form";
import Select from "react-select";

import { Message } from "../../../ui/message";
import { OptionsList, FilterFormValues } from "../../../../types";
import {
  createSingleSelectStyles,
  createMultiSelectStyles,
} from "./react-select-styles";

type Props<OptionsValue> = {
  name: string;
  control: Control<FilterFormValues>;
  index: number;
  conditionOptionsList: OptionsList<OptionsValue>[];
  valueOptionsList: Record<string, OptionsList<OptionsValue>[]>;
  resetField: UseFormResetField<FilterFormValues>;
  isDirty: boolean;
};

export const ConditionSelect = React.memo(function (
  props: Props<string | number>,
) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });
  const selectedFilterName = filtersWatch[props.index]?.name.value;

  React.useEffect(() => {
    if (props.isDirty) {
      props.resetField(`filters.${props.index}.condition`, {
        keepDirty: false,
        defaultValue: null,
      });
      props.resetField(`filters.${props.index}.value`, {
        keepDirty: false,
        defaultValue: null,
      });
    }
  }, [props.isDirty, selectedFilterName, props.resetField]);

  return (
    <>
      <Controller
        name={`filters.${props.index}.condition`}
        defaultValue={null}
        control={props.control}
        rules={{ required: true }}
        render={({ field, fieldState: { error }, formState: { isDirty } }) => {
          return (
            <div className="create-filter-form__select-wrapper">
              <Select
                {...field}
                className="error"
                options={props.conditionOptionsList}
                styles={createSingleSelectStyles(!!error)}
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
        rules={{ required: true }}
        render={({ field, fieldState: { error }, formState: { isDirty } }) => {
          return (
            <div className="create-filter-form__select-wrapper">
              <Select
                {...field}
                closeMenuOnSelect={props.name === "year"}
                isMulti={props.name === "genre" || undefined}
                options={props.valueOptionsList[props.name]}
                styles={createMultiSelectStyles(!!error)}
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
});
