import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaFileImport, FaDownload } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";

import { useGlobalState } from "../../hooks/use-global-state";

import "./database-page.scss";

type Input = { libPath: string };

const INPUT_ERRORS = {
  libPath: "This field is required",
};

export function DatabasePage() {
  const { playlist } = useGlobalState();

  const form = useForm<Input>();

  const handleLibPathSubmit: SubmitHandler<Input> = (data) => console.log(data);

  React.useEffect(() => {
    console.log(playlist.excludedTracks);
  }, [playlist.excludedTracks]);

  return (
    <div className="database-page">
      <header className="header1">Database</header>

      <form
        onSubmit={form.handleSubmit(handleLibPathSubmit)}
        id="libpath"
        className="database-page__row"
      >
        <span className="database-page__name">Music Library Path</span>
        <span>
          <input
            defaultValue="Library path"
            {...form.register("libPath", { required: true })}
            className="input database-page__input"
          />
          {form.formState.errors.libPath && <span>{INPUT_ERRORS.libPath}</span>}
        </span>
        <span className="database-page__buttons">
          <input
            className="btn btn_type_secondary"
            type="submit"
            value="Save"
          />
        </span>
      </form>

      <div className="database-page__row">
        <span className="database-page__name">Validation Status</span>
        <span>
          <IoIosCheckmarkCircleOutline className="database-page__icon database-page__icon_success" />
          <IoIosCloseCircleOutline className="database-page__icon database-page__icon_error" />
        </span>
        <span className="database-page__buttons">
          <span className="btn btn_type_secondary">Validate</span>
          <span className="btn btn_type_secondary">
            <FaDownload className="icon" /> Download report
          </span>
        </span>
      </div>

      <div className="database-page__row">
        <span className="database-page__name">Initialization</span>
        <span>{new Date().toDateString()}</span>
        <span className="database-page__buttons">
          <span className="btn btn_type_secondary">Initialize</span>
          <span className="btn btn_type_danger">Drop database</span>
        </span>
      </div>

      <div className="database-page__row">
        <span className="database-page__name">Excluded Tracks</span>
        <span>{playlist.excludedTracks.size}</span>
        <span className="database-page__buttons">
          <label htmlFor="importblacklisted">
            <input
              id="importblacklisted"
              type="file"
              onChange={playlist.handleExcludedTracksImport}
              multiple
              hidden
            />
            <span className="btn btn_type_secondary">
              <FaFileImport className="icon" />
              <span>Import from M3U</span>
            </span>
          </label>
          <span className="btn btn_type_danger">Clear</span>
        </span>
      </div>
    </div>
  );
}
