import express from "express";
import { getObserved } from "lib/eccc/routeHandler";

/*
 * "/" here represents "/weather"
 */

const router = express.Router();
router.get("/observed", getObserved);

export default router;
