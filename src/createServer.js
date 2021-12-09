const Koa = require('koa');
const config = require('config');
const koaCors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const { initializeLogger, getLogger } = require('./core/logging');
const { initializeData, shutdownData } = require('./data');
const installRest = require('./rest');

const swaggerJsdoc = require('swagger-jsdoc');
const { koaSwagger } = require('koa2-swagger-ui');
const swaggerDefinition = require('./swagger.config');

const NODE_ENV = config.get('env');
const CORS_ORIGINS = config.get('cors.origins');
const CORS_MAX_AGE = config.get('cors.maxAge');
const LOG_LEVEL = config.get('log.level');
const LOG_DISABLED = config.get('log.disabled');

module.exports = async function createServer() {
    initializeLogger({
        level: LOG_LEVEL,
        disabled: LOG_DISABLED,
        isProduction: NODE_ENV === 'production',
        defaultMeta: { NODE_ENV },
    });

    await initializeData();

    const app = new Koa();
    const logger = getLogger();

    logger.info(`log level ${LOG_LEVEL}, logs enabled: ${LOG_DISABLED !== true}`);

    // Add CORS
    app.use(
        koaCors({
            origin: (ctx) => {
                if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
                    return ctx.request.header.origin;
                }
                // Not a valid domain at this point, let's return the first valid as we should return a string
                return CORS_ORIGINS[0];
            },
            allowHeaders: ['Accept', 'Content-Type', 'Authorization'],
            maxAge: CORS_MAX_AGE,
        })
    );





    app.use(bodyParser());

    const options = {
        apis: ['src/rest/*.js'],
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
            basePath: "/api",
            servers: [{
                url: 'http://localhost:9000/',
                description: 'Development server',
            }],
        },
    }


    const spec = swaggerJsdoc(options);
    logger.info(spec);
    app.use(
        koaSwagger({
            routePrefix: '/swagger', // host at /swagger instead of default /docs
            swaggerOptions: {  // passed to SwaggerUi()
                spec,
            },
        }),
    );

    installRest(app);





    return {
        getApp() {
            return app;
        },

        start() {
            return new Promise((resolve) => {
                app.listen(9000);
                logger.info(`🚀 Server listening on http://localhost:9000`);
                resolve()
            })
        },

        async stop() {
            {
                app.removeAllListeners();
                await shutdownData();
                getLogger().info('Goodbye');
            }
        }
    }
}
