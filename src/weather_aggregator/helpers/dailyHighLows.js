function dailyHighLows(data) {
  const dailyTempRange = {};

  for (const date in data) {
    if (data.hasOwnProperty(date)) {
      const temperatures = data[date];

      if (temperatures.length > 0) {
        const highTemp = Math.max(...temperatures);
        const lowTemp = Math.min(...temperatures);

        dailyTempRange[date] = { highTemp, lowTemp };
      }
    }
  }

  return dailyTempRange;
}

module.exports = { dailyHighLows };