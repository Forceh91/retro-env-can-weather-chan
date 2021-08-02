const fs = require("fs");

const CRAWLER_FOLDER = "./cfg";
const CRAWLER_FILE = "crawl.txt";
let crawlerArray = [];

module.exports = {
  generateCrawler: () => {
    console.log(`Generating crawler from ${CRAWLER_FOLDER}/${CRAWLER_FILE}...`);
    const crawlerFile = `${CRAWLER_FOLDER}/${CRAWLER_FILE}`;
    fs.stat(crawlerFile, (err, stat) => {
      if (err || stat.size < 1) console.log("No crawler needs generating");
      else {
        fs.readFile(crawlerFile, "utf8", (err, data) => {
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
};
