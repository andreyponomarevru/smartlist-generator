import { toHourMinSec } from "../../../utils";

export function getPlaylistDuration(tracks: { duration: number }[]) {
  const totalSec = Object.values(tracks)
    .flat()
    .reduce((total, track) => track.duration + total, 0);

  return toHourMinSec(totalSec);
}
