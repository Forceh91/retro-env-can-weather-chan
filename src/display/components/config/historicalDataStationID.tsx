import { ChangeEvent, FormEvent, useState } from "react";
import { Stack, Text, FormControl, FormLabel, Input, Button, useToast, Link } from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";

type HistoricalDataStationIDConfigProps = {
  historicalDataStationID: number;
};

export function HistoricalDataStationIDConfig({ historicalDataStationID }: HistoricalDataStationIDConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("historicalDataStationID");

  const [mutableHistoricalDataStationID, setMutableHistoricalDataStationID] = useState<number>(historicalDataStationID);

  const handleStationIDChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMutableHistoricalDataStationID(Number(e.target.value));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ historicalDataStationID: mutableHistoricalDataStationID });

    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured updating your historical station ID",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your historical station ID was saved",
        status: "success",
      });
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>
          Configure the weather station that historical data is pulled from. This is what is used to generate the
          seasonal precipitation, last year temperatures, and last month stats.
        </Text>
        <Text fontSize="sm" color={"gray"}>
          <b>Note:</b> Not all weather stations track data correctly so this allows you to select another station
          (ideally close by) that can provide that information instead. For example,
          <i>"Winnipeg Richardson Intl A"</i> doesn't track both last year and precip data so we use a station in a
          different location referred to as
          <i>"Winnipeg A CS"</i>
        </Text>

        <Text fontSize="sm" color={"gray"}>
          Please refer to{" "}
          <Link
            color={"blue"}
            href="https://drive.google.com/file/d/1HDRnj41YBWpMioLPwAFiLlK4SK8NV72C/view?usp=sharing"
            target="_blank"
          >
            this CSV File
          </Link>{" "}
          for a list of available stations. The <b>Station ID</b> column is the number that needs entering below.
        </Text>
      </Stack>

      <form onSubmit={onSubmit}>
        <FormControl>
          <FormLabel>Station ID</FormLabel>
          <Input value={mutableHistoricalDataStationID} onChange={handleStationIDChange} />
        </FormControl>

        <Button type="submit" mt={4} colorScheme="teal" isLoading={isSaving}>
          Save
        </Button>
      </form>
    </Stack>
  );
}
