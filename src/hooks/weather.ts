import { CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT } from "consts";
import { useEffect, useRef, useState } from "react";
import { WeatherStation } from "types";

// tell the channel to fetch the config once every 15mins
export function useWeatherEventStream() {
  const [currentConditions, setCurrentConditions] = useState<WeatherStation>();
  const eventStreamRef = useRef<EventSource>(null);
  const currentConditionsRef = useRef<WeatherStation>();

  // keep ref in sync with state
  useEffect(() => {
    currentConditionsRef.current = currentConditions;
  }, [currentConditions]);

  useEffect(() => {
    // dont do anything if we have an event stream already
    if (eventStreamRef.current) return;

    // setup the weather event stream
    const eventStream = new EventSource("api/v1/weather/live");
    eventStreamRef.current = eventStream;

    // add an event listener for condition_update
      eventStream.addEventListener(CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT, (conditionUpdate) => {
        const parsedConditionUpdate = JSON.parse(conditionUpdate.data) as WeatherStation;
        if (!parsedConditionUpdate) return;

        // if its the same observation date (down to the min/sec) then skip updating the state because it'll render too much
      if (parsedConditionUpdate.observationID === currentConditionsRef.current?.observationID) return;

        // update the state (and eventually cause a re-render)
        setCurrentConditions(parsedConditionUpdate);
      });

    // cleanup on unmount
    return () => {
      if (eventStreamRef.current) {
        eventStreamRef.current.close();
        eventStreamRef.current = null;
      }
    };
  }, []);

  return { currentConditions };
}
