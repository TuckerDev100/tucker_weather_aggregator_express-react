function decimalToAbsInt(data) {
  if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
    const truncatedData = {
      lat: Math.floor(Math.abs(data.lat)),
      lng: Math.floor(Math.abs(data.lng)),
    };
    return truncatedData;
  } else {
    throw new Error('Invalid input data');
  }
}

module.exports = { decimalToAbsInt };