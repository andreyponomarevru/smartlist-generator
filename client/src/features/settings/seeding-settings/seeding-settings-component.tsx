import React from "react";
import { FaDownload } from "react-icons/fa";

import type { LibPathInput } from "../../../types";
import {
  useStartProcessMutation,
  useStopProcessMutation,
  useStreamSSEsQuery,
} from "../../api";
import { exportValidationReport } from "../../../utils";
import { Loader } from "../..//ui/loader/loader-component";
import { Process } from "../../ui/process";

interface SeedingSettingsProps extends React.HTMLAttributes<HTMLElement> {
  currentSettings: LibPathInput;
}

export function SeedingSettings(props: SeedingSettingsProps) {
  const sseStream = useStreamSSEsQuery("seeding");
  const [startProcess] = useStartProcessMutation();
  const [stopProcess] = useStopProcessMutation();

  const latestMsg = Array.isArray(sseStream.data)
    ? sseStream.data[sseStream.data.length - 1]
    : null;

  return (
    <section className="settings-page__subsection">
      <div className="settings-page__row">
        <header className="settings-page__header">Database Seeding</header>
        {latestMsg && (
          <Process
            details={latestMsg}
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
              ? () => stopProcess({ processName: "seeding" })
              : () =>
                  startProcess({
                    processName: "seeding",
                    libPath: props.currentSettings.libPath,
                  })
          }
        >
          {latestMsg?.status === "pending" && (
            <Loader className="settings-page__btn-loader" />
          )}
          {latestMsg?.status === "pending" ? "Stop" : "Seed"}
        </button>
      </div>
    </section>
  );
}
