const Koa = require('koa');
const config = require('config');
const koaCors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

//const { serializeError } = require('serialize-error');
const ServiceError = require('./core/serviceError');

const { initializeLogger, getLogger } = require('./core/logging');
const { initializeData, shutdownData } = require('./data');
const installRest = require('./rest');

const emoji = require('node-emoji');



const swaggerJsdoc = require('swagger-jsdoc');
const { koaSwagger } = require('koa2-swagger-ui');
const swaggerDefinition = require('./swagger.config');
const { EnvCmd } = require('env-cmd');

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
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    },
                }
            },
            security: [{
                bearerAuth: []
            }],
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


    app.use(async (ctx, next) => {
        const logger = getLogger();
        logger.info(`${emoji.get('fast_forward')} ${ctx.method} ${ctx.url}`);

        const getStatusEmoji = () => {
            if (ctx.status >= 500) return emoji.get('skull');
            if (ctx.status >= 400) return emoji.get('x');
            if (ctx.status >= 300) return emoji.get('rocket');
            if (ctx.status >= 200) return emoji.get('white_check_mark');
            return emoji.get('rewind');
        };

        try {
            await next();

            logger.info(
                `${getStatusEmoji()} ${ctx.method} ${ctx.status} ${ctx.url}`,
            );
        } catch (error) {
            logger.error(`${emoji.get('x')} ${ctx.method} ${ctx.status} ${ctx.url}`, {
                error,
            });

            throw error;
        }
    });

    app.use(async (ctx, next) => {
        try {
            await next();

            if (ctx.status === 404) {
                ctx.body = {
                    code: 'NOT_FOUND',
                    message: `Unknown resource: ${ctx.url}`,
                };
            }
        } catch (error) {
            const logger = getLogger();
            logger.error('Error occured while handling a request', {
                error,
            });

            let statusCode = error.status || 500;
            let errorBody = {
                code: error.code || 'INTERNAL_SERVER_ERROR',
                message: error.message,
                details: error.details || {},
                stack: NODE_ENV !== 'production' ? error.stack : undefined,
            };

            if (error instanceof ServiceError) {
                if (error.isNotFound) {
                    statusCode = 404;
                }

                if (error.isValidationFailed) {
                    statusCode = 400;
                }

                if (error.isUnauthorized) {
                    statusCode = 401;
                }

                if (error.isForbidden) {
                    statusCode = 403;
                }
            }

            ctx.status = statusCode;
            ctx.body = errorBody;
        }
    });


    installRest(app);



    return {
        getApp() {
            return app;
        },

        start() {
            return new Promise((resolve) => {
                const port = process.env.PORT || 9000;
                app.listen(port);
                logger.info(`🚀 Server listening on http://localhost:${port}`);
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
