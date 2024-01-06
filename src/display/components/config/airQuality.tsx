import { FormEvent, useState } from "react";
import { Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";
import { AirQualityStationSearchModal } from "./airQualityStationSearchModal";

type AirQualityConfigProps = {
  station: string;
};

export function AirQualityConfig({ station }: AirQualityConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("airQuality");
  const [mutableStation, setMutableStation] = useState(station);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ station: mutableStation });

    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured updating your AQHI station",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your AQHI station was saved",
        status: "success",
      });
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>
          Display the current air quality (and associated) on the forecast/almanac page using one of the many air
          quality stations around Canada.
        </Text>
        <Text fontSize="sm" color={"gray"}>
          <b>Note:</b> Your main weather station may not have a corresponding air quality station so you may have to
          just find the closest one instead
        </Text>
      </Stack>

      <form onSubmit={onSubmit}>
        <Stack mb={6}>
          <Text>Current Air Quality Station (region/station code): {mutableStation || "No AQHI tracking"}</Text>

          <Stack direction={"row"}>
            <AirQualityStationSearchModal
              disabled={isSaving}
              selectAirQualityStation={(station) => setMutableStation(`${station.zone}/${station.code}`)}
            />
            {mutableStation && (
              <Button type="button" mr={2} colorScheme="red" disabled={isSaving} onClick={() => setMutableStation("")}>
                Stop tracking AQHI
              </Button>
            )}
          </Stack>
        </Stack>

        <Button type="submit" mt={4} colorScheme="teal" isLoading={isSaving}>
          Save
        </Button>
      </form>
    </Stack>
  );
}
