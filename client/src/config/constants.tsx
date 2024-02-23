import { OptionsList, FilterFormValues } from "../types";

export const OPERATORS: OptionsList<string>[] = [
  { label: "any", value: "or" },
  { label: "all", value: "and" },
];
export const FILTER_NAMES: OptionsList<string>[] = [
  { label: "Year", value: "year" },
  { label: "Genre", value: "genre" },
];
export const GENRE_CONDITIONS: OptionsList<string>[] = [
  { label: "contains all", value: "contains all" },
  { label: "contains any", value: "contains any" },
  { label: "does not contain all", value: "does not contain all" },
  { label: "does not contain any", value: "does not contain any" },
];
export const YEAR_CONDITIONS: OptionsList<string>[] = [
  { label: "is", value: "is" },
  { label: "is not", value: "is not" },
  { label: "greater than or equal", value: "greater than or equal" },
  { label: "less than or equal", value: "less than or equal" },
];

export const defaultValues: FilterFormValues = {
  operator: OPERATORS[0],
  filters: [
    {
      name: FILTER_NAMES[1],
      condition: GENRE_CONDITIONS[0],
      value: [],
    },
  ],
};
