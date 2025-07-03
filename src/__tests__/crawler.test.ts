jest.mock("fs");
import { initializeCrawler } from "lib/crawler/crawler";
import fs from "fs";

describe("Crawler data loading", () => {
  it("loads & saves crawler messages from file correctly", () => {
    const crawlers = ["crawler 1", "crawler 2", "crawler 3"];
    jest.spyOn(fs, "readFileSync").mockImplementation(() => crawlers.join("\n"));

    const crawler = initializeCrawler();
    crawler.messages = crawlers;
    expect(crawler.messages).toStrictEqual(crawlers);
  });

});

describe("Crawler updating", () => {
  it("updates the crawler messages correctly", () => {
    const crawler = initializeCrawler();
    const writeFile = jest.spyOn(fs, "writeFileSync").mockImplementation();

    const newCrawlerMessages = ["a crawler", "and another one", "and a third one"];
    crawler.messages = newCrawlerMessages;
    expect(crawler.messages).toStrictEqual(newCrawlerMessages);

    crawler.messages = [...newCrawlerMessages, "   ", ""];
    expect(crawler.messages).toStrictEqual(newCrawlerMessages);
    expect(writeFile).toHaveBeenCalled();
  });

});
