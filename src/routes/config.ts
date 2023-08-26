import express, { Request, Response } from "express";
import {
  getConfigHandler,
  postPrimaryLocation,
  postStationsHandler,
  postProvinceTracking,
  postHistoricalDataStationID,
  postClimateNormals,
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

export default router;
