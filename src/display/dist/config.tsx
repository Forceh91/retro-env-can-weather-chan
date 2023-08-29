import { useChannelCurrentConfig } from "hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import {
  ClimateNormalsConfig,
  DisplayConfig,
  FlavoursConfig,
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
              <Tab>Display</Tab>
              <Tab>Weather Station</Tab>
              <Tab>Province Temp/Precip</Tab>
              <Tab>Historical Data</Tab>
              <Tab>Climate Normals</Tab>
              <Tab>Flavours</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <DisplayConfig
                  alternateRecordsSource={config.misc.alternateRecordsSource}
                  rejectInHourConditionUpdates={config.misc.rejectInHourConditionUpdates}
                  flavour={config.lookAndFeel.flavour}
                  flavours={config.flavours}
                />
              </TabPanel>
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

              <TabPanel>
                <FlavoursConfig currentFlavours={config.flavours} />
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
