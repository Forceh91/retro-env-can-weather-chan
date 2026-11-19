/**
 * A custom, text only screen written by the user (the `Screens.INFO` screen shows all of the active ones, one after
 * the other).
 */
export type InfoScreenEntry = {
  id: string;
  /** up to DISPLAY_MAX_LINES lines of DISPLAY_MAX_CHARACTERS_PER_LINE characters, lines are separated with "\n" */
  message: string;
  /** first day (inclusive) this is shown, as yyyy-MM-dd. When missing it's shown straight away */
  start?: string;
  /** last day (inclusive) this is shown, as yyyy-MM-dd. When missing it's shown until it's deleted */
  end?: string;
};

export type InfoScreenEntries = InfoScreenEntry[];
