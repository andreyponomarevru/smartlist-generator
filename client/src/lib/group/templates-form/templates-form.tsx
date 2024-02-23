import React from "react";
import {
  UseFormHandleSubmit,
  UseFormRegister,
  Controller,
  Control,
  useForm,
} from "react-hook-form";
import Select from "react-select";

import { FilterFormValues, OptionsList, TrackMeta } from "../../../types";
import { Playlist } from "../../playlist/playlist";

import "./templates-form.scss";

interface TemplatesForm extends React.HTMLAttributes<HTMLFormElement> {
  groupId: number;
  filters: {
    ids: string[];
    names: Record<string, string>;
    settings: Record<string, FilterFormValues>;
  };
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
}

export function TemplatesForm(props: TemplatesForm) {
  const { control, handleSubmit, watch } = useForm<{
    templateId: OptionsList<string>;
  }>({
    defaultValues: { templateId: { value: "", label: "" } },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const watchedSelect = watch();

  React.useEffect(() => {
    props.onFiltersChange(props.groupId);
  }, [watchedSelect.templateId]);

  function onSavedFilterSubmit(formValues: {
    templateId: OptionsList<string>;
  }) {
    props.onGetTrack(
      props.groupId,
      props.filters.settings[formValues.templateId.value]
    );
  }

  // props.onReplaceTrackprops.groupId, track.trackId, props.template);

  return (
    <>
      <form
        className={`templates-form ${props.className || ""}`}
        onSubmit={handleSubmit(onSavedFilterSubmit)}
      >
        <Controller
          name="templateId"
          control={control}
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

      <Playlist
        className="group__playlist"
        handleSubmit={handleSubmit}
        tracks={props.tracks}
        groupId={props.groupId}
        setPlayingIndex={props.setPlayingIndex}
        onReorderTrack={props.onReorderTrack}
        onReplaceTrack={props.onReplaceTrack}
        onRemoveTrack={props.onRemoveTrack}
        template={props.filters.settings[watchedSelect.templateId.value]}
      />
    </>
  );
}
