/*import React from "react";
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
import { CreateFilterForm } from "../create-filter-form/create-filter-form";
//import { SavedFiltersForm } from "../../pages/playlist-page/saved-filters-form/saved-filters-form";
import { useGlobalState } from "../../hooks/use-global-state";
import { SavedFiltersProvider } from "../../hooks/use-saved-filters";
import { CREATE_FILTER_FORM_ID } from "../../config/constants";

import "./group.scss";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: number;
  index: number;
}

const renderCount = 0;

function Group(props: GroupProps) {
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
      <div>
        <header
          className="group__header"
          onClick={() => playlist.toggleIsGroupOpen(props.groupId)}
        >
          <span className="group__index">{props.index + 1}.</span>
          <EditableText className="group__name" editable={groupName} />
          <div className="group__toggle-group-btn">
            {playlist.isGroupOpen[`${props.groupId}`] ? (
              <FaChevronUp className="icon" />
            ) : (
              <FaChevronDown className="icon" />
            )}
          </div>
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
        </header>

        <div
          className={`group__body ${
            playlist.isGroupOpen[`${props.groupId}`] ? "" : "group__body_hidden"
          }`}
        >
          <SavedFiltersProvider>
            {/*<SavedFiltersForm groupId={props.groupId} />}
            <CreateFilterForm
              formId={CREATE_FILTER_FORM_ID}
              className="group__form"
            />
          </SavedFiltersProvider>
        </div>
      </div>
      <div>
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
*/
