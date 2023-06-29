import express from "express";
import cors from "cors";
import { API_PORT, CORS_OPTIONS } from "consts";
import { initializeRouter } from "routes";

export function initializeAPI(): void {
  // setup express first with cors, json, and listening port
  const api = express().use(cors(CORS_OPTIONS)).use(express.json());
  api.listen(API_PORT);

  // now we can setup the router
  const router = initializeRouter();
  api.use("/api/v1", router);
}
