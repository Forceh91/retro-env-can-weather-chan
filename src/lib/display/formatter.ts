import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "consts";

export function formatStringTo8x32(text: string, maxLines: number) {
  // if the entire forecast is less than DISPLAY_MAX_CHARACTERS_PER_LINE, we can skip this
  if (text.length < DISPLAY_MAX_CHARACTERS_PER_LINE) return text;

  // we should follow the maxLinesx32 format here
  let formattedText = text;
  for (let line = 1, startPoint = 0; line <= maxLines; line++) {
    // before we do anything, we can just run to the end of the string if we'll past it
    if (startPoint + DISPLAY_MAX_CHARACTERS_PER_LINE >= text.length) {
      formattedText = `${formattedText.slice(0)}\n`;
      break;
    }

    // get the last space on this line and replace it with a line break
    const ixOfLastSpace = formattedText.lastIndexOf(" ", DISPLAY_MAX_CHARACTERS_PER_LINE * line);
    formattedText = formattedText.slice(0, ixOfLastSpace).trim() + "\n" + formattedText.slice(ixOfLastSpace).trim();

    startPoint += DISPLAY_MAX_CHARACTERS_PER_LINE;
  }

  // truncate the string at the last line break and do some trimming
  return formattedText.slice(0, formattedText.lastIndexOf("\n")).trim();
}
