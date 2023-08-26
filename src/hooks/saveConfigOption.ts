import axios from "lib/axios";
import { useState } from "react";

export function useSaveConfigOption(endpoint: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [wasSuccess, setWasSuccess] = useState(false);
  const [wasError, setWasError] = useState(false);

  const saveConfigOption = async (body: object) => {
    if (!body || !endpoint) return;

    resetState();
    setIsSaving(true);

    await axios
      .post(`config/${endpoint}`, body)
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
