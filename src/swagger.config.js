module.exports = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: 'Webshop API with Swagger',
            version: '1.0.0',
            description:
                'This is a simple CRUD API application made with Koa and documented with Swagger',
            contact: {
                name: 'WebshopAPI',
            },
        },
        servers: [{
            url: 'http://localhost:9000/',
        }],
    },

};