import express from "express";
import { getConfigHandler } from "lib/config";

/*
 * "/" here represents "/config"
 */

const router = express.Router();
router.get("/", getConfigHandler);

export default router;
