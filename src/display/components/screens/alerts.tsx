import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { cleanupAlertHeadline, isWarningSevereThunderstormWatch, shouldAlertFlash } from "lib/cap-cp";
import { formatStringTo8x32 } from "lib/display";
import { useEffect, useRef, useState } from "react";
import { CAPObject } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type AlertScreenProps = {
  alerts: CAPObject[];
  hasFetched: boolean;
} & AutomaticScreenProps;

type FakeAlertScreen = {
  isSevereTStormExplanation?: boolean;
} & Partial<CAPObject>;

function SevereTStormExplanationScreen() {
  return (
    <div id="stw_explanation">
      <div>a severe thunderstorm watch is</div>
      <div>an alert of possible thndrstrms</div>
      <div>large hail, intense lightning,</div>
      <div>locally heavy rain or damaging</div>
      <div>winds in and close to the watch</div>
      <div>area. persons in and near these</div>
      <div>areas should be on the lookout</div>
      <div>for severe weather conditions</div>
    </div>
  );
}

export function AlertScreen(props: AlertScreenProps) {
  const { onComplete, alerts, hasFetched } = props ?? {};
  const [page, setPage] = useState(1);
  const [displayedAlert, setDisplayedAlert] = useState<FakeAlertScreen>();
  const [displayAlerts, setDisplayAlerts] = useState<FakeAlertScreen[]>([]);
  const pageChangeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // still waiting on alerts to be fetched
    if (!hasFetched) return;

    // no alerts so we're done with this screen
    if (!alerts?.length) onComplete();
    else {
      // see if there's a severe tstorm and add a page for it
      const tempAlerts: FakeAlertScreen[] = [...alerts];
      const hasSevereTStormWatch = tempAlerts.findIndex((alert) => isWarningSevereThunderstormWatch(alert.headline));
      if (hasSevereTStormWatch > -1)
        tempAlerts.splice(hasSevereTStormWatch + 1, 0, { isSevereTStormExplanation: true });

      // set this is as the alerts to show
      setDisplayAlerts(tempAlerts);
    }
  }, [alerts]);

  // page changer
  useEffect(() => {
    if (!displayAlerts.length) return;

    // we know we have alerts so show the one for the current page
    setDisplayedAlert(displayAlerts[page - 1]);

    pageChangeTimeout.current = setTimeout(() => {
      if (page < displayAlerts.length) setPage(page + 1);
      else onComplete();
    }, SCREEN_DEFAULT_DISPLAY_LENGTH * 1000);
  }, [page, displayAlerts]);

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
    return formatStringTo8x32(relevantDescription.replace(/\n+/g, " ").split(/locations impacted/gi)[0], 7);
  };

  // display nothing if there's no alerts
  if (!displayAlerts?.length) return <></>;

  return (
    <div id="alert_screen" className={!displayedAlert?.isSevereTStormExplanation && "centre-align"}>
      {displayedAlert?.isSevereTStormExplanation && <SevereTStormExplanationScreen />}
      {displayedAlert && !displayedAlert.isSevereTStormExplanation && (
        <>
          <div className={shouldAlertFlash(displayedAlert as CAPObject) ? "flash" : ""}>
            {cleanupAlertHeadline(displayedAlert.headline)}
          </div>
          <div>{getShortDescriptionForAlert(displayedAlert.description)}</div>
        </>
      )}
    </div>
  );
}
