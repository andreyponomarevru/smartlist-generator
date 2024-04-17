import { StylesConfig } from "react-select";

import { OptionsList } from "../../../types";

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
