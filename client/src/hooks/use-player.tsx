import React from "react";
import { TrackMeta } from "../types";
import { API_ROOT_URL } from "../config/env";

export function usePlayer(tracks: Record<string, TrackMeta[]>) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [src, setSrc] = React.useState("");

  function togglePlayPause() {
    setIsPlaying((prev) => !prev);
  }

  const [playingIndex, setPlayingIndex] = React.useState<{
    groupId: number;
    index: number;
  } | null>(null);

  const [activeTrack, setActiveTrack] = React.useState<TrackMeta | null>(null);

  React.useEffect(() => {
    if (playingIndex) {
      setActiveTrack(tracks[playingIndex.groupId][playingIndex.index]);
    }
  }, [playingIndex]);

  React.useEffect(() => {
    if (playingIndex && activeTrack) {
      console.log(`${API_ROOT_URL}/tracks/${activeTrack.trackId}/stream`);
      setSrc(`${API_ROOT_URL}/tracks/${activeTrack?.trackId}/stream`);

      togglePlayPause();
    }
  }, [playingIndex, activeTrack]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (isPlaying) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [isPlaying, audioRef]);

  //
  // Tracking progress
  //

  const progressBarRef = React.useRef<HTMLInputElement | null>(null);

  const [timeProgress, setTimeProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  function onLoadedMetadata() {
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
    setIsPlaying(false);
    setSrc("");
    setPlayingIndex(null);
    setActiveTrack(null);
    setTimeProgress(0);
    setDuration(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (progressBarRef.current) progressBarRef.current.value = "0";
  }

  //
  // Back/forth Navigation
  //

  function handleNext() {
    console.log(playingIndex, activeTrack);
    if (!playingIndex || !activeTrack) return;

    if (tracks[playingIndex.groupId].length === 1) {
      reset();
      return;
    }

    if (playingIndex.index >= tracks[playingIndex.groupId].length - 1) {
      setPlayingIndex((prev) => {
        return prev ? { ...prev, index: 0 } : null;
      });
      setActiveTrack(tracks[playingIndex.groupId][playingIndex.index]);
    } else {
      reset();
      // Allow looping:
      // setPlayingIndex((prev) => {
      //   return prev ? { ...prev, index: prev.index + 1 } : null;
      // });
      // setActiveTrack(tracks[playingIndex.groupId][playingIndex.index + 1]);
    }
  }

  function handlePrevious() {
    if (Object.values(tracks).flat().length === 0) return;
    if (!playingIndex) return;

    if (playingIndex.index === 0) {
      const lastTrackIndex = tracks[playingIndex.groupId].length - 1;
      setPlayingIndex((prev) => {
        return prev ? { ...prev, index: lastTrackIndex } : null;
      });

      setActiveTrack(tracks[playingIndex.groupId][lastTrackIndex]);
    } else {
      setPlayingIndex((prev) => {
        return prev ? { ...prev, index: prev.index - 1 } : null;
      });
      setActiveTrack(tracks[playingIndex.groupId][playingIndex.index - 1]);
    }
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
    isPlaying,
    src,
    setIsPlaying,
    togglePlayPause,
    setPlayingIndex,
    audioRef,
    progressBarRef,
    duration,
    setTimeProgress,
    handleNext,
    handlePrevious,
    activeTrack,
    onLoadedMetadata,
    timeProgress,
    handleProgressChange,
    setIsMuted,
    isMuted,
    volume,
    setVolume,
  };
}
