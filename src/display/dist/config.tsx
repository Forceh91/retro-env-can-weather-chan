import { useChannelCurrentConfig } from "hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import {
  ClimateNormalsConfig,
  HistoricalDataStationIDConfig,
  ProvinceTempPrecipConfig,
  WeatherStationConfig,
} from "display/components/config";

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
              <Tab>Province Temp/Precip</Tab>
              <Tab>Historical Data</Tab>
              <Tab>Climate Normals</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <WeatherStationConfig weatherStation={config.primaryLocation} />
              </TabPanel>
              <TabPanel>
                <ProvinceTempPrecipConfig
                  isEnabled={config.provinceHighLowEnabled}
                  stations={config.provinceStations}
                />
              </TabPanel>
              <TabPanel>
                <HistoricalDataStationIDConfig historicalDataStationID={config.historicalDataStationID} />
              </TabPanel>

              <TabPanel>
                <ClimateNormalsConfig climateNormals={config.climateNormals} />
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
