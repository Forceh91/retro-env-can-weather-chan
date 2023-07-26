import { CONDITIONS_WIND_SPEED_CALM } from "consts";
import { formatObservedLong } from "lib/date";
import { useMemo } from "react";
import { ObservedConditions, WeatherStationTimeData } from "types";

type ConditionsProp = {
  city: string;
  conditions: ObservedConditions;
  stationTime: WeatherStationTimeData;
  showPressure?: boolean;
};

export function Conditions(props: ConditionsProp) {
  const { city, conditions, stationTime, showPressure = false } = props ?? {};
  const {
    temperature: { value: temperatureValue, units: temperatureUnits },
    wind: {
      speed: { value: windSpeedValue, units: windSpeedUnits },
      gust: windGust,
      direction: windDirection,
    },
    humidity: { value: humidityValue, units: humidityUnits },
    visibility: { value: visibilityValue, units: visibilityUnits },
    windchill,
    abbreviatedCondition,
  } = conditions;

  const title = useMemo(
    () => stationTime && ` ${city.slice(0, 8).padEnd(11)}${formatObservedLong(stationTime, true)}`,
    [stationTime]
  );

  const formattedTemperature = useMemo(
    () =>
      (temperatureValue && !isNaN(temperatureValue)
        ? `${Math.round(temperatureValue)} ${temperatureUnits ?? ""}`
        : "N/A"
      ).padStart(5),
    [stationTime]
  );

  const formattedWind = useMemo(() => {
    const speed = windSpeedValue ?? "";
    const direction = windDirection.padStart(3);

    // gust is a different format
    if (windGust) return `${direction}  ${speed}G${windGust.value} `;

    // handle "calm" or wind less than 2kmh
    if (!windSpeedValue || windSpeedValue === CONDITIONS_WIND_SPEED_CALM || Number(windSpeedValue) < 2)
      return CONDITIONS_WIND_SPEED_CALM.padEnd(11);

    return `${direction}${`${speed} KMH`.padStart(8)}`;
  }, [stationTime]);

  const formattedHumidity = useMemo(() => `${humidityValue ?? "N/A"} ${humidityUnits}`.padStart(5), [stationTime]);

  // todo: include aqhi reading
  const isShowingExtraData = windchill > 0;
  const formattedVisibility = useMemo(() => {
    if (!visibilityValue) return "";
    if (visibilityValue < 1) return `${visibilityValue * 1000} M`;

    return `${Math.round(visibilityValue)} ${visibilityUnits}`;
  }, [stationTime]);

  return (
    <div id="conditions">
      <div>{title}</div>
      <div>
        <span>Temp&nbsp;</span>
        <span>{formattedTemperature}</span>
        <span>{"".padEnd(6)}</span>
        <span>Wind&nbsp;</span>
        <span>{formattedWind}</span>
      </div>
      <div>
        <span>Hum&nbsp;&nbsp;</span>
        <span>{formattedHumidity}</span>
        <span>{"".padEnd(6)}</span>
        <span>{abbreviatedCondition ?? ""}</span>
      </div>
      <div>
        {isShowingExtraData && (
          <>
            <span>Vsby&nbsp;</span>
            <span>{formattedVisibility.padStart(6)}</span>
            <span>{"".padEnd(5)}</span>
            {windchill > 0 && <span>Wind Chill {windchill}</span>}
            {/* todo: aqhi */}
          </>
        )}
        {!isShowingExtraData && (
          <span>
            {"Visibility".padStart(16)}&nbsp;&nbsp;{formattedVisibility}
          </span>
        )}
      </div>
    </div>
  );
}
