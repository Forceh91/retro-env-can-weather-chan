import { ChangeEvent, FormEvent, useState } from "react";
import {
  Stack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tfoot,
} from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";
import { Flavour, FlavourScreen } from "types";
import { generateNewFlavour, isAutomaticScreen } from "lib/flavour/utils";
import { FLAVOUR_NAME_MAX_LENGTH, SCREEN_DESCRIPTIONS, SCREEN_MIN_DISPLAY_LENGTH, SCREEN_NAMES, Screens } from "consts";
import axios from "lib/axios";

type FlavoursConfigProps = {
  currentFlavours: string[];
};

export function FlavoursConfig({ currentFlavours }: FlavoursConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("flavour", "");
  const [mutableFlavour, setMutableFlavour] = useState<Flavour>();
  const [selectedFlavour, setSelectedFlavour] = useState<string>("");

  const isFlavourSaveable = !!mutableFlavour?.name?.length && !!mutableFlavour?.screens?.length;

  const handleFlavourNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMutableFlavour({ ...mutableFlavour, name: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ flavour: mutableFlavour }, !!!mutableFlavour.uuid);

    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured saving your flavour",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your flavour was saved",
        status: "success",
      });
  };

  const discardChanges = () => {
    setMutableFlavour(null);
    setSelectedFlavour("");
  };

  const createNewFlavour = () => {
    setMutableFlavour(generateNewFlavour());
  };

  const editFlavour = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFlavour(e.target.value);
    if (!e.target.value) return setMutableFlavour(null);

    axios.get(`/flavour/${e.target.value}`).then((resp) => {
      const { data } = resp;
      if (!data || !data.flavour) return;

      setMutableFlavour(data.flavour as Flavour);
    });
  };

  const addScreenToFlavour = () => {
    if (!mutableFlavour) return;

    setMutableFlavour({
      ...mutableFlavour,
      screens: [...mutableFlavour.screens, { id: Screens.FORECAST, duration: 0 }],
    });
  };

  const deleteScreen = (ix: number) => {
    const newScreens = [...mutableFlavour.screens];
    newScreens.splice(ix, 1);

    setMutableFlavour({ ...mutableFlavour, screens: newScreens });
  };

  const updateScreenID = (e: ChangeEvent<HTMLSelectElement>, screen: FlavourScreen, ix: number) => {
    // update screen in temp array
    const newScreens = [...mutableFlavour.screens];
    newScreens.splice(ix, 1, {
      id: Number(e.target.value),
      duration: isAutomaticScreen(Number(e.target.value)) ? 0 : Math.max(SCREEN_MIN_DISPLAY_LENGTH, screen.duration),
    });

    // store to state
    setMutableFlavour({ ...mutableFlavour, screens: newScreens });
  };

  const updateScreenDuration = (e: ChangeEvent<HTMLInputElement>, screen: FlavourScreen, ix: number) => {
    // update screen in temp array
    const newScreens = [...mutableFlavour.screens];
    newScreens.splice(ix, 1, { ...screen, duration: Math.max(SCREEN_MIN_DISPLAY_LENGTH, Number(e.target.value)) });

    // store to state
    setMutableFlavour({ ...mutableFlavour, screens: newScreens });
  };

  const moveScreenPosition = (screen: FlavourScreen, ix: number, isUp: boolean = false) => {
    if ((isUp && ix < 1) || (!isUp && ix >= mutableFlavour.screens.length)) return;

    // remove it from where it was originally
    const newScreens = [...mutableFlavour.screens];
    newScreens.splice(ix, 1);

    // then put it one higher
    newScreens.splice(isUp ? ix - 1 : ix + 1, 0, screen);

    // store to state
    setMutableFlavour({ ...mutableFlavour, screens: newScreens });
  };

  return (
    <Stack spacing={6}>
      <Stack>
        <Text>
          Flavours can be used to change the order in which screens appear and how long they appear for. You can also
          change the duration for screens which aren't automatic. An automatic screen is generally paginated and is used
          for alerts, forecast, etc.
        </Text>
      </Stack>

      <Stack direction={"row"} spacing={4} alignItems={"center"}>
        <Select placeholder="Select a flavour to edit" onChange={editFlavour} maxWidth={"md"} value={selectedFlavour}>
          {currentFlavours.map((flavourName) => (
            <option key={flavourName} value={flavourName}>
              {flavourName}
            </option>
          ))}
        </Select>
        <Text>or</Text>
        <Button
          type="button"
          colorScheme="green"
          size={"md"}
          isDisabled={isSaving || !!mutableFlavour}
          onClick={createNewFlavour}
        >
          Create new flavour
        </Button>
      </Stack>

      {mutableFlavour && (
        <form onSubmit={onSubmit}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Flavor Name</FormLabel>
              <Input
                value={mutableFlavour.name}
                onChange={handleFlavourNameChange}
                isDisabled={isSaving}
                maxLength={FLAVOUR_NAME_MAX_LENGTH}
              />
            </FormControl>

            <Text fontWeight={"medium"}>Flavour Screens</Text>
            <TableContainer>
              <Table variant={"striped"}>
                <Thead>
                  <Tr>
                    <Th>Screen</Th>
                    <Th>Duration (secs)</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mutableFlavour.screens?.length ? (
                    mutableFlavour.screens.map((screen, ix) => (
                      <Tr key={`screen.${ix}`}>
                        <Td>
                          <Select value={screen.id} onChange={(e) => updateScreenID(e, screen, ix)}>
                            {Object.keys(Screens)
                              .filter((screenID) => !isNaN(Number(screenID)))
                              .map((screenID) => (
                                <option
                                  key={`screen.option.${screenID}`}
                                  value={screenID}
                                  title={SCREEN_DESCRIPTIONS[Number(screenID) as Screens]}
                                >
                                  {SCREEN_NAMES[Number(screenID) as Screens]}
                                </option>
                              ))}
                          </Select>
                        </Td>
                        <Td>
                          {isAutomaticScreen(screen.id) ? (
                            <Text>Automatic</Text>
                          ) : (
                            <Input
                              value={screen.duration}
                              type="number"
                              onChange={(e) => updateScreenDuration(e, screen, ix)}
                            ></Input>
                          )}
                        </Td>
                        <Td>
                          <Stack direction={"row"} spacing={2}>
                            <Button
                              isDisabled={isSaving}
                              colorScheme="blue"
                              onClick={() => moveScreenPosition(screen, ix, true)}
                              size={"sm"}
                            >
                              Move up
                            </Button>

                            <Button
                              isDisabled={isSaving}
                              colorScheme="blue"
                              onClick={() => moveScreenPosition(screen, ix)}
                              size={"sm"}
                            >
                              Move down
                            </Button>

                            <Button
                              isDisabled={isSaving}
                              colorScheme="red"
                              onClick={() => deleteScreen(ix)}
                              size={"sm"}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3}>Flavour has no screens, one screen must be present</Td>
                    </Tr>
                  )}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Td colSpan={3}>
                      <Button colorScheme="blue" size={"sm"} onClick={addScreenToFlavour} isDisabled={isSaving}>
                        Add screen
                      </Button>
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>

            <Button type="submit" colorScheme="teal" isLoading={isSaving} isDisabled={!isFlavourSaveable}>
              Save
            </Button>

            <Button type="button" colorScheme="red" isDisabled={isSaving} onClick={discardChanges}>
              Discard changes
            </Button>
          </Stack>
        </form>
      )}
    </Stack>
  );
}
