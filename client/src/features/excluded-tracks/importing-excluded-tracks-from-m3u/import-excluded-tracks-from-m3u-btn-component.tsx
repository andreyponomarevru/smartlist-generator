import React from "react";
import { FaFileImport } from "react-icons/fa";

import { UploadFileBtn } from "../../ui/upload-file-btn";
import { parseFileToStrings, getRTKQueryErr } from "../../../utils";
import { useLazyImportExcludedTracksFromM3UQuery } from "../excluded-tracks-slice";
import { MUSIC_LIB_DIR } from "../../../config/env";
import { InvalidPathsError } from "./invalid-paths-error-component";
import { Message } from "../../ui/message";

import "./import-excluded-tracks-from-m3u-btn.scss";

type ImportErrors = {
  invalidPaths?: string[];
  importError?: string;
  notFoundTracks?: string[];
};

async function importM3UFiles(e: React.ChangeEvent<HTMLInputElement>) {
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

export function ImportExcludedTracksFromM3UBtn() {
  async function importExcludedTracksFromM3U(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    try {
      setErrors({});
      const importResult = await importExcluded(
        await importM3UFiles(e),
      ).unwrap();

      setErrors({
        notFoundTracks: importResult.notFoundTracks,
        invalidPaths: importResult.invalidPaths,
      });
    } catch (err) {
      setErrors({ importError: getRTKQueryErr(err) });
    }
  }

  const [errors, setErrors] = React.useState<ImportErrors>({});

  const [importExcluded, importExcludedResult] =
    useLazyImportExcludedTracksFromM3UQuery();

  return (
    <div className="import-excluded-tracks-from-m3u-btn">
      <UploadFileBtn
        id="importblacklisted"
        multiple={true}
        isDisabled={importExcludedResult.isFetching}
        onClick={(e) => setErrors({})}
        onChange={importExcludedTracksFromM3U}
        className={`btn_type_secondary ${importExcludedResult.isFetching ? "dimmed" : ""}`}
      >
        <FaFileImport className="icon" />
        Import from M3U
      </UploadFileBtn>

      {errors.invalidPaths && errors.invalidPaths.length > 0 && (
        <InvalidPathsError
          text={`${errors.invalidPaths.length} invalid paths — they are not in the
          ${MUSIC_LIB_DIR} dir`}
          paths={errors.invalidPaths}
        />
      )}
      {errors.notFoundTracks && errors.notFoundTracks.length > 0 && (
        <InvalidPathsError
          text={`${errors.notFoundTracks.length} tracks were not found in database because you either renamed or deleted them:`}
          paths={errors.notFoundTracks}
        />
      )}

      {errors.importError && (
        <Message
          className="import-excluded-tracks-from-m3u-btn__import-err"
          type="danger"
        >
          {errors.importError}
        </Message>
      )}
    </div>
  );
}
