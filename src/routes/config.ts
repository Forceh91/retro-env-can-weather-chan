import express, { Request, Response } from "express";
import { getConfigHandler, postPrimaryLocation, postStationsHandler } from "lib/config";

/*
 * "/" here represents "/config"
 */

const router = express.Router();
router.get("/", getConfigHandler);
router.post("/stations", async (req: Request, res: Response) => await postStationsHandler(req, res));
router.post("/primaryLocation", postPrimaryLocation);

export default router;
