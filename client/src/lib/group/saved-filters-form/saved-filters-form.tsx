import React from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import { FilterFormValues, OptionsList, TrackMeta } from "../../../types";
import { Playlist } from "../../playlist/playlist";
import { TrackToReorder, TrackToReplace } from "../../../hooks/use-playlist";
import { State as SavedFilterState } from "../../../hooks/use-saved-filters";

import "./saved-filters-form.scss";

interface SavedFiltersForm extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
  filters: SavedFilterState;
  onGetTrack: (groupId: number, formValues: FilterFormValues) => void;
  onFiltersChange: (groupId: number) => void;

  // Playlist props
  setPlayingIndex: ({
    groupId,
    index,
  }: {
    groupId: number;
    index: number;
  }) => void;
  tracks: Record<string, TrackMeta[]>;
  onRemoveTrack: (groupId: number, trackId: number) => void;
  onReplaceTrack: ({ groupId, trackId, formValues }: TrackToReplace) => void;
  onReorderTrack: ({ index, direction, groupId }: TrackToReorder) => void;
}

export function SavedFiltersForm(props: SavedFiltersForm) {
  const options = Object.values(props.filters.ids).map((id) => {
    return { label: props.filters.names[id], value: id };
  });

  const { control, handleSubmit, watch } = useForm<{
    savedFilterId: OptionsList<string>;
  }>({
    defaultValues: { savedFilterId: options[0] },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const watchedSelect = watch();

  console.log("props.filters.ids", props.filters.ids);

  React.useEffect(() => {
    props.onFiltersChange(props.groupId);
  }, [watchedSelect.savedFilterId]);

  function onSavedFilterSubmit(formValues: {
    savedFilterId: OptionsList<string>;
  }) {
    props.onGetTrack(
      props.groupId,
      props.filters.settings[formValues.savedFilterId.value]
    );
  }

  return (
    <>
      <form
        className={`saved-filters-form ${props.className || ""}`}
        onSubmit={handleSubmit(onSavedFilterSubmit)}
      >
        <Controller
          name="savedFilterId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              className="saved-filters-form__select"
              options={options}
            />
          )}
        />

        <button
          type="submit"
          name="a"
          disabled={false}
          className="btn btn_theme_black saved-filters-form__find-track-btn"
        >
          Find a track
        </button>
      </form>

      <Playlist
        className="group__playlist"
        handleSubmit={handleSubmit}
        tracks={props.tracks}
        groupId={props.groupId}
        setPlayingIndex={props.setPlayingIndex}
        onReorderTrack={props.onReorderTrack}
        onReplaceTrack={props.onReplaceTrack}
        onRemoveTrack={props.onRemoveTrack}
        savedFilter={props.filters.settings[watchedSelect.savedFilterId.value]}
      />
    </>
  );
}
