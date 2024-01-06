import { format } from "date-fns";
import { getAQHIRisk, getAQHIWarningMessage } from "lib/airquality/utils";
import { useEffect, useMemo } from "react";
import { AQHIObservationResponse, AutomaticScreenProps } from "types";

type AQHIWarningScreenProps = {
  city: string;
  airQuality: AQHIObservationResponse;
} & AutomaticScreenProps;

export function AQHIWarningScreen({ city, airQuality, onComplete }: AQHIWarningScreenProps) {
  const observedDateTime = useMemo(() => {
    if (!airQuality) return;

    return format(
      new Date(2023, airQuality?.month - 1, airQuality?.day, airQuality.hour + (airQuality.isPM ? 12 : 0)),
      "hh aa MMM dd"
    ).replace(/0(\d)/g, " $1");
  }, [airQuality, airQuality?.day, airQuality?.month, airQuality?.hour]);

  useEffect(() => {
    if (!airQuality || !airQuality.value || !airQuality.showWarning) return onComplete();
  }, [airQuality]);

  if (!airQuality?.value || !airQuality?.showWarning) return <></>;

  return (
    <div style={{ textAlign: "left" }}>
      <div>{city.slice(0, 3)} air quality health index at</div>
      <div>
        {observedDateTime} is {Math.round(airQuality.value).toString().padStart(2)}-{getAQHIRisk(airQuality.value)} risk
      </div>
      <div>{getAQHIWarningMessage(airQuality.value)}</div>
    </div>
  );
}
