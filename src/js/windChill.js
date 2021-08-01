module.exports = {
  calculateWindChillNumber: (temp, windSpeed) => {
    const windSpeedMs = windSpeed / 3.6;
    return Math.floor((12.1452 + 11.6222 * Math.sqrt(windSpeedMs) - 1.16222 * windSpeedMs) * (33 - temp));
  },
};
