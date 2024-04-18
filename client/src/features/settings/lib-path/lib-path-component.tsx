import React from "react";
import { useForm } from "react-hook-form";

import { Message } from "../../ui/message/message-component";
import { LibPathInput } from "../../../types";
import { useLocalStorage } from "../../../hooks/use-local-storage";

const formOptions = { required: "Required" };
const LIB_PATH_LOCAL_STORAGE_KEY = "libPath";

export function LibPathSettings() {
  function handleLibPathSubmit(input: LibPathInput) {
    setLibPath(input);
  }

  const [libPath, setLibPath] = useLocalStorage<LibPathInput>(
    LIB_PATH_LOCAL_STORAGE_KEY,
    { libPath: "" },
  );
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
            {...form.register("libPath", formOptions)}
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
