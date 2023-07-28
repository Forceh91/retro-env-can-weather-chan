import { CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT } from "consts";
import { useEffect, useState } from "react";
import { WeatherStation } from "types";

// tell the channel to fetch the config once every 15mins
export function useWeatherEventStream() {
  const [weatherEventStream, setWeatherEventStream] = useState<EventSource>();
  const [currentConditions, setCurrentConditions] = useState<WeatherStation>();

  useEffect(() => {
    // setup the weather event stream
    setWeatherEventStream(new EventSource("api/v1/weather/live"));
  }, []);

  // add an event listener for condition_update
  weatherEventStream &&
    weatherEventStream.addEventListener(CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT, (conditionUpdate) => {
      const parsedConditionUpdate = JSON.parse(conditionUpdate.data) as WeatherStation;
      if (!parsedConditionUpdate) return;

      // if its the same observation date (down to the min/sec) then skip updating the state because it'll render too much
      if (parsedConditionUpdate.stationTime?.observedDateTime === currentConditions?.stationTime?.observedDateTime)
        return;

      // update the state (and eventually cause a re-render)
      setCurrentConditions(parsedConditionUpdate);
    });

  return { currentConditions };
}
