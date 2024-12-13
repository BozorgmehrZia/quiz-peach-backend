const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const port = process.env.PORT || 9090;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Question Management API',
            version: '1.0.0',
            description: 'API documentation for Quiz Peach',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
