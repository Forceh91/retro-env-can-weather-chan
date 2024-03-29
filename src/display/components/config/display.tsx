import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";
import { FormEvent, useEffect, useState } from "react";
import { FlavourNames, LookAndFeel, MiscConfig } from "types";

type DisplayConfigProps = {
  flavour: string;
  flavours: FlavourNames;
  rejectInHourConditionUpdates: boolean;
  alternateRecordsSource: string;
  playlist: string[];
};

type MiscConfigOptionResponse = MiscConfig;

const exampleRecordsJSON = `{"records": [{"hi": {"value": 4.4,"year": 1880},"lo": {"value": -43.3,"year": 1885}},...]}`;

export function DisplayConfig({
  flavour,
  flavours,
  rejectInHourConditionUpdates,
  alternateRecordsSource,
  playlist,
}: DisplayConfigProps) {
  const toast = useToast();
  const [mutableRejectInHourConditionUpdates, setMutableRejectInHourConditionUpdates] =
    useState(rejectInHourConditionUpdates);
  const [mutableAlternateRecordsSource, setMutableAlternateRecordsSource] = useState(alternateRecordsSource ?? "");
  const [mutableFlavour, setMutableFlavour] = useState(flavour ?? "");
  const [mutablePlaylist, setMutablePlaylist] = useState(playlist);

  const miscSaveConfigOption = useSaveConfigOption<MiscConfigOptionResponse>("misc");
  const lookAndFeelSaveConfigOption = useSaveConfigOption<LookAndFeel>("lookAndFeel");
  const regeneratePlaylist = useSaveConfigOption<string[]>("playlist");

  const onSubmitMiscSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await miscSaveConfigOption.saveConfigOption({
      rejectInHourConditionUpdates: mutableRejectInHourConditionUpdates,
      alternateRecordsSource: mutableAlternateRecordsSource,
    });

    if (miscSaveConfigOption.wasError)
      return toast({
        title: "Unable to save misc settings",
        description: "An error occured saving your misc settings - please try again",
        status: "error",
      });

    if (miscSaveConfigOption.wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your misc settings were saved",
        status: "success",
      });
  };

  const onSubmitLookAndFeelSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await lookAndFeelSaveConfigOption.saveConfigOption({
      flavour: mutableFlavour,
    });

    if (lookAndFeelSaveConfigOption.wasError)
      return toast({
        title: "Unable to save look and feel settings",
        description: "An error occured saving your look and feel settings - please try again",
        status: "error",
      });

    if (lookAndFeelSaveConfigOption.wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your look and feel settings were saved",
        status: "success",
      });
  };

  useEffect(() => {
    if (regeneratePlaylist.wasError)
      toast({
        title: "Unable to regenerate playlist",
        description: "An error occured regenerating your playlist - please try again",
        status: "error",
      });

    if (regeneratePlaylist.wasSuccess) {
      setMutablePlaylist(regeneratePlaylist.response);

      toast({
        title: "Playlist regenerated successful",
        description: "Your playlist was regenerated",
        status: "success",
      });
    }
  }, [regeneratePlaylist.response, regeneratePlaylist.wasError, regeneratePlaylist.wasSuccess]);

  const onSubmitRegeneratePlaylist = () => {
    regeneratePlaylist.saveConfigOption({});
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>General settings for the channel related to what you see on the display portion of the simulator.</Text>
      </Stack>

      <Heading size={"md"}>Misc. Settings</Heading>

      <Stack mb={6}>
        <form onSubmit={onSubmitMiscSettings}>
          <Stack>
            <FormControl>
              <FormLabel htmlFor="isEnabled">Only update weather station conditions once an hour?</FormLabel>
              <Switch
                isDisabled={miscSaveConfigOption.isSaving}
                id="isEnabled"
                isChecked={mutableRejectInHourConditionUpdates}
                onChange={() => setMutableRejectInHourConditionUpdates(!mutableRejectInHourConditionUpdates)}
              />
              <FormHelperText>
                ECCC may send multiple updates during each hour. The original channel only received one update at the
                start of the hour. Enabling this gives a more authentic feeling to the channel
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="recordsSource">Use alternative record source?</FormLabel>
              <Input
                type="url"
                value={mutableAlternateRecordsSource}
                onChange={(e) => setMutableAlternateRecordsSource(e.target.value)}
              />
              <FormHelperText>
                At times the temperature records that ECCC hold may vary with how far back they start and end - this
                allows you to create your own source of truth for temperature records. Please provide a valid URL
                pointing to a JSON of the following format:
                <pre>{exampleRecordsJSON}</pre>
                Each entry would be the day number for the year (1-366). Make sure Feb 29th is included to account for
                leap years.
              </FormHelperText>
            </FormControl>
          </Stack>

          <Button type="submit" mt={4} colorScheme="teal" isLoading={miscSaveConfigOption.isSaving}>
            Save
          </Button>
        </form>
      </Stack>

      <Heading size={"md"}>Look and Feel</Heading>

      <Stack>
        <form onSubmit={onSubmitLookAndFeelSettings}>
          <FormControl>
            <FormLabel htmlFor="selectFlavour">Flavour</FormLabel>
            <Select
              onChange={(e) => setMutableFlavour(e.target.value)}
              maxWidth={"md"}
              value={mutableFlavour}
              id="selectFlavour"
            >
              <option value={""}>Default</option>
              {flavours.map((flavourName) => (
                <option key={flavourName} value={flavourName}>
                  {flavourName}
                </option>
              ))}
            </Select>
            <FormHelperText>See the "Flavours" tab for more info about flavours</FormHelperText>
          </FormControl>

          <Button type="submit" mt={4} colorScheme="teal" isLoading={lookAndFeelSaveConfigOption.isSaving}>
            Save
          </Button>
        </form>
      </Stack>

      <Heading size={"md"}>Playlist</Heading>

      <Stack>
        <Text>
          You currently have <b>{mutablePlaylist.length} tracks</b> in rotation
        </Text>

        <Button
          type="button"
          mt={4}
          colorScheme="teal"
          isLoading={regeneratePlaylist.isSaving}
          onClick={onSubmitRegeneratePlaylist}
        >
          Regenerate Playlist
        </Button>
      </Stack>
    </Stack>
  );
}
