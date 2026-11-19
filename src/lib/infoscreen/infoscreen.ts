import {
  DISPLAY_MAX_CHARACTERS_PER_LINE,
  DISPLAY_MAX_LINES,
  INFO_SCREEN_DATE_FORMAT,
  INFO_SCREEN_MAX_ENTRIES,
} from "consts";
import { format, isValid, parse } from "date-fns";
import { InfoScreenEntry } from "types";
import uuid4 from "uuid4";

// this file is used by the server and by the config page, so nothing in here can touch the file system

export type InfoScreenStatus = "scheduled" | "active" | "expired";

/** Tidies up what was typed/pasted: unix line breaks, no tabs, no trailing spaces, and no blank lines top or bottom. */
export function normalizeInfoScreenMessage(message: string) {
  return message
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/^\n+|\n+$/g, "");
}

/** The lines are shown exactly how they're written, so they have to fit the screen. Returns why they don't. */
export function validateInfoScreenMessage(message: unknown): string | undefined {
  if (typeof message !== "string") return "the message must be text";

  const normalized = normalizeInfoScreenMessage(message);
  if (!normalized.length) return "the message is empty";

  const lines = normalized.split("\n");
  if (lines.length > DISPLAY_MAX_LINES)
    return `the message is ${lines.length} lines, the most allowed is ${DISPLAY_MAX_LINES}`;

  // lines are centred on the display, so spaces either side of the text don't count
  const tooLongIx = lines.findIndex((line) => line.trim().length > DISPLAY_MAX_CHARACTERS_PER_LINE);
  if (tooLongIx !== -1)
    return `line ${tooLongIx + 1} is ${lines[tooLongIx].trim().length} characters, the most allowed is ${DISPLAY_MAX_CHARACTERS_PER_LINE}`;

  return undefined;
}

export function isValidInfoScreenDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  // formatting it back catches dates date-fns would otherwise roll over into the next month
  const parsed = parse(value, INFO_SCREEN_DATE_FORMAT, new Date());
  return isValid(parsed) && format(parsed, INFO_SCREEN_DATE_FORMAT) === value;
}

/**
 * Validates a whole list of info screens (from the config file or the config page). Anything that's wrong is reported
 * in `errors` and left out of `entries`, so callers decide whether that means dropping them or rejecting everything.
 */
export function parseInfoScreens(raw: unknown): { entries: InfoScreenEntry[]; errors: string[] } {
  if (!Array.isArray(raw)) return { entries: [], errors: ["info screens must be a list"] };

  const entries: InfoScreenEntry[] = [];
  const errors: string[] = [];
  const usedIDs = new Set<string>();

  if (raw.length > INFO_SCREEN_MAX_ENTRIES) errors.push(`there can only be ${INFO_SCREEN_MAX_ENTRIES} info screens`);

  raw.slice(0, INFO_SCREEN_MAX_ENTRIES).forEach((item: Partial<InfoScreenEntry>, ix) => {
    const label = `Info screen ${ix + 1}`;

    const messageError = validateInfoScreenMessage(item?.message);
    if (messageError) return errors.push(`${label}: ${messageError}`);

    // empty strings are what a cleared date input gives us, which just means "no date"
    const start = item.start || undefined;
    const end = item.end || undefined;
    if (start && !isValidInfoScreenDate(start)) return errors.push(`${label}: start must be a date as yyyy-MM-dd`);
    if (end && !isValidInfoScreenDate(end)) return errors.push(`${label}: end must be a date as yyyy-MM-dd`);
    if (start && end && end < start) return errors.push(`${label}: end is before start`);

    const id = typeof item.id === "string" && item.id.length && !usedIDs.has(item.id) ? item.id : uuid4();
    usedIDs.add(id);

    entries.push({
      id,
      message: normalizeInfoScreenMessage(item.message),
      ...(start && { start }),
      ...(end && { end }),
    });
  });

  return { entries, errors };
}

export function getInfoScreenStatus(entry: InfoScreenEntry, today: Date = new Date()): InfoScreenStatus {
  // yyyy-MM-dd sorts the same as the dates do, so these can be compared as strings
  const day = format(today, INFO_SCREEN_DATE_FORMAT);
  if (entry.start && day < entry.start) return "scheduled";
  if (entry.end && day > entry.end) return "expired";

  return "active";
}

export function getActiveInfoScreens(entries: InfoScreenEntry[], today: Date = new Date()): InfoScreenEntry[] {
  return (entries ?? []).filter((entry) => getInfoScreenStatus(entry, today) === "active");
}
