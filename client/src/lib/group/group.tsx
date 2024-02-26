import React from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaFilter,
  FaFileAlt,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

import { FilterFormValues, TrackMeta } from "../../types";
import { useEditableText } from "../../hooks/use-editable-text";
import { EditableText } from "../../lib/editable-text/editable-text";
import { Filter } from "../../hooks/use-saved-filters";
import { FiltersForm } from "./filters-form/filters-form";
import { Stats as StatsType } from "../../types";
import { SavedFiltersForm } from "./saved-filters-form/saved-filters-form";
import { TrackToReorder, TrackToReplace } from "../../hooks/use-playlist";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: number;
  name: string;
  mode: string;
  years?: StatsType[];
  genres?: StatsType[];
  isOpenGroupId: Record<string, boolean>;
  onToggle: () => void;
  onAddGroupWithSavedFilter: () => void;
  onAddGroupWithNewFilter: () => void;
  onDeleteGroup: () => void;
  onRenameGroup: (groupId: number, newName: string) => void;
  onGetTrack: (groupId: number, formValues: FilterFormValues) => void;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: ({ groupId, trackId, formValues }: TrackToReplace) => void;
  onReorderTrack: ({ index, direction, groupId }: TrackToReorder) => void;
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
        <header className="group__header" onClick={props.onToggle}>
          <EditableText className="group__name" editable={groupName} />
          <button
            onClick={props.onDeleteGroup}
            className="btn btn_theme_transparent-black"
          >
            <span>Delete</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onGroupReorderUp();
            }}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowUp className="icon" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onGroupReorderDown();
            }}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowDown className="icon" />
          </button>
          <div className="group__toggle-group-btn">
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
          {props.mode === "saved-filter" ? (
            <SavedFiltersForm
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
              name={groupName.state.text}
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
          onClick={props.onAddGroupWithSavedFilter}
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
