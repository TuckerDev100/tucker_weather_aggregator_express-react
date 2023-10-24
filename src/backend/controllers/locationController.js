const axios = require('axios');
const { truncateGeoData } = require('../helpers/truncateGeoData');
const { decimalToAbsInt } = require('../helpers/decimalToAbsInt.js'); // Import the decimalToAbsInt helper
const { dailyHighLows } = require('../helpers/dailyHighLows');

const getLocation = async (req, res) => {
  const { zip } = req.params;
  const apiKey = process.env.GOOGLE_GEOCACHE_KEY;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`);
    const locationResult = response.data;

    if (locationResult.status === 'OK') {
      const { lat, lng } = locationResult.results[0].geometry.location;
      const truncatedCoordinates = truncateGeoData({ lat, lng });
      const intCoords = decimalToAbsInt({ lat, lng });

      const gridId = await getStationId(locationResult);

      const hourlyTemps = await getHourlyData(gridId, [intCoords.lat, intCoords.lng]);

      const dailyTempRanges = dailyHighLows(hourlyTemps);
  
      const jsonResponse = {
        dailyTempRanges
      };

      res.status(200).json(jsonResponse);
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error in getLocation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStationId = async (locationResult) => {
  const { lat, lng } = locationResult.results[0].geometry.location;
  const gridUrl = `https://api.weather.gov/points/${lat},${lng}`;

  try {
    const gridResponse = await axios.get(gridUrl);
    const gridData = gridResponse.data;

    if (gridData.properties && gridData.properties.gridId) {
      console.log('GRID ID = ' + gridData.properties.gridId)
      return gridData.properties.gridId;
    } else {
      console.error('Grid ID not found in response');
      return null; // Return null or a suitable error value if the grid ID is not found
    }
  } catch (error) {
    console.error('Error in getStationId:', error);
    return null; // Return null or a suitable error value if there's an error
  }
};

const getHourlyData = async (gridId, intCoords) => {
  try {
    const [x, y] = intCoords;
    const hourlyDataUrl = `https://api.weather.gov/gridpoints/${gridId}/${x},${y}/forecast/hourly`;

    const hourlyResponse = await axios.get(hourlyDataUrl);
    const hourlyData = hourlyResponse.data;

    const dailyWeather = {}; // Initialize the dailyWeather hashmap

    if (hourlyData.properties && hourlyData.properties.periods) {
      const hourlyPeriods = hourlyData.properties.periods;

      // Iterate through the hourly periods and organize data by day
      hourlyPeriods.forEach((period) => {
        const date = period.startTime.substr(0, 10); // Extract the date portion

        // If the date is not in the dailyWeather hashmap, create a new entry
        if (!dailyWeather[date]) {
          dailyWeather[date] = [];
        }

        // Add the temperature value to the corresponding day
        dailyWeather[date].push(period.temperature);
      });
    } else {
      console.error('Hourly weather data not found in response');
    }

    return dailyWeather;
  } catch (error) {
    console.error('Error in getHourlyData:', error);
    return {};
  }
};

module.exports = { getLocation };