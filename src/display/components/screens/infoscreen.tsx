import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { centreOnGrid } from "lib/display";
import { normalizeInfoScreenMessage } from "lib/infoscreen";
import { useEffect, useState } from "react";
import { InfoScreenEntry } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type InfoScreenProps = {
  infoScreens: InfoScreenEntry[];
} & AutomaticScreenProps;

/**
 * Shows each of the custom text screens from the config one after the other, then moves on. Nothing is shown (and the
 * rotation moves straight on) when there aren't any that are active today.
 */
export function InfoScreen(props: InfoScreenProps) {
  const { infoScreens, onComplete } = props ?? {};

  // the list is refetched every few minutes, but it shouldn't change under the screen whilst it's being displayed
  const [pages] = useState(() => (infoScreens ?? []).filter((screen) => screen?.message?.trim().length));
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!pages.length) return onComplete();

    const timeout = setTimeout(() => {
      if (page < pages.length) setPage(page + 1);
      else onComplete();
    }, SCREEN_DEFAULT_DISPLAY_LENGTH * 1000);

    return () => clearTimeout(timeout);
  }, [page]);

  if (!pages.length) return <></>;

  return <div id="info_screen">{centreOnGrid(normalizeInfoScreenMessage(pages[page - 1].message))}</div>;
}
