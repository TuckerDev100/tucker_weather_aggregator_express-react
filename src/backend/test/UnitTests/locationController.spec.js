const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const { expect } = chai;

chai.should();

// Import your controller function
const locationController = require('../../controllers/locationController');

const geoCodeHappyPath = require('../Mocks/geoCodeHappyPath.json')



describe('locationController', () => {
  describe('getLocation', () => {
    it('should return location data when a valid zip code is provided', async () => {
      const validZip = '80303';

      // Stub the axios.get method to return a mock response
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.returns(Promise.resolve({ data: geoCodeHappyPath }));

      const req = { params: { zip: validZip } };
      const res = {
        status: (statusCode) => {
          statusCode.should.equal(200);
          return {
            json: (data) => {
              // Assertions for the response JSON data
              data.should.have.property('latitude');
              data.should.have.property('longitude');
            },
          };
        },
      };

      await locationController.getLocation(req, res);

      // Restore the axios.get method
      axiosStub.restore();
    });

    it('should return a "Location Not Found" error for an invalid zip code', async () => {
      const invalidZip = 'invalidZip';
    
      // Stub the axios.get method to return a mock response with status 404
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.returns(Promise.resolve({ status: 404, data: {} }));
    
      const req = { params: { zip: invalidZip } };
      const res = {
        status: (statusCode) => {
          statusCode.should.equal(404);
          return {
            json: (data) => {
              data.should.have.property('error', 'Location Not Found');
            },
          };
        },
      };
    
      await locationController.getLocation(req, res);
    
      axiosStub.restore();
    });

    it('should handle internal server errors gracefully', async () => {
      const invalidZip = '80303';

      // Stub the axios.get method to simulate an error
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.rejects(new Error('Internal Server Error'));

      const req = { params: { zip: invalidZip } };
      const res = {
        status: (statusCode) => {
          statusCode.should.equal(500);
          return {
            json: (data) => {
              // Assertions for the error message
              data.should.have.property('error', 'Internal Server Error');
            },
          };
        },
      };

      await locationController.getLocation(req, res);

      // Restore the axios.get method
      axiosStub.restore();
    });
  });
});