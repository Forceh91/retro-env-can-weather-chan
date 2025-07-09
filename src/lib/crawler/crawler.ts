import fs from "fs";
import Logger from "lib/logger";

export const CRAWLER_DEFAULT_SPEED = 125;
const CRAWLER_PATH = {
  FOLDER: "./cfg",
  FILE: "crawler.txt",
};
const CRAWLER_ABSOLUTE_PATH = `${CRAWLER_PATH.FOLDER}/${CRAWLER_PATH.FILE}`;
const logger = new Logger("crawler");

export class Crawler {
  private _messages: string[] | null = [];
  speed: number = CRAWLER_DEFAULT_SPEED;

  public toJSON() {
    return {messages: this.messages, speed: this.speed};
  }

  constructor() {
    try {
      if (process.env.NODE_ENV === "test") {
        this._messages = null;
        this.speed = CRAWLER_DEFAULT_SPEED;
        return;
      }
      this.messages = this.loadCrawlerMessages();
    } catch (err) {
      logger.error("Constructor error:", err);
      this._messages = null;
      this.speed = CRAWLER_DEFAULT_SPEED;
    }
  }

  get messages(): string[] | null {
    return this._messages;
  }

  set messages(data: string[] | null) {
    if (data == null) {
      this._messages = null;
      logger.log("Messages set to null");
    } else if (!Array.isArray(data)) {
      logger.error("Invalid messages data: not an array");
      return;
    } else {
      // Filter out non-string elements
      const validMessages = data.filter((msg): msg is string => typeof msg === "string");
      if (!validMessages.length) {
        this._messages = null;
        logger.log("No valid messages, set to null");
      } else {
        this._messages = validMessages
          .map((message) => message.trim())
          .filter((message) => message.length);
        logger.log("Set messages:", this._messages);
      }
    }
    try {
      this.saveCrawlerMessages(this._messages);
    } catch (err) {
      logger.error("Error saving messages:", err);
    }
  }

  get crawler() {
    return {
      messages: this.messages,
      speed: this.speed,
    };
  }

  set crawler(data: { messages?: unknown; speed?: unknown }) {
    try {
      if (data.messages != null) {
        if (!Array.isArray(data.messages)) {
          logger.error("Invalid crawler.messages: not an array");
          return;
        }
        this._messages = data.messages;
      }
      if (data.speed != null && typeof data.speed === "number") {
        this.speed = data.speed;
        logger.log("Set speed:", this.speed);
      }
    } catch (err) {
      logger.error("Error in crawler setter:", err);
    }
  }

  private loadCrawlerMessages(): string[] | null {
    logger.log("Loading crawler messages from", CRAWLER_ABSOLUTE_PATH);
    try {
      const data = fs.readFileSync(CRAWLER_ABSOLUTE_PATH, "utf8");
      const messages = data
        .split("\n")
        .map((message) => message.trim())
        .filter((message) => message.length);
      logger.log("Loaded", messages.length, "crawler messages:", messages);
      return messages.length ? messages : null;
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.error("No crawler file found");
        return null;
      } else {
        logger.error("Unable to load from crawler file:", err);
        return null;
      }
    }
  }

  private saveCrawlerMessages(messages: string[] | null) {
    logger.log("Saving crawler messages to", CRAWLER_ABSOLUTE_PATH);
    try {
      if (messages == null) {
        logger.log("No messages to save (null)");
        return;
      }
      fs.mkdirSync(CRAWLER_PATH.FOLDER, { recursive: true });
      fs.writeFileSync(CRAWLER_ABSOLUTE_PATH, messages.join("\n"), "utf8");
      logger.log("Saved", messages.length, "crawler messages");
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.error("No crawler file found");
      } else {
        logger.error("Unable to save to crawler file:", err);
      }
    }
  }

}

let crawler: Crawler = null;
export function initializeCrawler(): Crawler {
  if (crawler) return crawler;
  crawler = new Crawler();
  return crawler;
}