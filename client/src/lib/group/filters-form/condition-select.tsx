import React from "react";
import { useWatch, Controller } from "react-hook-form";
import Select from "react-select";
import { SelectProps } from "../../../types";

export function ConditionSelect(props: SelectProps<string>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (filtersWatch[props.index]?.name.value === props.name) {
      props.resetField(`filters.${props.index}.condition`, {
        defaultValue: props.defaultValue,
      });
    }
  }, [filtersWatch[props.index]?.name.value]);

  return filtersWatch[props.index]?.name.value === props.name ? (
    <Controller
      name={`filters.${props.index}.condition`}
      control={props.control}
      render={({ field }) => (
        <Select
          {...field}
          options={props.options}
          defaultValue={props.defaultValue}
        />
      )}
    />
  ) : null;
}
