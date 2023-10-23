const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const axios = require('axios');
const { expect } = chai;

chai.use(sinonChai);

// Import the controller function you want to test
const locationController = require('../../controllers/locationController');

describe('Location Controller', () => {
  it('should return location data when the API call is successful', async () => {
    // Create a sandbox for spies/stubs
    const sandbox = sinon.createSandbox();

    // Stub the axios.get method to return a predefined response
    sandbox.stub(axios, 'get').resolves({ data: 'Mocked Location Data' });

    // Create mock request and response objects
    const req = {
      params: { state: 'CA', zip: '90210', city: 'BeverlyHills' },
    };

    const res = {
      send: (data) => {
        expect(data).to.deep.equal({ result: 'Mocked Location Data' });
      },
    };

    // Call the controller function
    await locationController.getLocation(req, res);

    // Restore axios.get to its original state
    sandbox.restore();
  });

  it('should handle errors gracefully when the API call fails', async () => {
    // Create a sandbox for spies/stubs
    const sandbox = sinon.createSandbox();

    // Stub the axios.get method to simulate an error
    sandbox.stub(axios, 'get').rejects(new Error('Mocked Error'));

    // Create mock request and response objects
    const req = {
      params: { state: 'CA', zip: '90210', city: 'BeverlyHills' },
    };

    const res = {
      status: (statusCode) => {
        expect(statusCode).to.equal(404);
        return {
          json: (data) => {
            expect(data).to.deep.equal({ error: 'Location Not Found' });
          },
        };
      },
    };

    // Call the controller function
    await locationController.getLocation(req, res);

    // Restore axios.get to its original state
    sandbox.restore();
  });
});