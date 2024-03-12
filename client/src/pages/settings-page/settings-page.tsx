import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaFileImport, FaDownload } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";

import { useGlobalState } from "../../hooks/use-global-state";

import "./database-page.scss";

type Input = { libPath: string };

const INPUT_ERRORS = { libPath: "This field is required" };

export function DatabasePage() {
  const { playlist, statsQuery } = useGlobalState();
  const form = useForm<Input>();

  const handleLibPathSubmit: SubmitHandler<Input> = (data) => console.log(data);

  const excludedCount = playlist.excludedTracks.state.trackIds.size;
  const totalCount =
    statsQuery.data?.years.results?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;
  const excludedPercentage = ((100 * excludedCount) / totalCount).toFixed(1);
  const tracksLeft = totalCount - excludedCount;

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
        <span>
          <span className="database-page__highlighting database-page__highlighting_primary">
            {excludedCount} ({excludedPercentage}%)
          </span>{" "}
          out of{" "}
          <span className="database-page__highlighting database-page__highlighting_primary">
            {totalCount}
          </span>{" "}
          tracks were excluded.{" "}
          <span className="database-page__highlighting database-page__highlighting_primary">
            {tracksLeft}
          </span>{" "}
          tracks left.
        </span>
        <span className="database-page__buttons">
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
    </div>
  );
}
