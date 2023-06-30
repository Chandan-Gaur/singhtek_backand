const swaggerJsdoc = require('swagger-jsdoc');


const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:8080' }],
    },
    apis: [
      './routes/Users.route.js',
      './routes/Admin.route.js',
      './routes/SinghTekUsers.route.js',
      './routes/Merchant.route.js',
    ],
  };
  

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
