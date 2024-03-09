import { OptionsList } from "../types";

export const OPERATORS: Record<string, OptionsList<string>> = {
  any: { label: "any", value: "or" },
  all: { label: "all", value: "and" },
};
export const FILTER_NAMES: Record<string, OptionsList<string>> = {
  year: { label: "Year", value: "year" },
  genre: { label: "Genre", value: "genre" },
};
export const FILTER_CONDITIONS: Record<
  string,
  Record<string, OptionsList<string>>
> = {
  genre: {
    containsAll: { label: "contains all", value: "contains all" },
    containsAny: { label: "contains any", value: "contains any" },
    doesNotContainAll: {
      label: "does not contain all",
      value: "does not contain all",
    },
    doesNotContainAny: {
      label: "does not contain any",
      value: "does not contain any",
    },
  },
  year: {
    is: { label: "is", value: "is" },
    isNot: { label: "is not", value: "is not" },
    gte: { label: "greater than or equal", value: "greater than or equal" },
    lte: { label: "less than or equal", value: "less than or equal" },
  },
};

export const CREATE_FILTER_FORM_ID = "create-filter-form";
export const EDIT_FILTER_FORM_ID = "edit-filter-form";
export const CHOOSE_FILTER_FORM_ID = "choose-filter-form";
