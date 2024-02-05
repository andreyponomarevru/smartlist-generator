import React from "react";
import { useWatch, Controller } from "react-hook-form";
import Select from "react-select";
import { SelectProps } from "../../types";

export function ValueSelect(props: SelectProps<number>) {
  const filtersWatch = useWatch({ name: "filters", control: props.control });

  React.useEffect(() => {
    if (filtersWatch[props.index]?.name.value === props.name) {
      props.resetField(`filters.${props.index}.value`, {
        defaultValue: props.defaultValue,
      });
    }
  }, [filtersWatch[props.index]?.name.value]);

  // If the  name of this component (props.name) matches the selected in dropdowb filter name
  return filtersWatch[props.index]?.name.value === props.name ? (
    <Controller
      name={`filters.${props.index}.value`}
      control={props.control}
      render={({ field }) => {
        return (
          <Select
            {...field}
            closeMenuOnSelect={props.name !== "genre"}
            isMulti={props.name === "genre"}
            options={props.options}
            defaultValue={props.defaultValue}
          />
        );
      }}
    />
  ) : null;
}
