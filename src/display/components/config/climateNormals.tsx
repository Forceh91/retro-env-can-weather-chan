import { ChangeEvent, FormEvent, useState } from "react";
import { Stack, Text, FormControl, FormLabel, Input, Button, useToast, Link, Select } from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";
import { ClimateNormals } from "types";
import { PROVINCE_LIST } from "consts";

type ClimateNormalsConfigProps = {
  climateNormals: ClimateNormals;
};

export function ClimateNormalsConfig({ climateNormals }: ClimateNormalsConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("climateNormals");
  const [mutableClimateID, setMutableClimateID] = useState<number>(climateNormals.climateID);
  const [mutableStationID, setMutableStationID] = useState<number>(climateNormals.stationID);
  const [mutableProvince, setMutableProvince] = useState<string>(climateNormals.province);

  const handleClimateIDChange = (e: ChangeEvent<HTMLInputElement>) => setMutableClimateID(Number(e.target.value));
  const handleStationIDChange = (e: ChangeEvent<HTMLInputElement>) => setMutableStationID(Number(e.target.value));
  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => setMutableProvince(e.target.value);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({
      climateID: mutableClimateID,
      stationID: mutableStationID,
      province: mutableProvince,
    });

    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured updating your climate normals settings",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your climate normals settings were saved",
        status: "success",
      });
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>
          Configure the the weather station that climate normals data is pulled from. This is the{" "}
          <b>Normal Precipitation</b> (City Stats Page) and <b>Normal Column</b> on the "Weather Statistics for MONTH"
          screen. You can generally set this to the same station where you are getting the current conditions from
          without too much issue.
        </Text>
        <Text fontSize="sm" color={"gray"}>
          <b>Note:</b> Not all weather stations track data correctly so this allows you to get your climate normals from
          a nearby weather station if needed. When deciding if you should select a station or not you check that the
          Start/End date columns are within the last year. All climate normals are pulled from the 80s-90s data that is
          available on ECCC for simulator authenticity.
        </Text>

        <Text fontSize="sm" color={"gray"}>
          Please refer to{" "}
          <Link color={"blue"} href="https://climate.weather.gc.ca/climate_normals/index_e.html" target="_blank">
            this website
          </Link>{" "}
          (1981-2010 tab) to see if climate normals would exist for your station.
        </Text>

        <Text fontSize="sm" color={"gray"}>
          Please refer to{" "}
          <Link
            color={"blue"}
            href="https://drive.google.com/file/d/1HDRnj41YBWpMioLPwAFiLlK4SK8NV72C/view?usp=sharing"
            target="_blank"
          >
            this CSV file
          </Link>{" "}
          for a list of available stations. The <b>Climate ID</b>, <b>Station ID</b>, <b>Province</b> columns are the
          numbers that need entering below. They must all come from the same row otherwise data will not be collected.
        </Text>
      </Stack>

      <form onSubmit={onSubmit}>
        <Stack direction={"row"}>
          <FormControl>
            <FormLabel>Climate ID</FormLabel>
            <Input value={mutableClimateID} onChange={handleClimateIDChange} isDisabled={isSaving} />
          </FormControl>

          <FormControl>
            <FormLabel>Station ID</FormLabel>
            <Input value={mutableStationID} onChange={handleStationIDChange} isDisabled={isSaving} />
          </FormControl>

          <FormControl>
            <FormLabel>Province</FormLabel>
            <Select
              placeholder="Select province"
              value={mutableProvince}
              onChange={handleProvinceChange}
              isDisabled={isSaving}
            >
              {PROVINCE_LIST.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Button type="submit" mt={4} colorScheme="teal" isLoading={isSaving}>
          Save
        </Button>
      </form>
    </Stack>
  );
}
