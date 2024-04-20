import React from "react";
import { FaDownload } from "react-icons/fa";

import type { LibPathInput } from "../../types";
import {
  useStartProcessMutation,
  useStopProcessMutation,
  useStreamSSEsQuery,
} from "../api";
import { exportValidationReport, getRTKQueryErr } from "../../utils";
import { Loader } from "../ui/loader/loader-component";
import { Process } from "../ui/process";
import { Message } from "../ui/message";

interface Props extends React.HTMLAttributes<HTMLElement> {
  settings: LibPathInput;
}

export function SeedingSettings(props: Props) {
  const sseStream = useStreamSSEsQuery("seeding");
  const [startProc, startProcResult] = useStartProcessMutation();
  const [stopProc, stopProcResult] = useStopProcessMutation();

  const latestMsg = Array.isArray(sseStream.data)
    ? sseStream.data[sseStream.data.length - 1]
    : null;

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Database Seeding</header>
        {latestMsg && (
          <Process
            message={latestMsg}
            className={`status-loader status-loader_${latestMsg.status}`}
          >
            {latestMsg.result && (
              <button
                type="button"
                onClick={() => exportValidationReport(latestMsg.result)}
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
          onClick={
            latestMsg?.status === "pending"
              ? () => stopProc({ processName: "seeding" })
              : () =>
                  startProc({
                    processName: "seeding",
                    libPath: props.settings.libPath,
                  })
          }
        >
          {latestMsg?.status === "pending" && (
            <Loader className="settings-page__btn-loader" />
          )}
          {latestMsg?.status === "pending" ? "Stop" : "Seed"}
        </button>
      </div>
      {sseStream.error && (
        <Message type="danger">{getRTKQueryErr(sseStream.error)}</Message>
      )}
      {startProcResult.error && (
        <Message type="danger">{getRTKQueryErr(startProcResult.error)}</Message>
      )}
      {stopProcResult.error && (
        <Message type="danger">{stopProcResult.error.toString()}</Message>
      )}
    </section>
  );
}
