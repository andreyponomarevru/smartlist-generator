import React from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import { FilterFormValues, OptionsList, TrackMeta } from "../../../types";
import { TrackToReorder, TrackToReplace } from "../../../hooks/use-playlist";
import { useSavedFilters } from "../../../hooks/use-saved-filters";
import { useGlobalState } from "../../../hooks/use-global-state";

import "./saved-filters-form.scss";
/*
interface SavedFiltersForm extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
}

 function SavedFiltersForm(props: SavedFiltersForm) {
  const { playlist } = useGlobalState();
  const { savedFilters } = useSavedFilters();

  const options = Object.entries(savedFilters).map(([id, inputs]) => {
    return { label: inputs.name, value: id };
  });

  const { control, handleSubmit, watch } = useForm<{
    filterId: {
      label: string;
      value: string;
    };
  }>({
    defaultValues: { filterId: options[0] },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const watchedSelect = watch();

  React.useEffect(() => {
    playlist.handleResetTracks(props.groupId);
  }, [watchedSelect]);

  function onSavedFilterSubmit(formValues: { filterId: OptionsList<string> }) {
    //playlist.handleAddTrack(settings[formValues.savedFilterId.value]);
  }

  // <IoMdInformationCircleOutline />

  return (
    <>
      <form
        className={`saved-filters-form ${props.className || ""}`}
        onSubmit={handleSubmit(onSavedFilterSubmit)}
        id="filter-form"
      >{
        <Controller
          name="filterId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              className="saved-filters-form__select"
              options={options}
            />
          )}
        />
        <SubmitFormBtn className="saved-filters-form__find-track-btn" />
          }</form>
      {<Playlist
        className="group__playlist"
        handleSubmit={{} as any}
        onFormSubmit={() => {}}
        savedFilter={settings[watchedSelect.savedFilterId.value]}
        tracks={[]}
      />}
    </>
  );
}
*/
