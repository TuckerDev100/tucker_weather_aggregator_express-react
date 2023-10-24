const axios = require('axios');
const { truncateGeoData } = require('../helpers/truncateGeoData');
const { decimalToAbsInt } = require('../helpers/decimalToAbsInt'); // Import the decimalToAbsInt helper

const getLocation = async (req, res) => {
  const { zip } = req.params;
  const apiKey = process.env.GOOGLE_GEOCACHE_KEY;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`);
    const locationResult = response.data;

    if (locationResult.status === 'OK') {
      const { lat, lng } = locationResult.results[0].geometry.location;
      const truncatedCoordinates = truncateGeoData({ lat, lng });

      const jsonResponse = {
        latitude: truncatedCoordinates.lat,
        longitude: truncatedCoordinates.lng,
      };

      const gridId = await getStationId(locationResult);

      const

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

const getHistory = async (lat, lng, gridId) => {

};

module.exports = { getLocation };