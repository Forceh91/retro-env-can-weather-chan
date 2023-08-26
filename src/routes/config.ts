import express, { Request, Response } from "express";
import { getConfigHandler, postPrimaryLocation, postStationsHandler, postProvinceTracking } from "lib/config";

/*
 * "/" here represents "/config"
 */

const router = express.Router();
router.get("/", getConfigHandler);
router.post("/stations", async (req: Request, res: Response) => await postStationsHandler(req, res));
router.post("/primaryLocation", postPrimaryLocation);
router.post("/provinceTracking", postProvinceTracking);

export default router;
