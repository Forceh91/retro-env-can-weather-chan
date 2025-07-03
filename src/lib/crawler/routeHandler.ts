import { Request, Response } from "express";
import { initializeCrawler } from "./crawler";

export function getCrawlerData(req: Request, res: Response) {
  res.json(initializeCrawler());
}