module.exports = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Webshop API with Swagger",
            version: '1.0.0',
            description:
                'This is a simple CRUD API application made with Koa and documented with Swagger',
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'WebshopAPI',
            },
        },
        //basePath: "/api",
        servers: [{
            url: 'http://localhost:9000/',
            description: 'Development server',
        }],
    },

};