import React from "react";
import { TrackMeta } from "../../types";
import { API_ROOT_URL } from "../../config/env";

type State = {
  activeTrack?: TrackMeta | null;
  isPlaying?: boolean;
  src?: string;
};
type Action =
  | { type: "PLAY"; payload: { track: TrackMeta; src: string } }
  | { type: "TOGGLE_PLAY"; payload: { isPlaying: boolean } }
  | { type: "RESET" };

function playerReducer(state: State, action: Action): State {
  switch (action.type) {
    case "PLAY": {
      return {
        ...state,
        activeTrack: action.payload.track,
        isPlaying: true,
        src: action.payload.src,
      };
    }
    case "TOGGLE_PLAY": {
      return { ...state, isPlaying: action.payload.isPlaying };
    }
    case "RESET": {
      return { activeTrack: null };
    }

    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function usePlayer() {
  const initialState: State = { activeTrack: null };
  const [state, dispatch] = React.useReducer(playerReducer, initialState);

  function play(track: TrackMeta) {
    if (state.activeTrack) {
      dispatch({ type: "RESET" });
    }
    dispatch({
      type: "PLAY",
      payload: {
        src: `${API_ROOT_URL}/tracks/${track.trackId}/stream`,
        track: track,
      },
    });
  }

  function togglePlay(isPlaying: boolean) {
    dispatch({ type: "TOGGLE_PLAY", payload: { isPlaying } });
  }

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  React.useEffect(() => {
    if (state.isPlaying) {
      audioRef.current
        ?.play()
        .catch((err) => console.log("request aborted", err));
    } else {
      audioRef.current?.pause();
    }
  }, [state.isPlaying, state.activeTrack, audioRef]);

  //
  // Tracking progress
  //

  const progressBarRef = React.useRef<HTMLInputElement | null>(null);
  const [timeProgress, setTimeProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  function handleMetadataLoaded() {
    if (progressBarRef.current && audioRef.current) {
      const seconds = audioRef.current.duration;
      setDuration(seconds);
      progressBarRef.current.max = String(seconds);
    }
  }

  function handleProgressChange() {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(progressBarRef.current?.value);
    }
  }

  function reset() {
    dispatch({ type: "RESET" });
    setTimeProgress(0);
    setDuration(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (progressBarRef.current) progressBarRef.current.value = "0";
  }

  //
  // Volume
  //

  const [volume, setVolume] = React.useState(60);
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume, audioRef]);

  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, audioRef, isMuted]);

  return {
    ...state,
    isMuted,
    volume,
    timeProgress,
    duration,
    audioRef,
    progressBarRef,
    play,
    togglePlay,
    reset,
    setIsMuted,
    setVolume,
    setTimeProgress,
    onLoadedMetadata: handleMetadataLoaded,
    handleProgressChange,
  };
}
