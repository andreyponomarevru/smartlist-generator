import React from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaFilter,
  FaFileAlt,
  FaArrowDown,
  FaArrowUp,
  FaRegTrashAlt,
  FaSlidersH,
} from "react-icons/fa";

import { useEditableText } from "../../hooks/use-editable-text";
import { EditableText } from "../../lib/editable-text/editable-text";
import { FiltersForm } from "./filters-form/filters-form";
import { SavedFiltersForm } from "./saved-filters-form/saved-filters-form";
import { useGlobalState } from "../../hooks/use-global-state";
import { SavedFiltersProvider } from "../../hooks/use-saved-filters";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: number;
  index: number;
}

let renderCount = 0;

export function Group(props: GroupProps) {
  // console.log(renderCount++);

  const { playlist } = useGlobalState();

  const groupName = useEditableText(playlist.groupNames[`${props.groupId}`]);

  React.useEffect(() => {
    if (groupName.state.text !== playlist.groupNames[`${props.groupId}`]) {
      playlist.handleRenameGroup(props.groupId, groupName.state.text);
    }
  }, [groupName.state.text]);

  return (
    <>
      <div className={`group ${props.className || ""}`}>
        <header
          className="group__header"
          onClick={() => playlist.toggleIsGroupOpen(props.groupId)}
        >
          <span className="group__index">{props.index + 1}.</span>
          <EditableText className="group__name" editable={groupName} />
          <button
            onClick={() => playlist.handleDestroyGroup(props.groupId)}
            className="btn btn_theme_transparent-black"
          >
            <span>
              <FaRegTrashAlt className="icon" />
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playlist.handleReorderGroups(props.index, "UP");
            }}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowUp className="icon" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playlist.handleReorderGroups(props.index, "DOWN");
            }}
            className="btn btn_theme_transparent-black group__sort-btn"
          >
            <FaArrowDown className="icon" />
          </button>
          <div className="group__toggle-group-btn">
            {playlist.isGroupOpen[`${props.groupId}`] ? (
              <FaChevronUp className="icon" />
            ) : (
              <FaChevronDown className="icon" />
            )}
          </div>
        </header>

        <div
          className={`group__body ${
            playlist.isGroupOpen[`${props.groupId}`] ? "" : "group__body_hidden"
          }`}
        >
          <SavedFiltersProvider>
            {playlist.groupModes[`${props.groupId}`] === "saved-filter" ? (
              <SavedFiltersForm groupId={props.groupId} />
            ) : (
              <FiltersForm groupId={props.groupId} className="group__form" />
            )}
          </SavedFiltersProvider>
        </div>
      </div>
      <div className="group__btns-group">
        <button
          className="btn btn_theme_transparent-black add-section-btn"
          onClick={() =>
            playlist.handleAddGroup(props.index + 1, "saved-filter")
          }
        >
          <FaFileAlt className="icon" />
          <span>Use saved filters</span>
        </button>
        <button
          className="btn btn_theme_transparent-black add-section-btn"
          onClick={() => playlist.handleAddGroup(props.index + 1, "new-filter")}
        >
          <FaSlidersH className="icon" />
          <span>Create a new filter</span>
        </button>
      </div>
    </>
  );
}
