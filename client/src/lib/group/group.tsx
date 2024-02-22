import React from "react";
import {
  useForm,
  useFieldArray,
  UseFormHandleSubmit,
  UseFormRegister,
  Controller,
  Control,
  UseFormReset,
} from "react-hook-form";
import {
  FaChevronUp,
  FaChevronDown,
  FaPlus,
  FaMinus,
  FaFilter,
  FaFileAlt,
  FaAngleDown,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import Select from "react-select";

import {
  FormValues,
  TrackMeta,
  OptionsList,
  GetStatsRes,
  APIResponse,
} from "../../types";
import { useEditableText } from "../../hooks/use-editable-text";
import { EditableText } from "../../lib/editable-text/editable-text";
import { State as EditableState } from "../../hooks/use-editable-text";
import { Filter } from "../../hooks/use-filters";
import { Playlist } from "../playlist/playlist";
import { FiltersFormMemoized } from "./filters-form/filters-form";
import { defaultValues, OPERATORS } from "../../config/constants";
import { Stats as StatsType } from "../../types";
import { TemplatesForm } from "./templates-form/templates-form";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: number;
  name: string;
  mode: string;
  years?: StatsType[];
  genres?: StatsType[];
  isOpenGroupId: Record<string, boolean>;
  onToggle: () => void;
  onAddGroupWithTemplate: () => void;
  onAddGroupWithNewFilter: () => void;
  onDeleteGroup: () => void;
  onRenameGroup: (groupId: number, newName: string) => void;
  onGetTrack: (groupId: number, formValues: FormValues) => void;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: (
    groupId: number,
    trackId: number,
    formValues: FormValues
  ) => void;
  onFiltersChange: (groupId: number) => void;
  onGroupReorderUp: () => void;
  onGroupReorderDown: () => void;
  setPlayingIndex: ({
    groupId,
    index,
  }: {
    groupId: number;
    index: number;
  }) => void;
  tracks: Record<string, TrackMeta[]>;
  onReorderTrack: (
    index: number,
    direction: "UP" | "DOWN",
    groupId: number
  ) => void;
  saveFilter: ({ id, name, settings }: Filter) => void;
  deleteFilter: (name: string) => void;
  filters: {
    ids: string[];
    names: Record<string, string>;
    settings: Record<string, FormValues>;
  };
}

let renderCount = 0;

type Stats = {
  years: OptionsList<number>[];
  genres: OptionsList<number>[];
};

export function Group(props: GroupProps) {
  // console.log(renderCount++);

  const [filtersMode, setFiltersMode] = React.useState(false);

  // Group name

  const groupName = useEditableText(props.name);

  React.useEffect(() => {
    props.onRenameGroup(props.groupId, groupName.state.text);
  }, [groupName.state.text]);

  // "Filter constructor" mode

  const {
    formState,
    control,
    register,
    handleSubmit,
    resetField,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "filters",
  });

  const watchedNewFilters = watch();

  //

  const [stats, setStats] = React.useState<Stats>({ years: [], genres: [] });

  React.useEffect(() => {
    if (!props.genres || !props.years) return;

    const genres: OptionsList<number>[] = [...props.genres]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id as number, label: g.name }));

    const years: OptionsList<number>[] = [...props.years]
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .map((y) => ({ value: parseInt(y.name), label: String(y.name) }));

    setStats({ genres, years });
  }, [props.genres, props.years]);

  // Reset "filter constructor" mode's state on form update

  // If (form has been changed) reset all tracks
  const [isFiltersChanged, setIsFiltersChanged] = React.useState(false);
  React.useEffect(() => {
    if (formState.isDirty) {
      setIsFiltersChanged(true);
      props.onFiltersChange(props.groupId);
    } else {
      setIsFiltersChanged(false);
    }
  }, [formState]);

  React.useEffect(() => {
    if (isFiltersChanged) {
      reset(undefined, { keepValues: true, keepDirty: false });
    }
  }, [formState]);

  // "Saved filters" mode

  const {
    control: control2,
    register: register2,
    handleSubmit: handleSubmit2,
  } = useForm<{ templateId: OptionsList<string> }>({
    defaultValues: { templateId: { value: "", label: "" } },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  function onSavedFilterSubmit(formValues: {
    templateId: OptionsList<string>;
  }) {
    props.onGetTrack(
      props.groupId,
      props.filters.settings[formValues.templateId.value]
    );
  }

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <EditableText className="group__name" text={groupName} />
          <button
            onClick={props.onDeleteGroup}
            className="btn btn_theme_transparent-black"
          >
            <span>Delete</span>
          </button>

          <button
            onClick={props.onGroupReorderUp}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowUp className="icon" />
          </button>
          <button
            onClick={props.onGroupReorderDown}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowDown className="icon" />
          </button>

          <div className="group__toggle-group-btn" onClick={props.onToggle}>
            {props.isOpenGroupId[`${props.groupId}`] ? (
              <FaChevronUp className="icon" />
            ) : (
              <FaChevronDown className="icon" />
            )}
          </div>
        </header>

        <div
          className={`group__body ${
            props.isOpenGroupId[`${props.groupId}`] ? "" : "group__body_hidden"
          }`}
        >
          <div className="group__tabs group__btns">
            {props.mode === "template" ? null : (
              <button
                className="btn btn_theme_transparent-black group__save-filter-btn"
                onClick={() => {
                  props.saveFilter({
                    id: JSON.stringify(watchedNewFilters),
                    name: groupName.state.text,
                    settings: watchedNewFilters,
                  });
                }}
              >
                Save filter
              </button>
            )}
          </div>
          {props.mode === "template" ? (
            <TemplatesForm
              handleSubmit2={handleSubmit2}
              onTemplateSubmit={onSavedFilterSubmit}
              filters={props.filters}
              register2={register2}
              control={control2}
            />
          ) : (
            <FiltersFormMemoized
              groupId={props.groupId}
              register={register}
              insert={insert}
              remove={remove}
              handleSubmit={handleSubmit}
              onGetTrack={props.onGetTrack}
              control={control}
              resetField={resetField}
              fields={fields}
              setValue={setValue}
              stats={stats}
              className="group__form"
            />
          )}
          <Playlist
            className="group__playlist"
            handleSubmit={handleSubmit}
            tracks={props.tracks}
            groupId={props.groupId}
            setPlayingIndex={props.setPlayingIndex}
            onReorderTrack={props.onReorderTrack}
            onReplaceTrack={props.onReplaceTrack}
            onRemoveTrack={props.onRemoveTrack}
          />
        </div>
      </div>
      <div className="app__btns">
        <button
          className="btn btn_theme_transparent-black add-section-btn"
          onClick={props.onAddGroupWithTemplate}
        >
          <span>Add new section (using saved filters)</span>
          <FaFileAlt className="icon" />
        </button>
        <button
          className="btn btn_theme_transparent-black add-section-btn"
          onClick={props.onAddGroupWithNewFilter}
        >
          <span>Add new section (creating a new filter)</span>
          <FaFilter className="icon" />
        </button>
      </div>
    </>
  );
}
