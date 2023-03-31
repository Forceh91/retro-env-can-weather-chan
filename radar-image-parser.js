const getPixels = require("get-pixels");

// radar images are 580px across
const RADAR_WIDTH = 580;

// we only need the first 480px of them
const NEEDED_RADAR_WIDTH = 480;

const radarImageData = [];
async function parseRadarImage(radarImageURL, radarImageNum, callback) {
  if (!radarImageNum) radarImageData.slice(0, radarImageData.length);

  await getPixels(radarImageURL, function(err, pixels) {
    if (err) {
      console.log("Bad image path");
      return;
    }

    // each entry in the pixels data isn't a pixel, its a part of RGB. so every 3rd (or 4th?) entry is a complete pixel
    // pixels.data[0] = red amount, pixels.data[1] = green amount, pixels.data[2] = blue amount, pixels.data[3] = alpha?
    const CHANNELS = 4;
    const completePixels = [];
    let tempPixelData = [];
    pixels.data.forEach((pixelChannelData, ix) => {
      if (ix && !(ix % CHANNELS)) {
        completePixels.push(tempPixelData);
        tempPixelData = [];
      }

      tempPixelData.push(pixelChannelData);
    });

    completePixels.push(tempPixelData);

    // now that we know the image proper we can generate an ascii version of what the radar told us
    // and we only care about creating something if the colour is snow/rain in RGBA format
    const SNOW_OR_RAIN_RADAR_COLOURS = [
      "153,204,255",
      "0,153,255",
      "0,255,102",
      "0,204,0",
      "0,153,0",
      "0,102,0",
      "255,255,51",
      "255,204,0",
      "255,153,0",
      "255,102,0",
      "255,0,0",
      "255,0,153",
      "153,51,204",
      "102,0,153",
    ].map((rgb) => rgb + ",255");

    // loop through all pixels
    const PIXEL_RADAR_OUTPUT = [];
    let i = 0;
    while (i < completePixels.length) {
      // get the pixel and either put a space if its not radar data, or an * if it is
      const pixel = completePixels[i];
      const pixelRGBA = pixel && pixel.join(",");
      if (!pixelRGBA) continue;

      // convert pixel colour to a character and put a * if relevant
      if (SNOW_OR_RAIN_RADAR_COLOURS.includes(pixelRGBA)) PIXEL_RADAR_OUTPUT.push("*");
      else PIXEL_RADAR_OUTPUT.push(" ");

      // if we reached the width of the image then start a new line
      if (i && !((i + 1) % RADAR_WIDTH)) PIXEL_RADAR_OUTPUT.push("\n");

      // next
      i++;
    }

    // store this for later use
    radarImageData[radarImageNum] = PIXEL_RADAR_OUTPUT.join("");

    // log stuff.
    typeof callback === "function" && callback(radarImageNum);
  });
}

function getRadarImage(ix) {
  return radarImageData[ix] || [];
}

module.exports = { parseRadarImage, getRadarImage };
