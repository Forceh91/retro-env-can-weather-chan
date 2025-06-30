import express from "express";
import { getCrawlerData } from "lib/crawler";

/*
 * "/" here represents "/init"
 */

const router = express.Router();
router.get("/crawlerData", getCrawlerData);

export default router;
