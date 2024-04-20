import { toHourMinSec } from "../../../utils";

export function getPlaylistTotalDuration(tracks: { duration: number }[]) {
  return toHourMinSec(
    Object.values(tracks)
      .flat()
      .reduce((total, track) => track.duration + total, 0),
  );
}
