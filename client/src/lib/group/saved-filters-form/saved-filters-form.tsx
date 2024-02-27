import React from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import { FilterFormValues, OptionsList, TrackMeta } from "../../../types";
import { Playlist } from "../../playlist/playlist";
import { TrackToReorder, TrackToReplace } from "../../../hooks/use-playlist";
import { useSavedFilters } from "../../../hooks/use-saved-filters";
import { SubmitFormBtn } from "../submit-form-btn/submit-form-btn";
import { useGlobalState } from "../../../hooks/use-global-state";

import "./saved-filters-form.scss";

interface SavedFiltersForm extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
}

export function SavedFiltersForm(props: SavedFiltersForm) {
  const { playlist } = useGlobalState();
  const {
    state: { ids, names, settings },
  } = useSavedFilters();

  const options = Object.values(ids).map((id) => {
    return { label: names[id], value: id };
  });

  const { control, handleSubmit, watch } = useForm<{
    savedFilterId: OptionsList<string>;
  }>({
    defaultValues: { savedFilterId: options[0] },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const watchedSelect = watch();

  React.useEffect(() => {
    playlist.handleResetTracks(props.groupId);
  }, [watchedSelect.savedFilterId]);

  function onSavedFilterSubmit(formValues: {
    savedFilterId: OptionsList<string>;
  }) {
    playlist.handleAddTrack(
      props.groupId,
      settings[formValues.savedFilterId.value]
    );
  }

  return (
    <>
      <form
        className={`saved-filters-form ${props.className || ""}`}
        onSubmit={handleSubmit(onSavedFilterSubmit)}
        id={`filter-form-${props.groupId}`}
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
        <SubmitFormBtn
          groupId={props.groupId}
          className="saved-filters-form__find-track-btn"
        />
      </form>
      <Playlist
        className="group__playlist"
        handleSubmit={handleSubmit}
        groupId={props.groupId}
        savedFilter={settings[watchedSelect.savedFilterId.value]}
      />
    </>
  );
}
