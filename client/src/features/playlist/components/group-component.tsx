import React from "react";
import Select from "react-select";
import { Controller, useForm, FormProvider } from "react-hook-form";
import {
  FaChevronUp,
  FaChevronDown,
  FaArrowDown,
  FaArrowUp,
  FaRegTrashAlt,
} from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { GrCircleInformation } from "react-icons/gr";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../hooks/redux-ts-helpers";
import { OptionsList, SavedFilterFormValues, TrackMeta } from "../../../types";
import { Track } from "../../track";
import { Subplaylist } from "../../ui/subplaylist";
import { Modal, useModal } from "../../ui/modal/";
import { FilterDetails, selectFilters } from "../../filters/";
import { useLazyFindTrackQuery } from "../../track";
import type { Direction } from "../playlist-slice";
import { selectExcludedTracksIds } from "../../excluded-tracks";
import {
  addGroup,
  reorderGroup,
  destroyGroup,
  toggleOpenGroup,
  addTrack,
  removeTrack,
  reorderTrack,
  replaceTrack,
  resetGroup,
  selectPlaylist,
  selectTracksFromGroup,
} from "../playlist-slice";
import { Message } from "../../ui/message";

import "./group.scss";

export const CHOOSE_FILTER_FORM_ID = "choose-filter-form";

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId: string;
  index: number;
}

type SavedFilter = { filterId: { label: string; value: string } };

export function Group(props: GroupProps) {
  const { setState: setModalState } = useModal();

  const dispatch = useAppDispatch();
  const playlist = useAppSelector(selectPlaylist);
  const excludedTracksIds = useAppSelector(selectExcludedTracksIds);
  const tracks = useAppSelector((state) =>
    selectTracksFromGroup(state, props.groupId),
  );

  const [findTrack, findTrackResult] = useLazyFindTrackQuery();

  const filters = useAppSelector(selectFilters);

  const options = Object.entries(filters).map(([id, formValues]) => {
    return { label: formValues.name, value: id };
  });
  const form = useForm<SavedFilter>({
    defaultValues: { filterId: options[0] },
    mode: "onSubmit",
    shouldUnregister: false,
  });
  const selectedFilterId = form.watch("filterId.value");

  async function handleSubmit(formValues: { filterId: OptionsList<string> }) {
    try {
      const foundTrack = await findTrack({
        formValues: filters[formValues.filterId.value],
        excludedTracks: [...excludedTracksIds, ...tracks.map((t) => t.trackId)],
      }).unwrap();
      dispatch(addTrack({ groupId: props.groupId, tracks: foundTrack }));
    } catch (err) {
      console.log("Ooops ...", err);
    }
  }

  async function handleResubmit(
    formValues: SavedFilterFormValues,
    trackId: number,
  ) {
    try {
      const foundTrack = await findTrack({
        formValues: filters[formValues.filterId.value],
        excludedTracks: [...excludedTracksIds, ...tracks.map((t) => t.trackId)],
      }).unwrap();
      dispatch(
        replaceTrack({ groupId: props.groupId, trackId, newTrack: foundTrack }),
      );
    } catch (err) {
      console.log("Ooops ...", err);
    }
  }

  function handleTrackRemove(trackId: number) {
    dispatch(removeTrack({ groupId: props.groupId, trackId }));
  }

  function handleTrackReorder({
    index,
    direction,
  }: {
    index: number;
    direction: Direction;
  }) {
    dispatch(reorderTrack({ index, direction, groupId: props.groupId }));
  }

  return (
    <>
      <div className="group">
        <header
          className="group__header"
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleOpenGroup({ groupId: props.groupId }));
          }}
        >
          <span className="group__index">{props.index + 1}</span>
          <div className="group__name">
            <form
              className={`group__saved-filters-form ${props.className || ""}`}
              onSubmit={form.handleSubmit(handleSubmit)}
              onClick={(e) => e.stopPropagation()}
              role="presentation"
              id={`${CHOOSE_FILTER_FORM_ID}-${props.groupId}`}
            >
              <Controller
                name="filterId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="group__select"
                    options={options}
                    closeMenuOnSelect={true}
                    onChange={(currentValue) => {
                      const prevValue = field.value;
                      field.onChange(currentValue);
                      if (currentValue?.value !== prevValue.value) {
                        dispatch(resetGroup({ groupId: props.groupId }));
                      }
                    }}
                  />
                )}
              />
            </form>
          </div>
          <div className="group__toggle-group-btn">
            {playlist.isGroupOpen[`${props.groupId}`] ? (
              <FaChevronUp className="icon" />
            ) : (
              <FaChevronDown className="icon" />
            )}
          </div>
          <span></span>
          <div
            className="group__header-btns"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setModalState({ isVisible: true })}
              className="btn btn_type_icon btn_hover_grey-20"
            >
              <GrCircleInformation className="icon" />
            </button>
            <Modal title={filters[selectedFilterId].name}>
              <FilterDetails filterId={selectedFilterId} />
            </Modal>
            <button
              type="button"
              onClick={() => dispatch(destroyGroup({ groupId: props.groupId }))}
              className="btn btn_type_icon btn_hover_grey-20"
            >
              <span>
                <FaRegTrashAlt className="icon" />
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(reorderGroup({ index: props.index, direction: "UP" }))
              }
              className="btn btn_type_icon btn_hover_grey-20 group__sort-btn"
            >
              <FaArrowUp className="icon" />
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(
                  reorderGroup({ index: props.index, direction: "DOWN" }),
                );
              }}
              className="btn btn_type_icon btn_hover_grey-20 group__sort-btn"
            >
              <FaArrowDown className="icon" />
            </button>
          </div>
        </header>

        <div
          className={`group__body ${
            playlist.isGroupOpen[`${props.groupId}`] ? "" : "group__body_hidden"
          }`}
        >
          <FormProvider {...form}>
            {playlist.tracks[`${props.groupId}`].length > 0 && (
              <>
                <Subplaylist className="group__playlist">
                  <ol className="subplaylist ">
                    {playlist.tracks[`${props.groupId}`].map(
                      (trackMeta: TrackMeta, index) => (
                        <Track
                          key={JSON.stringify(trackMeta) + props.groupId}
                          formId={`${CHOOSE_FILTER_FORM_ID}-${props.groupId}`}
                          meta={trackMeta}
                          index={index}
                          onRemoveTrack={handleTrackRemove}
                          onReorderTracks={handleTrackReorder}
                          onResubmit={handleResubmit}
                          tracksTotal={
                            playlist.tracks[`${props.groupId}`].length
                          }
                        />
                      ),
                    )}
                  </ol>
                </Subplaylist>
                {findTrackResult.error && (
                  <Message type="danger">
                    {findTrackResult.error.toString()}
                  </Message>
                )}
              </>
            )}
          </FormProvider>

          <button
            name="findtrack"
            type="submit"
            disabled={false}
            form={`${CHOOSE_FILTER_FORM_ID}-${props.groupId}`}
            className="btn btn_type_primary group__find-track-btn"
          >
            Add Track
          </button>
        </div>
      </div>
      <button
        type="button"
        className="btn btn_type_secondary"
        onClick={() => dispatch(addGroup({ insertAt: props.index + 1 }))}
      >
        <IoMdAddCircle className="icon" />
        Add Group
      </button>
    </>
  );
}
