import axios from "lib/axios";
import { useState } from "react";

export function useSaveConfigOption(endpoint: string, baseURL: string = "config") {
  const [isSaving, setIsSaving] = useState(false);
  const [wasSuccess, setWasSuccess] = useState(false);
  const [wasError, setWasError] = useState(false);

  const saveConfigOption = async (body: object, isNew: boolean = false) => {
    if (!body || !endpoint) return;

    resetState();
    setIsSaving(true);

    const method = isNew ? "put" : "post";
    await axios[method](`${baseURL}/${endpoint}`, body)
      .then(() => setWasSuccess(true))
      .catch(() => setWasError(true))
      .finally(() => setIsSaving(false));
  };

  const resetState = () => {
    setWasSuccess(false);
    setWasError(false);
  };

  return { saveConfigOption, isSaving, wasSuccess, wasError };
}
