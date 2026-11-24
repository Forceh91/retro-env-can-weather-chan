import { RefreshMode } from "types/config.types";

export const REFRESH_MODE_DEFAULT: RefreshMode = "observation";

export const REFRESH_MODES: { value: RefreshMode; label: string; description: string }[] = [
  {
    value: "observation",
    label: "When a new observation arrives",
    description: "About once an hour. This is how the simulator has behaved for a while.",
  },
  {
    value: "observation-changes",
    label: "New observation, plus any new forecast or alert",
    description:
      "Refreshes once an hour at the new observation, and again if the forecast changes or an alert is issued.",
  },
  {
    value: "ten-minute",
    label: "Every ten minutes (authentic)",
    description:
      "Six refreshes an hour on a fixed clock, and nothing happens in real time. This is how the original channel worked.",
  },
  {
    value: "ten-minute-alerts",
    label: "Every ten minutes, plus new alerts",
    description: "The ten minute clock, with an extra refresh as soon as a new alert is issued.",
  },
];

/** the original channel refreshed on every multiple of this many minutes */
export const REFRESH_INTERVAL_MINUTES = 10;
