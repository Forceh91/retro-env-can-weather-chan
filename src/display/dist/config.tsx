import { useChannelCurrentConfig } from "hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { WeatherStationConfig } from "display/components/config";

const ConfigScreen = () => {
  const { config, fetched } = useChannelCurrentConfig();

  return (
    <>
      <Heading>Weather Simulator Config</Heading>
      {!fetched && <>Fetching config...</>}
      {fetched && (
        <>
          <Tabs>
            <TabList>
              <Tab>Weather Station</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <WeatherStationConfig weatherStation={config.primaryLocation} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("config") as HTMLElement);
root &&
  root.render(
    <React.StrictMode>
      <ChakraProvider>
        <ConfigScreen />
      </ChakraProvider>
    </React.StrictMode>
  );
