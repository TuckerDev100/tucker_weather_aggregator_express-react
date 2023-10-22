const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const axios = require('axios');
const { app } = require('../index'); // Import your Express app
const { expect } = chai;

chai.use(sinonChai);

// Import supertest and chai-http
const request = require('supertest');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('GET /weather/:city', () => {
  let axiosGetStub;

  beforeEach(() => {
    // Create a stub for axios.get
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    // Restore the axios.get stub after each test
    axiosGetStub.restore();
  });

  it('should return weather data on a successful call', async () => {
    const city = 'exampleCity';
    const expectedWeatherData = 'Cloudy 25°C NE 12km/h Waxing Crescent';

    // Set up the axios.get stub to return a response
    axiosGetStub.withArgs(`https://wttr.in/${city}?format=%C+%t+%w+%m`).resolves({ data: expectedWeatherData });

    // Make an HTTP request using supertest and chai-http
    const response = await request(app)
      .get(`/weather/${city}`);

    // Assert the response status and data
    expect(response).to.have.status(200);
    expect(response.body.result).to.equal(expectedWeatherData);
  });

  it('should handle errors and return a 404 status on a failed call', async () => {
    const city = 'nonexistentCity';

    // Set up the axios.get stub to reject with an error
    axiosGetStub.withArgs(`https://wttr.in/${city}?format=%C+%t+%w+%m`).rejects(new Error('Location Not Found'));

    // Make an HTTP request using supertest and chai-http
    const response = await request(app)
      .get(`/weather/${city}`);

        // Log the response for debugging
  console.log('Response:', response);

  // Log the response body for debugging
  console.log('Response Body:', response.body);

    // Assert the response status and error message
    expect(response).to.have.status(404);
    expect(response.body.error).to.equal('Location Not Found');
  });
});