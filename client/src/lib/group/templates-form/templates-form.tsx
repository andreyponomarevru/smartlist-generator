import React from "react";
import {
  UseFormHandleSubmit,
  UseFormRegister,
  Controller,
  Control,
} from "react-hook-form";
import Select from "react-select";

import { FormValues, OptionsList } from "../../../types";

import "./templates-form.scss";

interface TemplatesForm extends React.HTMLAttributes<HTMLFormElement> {
  handleSubmit2: UseFormHandleSubmit<
    { templateId: OptionsList<string> },
    undefined
  >;
  onTemplateSubmit: (formValues: { templateId: OptionsList<string> }) => void;
  filters: {
    ids: string[];
    names: Record<string, string>;
    settings: Record<string, FormValues>;
  };
  register2: UseFormRegister<{
    templateId: OptionsList<string>;
  }>;
  control: Control<{ templateId: OptionsList<string> }, any>;
}

export function TemplatesForm(props: TemplatesForm) {
  return (
    <form
      className={`templates-form ${props.className || ""}`}
      onSubmit={props.handleSubmit2(props.onTemplateSubmit)}
    >
      <Controller
        name="templateId"
        control={props.control}
        render={({ field }) => (
          <Select
            className="templates-form__select"
            {...field}
            options={Object.values(props.filters.ids).map((id) => {
              return { label: props.filters.names[id], value: id };
            })}
          />
        )}
      />

      <button
        type="submit"
        name="a"
        disabled={false}
        className="btn btn_theme_black templates-form__find-track-btn"
      >
        Find a track
      </button>
    </form>
  );
}
