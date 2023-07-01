import { Request, Response } from "express";
import { initializeConfig } from "./config";

const config = initializeConfig();

export function getConfigHandler(req: Request, res: Response) {
  res.json({ config: config.config, crawler: config.crawlerMessages });
}
