import {
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
  useToast,
  Box,
  Flex,
} from "@chakra-ui/react";
import { DISPLAY_MAX_CHARACTERS_PER_LINE, DISPLAY_MAX_LINES, INFO_SCREEN_MAX_ENTRIES } from "consts";
import { useSaveConfigOption } from "hooks";
import {
  getInfoScreenStatus,
  InfoScreenStatus,
  normalizeInfoScreenMessage,
  validateInfoScreenMessage,
} from "lib/infoscreen";
import { FormEvent, useEffect, useState } from "react";
import { InfoScreenEntry } from "types";
import uuid4 from "uuid4";

type InfoScreensConfigProps = {
  infoScreens: InfoScreenEntry[];
};

type SaveInfoScreensResponse = {
  infoScreens: InfoScreenEntry[];
};

const STATUS_BADGES: Record<InfoScreenStatus, { colorScheme: string; label: string }> = {
  active: { colorScheme: "green", label: "Showing" },
  scheduled: { colorScheme: "blue", label: "Scheduled" },
  expired: { colorScheme: "gray", label: "Expired" },
};

export function InfoScreensConfig({ infoScreens }: InfoScreensConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError, response } =
    useSaveConfigOption<SaveInfoScreensResponse>("infoScreens");

  const [mutableInfoScreens, setMutableInfoScreens] = useState<InfoScreenEntry[]>(infoScreens ?? []);

  // validate the message of each one so you find out whilst typing, not after pressing save
  const messageErrors = mutableInfoScreens.map((screen) => validateInfoScreenMessage(screen.message));
  const hasDateErrors = mutableInfoScreens.some(
    (screen) => !!screen.start && !!screen.end && screen.end < screen.start
  );
  const isSaveable = !isSaving && !hasDateErrors && messageErrors.every((error) => !error);

  useEffect(() => {
    if (wasError)
      toast({
        title: "Unable to save",
        description: "An error occured updating your info screens",
        status: "error",
      });
  }, [wasError]);

  useEffect(() => {
    if (!wasSuccess) return;

    // the server tidies up what was typed, so show what it kept
    if (response?.infoScreens) setMutableInfoScreens(response.infoScreens);
    toast({ title: "Save successful", description: "Your info screens were saved", status: "success" });
  }, [wasSuccess]);

  const addInfoScreen = () => setMutableInfoScreens([...mutableInfoScreens, { id: uuid4(), message: "" }]);

  const updateInfoScreen = (id: string, changes: Partial<InfoScreenEntry>) =>
    setMutableInfoScreens(mutableInfoScreens.map((screen) => (screen.id === id ? { ...screen, ...changes } : screen)));

  const deleteInfoScreen = (id: string) =>
    setMutableInfoScreens(mutableInfoScreens.filter((screen) => screen.id !== id));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ infoScreens: mutableInfoScreens });
  };

  return (
    <Stack spacing={6}>
      <Text>
        Custom text only screens, shown by the "Info screen" screen in a flavour. Each one is {DISPLAY_MAX_LINES} lines
        of {DISPLAY_MAX_CHARACTERS_PER_LINE} characters at most and is centred on the display, so what you type on each
        line is what appears on it (a blank line stays blank). Leave the dates empty to show it all the time.
      </Text>

      <form onSubmit={onSubmit}>
        <Stack spacing={6}>
          {!mutableInfoScreens.length && <Text fontStyle="italic">There are no info screens yet.</Text>}

          {mutableInfoScreens.map((screen, ix) => {
            const lines = normalizeInfoScreenMessage(screen.message).split("\n");
            const longestLine = Math.max(...lines.map((line) => line.trim().length));
            const status = getInfoScreenStatus(screen);
            const hasDateError = !!screen.start && !!screen.end && screen.end < screen.start;

            return (
              <Box key={screen.id} borderWidth="1px" borderRadius="md" p={4}>
                <Stack spacing={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">
                      Info screen {ix + 1}{" "}
                      <Badge colorScheme={STATUS_BADGES[status].colorScheme}>{STATUS_BADGES[status].label}</Badge>
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      isDisabled={isSaving}
                      onClick={() => deleteInfoScreen(screen.id)}
                    >
                      Delete
                    </Button>
                  </Flex>

                  <FormControl isInvalid={!!messageErrors[ix]}>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      value={screen.message}
                      onChange={(e) => updateInfoScreen(screen.id, { message: e.target.value })}
                      rows={DISPLAY_MAX_LINES}
                      wrap="off"
                      fontFamily="mono"
                      isDisabled={isSaving}
                    />
                    <Text fontSize="sm" color={messageErrors[ix] ? "red.500" : "gray.500"} mt={1}>
                      {messageErrors[ix] && screen.message.length
                        ? `Too big for the display: ${messageErrors[ix]}`
                        : `${screen.message.length ? lines.length : 0}/${DISPLAY_MAX_LINES} lines, longest is ${
                            screen.message.length ? longestLine : 0
                          }/${DISPLAY_MAX_CHARACTERS_PER_LINE} characters`}
                    </Text>
                  </FormControl>

                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    <FormControl>
                      <FormLabel>First day shown</FormLabel>
                      <Input
                        type="date"
                        value={screen.start ?? ""}
                        onChange={(e) => updateInfoScreen(screen.id, { start: e.target.value })}
                        isDisabled={isSaving}
                      />
                    </FormControl>
                    <FormControl isInvalid={hasDateError}>
                      <FormLabel>Last day shown</FormLabel>
                      <Input
                        type="date"
                        value={screen.end ?? ""}
                        min={screen.start || undefined}
                        onChange={(e) => updateInfoScreen(screen.id, { end: e.target.value })}
                        isDisabled={isSaving}
                      />
                      {hasDateError && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          The last day can't be before the first day
                        </Text>
                      )}
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>
            );
          })}

          <Stack direction="row" spacing={4}>
            <Button
              type="button"
              colorScheme="blue"
              isDisabled={isSaving || mutableInfoScreens.length >= INFO_SCREEN_MAX_ENTRIES}
              onClick={addInfoScreen}
            >
              Add info screen
            </Button>
            <Button type="submit" colorScheme="teal" isLoading={isSaving} isDisabled={!isSaveable}>
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
