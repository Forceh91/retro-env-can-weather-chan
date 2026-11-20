import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "consts";

export function formatStringTo8x32(text: string, maxLines: number) {
  // if the entire forecast is less than DISPLAY_MAX_CHARACTERS_PER_LINE, we can skip this
  if (text.length < DISPLAY_MAX_CHARACTERS_PER_LINE) return text;

  // we should follow the maxLinesx32 format here
  let formattedText = text;
  for (let line = 1, startPoint = 0; line <= maxLines; line++) {
    // before we do anything, we can just run to the end of the string if we'll past it
    if (startPoint + DISPLAY_MAX_CHARACTERS_PER_LINE >= text.length) {
      formattedText = `${formattedText.slice(0).trim()}\n`;
      break;
    }

    // get the last space on this line and replace it with a line break (put -1 here because if the last space is on the endpoint, it gets confused)
    const ixOfLastSpace = formattedText.lastIndexOf(" ", startPoint + DISPLAY_MAX_CHARACTERS_PER_LINE);
    formattedText = formattedText.slice(0, ixOfLastSpace).trim() + "\n" + formattedText.slice(ixOfLastSpace).trim();

    // move the cursor forward to the end of this line
    startPoint = ixOfLastSpace;
  }

  // truncate the string at the last line break and do some trimming
  return formattedText.slice(0, formattedText.lastIndexOf("\n", maxLines * DISPLAY_MAX_CHARACTERS_PER_LINE)).trim();
}

/**
 * Centres each line of text on the character grid instead of using `text-align: center`.
 * CSS centring puts a line with an odd number of characters over a line with an even number on a half column, so the
 * lines no longer sit on top of each other. Padding with whole spaces keeps every character on a column. When there's an
 * odd space left over it goes on the right (the line is outdented by half a column rather than pushed off the grid)
 */
export function centreOnGrid(text: string, columns: number = DISPLAY_MAX_CHARACTERS_PER_LINE) {
  if (!text?.length) return "";

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed.length) return "";

      return "".padStart(Math.max(0, Math.floor((columns - trimmed.length) / 2))) + trimmed;
    })
    .join("\n");
}
