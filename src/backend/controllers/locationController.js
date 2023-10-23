require("dotenv").config();
const axios = require('axios');
const apiKey = process.env.GOOGLE_GEOCACHE_KEY;

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
      
      // Create a JSON response object with "latitude" and "longitude"
      const jsonResponse = {
        latitude,
        longitude,
      };

      res.json(jsonResponse);
    } else {
      res.status(404).json({ error: "Location Not Found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getLocation };