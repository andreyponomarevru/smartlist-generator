import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaFileImport, FaDownload } from "react-icons/fa";
import { useForm } from "react-hook-form";

import { Message } from "../../lib/message/message";
import { useGlobalState } from "../../hooks/use-global-state";
import { useLibPath } from "../../hooks/api/use-lib-path";
import { LibPathInput } from "../../types";

import "./settings-page.scss";

const INPUT_ERROR_MESSAGE = "Required";

export function SettingsPage() {
  const { playlist, statsQuery } = useGlobalState();
  const [libPath, setLibPath] = useLibPath();

  const form = useForm<LibPathInput>({ defaultValues: libPath });
  const {
    formState: { isSubmitted, isDirty },
    reset,
  } = form;
  React.useEffect(() => {
    if (isSubmitted && isDirty) {
      reset(libPath, {
        keepValues: true,
        keepErrors: true,
        keepIsSubmitSuccessful: true,
        keepDirty: false,
        keepIsSubmitted: false,
      });
    }
  }, [isSubmitted, reset, isDirty, libPath]);

  function handleLibPathSubmit(input: LibPathInput) {
    setLibPath(input);
  }

  //

  const excludedCount = playlist.excludedTracks.state.tracks.size;
  const totalCount =
    statsQuery.data?.years.results?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;
  const excludedPercentage = ((100 * excludedCount) / totalCount).toFixed(1);
  const tracksLeft = totalCount - excludedCount;

  return (
    <div className="settings-page">
      <header className="header1">Database</header>

      <div className="settings-page__subsection">
        <form
          onSubmit={form.handleSubmit(handleLibPathSubmit)}
          id="libpath"
          className="settings-page__row"
        >
          <span className="settings-page__name">Lib Path</span>
          <span className="settings-page__input-wrapper">
            <input
              {...form.register("libPath", { required: INPUT_ERROR_MESSAGE })}
              className={`input settings-page__input ${
                form.formState.errors.libPath ? "input_error" : ""
              }`}
            />
          </span>
          <span className="settings-page__buttons">
            <input
              className="btn btn_type_secondary"
              type="submit"
              value="Save"
            />
          </span>
        </form>

        {form.formState.errors.libPath && (
          <Message type="danger">
            {form.formState.errors.libPath?.message}
          </Message>
        )}
        {form.formState.isSubmitSuccessful && (
          <Message type="success">Saved</Message>
        )}
      </div>

      <div className="settings-page__subsection">
        <div className="settings-page__row">
          <span className="settings-page__name">Files Validation</span>
          <span>
            <IoIosCheckmarkCircleOutline className="settings-page__icon settings-page__icon_success" />
            <IoIosCloseCircleOutline className="settings-page__icon settings-page__icon_error" />
          </span>
          <span className="settings-page__buttons">
            <span className="btn btn_type_secondary">Validate</span>
            <span className="btn btn_type_secondary">
              <FaDownload className="icon" /> Download report
            </span>
          </span>
        </div>
      </div>

      <div className="settings-page__subsection">
        <div className="settings-page__row">
          <span className="settings-page__name">Database</span>
          <span>
            Created on{" "}
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {new Date().toDateString()}
            </span>
          </span>
          <span className="settings-page__buttons">
            <span className="btn btn_type_secondary">Populate</span>
            <span className="btn btn_type_danger">Drop</span>
          </span>
        </div>
      </div>

      <div className="settings-page__subsection">
        <div className="settings-page__row">
          <span className="settings-page__name">Excluded Tracks</span>
          <span>
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {excludedCount} ({excludedPercentage}%)
            </span>{" "}
            out of{" "}
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {totalCount}
            </span>{" "}
            tracks were excluded.{" "}
            <span className="settings-page__highlighting settings-page__highlighting_primary">
              {tracksLeft}
            </span>{" "}
            tracks left
          </span>
          <span className="settings-page__buttons">
            <label htmlFor="importblacklisted">
              <input
                id="importblacklisted"
                type="file"
                onChange={playlist.excludedTracks.handleImport}
                multiple
                hidden
              />
              <span className="btn btn_type_secondary">
                <FaFileImport className="icon" />
                <span>Import from M3U</span>
              </span>
            </label>
            <button
              type="button"
              onClick={playlist.excludedTracks.handleClear}
              className="btn btn_type_danger"
            >
              Clear
            </button>
          </span>
        </div>
        <div className="settings-page__messages">
          {playlist.excludedTracks.state.errors.map((err) => (
            <Message key={err.message} type="danger">
              {err.message}
            </Message>
          ))}
        </div>
      </div>
    </div>
  );
}
