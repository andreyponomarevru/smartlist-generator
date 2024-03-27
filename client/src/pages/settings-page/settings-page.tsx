import React from "react";
import { FaFileImport, FaDownload } from "react-icons/fa";
import { useForm } from "react-hook-form";

import { Message } from "../../lib/message/message";
import { useGlobalState } from "../../hooks/use-global-state";
import { LibPathInput, Process, ProcessStatus } from "../../types";
import { API_ROOT_URL } from "../../config/env";
import { useSSE } from "../../hooks/api/use-sse";
import { useStartValidationProcess } from "../../hooks/api/processes/use-start-validation";
import { useLocalStorage } from "../../hooks/use-local-storage";
import {
  calculateExcludedStats,
  exportValidationReport,
} from "../../utils/misc";
import { Loader } from "../../lib/loader/loader";
import { useStopValidationProcess } from "../../hooks/api/processes/use-stop-validation";

import "./settings-page.scss";

interface ProcessProps extends React.HTMLAttributes<HTMLSpanElement> {
  details: Omit<Process, "status"> | null;
  status: ProcessStatus | "initial";
}
interface ValidationSettingsProps extends React.HTMLAttributes<HTMLElement> {
  currentSettings: LibPathInput;
}
interface SeedingSettingsProps extends React.HTMLAttributes<HTMLElement> {
  currentSettings: LibPathInput;
}

const INPUT_ERROR_MESSAGE = "Required";

export function SettingsPage() {
  const [libPath] = useLocalStorage<LibPathInput>("libPath", { libPath: "" });

  return (
    <div className="settings-page">
      <header className="header1">Database</header>
      <LibPathSettings />
      <ValidationSettings currentSettings={libPath} />
      <SeedingSettings currentSettings={libPath} />
      <ExcludedTracksSettings />
    </div>
  );
}

function ValidationSettings(props: ValidationSettingsProps) {
  const [sseData] = useSSE<Process>(
    `${API_ROOT_URL}/processes/validation`,
    "validation",
  );

  const startProcessQuery = useStartValidationProcess();
  async function startProcess() {
    await startProcessQuery.mutateAsync(props.currentSettings);
  }

  const stopProcessQuery = useStopValidationProcess();
  async function stopProcess() {
    await stopProcessQuery.mutateAsync();
  }

  //

  const status = sseData?.status || "initial";

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Files Validation</header>
        <div className="settings-page__column">
          {sseData && (
            <Process
              status={status}
              details={sseData}
              className={`status-loader status-loader_${status}`}
            >
              {sseData.result && (
                <button
                  type="button"
                  onClick={() => exportValidationReport(sseData.result)}
                  className="btn btn_type_secondary"
                >
                  <FaDownload className="icon" /> Download report
                </button>
              )}
            </Process>
          )}
          <button
            type="button"
            className="btn btn_type_secondary"
            onClick={status === "pending" ? stopProcess : startProcess}
          >
            {status === "pending" && (
              <Loader className="settings-page__btn-loader" />
            )}
            {status === "pending" ? "Stop" : "Validate"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SeedingSettings(props: SeedingSettingsProps) {
  const [sseData] = useSSE<Process>(
    `${API_ROOT_URL}/processes/seeding`,
    "seeding",
  );

  const status = sseData?.status || "initial";

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Database Seeding</header>
        {sseData && (
          <Process status={sseData.status || "initial"} details={sseData} />
        )}
        <span className="btn btn_type_secondary">Populate</span>
      </div>
    </section>
  );
}

function ExcludedTracksSettings() {
  const { playlist, statsQuery } = useGlobalState();

  const excludedCount = playlist.excludedTracks.state.tracks.size;
  const { totalCount, excludedPercentage, tracksLeft } = calculateExcludedStats(
    excludedCount,
    statsQuery.data?.years.results,
  );

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Excluded Tracks</header>
        <div className="settings-page__row">
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
          <span className="settings-page settings-page__inputs-group">
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
    </section>
  );
}

function LibPathSettings() {
  function handleLibPathSubmit(input: LibPathInput) {
    setLibPath(input);
  }

  const [libPath, setLibPath] = useLocalStorage<LibPathInput>("libPath", {
    libPath: "",
  });
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

  return (
    <section className="settings-page__subsection">
      <form
        onSubmit={form.handleSubmit(handleLibPathSubmit)}
        id="libpath"
        className="settings-page__row"
      >
        <header className="settings-page__header">Lib Path</header>
        <div className="settings-page__inputs-group">
          <input
            {...form.register("libPath", { required: INPUT_ERROR_MESSAGE })}
            className={`input settings-page__input ${
              form.formState.errors.libPath ? "input_error" : ""
            }`}
          />
          <input
            className="btn btn_type_secondary"
            type="submit"
            value="Save"
          />
        </div>
      </form>

      {form.formState.errors.libPath && (
        <Message type="danger">
          {form.formState.errors.libPath?.message}
        </Message>
      )}
      {form.formState.isSubmitSuccessful && (
        <Message type="success">Saved</Message>
      )}
    </section>
  );
}

function Process(props: ProcessProps) {
  return (
    <span
      className={`process process_status_${props.status} ${
        props.className || ""
      }`}
    >
      <span className="process__time">
        <span>
          {props.details?.createdAt &&
            `Created at: ${new Date(
              props.details?.createdAt,
            ).toLocaleString()}`}
        </span>
        <span>
          {props.details?.updatedAt &&
            `Updated at: ${new Date(
              props.details?.updatedAt,
            ).toLocaleString()}`}
        </span>
      </span>

      {props.children}
    </span>
  );
}
