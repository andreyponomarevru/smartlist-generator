import React from "react";

import { selectExcludedTracksIds } from "../excluded-tracks-slice";
import { useAppSelector } from "../../../hooks/redux-ts-helpers";
import { ImportExcludedTracksFromM3UBtn } from "../importing-excluded-tracks-from-m3u";
import { ExcludedTracksStats } from "../stats";
import { ClearExcludedTracksBtn } from "../clearing";

export function ExcludedTracksSettings() {
  const excludedTracks = useAppSelector(selectExcludedTracksIds);

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Excluded Tracks</header>
        <div className="settings-page__row">
          <ExcludedTracksStats />

          <span className="settings-page settings-page__inputs-group">
            <ImportExcludedTracksFromM3UBtn />
            <ClearExcludedTracksBtn isDisabled={excludedTracks.length === 0} />
          </span>
        </div>
      </div>
    </section>
  );
}
