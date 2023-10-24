require("dotenv").config();
const express = require('express');
const cors = require('cors');
const locationRoute = require('./routes/locationRoute'); // Update the

const app = express();

// Configure middleware
app.use(express.json());
app.use(cors());

// Use the location route
app.use('/location', locationRoute);

app.get('/weather',)

// Start the server
const PORT = 3300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});