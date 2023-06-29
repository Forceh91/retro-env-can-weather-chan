import express, { Router } from "express";
import initRoutes from "./init";
import weatherRoutes from "./weather";

export function initializeRouter(): Router {
  const router = express.Router();
  router.use("/init", initRoutes);
  router.use("/weather", weatherRoutes);

  return router;
}
