import { Button, FormControl, FormLabel, Stack, Text, Textarea, useToast } from "@chakra-ui/react";
import { useSaveConfigOption } from "hooks";
import { FormEvent, useState } from "react";

type CrawlerConfigProps = {
  crawler: string[];
};

export function CrawlerConfig({ crawler }: CrawlerConfigProps) {
  const toast = useToast();
  const { saveConfigOption, isSaving, wasSuccess, wasError } = useSaveConfigOption("crawler");

  const [mutableCrawler, setMutableCrawler] = useState(crawler.join("\n"));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.closeAll();

    await saveConfigOption({ crawler: mutableCrawler.split("\n") });

    console.log("checking state!");
    if (wasError)
      return toast({
        title: "Unable to save",
        description: "An error occured updating your crawler messages",
        status: "error",
      });

    if (wasSuccess)
      return toast({
        title: "Save successful",
        description: "Your crawler messages were saved",
        status: "success",
      });
  };

  return (
    <Stack>
      <Text>Add crawler messages to the top bar of the display - one line holds one crawler message.</Text>

      <form onSubmit={onSubmit}>
        <FormControl>
          <FormLabel>Crawler Messages</FormLabel>
          <Textarea value={mutableCrawler} onChange={(e) => setMutableCrawler(e.target.value)} rows={6} />
        </FormControl>

        <Button type="submit" mt={4} colorScheme="teal" isLoading={isSaving}>
          Save
        </Button>
      </form>
    </Stack>
  );
}
