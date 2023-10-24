const Decimal = require('decimal.js');

function truncateGeoData(data) {
  if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
    const truncatedData = {
      lat: new Decimal(data.lat).toDecimalPlaces(4).toNumber(),
      lng: new Decimal(data.lng).toDecimalPlaces(4).toNumber(),
    };
    return truncatedData;
  } else {
    throw new Error('Invalid input data');
  }
}

module.exports = { truncateGeoData };