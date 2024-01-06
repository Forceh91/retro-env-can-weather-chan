import express from "express";
import { getInitHandler } from "lib/config";

/*
 * "/" here represents "/init"
 */

const router = express.Router();
router.get("/", getInitHandler);

export default router;
