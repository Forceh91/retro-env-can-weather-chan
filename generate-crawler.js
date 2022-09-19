const fs = require("fs");

const CRAWLER_FOLDER = "./cfg";
const CRAWLER_FILE_NAME = "crawl.txt";
const CRAWLER_FILE = `${CRAWLER_FOLDER}/${CRAWLER_FILE_NAME}`;
let crawlerArray = [];

module.exports = {
  generateCrawler: () => {
    console.log(`Generating crawler from ${CRAWLER_FILE}...`);
    fs.stat(CRAWLER_FILE, (err, stat) => {
      if (err || stat.size < 1) console.log("No crawler needs generating");
      else {
        fs.readFile(CRAWLER_FILE, "utf8", (err, data) => {
          if (err) console.log("Unable to generate crawler");
          else {
            crawlerArray = data.split(/\r?\n/g);
            console.log("Generated a crawler list of", crawlerArray.length, "messages");
          }
        });
      }
    });
  },

  getCrawler: () => {
    return crawlerArray || [];
  },

  saveCrawler(messages, callback) {
    function doCallback(v) {
      if (typeof callback === "function") callback(v);
    }

    const isArray = Array.isArray(messages);
    if (!isArray) return doCallback(false);

    console.log("[CRAWLER] Saving new crawler to file...");

    fs.writeFile(CRAWLER_FILE, messages.join("\n"), "utf8", (err, data) => {
      if (err) {
        console.warn("[CRAWLER]", "Unable to save new crawler");
        return doCallback(false);
      }

      crawlerArray.splice(0, crawlerArray.length, ...messages);
      console.log("[CRAWLER]", "Saved new crawler messages to file");
      return doCallback(true);
    });
  },
};
