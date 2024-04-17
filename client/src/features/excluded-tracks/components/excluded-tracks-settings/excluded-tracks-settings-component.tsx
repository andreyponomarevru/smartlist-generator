import React from "react";
import { FaFileImport } from "react-icons/fa";

import { Message } from "../../../ui/message";
import { MUSIC_LIB_DIR } from "../../../../config/env";
import { useLazyImportExcludedTracksFromM3UQuery } from "../..";
import { useGetStatsQuery } from "../../../stats";
import {
  isErrorWithMessage,
  isFetchBaseQueryError,
  parseFileToStrings,
} from "../../../../utils";
import {
  clearExcludedTracks,
  selectExcludedTracksIds,
} from "../../excluded-tracks-slice";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../hooks/redux-ts-helpers";
import { InvalidPathsError } from "../invalid-paths-error/invalid-paths-error-component";

function calcExcludedStats(excludedCount = 0, stats: { count: number }[] = []) {
  const totalCount =
    stats.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;
  const tracksLeft = totalCount - excludedCount;

  return {
    totalCount,
    excludedPercentage:
      totalCount === 0 && excludedCount === 0
        ? 0
        : Number(((100 * excludedCount) / totalCount).toFixed(1)),
    tracksLeft,
  };
}

export async function importM3UFiles(e: React.ChangeEvent<HTMLInputElement>) {
  if (!e.target.files || e.target.files.length === 0) {
    throw new Error("No file(s)");
  }
  const importedFiles = Array.from(e.target.files);
  const isValidExtension = importedFiles.every((file) => {
    return file.name.split(".").pop()?.toLowerCase() === "m3u";
  });
  if (!isValidExtension) {
    throw new Error("Only M3U files are allowed");
  }

  const mergedM3UContent = (
    await Promise.all(importedFiles.map(parseFileToStrings))
  )
    .flat()
    .map((stringifiedFile) => stringifiedFile.split("\n"))
    .flat();
  return mergedM3UContent;
}

type ImportErrors = {
  invalidPaths?: string[];
  importError?: string;
  notFoundTracks?: string[];
};

export function ExcludedTracksSettings() {
  const dispatch = useAppDispatch();

  const excludedTracks = useAppSelector(selectExcludedTracksIds);
  const stats = useGetStatsQuery(excludedTracks);
  const excludedStats = calcExcludedStats(
    excludedTracks.length,
    stats.data?.years,
  );

  const [errors, setErrors] = React.useState<ImportErrors>({});
  const [importExcluded, importExcludedResult] =
    useLazyImportExcludedTracksFromM3UQuery();

  async function importExcludedTracksFromM3U(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    try {
      const importResult = await importExcluded(
        await importM3UFiles(e),
      ).unwrap();

      setErrors({
        notFoundTracks: importResult.notFoundTracks,
        invalidPaths: importResult.invalidPaths,
      });
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const errMsg = "error" in err ? err.error : JSON.stringify(err.data);
        setErrors({ importError: errMsg });
      } else if (isErrorWithMessage(err)) {
        setErrors({ importError: err.message });
      }
    }
  }

  function clearExcluded() {
    setErrors({});
    dispatch(clearExcludedTracks());
  }

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Excluded Tracks</header>
        <div className="settings-page__row">
          <span>
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {excludedTracks.length} ({excludedStats.excludedPercentage}%)
            </span>{" "}
            out of{" "}
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {excludedStats.totalCount}
            </span>{" "}
            tracks were excluded.{" "}
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {excludedStats.tracksLeft}
            </span>{" "}
            tracks left
          </span>
          <span className="settings-page settings-page__inputs-group">
            <label htmlFor="importblacklisted">
              <input
                id="importblacklisted"
                type="file"
                onClick={(e) => setErrors({})}
                onChange={importExcludedTracksFromM3U}
                multiple
                hidden
                disabled={importExcludedResult.isFetching}
              />
              <span
                className={`btn btn_type_secondary ${importExcludedResult.isFetching ? "dimmed" : ""}`}
              >
                <FaFileImport className="icon" />
                <span>Import from M3U</span>
              </span>
            </label>
            <button
              type="button"
              disabled={excludedTracks.length === 0}
              onClick={clearExcluded}
              className="btn btn_type_danger"
            >
              Clear
            </button>
          </span>
        </div>
        {errors.invalidPaths && errors.invalidPaths.length > 0 && (
          <InvalidPathsError
            shortText={`${errors.invalidPaths.length} invalid paths — they are not in the
          ${MUSIC_LIB_DIR} dir`}
            paths={errors.invalidPaths}
          />
        )}
        {errors.notFoundTracks && errors.notFoundTracks.length > 0 && (
          <InvalidPathsError
            shortText={`${errors.notFoundTracks.length} tracks were not found in database because you either renamed or deleted them:`}
            paths={errors.notFoundTracks}
          />
        )}

        {errors.importError && (
          <Message type="danger">{errors.importError}</Message>
        )}
      </div>
    </section>
  );
}
