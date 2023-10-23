require("dotenv").config();
const axios = require('axios');
const apiKey = process.env.GOOGLE_GEOCACHE_KEY;

const { truncateCoordinates } = require('../helpers/truncateGeoData');

const getLocation = async (req, res) => {
  const { zip } = req.params;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`);
    const locationResult = response.data;

    console.log("Response from Google Geocoding API:", response);
    console.log("Location result:", locationResult);

    // Extract latitude and longitude from the JSON response
    if (locationResult.results && locationResult.results.length > 0) {
      const latitude = locationResult.results[0].geometry.location.lat;
      const longitude = locationResult.results[0].geometry.location.lng;

      // Use the helper method to truncate coordinates
      const truncatedData = truncateCoordinates({ lat: latitude, lng: longitude });

      // Create a JSON response object with truncated values
      const jsonResponse = {
        latitude: truncatedData.lat,
        longitude: truncatedData.lng,
      };

      console.log('TRUNCATED GEOCODE = ' + jsonResponse.latitude, + ' ' + jsonResponse.longitude);

      const stations = await getStation(truncatedData.lat, truncatedData.lng);

      // Include the observation stations in the JSON response
      jsonResponse.observationStations = stations;

      res.status(200).json(jsonResponse);
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      res.status(404).json({ error: "Location Not Found" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const getStation = async (latitude, longitude) => {
  try {
    // Construct the URL for the Weather API
    const url = `https://api.weather.gov/points/${latitude},${longitude}`;
    const response = await axios.get(url);
    
    // Extract the observation stations from the response
    if (response.data && response.data.properties) {
      return response.data.properties.observationStations;
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error getting observation stations:", err);
    return [];
  }
};

const findClosest = async() => {
  
}

module.exports = { getLocation };