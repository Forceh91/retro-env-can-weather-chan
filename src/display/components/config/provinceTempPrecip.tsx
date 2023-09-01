import {
  Button,
  FormControl,
  FormLabel,
  Stack,
  Switch,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { PROVINCE_TRACKING_MAX_STATIONS } from "consts";
import { useSaveConfigOption } from "hooks";
import { FormEvent, useState } from "react";
import { ECCCWeatherStation, ProvinceStations } from "types";
import { WeatherStationSearchModal } from "./weatherStationSearchModal";

type ProvinceTempPrecipConfigProps = { isEnabled: boolean; stations: ProvinceStations };

export function ProvinceTempPrecipConfig({ isEnabled, stations }: ProvinceTempPrecipConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("provinceTracking");
  const [mutableIsEnabled, setMutableIsEnabled] = useState(isEnabled);
  const [mutableStations, setMutableStations] = useState<ProvinceStations>(stations ?? []);
  const isStationSearchDisabled = isSaving || mutableStations.length === PROVINCE_TRACKING_MAX_STATIONS;
  const canSave = !mutableIsEnabled || (mutableIsEnabled && mutableStations.length > 0);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ isEnabled: mutableIsEnabled, stations: mutableStations });

    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured updating your province tracking",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your province tracking options were saved",
        status: "success",
      });
  };

  const addTrackedStation = (station: ECCCWeatherStation) => {
    // province tracking uses a slightly format
    if (mutableStations?.length === PROVINCE_TRACKING_MAX_STATIONS) return;

    // make sure its not in there already
    if (mutableStations.find((mutableStation) => mutableStation.code.includes(station.location))) return;

    // cleanup the station name (dont want brackets etc.)
    const [cleanName] = station.name.split("(");

    // update it
    setMutableStations([
      ...mutableStations,
      { name: cleanName, code: `${station.province.toUpperCase()}/${station.location}` },
    ]);
  };

  const deleteTrackedStation = (code: string) => {
    // find its index
    const ix = mutableStations.findIndex((station) => station.code === code);
    if (ix === -1) return;

    // remove it
    const newStations = [...mutableStations];
    newStations.splice(ix, 1);

    // update the state
    setMutableStations(newStations);
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>
          Track precipitation and high/low temp over a 24hr period for up to {PROVINCE_TRACKING_MAX_STATIONS} stations
          in the same province as your main station.
        </Text>
        <Text fontSize="sm" color={"gray"}>
          <b>Note:</b> Whilst not strictly limited to stations within the same province, it is recommended to do so.
          Some precipitation reports may not be accurate. It is recommended to add the main station here too.
        </Text>
      </Stack>

      <Stack>
        <form onSubmit={onSubmit}>
          <Stack mb={6}>
            <FormControl>
              <FormLabel htmlFor="isEnabled">Enable province precip and high/low temp tracking?</FormLabel>
              <Switch
                isDisabled={isSaving}
                id="isEnabled"
                isChecked={mutableIsEnabled}
                onChange={() => setMutableIsEnabled(!mutableIsEnabled)}
              />
            </FormControl>
          </Stack>

          {mutableIsEnabled && (
            <Stack>
              <Stack direction={"row"} display={"flex"} alignItems={"center"}>
                <Heading as="h2" size="md">
                  Tracked Stations
                </Heading>
                <WeatherStationSearchModal
                  disabled={isStationSearchDisabled}
                  selectWeatherStation={addTrackedStation}
                />
              </Stack>

              <TableContainer mt={4}>
                <Table variant="striped" size={"sm"}>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Province/Code</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mutableStations?.length ? (
                      mutableStations.map((station) => (
                        <Tr key={station.code}>
                          <Td>{station.name}</Td>
                          <Td>{station.code}</Td>
                          <Td>
                            <Button
                              isDisabled={isSaving}
                              colorScheme="red"
                              onClick={() => deleteTrackedStation(station.code)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={4}>You aren't tracking any stations</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          <Button type="submit" mt={4} colorScheme="teal" isDisabled={!canSave} isLoading={isSaving}>
            Save
          </Button>
        </form>
      </Stack>
    </Stack>
  );
}
