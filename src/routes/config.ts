import express, { Request, Response } from "express";
import {
  getConfigHandler,
  postPrimaryLocation,
  postStationsHandler,
  postProvinceTracking,
  postHistoricalDataStationID,
  postClimateNormals,
  postMisc,
  postLookAndFeel,
  postCrawlerMessages,
  postAirQualityStation,
  postPlaylist,
} from "lib/config";

/*
 * "/" here represents "/config"
 */

const router = express.Router();
router.get("/", getConfigHandler);
router.post("/stations", async (req: Request, res: Response) => await postStationsHandler(req, res));
router.post("/primaryLocation", postPrimaryLocation);
router.post("/provinceTracking", postProvinceTracking);
router.post("/historicalDataStationID", postHistoricalDataStationID);
router.post("/climateNormals", postClimateNormals);
router.post("/misc", postMisc);
router.post("/lookAndFeel", postLookAndFeel);
router.post("/airQuality", postAirQualityStation);
router.post("/crawler", postCrawlerMessages);
router.post("/playlist", async (req: Request, res: Response) => await postPlaylist(req, res));

export default router;
