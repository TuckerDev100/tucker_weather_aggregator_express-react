// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const sinon = require('sinon');
// const axios = require('axios');

// const locationController = require('../../controllers/locationController');

// const { expect } = chai;

// chai.use(chaiHttp);

// describe('Location Controller', () => {
//   before(() => {
//     // Stub the axios.get method to return a mock response
//     sinon.stub(axios, 'get').resolves({
//       data: {
//         status: 'OK',
//         results: [
//           {
//             geometry: {
//               location: {
//                 lat: 123.456,
//                 lng: 789.012,
//               },
//             },
//           },
//         ],
//       },
//     });
//   });

//   after(() => {
//     // Restore the axios.get method after testing
//     axios.get.restore();
//   });

//   it('should return a valid response for a valid location', (done) => {
//     chai.request(app)
//       .get('/your-location-endpoint/12345') // Replace with your endpoint and valid zip code
//       .end((err, res) => {
//         expect(err).to.be.null;
//         res.should.have.status(200);
//         res.body.should.be.an('object');
//         // Add more assertions based on the expected response structure

//         done();
//       });
//   });
// });
