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

    if (locationResult.results && locationResult.results.length > 0) {
      const latitude = locationResult.results[0].geometry.location.lat;
      const longitude = locationResult.results[0].geometry.location.lng;

      const truncatedData = truncateCoordinates({ lat: latitude, lng: longitude });

      const jsonResponse = {
        latitude: truncatedData.lat,
        longitude: truncatedData.lng,
      };

      console.log('TRUNCATED GEOCODE = ' + jsonResponse.latitude, + ' ' + jsonResponse.longitude);

      const stations = await getStation(truncatedData.lat, truncatedData.lng);
      jsonResponse.observationStations = stations;

      const closestStationsUrl = `https://api.weather.gov/points/${truncatedData.lat},${truncatedData.lng}`;
      const closestStationsObj = await findClosest(closestStationsUrl);

      console.log('CLOSEST STATION OBJ:', closestStationsObj);

      jsonResponse.closestStations = closestStationsObj;

      for (const key in closestStationsObj) {
        jsonResponse.closestStations.push({ [key]: closestStationsObj[key] });
      }

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

async function findClosest(url) {
  try {
    // Make a GET request to the specified URL
    const response = await axios.get(url);

    // Check if the response status is okay (200)
    if (response.status === 200) {
      const data = response.data;

      // Check if the data is valid GeoJSON (you can customize this validation)
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        const geoJSONData = data.features;

        // Create an object to store stationIdentifier and coordinates
        const result = {};

        // Iterate through the features and extract stationIdentifier and coordinates
        geoJSONData.forEach((feature) => {
          if (feature.properties && feature.properties.stationIdentifier && feature.geometry && feature.geometry.coordinates) {
            const stationIdentifier = feature.properties.stationIdentifier;
            const coordinates = feature.geometry.coordinates;
            result[stationIdentifier] = coordinates;
          }
        });

        // Log the object
        console.log('Parsed GeoJSON:', result);

        return result;
      } else {
        console.error('Invalid GeoJSON format');
        return null;
      }
    } else {
      console.error('Failed to fetch data:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error in parseGeoJSONFromURL:', error);
    return null;
  }
}

// // Usage example
// const url = 'https://your-geojson-api-url.com';
// parseGeoJSONFromURL(url)
//   .then((result) => {
//     // Do something with the parsed data (result)
//   });



module.exports = { getLocation };