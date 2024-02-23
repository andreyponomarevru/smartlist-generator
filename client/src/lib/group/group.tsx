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
  FilterFormValues,
  TrackMeta,
  OptionsList,
  GetStatsRes,
  APIResponse,
} from "../../types";
import { useEditableText } from "../../hooks/use-editable-text";
import { EditableText } from "../../lib/editable-text/editable-text";
import { State as EditableState } from "../../hooks/use-editable-text";
import { Filter } from "../../hooks/use-templates";
import { Playlist } from "../playlist/playlist";
import { FiltersForm } from "./filters-form/filters-form";
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
  onGetTrack: (groupId: number, formValues: FilterFormValues) => void;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: (
    groupId: number,
    trackId: number,
    formValues: FilterFormValues
  ) => void;
  onReorderTrack: (
    index: number,
    direction: "UP" | "DOWN",
    groupId: number
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
  saveFilter: ({ id, name, settings }: Filter) => void;
  deleteFilter: (name: string) => void;
  filters: {
    ids: string[];
    names: Record<string, string>;
    settings: Record<string, FilterFormValues>;
  };
}

let renderCount = 0;

export function Group(props: GroupProps) {
  // console.log(renderCount++);

  const groupName = useEditableText(props.name);

  React.useEffect(() => {
    if (groupName.state.text !== props.name) {
      props.onRenameGroup(props.groupId, groupName.state.text);
    }
  }, [groupName.state.text]);

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header className="group__header">
          <EditableText className="group__name" editable={groupName} />
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
          {props.mode === "template" ? (
            <TemplatesForm
              groupId={props.groupId}
              filters={props.filters}
              onGetTrack={props.onGetTrack}
              setPlayingIndex={props.setPlayingIndex}
              tracks={props.tracks}
              onRemoveTrack={props.onRemoveTrack}
              onReplaceTrack={props.onReplaceTrack}
              onReorderTrack={props.onReorderTrack}
              onFiltersChange={props.onFiltersChange}
            />
          ) : (
            <FiltersForm
              groupId={props.groupId}
              name={"groupName.state.text"}
              onGetTrack={props.onGetTrack}
              years={props.years}
              genres={props.genres}
              onFiltersChange={props.onFiltersChange}
              saveFilter={props.saveFilter}
              setPlayingIndex={props.setPlayingIndex}
              tracks={props.tracks}
              onRemoveTrack={props.onRemoveTrack}
              onReplaceTrack={props.onReplaceTrack}
              onReorderTrack={props.onReorderTrack}
              className="group__form"
            />
          )}
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
