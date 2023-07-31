import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { cleanupAlertHeadline, shouldAlertFlash } from "lib/cap-cp";
import { formatStringTo8x32 } from "lib/display";
import { useEffect, useRef, useState } from "react";
import { CAPObject } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type AlertScreenProps = {
  alerts: CAPObject[];
  hasFetched: boolean;
} & AutomaticScreenProps;

export function AlertScreen(props: AlertScreenProps) {
  const { onComplete, alerts, hasFetched } = props ?? {};
  const [page, setPage] = useState(1);
  const [displayedAlert, setDisplayedAlert] = useState<CAPObject>();
  const pageChangeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // still waiting on alerts to be fetched
    if (!hasFetched) return;

    // no alerts so we're done with this screen
    if (!alerts?.length) onComplete();
  }, [alerts]);

  // page changer
  useEffect(() => {
    // we know we have alerts so show the one for the current page
    setDisplayedAlert(alerts[page - 1]);

    pageChangeTimeout.current = setTimeout(() => {
      if (page < alerts.length) setPage(page + 1);
      else onComplete();
    }, SCREEN_DEFAULT_DISPLAY_LENGTH * 1000);
  }, [page]);

  // used to clear the page switching timeout
  useEffect(() => {
    return () => {
      pageChangeTimeout.current && clearTimeout(pageChangeTimeout.current);
    };
  }, []);

  const getShortDescriptionForAlert = (description: string) => {
    if (!description?.length) return "";

    // split on each paragraph
    const paragraphSplit = description.split(/.\s\s/).map((paragraph) => paragraph.trim());

    // take the first two paragraphs and join them
    const shortDescription = paragraphSplit.slice(0, 2)?.join(". ")?.trim() ?? "";

    // remove extra stuff thats not relevant
    const [relevantDescription] = shortDescription.split(/\n+###|\s+##/gi);
    return formatStringTo8x32(relevantDescription.split(/locations impacted/gi)[0], 7);
  };

  // display nothing if there's no alerts
  if (!alerts?.length) return <></>;

  return (
    <div id="alert_screen" className="centre-align">
      {displayedAlert && (
        <>
          <div className={shouldAlertFlash(displayedAlert) ? "flash" : ""}>
            {cleanupAlertHeadline(displayedAlert.headline)}
          </div>
          <div>{getShortDescriptionForAlert(displayedAlert.description)}</div>
        </>
      )}
    </div>
  );
}
