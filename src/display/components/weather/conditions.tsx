import { CONDITIONS_WIND_SPEED_CALM } from "consts";
import { formatObservedLong } from "lib/date";
import { isLooseNull } from "lib/isnull";
import { useMemo } from "react";
import { AQHIObservationResponse, ObservedConditions, WeatherStationTimeData } from "types";

type ConditionsProp = {
  city: string;
  conditions: ObservedConditions;
  stationTime: WeatherStationTimeData;
  showPressure?: boolean;
  airQuality: AQHIObservationResponse;
};

export function Conditions(props: ConditionsProp) {
  const {
    city,
    conditions,
    stationTime,
    stationTime: { observedDateTime },
    showPressure = false,
    airQuality,
  } = props ?? {};
  const {
    temperature: { value: temperatureValue, units: temperatureUnits },
    wind: {
      speed: { value: windSpeedValue },
      gust: windGust,
      direction: windDirection,
    },
    humidity: { value: humidityValue, units: humidityUnits },
    visibility: { value: visibilityValue, units: visibilityUnits },
    pressure: { value: pressureValue, units: pressureUnits, tendency: pressureTendency },
    windchill,
    abbreviatedCondition,
  } = conditions;

  const title = useMemo(
    () => stationTime && ` ${city.slice(0, 8).padEnd(11)}${formatObservedLong(stationTime, true)}`,
    [observedDateTime]
  );

  const formattedTemperature = useMemo(
    () =>
      (temperatureValue !== null && !isNaN(temperatureValue)
        ? `${Math.round(temperatureValue)} ${temperatureUnits ?? ""}`
        : "N/A"
      ).padStart(5),
    [observedDateTime]
  );

  const formattedWind = useMemo(() => {
    // handle "calm" or wind less than 2kmh
    if (!windSpeedValue || windSpeedValue === CONDITIONS_WIND_SPEED_CALM || Number(windSpeedValue) < 2)
      return CONDITIONS_WIND_SPEED_CALM;

    const speed = windSpeedValue ?? "";
    const direction = (windDirection ?? "").padStart(3);

    // gust is a different format (omits units)
    if (windGust) return `${direction}  ${speed}G${windGust.value} `;

    return `${direction}${`${speed} KMH`.padStart(8)}`;
  }, [observedDateTime]);

  const formattedHumidity = useMemo(() => `${humidityValue ?? "N/A"} ${humidityUnits}`.padStart(5), [stationTime]);

  const isShowingExtraData = windchill > 0 || airQuality?.value;
  const formattedVisibility = useMemo(() => {
    if (isLooseNull(visibilityValue)) return "";
    if (visibilityValue < 1) return `${(visibilityValue * 1000).toString().padStart(4, " ")} M`;

    return `${Math.round(visibilityValue)} ${visibilityUnits}`;
  }, [observedDateTime]);

  return (
    <div id="conditions">
      <div className="grid-row">{title}</div>
      <div className="grid-row">
        <span>
          <span>Temp&nbsp;</span>
          <span>{formattedTemperature}</span>
        </span>
        <span>{"".padEnd(6)}</span>
        <span>
          <span>Wind&nbsp;</span>
          <span>{formattedWind}</span>
        </span>
      </div>
      <div className="grid-row">
        <span>
          <span>Hum&nbsp;&nbsp;</span>
          <span>{formattedHumidity}</span>
        </span>
        <span>{"".padEnd(6)}</span>
        <span>
          <span>{abbreviatedCondition ?? ""}</span>
        </span>
      </div>
      <div className="grid-row">
        {isShowingExtraData && (
          <>
            <span>
              <span>Vsby&nbsp;</span>
              <span>{formattedVisibility.padStart(6)}</span>
            </span>
            <span>{"".padEnd(5)}</span>
            <span>
              {windchill > 0 && <span>Wind Chill {windchill}</span>}
              {!windchill && airQuality?.value && <span>Air Quality {airQuality.textValue}</span>}
            </span>
          </>
        )}
        {!isShowingExtraData && (
          <span>
            {"Visibility".padStart(16)}&nbsp;&nbsp;{formattedVisibility}
          </span>
        )}
      </div>
      {showPressure && (
        <div className="grid-row">
          {"Pressure".padStart(11)} {pressureValue.toFixed(1).padStart(5)} {pressureUnits.padEnd(4)} {pressureTendency}
        </div>
      )}
    </div>
  );
}
